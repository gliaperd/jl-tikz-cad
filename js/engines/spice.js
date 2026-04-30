// js/engines/spice.js
import { AppState, THEME_COLORS } from '../state.js';
import { parseSpiceToNumber } from '../parsers/helpers.js';
import { saveFileAs } from '../parsers/io.js';

let isSpiceInitialized = false;

// -----------------------------------------
// 1. NETLIST GENERATION
// -----------------------------------------
export function buildSpiceCommands(mode) {
    let c = AppState.spiceSimConfig;
    let cmds = "";
    if (c.modelsContent) cmds += c.modelsContent + "\n\n";
    if (c.customCmds) cmds += c.customCmds + "\n";
    
    if (mode === 'tran') {
        cmds += `.tran ${c.tranStep} ${c.tranStop} ${c.tranStart}\n`;
    } else if (mode === 'ac') {
        cmds += `.ac ${c.acType} ${c.acPoints} ${c.acStart} ${c.acStop}\n`;
    }
    cmds += ".end\n";
    return cmds;
}

export function formatEng(val, unit = 'V') {
    if (val === 0 || Math.abs(val) < 1e-15) return "0.00 " + unit;
    let abs = Math.abs(val);
    let sign = val < 0 ? "-" : "";
    
    if (abs >= 1e6) return sign + (abs / 1e6).toFixed(2) + " M" + unit;
    if (abs >= 1e3) return sign + (abs / 1e3).toFixed(2) + " k" + unit;
    if (abs >= 1) return sign + abs.toFixed(2) + " " + unit;
    if (abs >= 1e-3) return sign + (abs * 1e3).toFixed(2) + " m" + unit;
    if (abs >= 1e-6) return sign + (abs * 1e6).toFixed(2) + " u" + unit;
    if (abs >= 1e-9) return sign + (abs * 1e9).toFixed(2) + " n" + unit;
    if (abs >= 1e-12) return sign + (abs * 1e12).toFixed(2) + " p" + unit;
    return val.toExponential(2) + " " + unit;
}

export function generateSpiceNetlistStr(customSim) {
    let elements = AppState.graph.getElements();
    if (elements.length === 0) return { errors: ["Empty Canvas"] };

    let topo = window.extractTopology();
    let getNetForPin = (pt) => {
        let cluster = topo.terminals.find(t => Math.abs(t.x - pt.x) < 5 && Math.abs(t.y - pt.y) < 5);
        return cluster ? topo.netMap.get(topo.uf.find(cluster.id)) : null;
    };

    let errors = [];
    if (topo.gndNodes.size === 0) errors.push("<b>No Ground (GND) found!</b> SPICE requires a 'groundterminal' to establish Node 0.");

    let netPopulation = {};
    elements.forEach(el => {
        let macro = el.get('latexMacro');
        if (macro !== 'connectordot' && macro !== 'freetext') {
            el.getPorts().forEach(port => {
                let pt = window.getAbsolutePinCoord(el, port.id);
                let netId = getNetForPin(pt);
                if (netId) netPopulation[netId] = (netPopulation[netId] || 0) + 1;
            });
        }
    });

    let spiceCode = "* JL CAD Generated SPICE Netlist\n\n";
    let includedModels = new Set();

    elements.forEach(el => {
        let macro = el.get('latexMacro');
        if (macro === 'freetext' || macro === 'connectordot' || macro === 'groundterminal') return;

        let dbData = JL_DATABASE[macro];
        let baseName = (el.get('displayedText') || "comp").replace(/\s+/g, '');
        let name = baseName + "_" + el.id.split('-')[0].substring(0, 4);

        if (!dbData || !dbData.spiceTemplate) {
            errors.push(`Component <b>${name}</b> does not have a SPICE Template.`);
            return;
        }

        let template = dbData.spiceTemplate;
        let spiceData = el.get('spiceData') || {};
        template = template.replace(/\{NAME\}/g, name);

        el.getPorts().forEach(port => {
            let pt = window.getAbsolutePinCoord(el, port.id);
            let netId = getNetForPin(pt);
            if (netId === null || netPopulation[netId] === 1) errors.push(`Component <b>${name}</b> has an unconnected/floating pin.`);
            template = template.replace(new RegExp(`\\{${port.id}\\}`, 'g'), netId || "NC");
        });

        let remainingParams = [...template.matchAll(/\{([^}]+)\}/g)].map(m => m[1]);
        remainingParams.forEach(param => {
            let val = spiceData[param] !== undefined ? spiceData[param] : "";

            if (param === 'MODEL' && val === "") {
                let prefixMatch = dbData.spiceTemplate.match(/^([a-zA-Z])_/);
                let compType = prefixMatch ? prefixMatch[1].toUpperCase() : null;
                let isP = el.get('customArgs') && el.get('customArgs')[2] === 'p'; 
                
                if (compType === 'D') { val = "D_IDEAL"; includedModels.add(".model D_IDEAL D"); } 
                else if (compType === 'Q') { val = isP ? "PNP_IDEAL" : "NPN_IDEAL"; includedModels.add(isP ? ".model PNP_IDEAL PNP" : ".model NPN_IDEAL NPN"); } 
                else if (compType === 'M') { val = isP ? "PMOS_IDEAL" : "NMOS_IDEAL"; includedModels.add(isP ? ".model PMOS_IDEAL PMOS" : ".model NMOS_IDEAL NMOS"); }
                else if (compType === 'X') { val = "OPAMP_IDEAL"; includedModels.add(".subckt OPAMP_IDEAL in_p in_n out\nE1 out 0 in_p in_n 1Meg\n.ends"); }
            }

            if (param === 'MODEL' && val !== "") {
                let userModels = AppState.spiceSimConfig.modelsContent || "";
                if (val.startsWith('WIZ_')) {
                    let isZener = macro.includes('zener'); let isMOS = macro.includes('mos'); let isBJT = macro.includes('bipolar'); let isDiode = macro.includes('diode') && !isZener;
                    let modelStr = `.model ${val} `;
                    if (isZener) modelStr += `D (BV=${spiceData['WIZ_VZ'] || '5.1'} IBV=1m IS=1e-14 N=1)`;
                    else if (isMOS) {
                        let isP = el.get('customArgs') && el.get('customArgs')[2] === 'p';
                        modelStr += (isP ? "PMOS" : "NMOS") + ` (VTO=${spiceData['WIZ_VTO'] || '1.0'} KP=${spiceData['WIZ_KP'] || '20u'})`;
                    } else if (isBJT) {
                        let isP = el.get('customArgs') && el.get('customArgs')[2] === 'p';
                        modelStr += (isP ? "PNP" : "NPN") + ` (BF=${spiceData['WIZ_BF'] || '100'} IS=1e-14)`;
                    } else if (isDiode) {
                        modelStr += `D (IS=1e-14 VJ=${spiceData['WIZ_VJ'] || '0.7'})`;
                    }
                    if (!userModels.includes(val)) includedModels.add(modelStr);
                } 
            }
            if (val === "") {
                if (param === 'SIGNAL') val = "0";
                if (param === 'W') val = "1u";
                if (param === 'L') val = "1u";
            }
            template = template.replace(new RegExp(`\\{${param}\\}`, 'g'), val);
        });

        let missingMatches = template.match(/\{([^}]+)\}/g);
        if (missingMatches) missingMatches.forEach(m => errors.push(`Component <b>${name}</b> is missing value for parameter: <b>${m}</b>.`));
        
        spiceCode += template + "\n";
        if (dbData.spiceModel) includedModels.add(dbData.spiceModel);
    });

    if (includedModels.size > 0) {
        spiceCode += "\n* --- Component Models & Subcircuits ---\n";
        includedModels.forEach(modelCode => { spiceCode += modelCode + "\n\n"; });
    }

    spiceCode += "\n* --- Simulation Commands ---\n";
    spiceCode += (customSim || ".op\n.end") + "\n";

    return { code: spiceCode, topo: topo, errors: errors };
}

// -----------------------------------------
// 2. SIMULATION RUNNER (WASM)
// -----------------------------------------
export function runSimulation(mode, customNetlist = null) {
    if (typeof Module === 'undefined') return;

    if (!customNetlist) {
        let c = AppState.spiceSimConfig;
        let MAX_SAFE_POINTS = 200000; 
        
        if (mode === 'tran') {
            let step = parseSpiceToNumber(c.tranStep); let stop = parseSpiceToNumber(c.tranStop); let start = parseSpiceToNumber(c.tranStart);
            if (step > 0) {
                let pts = (stop - start) / step;
                if (pts > MAX_SAFE_POINTS) return Swal.fire('Simulation Aborted', `Requested <b>${Math.round(pts).toLocaleString()}</b> data points. Decrease your Stop Time or increase your Time Step.`, 'error');
            }
        } else if (mode === 'ac') {
            let pts = parseInt(c.acPoints); let start = parseSpiceToNumber(c.acStart); let stop = parseSpiceToNumber(c.acStop);
            let totalPts = (c.acType === 'lin') ? pts : (pts * Math.log10(stop / start));
            if (totalPts > MAX_SAFE_POINTS) return Swal.fire('Simulation Aborted', `Requested <b>~${Math.round(totalPts).toLocaleString()}</b> data points. Decrease points.`, 'error');
        }
    }

    Swal.fire({ title: 'Simulating...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    setTimeout(() => {
        try {
            try { Module.FS.mkdir('/tmp'); } catch(e) {}
            let safeRam = "MemTotal:       524288 kB\nMemFree:        524288 kB\nMemAvailable:   524288 kB\n";
            try { Module.FS.writeFile('/tmp/meminfo', safeRam); } catch(e) {}

            window.spiceErrorFlag = false; window.spiceErrorMsg = "";

            if (!isSpiceInitialized) {
                let sendCharCallback = Module.addFunction(function(textPtr) {
                    let msg = Module.UTF8ToString(textPtr).trim();
                    console.warn("[SPICE]:", msg);
                    if (msg.startsWith('stderr Error')) {
                        window.spiceErrorFlag = true; window.spiceErrorMsg = msg.replace('stderr Error', '').trim();
                    } else if (msg.startsWith('stderr') && msg.toLowerCase().includes('error')) {
                        window.spiceErrorFlag = true;
                    }
                    return 0; 
                }, 'iiii'); 
                Module.ccall('ngSpice_Init', 'number', ['number','number','number','number','number','number','number'], [sendCharCallback, 0, 0, 0, 0, 0, 0]);
                isSpiceInitialized = true;
            }

            let cleanNetlist = ""; let topo = null;

            if (customNetlist) {
                cleanNetlist = customNetlist.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
                topo = window.extractTopology(); 
            } else {
                let simCommands = "\n" + buildSpiceCommands(mode);
                let netlistData = generateSpiceNetlistStr(simCommands); 

                if (netlistData.errors && netlistData.errors.length > 0) {
                    let errorHtml = `<ul style="text-align: left; font-size: 13px; color: #c0392b;">` + netlistData.errors.map(e => `<li style="margin-bottom: 5px;">${e}</li>`).join('') + `</ul>`;
                    Swal.fire('Error', 'There are errors in the schematic.<br><br>' + errorHtml, 'error');
                    return;
                }
                cleanNetlist = netlistData.code.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
                topo = netlistData.topo;
            }

            Module.FS.writeFile('/circuit.cir', cleanNetlist);
            Module.ccall('ngSpice_Command', 'number', ['string'], ['destroy all']);
            Module.ccall('ngSpice_Command', 'number', ['string'], ['remcirc']);
            Module.ccall('ngSpice_Command', 'number', ['string'], ['source /circuit.cir']);

            if (window.spiceErrorFlag) return Swal.fire('SPICE Error', 'The engine encountered a fatal error:<br><br><b>' + window.spiceErrorMsg + '</b><br><br>Check the console for details.', 'error');

            if (mode === 'op') Module.ccall('ngSpice_Command', 'number', ['string'], ['op']);
            else Module.ccall('ngSpice_Command', 'number', ['string'], ['run']);

            Module.ccall('ngSpice_Command', 'number', ['string'], ['set filetype=ascii']);
            try { Module.FS.unlink('/output.raw'); } catch(e) {}
            Module.ccall('ngSpice_Command', 'number', ['string'], ['write /output.raw']);

            try {
                let rawOutput = Module.FS.readFile('/output.raw', { encoding: 'utf8' });
                if (mode === 'op') {
                    annotateDCOperatingPointFromRaw(rawOutput, topo);
                    Swal.fire({ toast: true, position: 'bottom-end', icon: 'success', title: 'DC Simulation Complete!', showConfirmButton: false, timer: 2000 });
                } else {
                    let parsedData = parseSpiceRaw(rawOutput);
                    let title = mode === 'tran' ? 'Transient Analysis' : 'AC Analysis';
                    plotSimulationResults(parsedData, title);
                }
            } catch(e) { Swal.fire({ icon: 'error', title: 'Simulation error', text: "See SPICE LOGS in console." }); }
        } catch (error) { console.error(error); }
    }, 100);
}

// -----------------------------------------
// 3. PARSING & CHARTING
// -----------------------------------------
function parseSpiceValue(valStr) {
    if (valStr.includes(',')) {
        let parts = valStr.split(',');
        let re = parseFloat(parts[0]); let im = parseFloat(parts[1]);
        return { mag: Math.sqrt(re*re + im*im), phase: Math.atan2(im, re) * (180 / Math.PI) };
    }
    return parseFloat(valStr);
}

function parseSpiceRaw(rawOutput) {
    let lines = rawOutput.split('\n');
    let mode = ''; let vars = []; let points = []; let currentPoint = [];

    for (let i = 0; i < lines.length; i++) {
        let l = lines[i].trim();
        if (l.startsWith('Variables:')) { mode = 'vars'; continue; }
        if (l.startsWith('Values:')) { mode = 'vals'; continue; }

        if (mode === 'vars') {
            let parts = l.split(/\s+/);
            if (parts.length >= 3 && !isNaN(parts[0])) vars.push({ idx: parseInt(parts[0]), name: parts[1], type: parts[2] });
        } else if (mode === 'vals' && l !== '') {
            let parts = l.split(/\s+/);
            let startIndex = (currentPoint.length === 0 && parts.length > 1 && !parts[0].includes('.') && !parts[0].includes('e')) ? 1 : 0;
            for (let j = startIndex; j < parts.length; j++) currentPoint.push(parseSpiceValue(parts[j]));
            if (currentPoint.length === vars.length) { points.push(currentPoint); currentPoint = []; }
        }
    }
    return { vars, points };
}

function plotSimulationResults(parsedData, title) {
    window.currentSimData = parsedData;
    window.currentSimTitle = title;
    window.currentSimIsAC = title.includes('AC');
    
    if (!parsedData.vars || parsedData.vars.length < 2 || parsedData.points.length === 0) return Swal.fire('Error', 'No plot data available.', 'error');

    let xVar = parsedData.vars[0];
    let datasets = [];
    let colors = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#e67e22', '#1abc9c', '#34495e'];
    let isAC = window.currentSimIsAC;
    const getX = (p) => typeof p[0] === 'object' ? p[0].mag : p[0];

    let activePoints = parsedData.points;
    if (isAC) activePoints = activePoints.filter(p => getX(p) > 0);

    if (activePoints.length === 0) {
        return Swal.fire({ title: 'No Data Plotted', html: 'The simulation ran, but the graph is empty.<br><b>Tip for AC Analysis:</b> Make sure your source has an <b>AC Amplitude</b> set (e.g., <code>1</code>).', icon: 'warning' });
    }

    if (activePoints.length > 3000) {
        let step = Math.ceil(activePoints.length / 3000);
        activePoints = activePoints.filter((_, index) => index % step === 0);
        title += ` <span style="font-size: 11px; color: #7f8c8d; font-weight: normal;">(Decimated)</span>`;
    }

    let maxX = 0, maxY = 0, isComplex = false;
    for (let i = 1; i < parsedData.vars.length; i++) {
        for (let p of activePoints) {
            let xVal = getX(p), yVal = p[i], yMag = typeof yVal === 'object' ? yVal.mag : yVal;
            if (Math.abs(xVal) > maxX) maxX = Math.abs(xVal);
            if (Math.abs(yMag) > maxY) maxY = Math.abs(yMag);
            if (typeof yVal === 'object') isComplex = true;
        }
    }

    let getScale = (m) => {
        if (m === 0) return { mult: 1, prefix: '' };
        let a = Math.abs(m);
        if (a >= 1e9) return { mult: 1e-9, prefix: 'G' }; if (a >= 1e6) return { mult: 1e-6, prefix: 'M' };
        if (a >= 1e3) return { mult: 1e-3, prefix: 'k' }; if (a >= 1) return { mult: 1, prefix: '' };
        if (a >= 1e-3) return { mult: 1e3, prefix: 'm' }; if (a >= 1e-6) return { mult: 1e6, prefix: 'µ' };
        if (a >= 1e-9) return { mult: 1e9, prefix: 'n' }; if (a >= 1e-12) return { mult: 1e12, prefix: 'p' };
        return { mult: 1e15, prefix: 'f' };
    };

    let xScale = isAC ? { mult: 1, prefix: '' } : getScale(maxX);
    let yScale = getScale(maxY);
    let xUnit = isAC ? 'Hz' : 's';
    let isAllV = parsedData.vars.slice(1).every(v => v.name.toLowerCase().startsWith('v'));
    let isAllI = parsedData.vars.slice(1).every(v => v.name.toLowerCase().startsWith('i'));
    let yUnit = isAllV ? 'V' : (isAllI ? 'A' : '');

    for (let i = 1; i < parsedData.vars.length; i++) {
        let bc = colors[(i-1) % colors.length];
        if (isComplex) {
            datasets.push({ label: parsedData.vars[i].name + ' (Mag)', data: activePoints.map(p => ({ x: getX(p), y: (typeof p[i] === 'object' ? p[i].mag : p[i]) })), borderColor: bc, borderWidth: 2, fill: false, pointRadius: 0, tension: 0.1, yAxisID: 'y' });
            datasets.push({ label: parsedData.vars[i].name + ' (Phase)', data: activePoints.map(p => ({ x: getX(p), y: (typeof p[i] === 'object' ? p[i].phase : 0) })), borderColor: bc, borderWidth: 2, borderDash: [5, 5], fill: false, pointRadius: 0, tension: 0.1, yAxisID: 'y1' });
        } else {
            datasets.push({ label: parsedData.vars[i].name, data: activePoints.map(p => ({ x: getX(p), y: p[i] })), borderColor: bc, borderWidth: 2, fill: false, pointRadius: 0, tension: 0.1, yAxisID: 'y' });
        }
    }

    Swal.fire({
        width: 'auto', padding: '0', background: 'transparent', backdrop: false, showConfirmButton: false, heightAuto: false,
        html: `
            <div id="sim-true-window" style="width: 800px; height: 500px; min-width: 400px; min-height: 300px; resize: both; overflow: hidden; display: flex; flex-direction: column; background: #ffffff; border-radius: 6px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); border: 1px solid #bdc3c7; pointer-events: auto;">
                <div id="swal-drag-handle-sim" style="flex: 0 0 40px; cursor: move; background: #2c3e50; color: #ecf0f1; padding: 0 15px; display: flex; justify-content: space-between; align-items: center; user-select: none;">
                    <span style="font-size: 14px; font-weight: bold; display:flex; align-items:center; gap:8px;">📊 ${title}</span>
                    <div style="display:flex; gap: 5px; align-items: center;">
                        <button onclick="Swal.close()" style="background: none; border: none; color: white; cursor: pointer; font-weight: bold; font-size: 16px;" title="Close">✖</button>
                    </div>
                </div>
                <div style="flex: 1; padding: 15px; box-sizing: border-box; overflow: hidden;">
                    <div style="position: relative; width: 100%; height: 100%;"><canvas id="simChart"></canvas></div>
                </div>
            </div>
        `,
        didOpen: () => {
            const popup = Swal.getPopup(); const handle = document.getElementById('swal-drag-handle-sim');
            popup.style.background = 'transparent'; popup.style.boxShadow = 'none';
            let isDragging = false, startX, startY, initialLeft, initialTop;
            const onMouseMove = (e) => { if (!isDragging) return; popup.style.left = (initialLeft + (e.clientX - startX)) + 'px'; popup.style.top = (initialTop + (e.clientY - startY)) + 'px'; };
            const onMouseUp = () => { isDragging = false; document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp); };
            handle.addEventListener('mousedown', (e) => {
                if (e.target.tagName === 'BUTTON') return; 
                isDragging = true; const rect = popup.getBoundingClientRect(); popup.style.margin = '0'; popup.style.position = 'fixed'; 
                popup.style.left = rect.left + 'px'; popup.style.top = rect.top + 'px'; startX = e.clientX; startY = e.clientY; initialLeft = rect.left; initialTop = rect.top;
                document.addEventListener('mousemove', onMouseMove); document.addEventListener('mouseup', onMouseUp);
            });

            let ctx = document.getElementById('simChart').getContext('2d');
            window.simChartInstance = new Chart(ctx, {
                type: 'line', data: { datasets: datasets },
                options: {
                    responsive: true, maintainAspectRatio: false, animation: false, interaction: { mode: 'index', intersect: false },
                    scales: {
                        x: { type: isAC ? 'logarithmic' : 'linear', title: { display: true, text: `${xVar.name} (${xScale.prefix}${xUnit})` }, ticks: { callback: v => isAC ? v : parseFloat((v * xScale.mult).toFixed(3)) } },
                        y: { type: 'linear', position: 'left', title: { display: true, text: `Magnitude (${yScale.prefix}${yUnit})` }, ticks: { callback: v => parseFloat((v * yScale.mult).toFixed(3)) } },
                        y1: { type: 'linear', display: isComplex, position: 'right', title: { display: true, text: 'Phase (°)' }, grid: { drawOnChartArea: false } }
                    }
                }
            });
        }
    });
}

// -----------------------------------------
// 4. DC BACK-ANNOTATION (BLue/Purple Badges)
// -----------------------------------------
export function clearSimAnnotations() {
    let overlay = document.getElementById('dc-annotation-overlay');
    if (overlay) overlay.innerHTML = '';
}

function annotateDCOperatingPointFromRaw(rawOutput, topo) {
    let voltages = {};
    let lines = rawOutput.split('\n');
    let inVars = false, inVals = false, vars = [], vals = [];

    lines.forEach(line => {
        let l = line.trim();
        if (l.startsWith('Variables:')) { inVars = true; return; }
        if (l.startsWith('Values:')) { inVars = false; inVals = true; return; }
        if (inVars) { let p = l.split(/\s+/); if (p.length >= 3) vars.push(p[1].toLowerCase()); } 
        else if (inVals && l !== '') {
            let p = l.split(/\s+/);
            if (vals.length === 0 && p.length > 1) vals.push(parseFloat(p[1])); else if (p.length > 0) vals.push(parseFloat(p[0]));
        }
    });

    for (let i = 0; i < vars.length; i++) { let m = vars[i].match(/^v\(([^)]+)\)$/); if (m) voltages[m[1]] = vals[i]; }

    let overlay = document.getElementById('dc-annotation-overlay');
    if (!overlay) {
        overlay = document.createElement('div'); overlay.id = 'dc-annotation-overlay';
        overlay.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:1100; overflow:hidden;';
        document.getElementById('paper-container').appendChild(overlay);
    }
    overlay.innerHTML = '<svg id="dc-lines-svg" style="position:absolute; top:0; left:0; width:100%; height:100%; overflow:visible; pointer-events:none;"></svg>';
    let linesSvg = overlay.querySelector('#dc-lines-svg');
    let getNet = (id) => topo.netMap.get(topo.uf.find(id));
    let drawnNets = new Set(); let matrix = AppState.paper.matrix(); 

    topo.terminals.forEach(term => {
        let netId = getNet(term.id);
        if (netId && !drawnNets.has(netId)) {
            drawnNets.add(netId);
            let v = netId === '0' ? 0.0 : voltages[netId];
            if (v !== undefined) {
                let text = formatEng(v, 'V');
                let screenX = term.x * matrix.a + matrix.e, screenY = term.y * matrix.d + matrix.f;
                let targetX = screenX + 25, targetY = screenY - 25;

                let lineEl = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                lineEl.setAttribute('x1', screenX); lineEl.setAttribute('y1', screenY); lineEl.setAttribute('x2', targetX); lineEl.setAttribute('y2', targetY);
                lineEl.setAttribute('stroke', '#2980b9'); lineEl.setAttribute('stroke-width', '1.5'); linesSvg.appendChild(lineEl);
                let dotEl = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                dotEl.setAttribute('cx', screenX); dotEl.setAttribute('cy', screenY); dotEl.setAttribute('r', '3'); dotEl.setAttribute('fill', '#2980b9'); linesSvg.appendChild(dotEl);

                let badge = document.createElement('div');
                badge.style.cssText = `position:absolute; left:${targetX}px; top:${targetY - 10}px; background:#2980b9; color:white; padding:2px 5px; border-radius:4px; font-size:10px; font-family:monospace; font-weight:bold; border:1px solid #1f618d;`;
                badge.innerText = text; overlay.appendChild(badge);
            }
        }
    });
}

// -----------------------------------------
// 5. NETLIST EDITOR DIALOG
// -----------------------------------------
export function openSpiceNetlistEditor() {
    let mode = AppState.spiceSimConfig.activeTab || 'tran';
    let simCommands = "\n" + buildSpiceCommands(mode);
    let netlistData = generateSpiceNetlistStr(simCommands);

    if (netlistData.errors && netlistData.errors.length > 0) {
        let errorHtml = `<ul style="text-align: left; font-size: 13px; color: #c0392b;">` + 
                        netlistData.errors.map(e => `<li style="margin-bottom: 5px;">${e}</li>`).join('') + 
                        `</ul>`;
        Swal.fire('Error', 'There are errors in the schematic.<br><br>' + errorHtml, 'error');
        return;
    }

    let cleanNetlist = netlistData.code.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    Swal.fire({
        title: 'SPICE Netlist Editor',
        width: '800px',
        html: `
            <div style="text-align:left; font-size:13px; color:#2c3e50;">
                <p style="margin-top:0; color:#7f8c8d;">You can manually edit the generated netlist before running the simulation.<br><b>Note:</b> Edits made here are temporary and will not be saved back to the canvas.</p>
                <textarea id="custom-netlist-editor" spellcheck="false" style="width: 100%; height: 400px; font-family: monospace; font-size: 13px; padding: 10px; box-sizing: border-box; border: 1px solid #bdc3c7; border-radius: 4px; white-space: pre; overflow: auto; background: #fdfdfd; color: #2c3e50;">${cleanNetlist}</textarea>
            </div>
        `,
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: '⚡ Run Simulation',
        denyButtonText: '💾 Save to File',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#27ae60',
        denyButtonColor: '#3498db',
        preConfirm: () => {
            return document.getElementById('custom-netlist-editor').value;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            let customCode = result.value;
            
            // Smart Detection: Find out what type of simulation the expert typed in
            let detectedMode = 'op';
            let lowerCode = customCode.toLowerCase();
            if (lowerCode.includes('.tran')) detectedMode = 'tran';
            else if (lowerCode.includes('.ac')) detectedMode = 'ac';
            
            runSimulation(detectedMode, customCode);
            
        } else if (result.isDenied) {
            let code = document.getElementById('custom-netlist-editor').value;
            saveFileAs('circuit.cir', code, 'text/plain', 'SPICE Netlist', '.cir');
        }
    });
}

// -----------------------------------------
// 6. THEVENIN / NORTON SOLVER
// -----------------------------------------
export function promptTheveninNode() {
    let netlistData = generateSpiceNetlistStr("\n.op\n.end\n");
    if (netlistData.errors && netlistData.errors.length > 0) {
        Swal.fire('Error', 'Fix schematic errors before running the solver.', 'error');
        return;
    }

    let code = netlistData.code;

    // Looking for: I_PROBE_xxxx <NODE> 0 DC 0
    let probeRegex = /I_PROBE_[^\s]+\s+([^\s]+)\s+0\s+DC\s+0/i;
    let match = code.match(probeRegex);

    if (!match) {
        Swal.fire({
            title: 'Probe Not Connected', 
            html: 'The <b>Test Probe (TP)</b> is either missing or not touching a valid wire/pin.<br><br><i>Ensure the top tip of the probe is visually overlapping a wire or connection dot!</i>', 
            icon: 'info',
            confirmButtonColor: '#3498db'
        });
        return;
    }
    
    let allProbes = code.match(/I_PROBE_[^\s]+/gi);
    if (allProbes && allProbes.length > 1) {
        Swal.fire('Too Many Probes', 'Please leave only ONE Test Probe on the canvas.', 'warning');
        return;
    }

    let targetNode = match[1];

    if (targetNode === '0') {
        Swal.fire('Invalid Node', 'The probe is connected directly to Ground (Node 0). Please move it to a live circuit node!', 'error');
        return;
    }

    executeTheveninSolver(targetNode);
}

function executeTheveninSolver(targetNode) {
    if (typeof Module === 'undefined') return;
    Swal.fire({ title: 'Calculating Vth and Rth...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    setTimeout(() => {
        try {
            try { Module.FS.mkdir('/tmp'); } catch(e) {}
            let safeRam = "MemTotal:       524288 kB\nMemFree:        524288 kB\nMemAvailable:   524288 kB\n";
            try { Module.FS.writeFile('/tmp/meminfo', safeRam); } catch(e) {}

            if (!isSpiceInitialized) {
                let sendCharCallback = Module.addFunction(function(textPtr) {
                    let msg = Module.UTF8ToString(textPtr).trim();
                    console.warn("[SPICE]:", msg);
                    if (msg.startsWith('stderr Error')) {
                        window.spiceErrorFlag = true;
                        window.spiceErrorMsg = msg.replace('stderr Error', '').trim();
                    } else if (msg.startsWith('stderr') && msg.toLowerCase().includes('error')) {
                        window.spiceErrorFlag = true;
                    }
                    return 0; 
                }, 'iiii'); 
                Module.ccall('ngSpice_Init', 'number', ['number','number','number','number','number','number','number'], [sendCharCallback, 0, 0, 0, 0, 0, 0]);
                isSpiceInitialized = true;
            }

            let netlistData = generateSpiceNetlistStr("\n.op\n.end\n");
            if (netlistData.errors && netlistData.errors.length > 0) {
                Swal.fire('Error', 'Fix schematic errors before running the solver.', 'error');
                return;
            }
            let baseNetlist = netlistData.code.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

            // --- RUN 1: OPEN CIRCUIT VOLTAGE (Vth) ---
            window.spiceErrorFlag = false;
            window.spiceErrorMsg = "";

            Module.FS.writeFile('/circuit_voc.cir', baseNetlist);
            Module.ccall('ngSpice_Command', 'number', ['string'], ['destroy all']);
            Module.ccall('ngSpice_Command', 'number', ['string'], ['remcirc']);
            Module.ccall('ngSpice_Command', 'number', ['string'], ['source /circuit_voc.cir']);
            Module.ccall('ngSpice_Command', 'number', ['string'], ['op']);

            if (window.spiceErrorFlag) {
                Swal.fire('Circuit Error', 'SPICE crashed on your base circuit:<br><br><b style="color:#c0392b;">' + window.spiceErrorMsg + '</b><br><br>Check your schematic for disconnected pins!', 'error');
                return;
            }

            Module.ccall('ngSpice_Command', 'number', ['string'], ['set filetype=ascii']);
            try { Module.FS.unlink('/output_voc.raw'); } catch(e) {}
            Module.ccall('ngSpice_Command', 'number', ['string'], ['write /output_voc.raw']);
            
            let Vth = 0;
            let vocExists = false;
            try { vocExists = Module.FS.analyzePath('/output_voc.raw').exists; } catch(e) {}
            
            if (vocExists) {
                let rawVoc = Module.FS.readFile('/output_voc.raw', { encoding: 'utf8' });
                let parsedVoc = parseSpiceRaw(rawVoc);
                let vIndex = parsedVoc.vars.findIndex(v => v.name === `v(${targetNode})`);
                if (vIndex !== -1) Vth = parsedVoc.points[0][vIndex];
                else {
                    Swal.fire('Error', `Node ${targetNode} not found in results.`, 'error');
                    return;
                }
            } else {
                Swal.fire('Simulation Error', 'SPICE aborted during Open-Circuit calculation. Check the browser console.', 'error');
                return;
            }

            // --- RUN 2: SHORT CIRCUIT CURRENT (Isc) ---
            window.spiceErrorFlag = false; 
            let shortNetlist = baseNetlist.replace('.op', `V_THEV_SHORT ${targetNode} 0 DC 0\n.op`);
            Module.FS.writeFile('/circuit_isc.cir', shortNetlist);
            Module.ccall('ngSpice_Command', 'number', ['string'], ['destroy all']);
            Module.ccall('ngSpice_Command', 'number', ['string'], ['remcirc']);
            Module.ccall('ngSpice_Command', 'number', ['string'], ['source /circuit_isc.cir']);
            Module.ccall('ngSpice_Command', 'number', ['string'], ['op']);
            Module.ccall('ngSpice_Command', 'number', ['string'], ['set filetype=ascii']);
            try { Module.FS.unlink('/output_isc.raw'); } catch(e) {}
            Module.ccall('ngSpice_Command', 'number', ['string'], ['write /output_isc.raw']);

            let Isc = 0;
            let iscExists = false;
            try { iscExists = Module.FS.analyzePath('/output_isc.raw').exists; } catch(e) {}

            if (iscExists) {
                let rawIsc = Module.FS.readFile('/output_isc.raw', { encoding: 'utf8' });
                let parsedIsc = parseSpiceRaw(rawIsc);
                let iIndex = parsedIsc.vars.findIndex(v => v.name === `i(v_thev_short)`);
                if (iIndex !== -1) Isc = parsedIsc.points[0][iIndex];
            } else {
                console.warn("[Thevenin] Singular Matrix detected. Assigning infinite short-circuit current (Rth = 0).");
                Isc = Infinity;
            }

            // Calculate Rth
            let Rth = 0;
            if (Isc === Infinity) Rth = 0; 
            else if (Math.abs(Isc) < 1e-12) Rth = 1e12; 
            else Rth = Math.abs(Vth / Isc);
            
            if (Rth < 1e-6) Rth = 0;

            drawTheveninEquivalent(Vth, Rth, targetNode);

        } catch (error) { 
            console.error("Thevenin Solver Exception:", error); 
            Swal.fire('Simulation Error', 'An unexpected error occurred. See console.', 'error');
        }
    }, 100);
}

function drawTheveninEquivalent(Vth, Rth, nodeName) {
    // 1. Format Absolute Voltage
    let absVth = Math.abs(Vth);
    let vStr = absVth < 1e-6 ? "0" : absVth.toPrecision(3);
    let isVthPos = (Vth >= 0);
    let vTopSign = isVthPos ? "+" : "-";
    let vBotSign = isVthPos ? "-" : "+";
    
    // 2. Format Resistance
    let rStr = Rth >= 1e9 ? "∞" :
               Rth >= 1e6 ? (Rth/1e6).toPrecision(3) + ' M' : 
               Rth >= 1e3 ? (Rth/1e3).toPrecision(3) + ' k' : 
               Rth > 0 && Rth < 1 ? (Rth*1000).toPrecision(3) + ' m' : Math.round(Rth).toString();

    // 3. Calculate and Format Absolute Norton Current
    let Ino = Rth === 0 ? Infinity : (Vth / Rth);
    let absIno = Math.abs(Ino);
    let isInoPos = (Ino >= 0);
    
    let iStr = absIno === Infinity ? "∞" :
               absIno < 1e-12 ? "0" :
               absIno >= 1 ? absIno.toPrecision(3) :
               absIno >= 1e-3 ? (absIno * 1e3).toPrecision(3) + ' m' :
               absIno >= 1e-6 ? (absIno * 1e6).toPrecision(3) + ' µ' :
               absIno >= 1e-9 ? (absIno * 1e9).toPrecision(3) + ' n' : absIno.toExponential(2);
    
    let iArrowPath = isInoPos ? 
        "M 60 170 L 60 130 M 55 140 L 60 130 L 65 140" :  
        "M 60 130 L 60 170 M 55 160 L 60 170 L 65 160";   

    let theveninSvg = '';
    if (Rth >= 1e9) {
        theveninSvg = `<div style="width:340px; height:280px; background: #fdfdfd; border: 1px dashed #bdc3c7; border-radius: 8px; display:flex; align-items:center; justify-content:center; text-align:center; padding: 20px; box-sizing:border-box;"><span style="color:#7f8c8d; font-size:13px;">Thevenin Equivalent N/A<br>(Ideal Current Source / Rth = ∞)</span></div>`;
    } else {
        theveninSvg = `
            <svg width="340" height="280" viewBox="-50 0 350 280" xmlns="http://www.w3.org/2000/svg" style="background: #fdfdfd; border: 1px dashed #bdc3c7; border-radius: 8px;">
                <path d="M 100 200 L 100 220 M 80 220 L 120 220 M 87 228 L 113 228 M 94 236 L 106 236" stroke="#2c3e50" stroke-width="2" fill="none" stroke-linecap="round"/>
                
                <circle cx="60" cy="150" r="30" stroke="#2c3e50" stroke-width="2" fill="#fff" />
                <text x="60" y="135" font-family="monospace" font-size="20" font-weight="bold" text-anchor="middle" fill="#c0392b">${vTopSign}</text>
                <text x="60" y="178" font-family="monospace" font-size="24" font-weight="bold" text-anchor="middle" fill="#2980b9">${vBotSign}</text>
                <text x="25" y="155" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="end" fill="#2c3e50">${vStr} V</text>
                <text x="25" y="135" font-family="sans-serif" font-size="11" text-anchor="end" fill="#7f8c8d">Vth</text>
                
                <path d="M 60 120 L 60 100 L 100 100" stroke="#2c3e50" stroke-width="2" fill="none" />
                <path d="M 100 100 L 110 85 L 130 115 L 150 85 L 170 115 L 180 100" stroke="#2c3e50" stroke-width="2" fill="none" stroke-linejoin="round" />
                <text x="140" y="65" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="#2c3e50">${rStr} Ω</text>
                <text x="140" y="45" font-family="sans-serif" font-size="11" text-anchor="middle" fill="#7f8c8d">Rth</text>
                
                <line x1="180" y1="100" x2="230" y2="100" stroke="#2c3e50" stroke-width="2" />
                
                <path d="M 60 180 L 60 200 L 230 200" stroke="#2c3e50" stroke-width="2" fill="none" />
                <circle cx="100" cy="200" r="3.5" fill="#2c3e50" /> <circle cx="235" cy="100" r="5" stroke="#8e44ad" stroke-width="2" fill="white" />
                <circle cx="235" cy="200" r="5" stroke="#2c3e50" stroke-width="2" fill="white" />
                <text x="245" y="105" font-family="sans-serif" font-size="14" font-weight="bold" fill="#8e44ad">Node ${nodeName}</text>
            </svg>
        `;
    }

    let nortonSvg = '';
    if (Rth === 0) {
        nortonSvg = `<div style="width:340px; height:280px; background: #fdfdfd; border: 1px dashed #bdc3c7; border-radius: 8px; display:flex; align-items:center; justify-content:center; text-align:center; padding: 20px; box-sizing:border-box;"><span style="color:#7f8c8d; font-size:13px;">Norton Equivalent N/A<br>(Ideal Voltage Source / Rth = 0)</span></div>`;
    } else {
        nortonSvg = `
            <svg width="340" height="280" viewBox="-50 0 350 280" xmlns="http://www.w3.org/2000/svg" style="background: #fdfdfd; border: 1px dashed #bdc3c7; border-radius: 8px;">
                <path d="M 145 200 L 145 220 M 125 220 L 165 220 M 132 228 L 158 228 M 139 236 L 151 236" stroke="#2c3e50" stroke-width="2" fill="none" stroke-linecap="round"/>
                
                <circle cx="60" cy="150" r="30" stroke="#2c3e50" stroke-width="2" fill="#fff" />
                <path d="${iArrowPath}" stroke="#c0392b" stroke-width="2" fill="none" stroke-linejoin="round" />
                <text x="25" y="155" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="end" fill="#2c3e50">${iStr} A</text>
                <text x="25" y="135" font-family="sans-serif" font-size="11" text-anchor="end" fill="#7f8c8d">Ino</text>

                <path d="M 145 100 L 145 120 L 130 130 L 160 150 L 130 170 L 145 180 L 145 200" stroke="#2c3e50" stroke-width="2" fill="none" stroke-linejoin="round" />
                <text x="175" y="155" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="start" fill="#2c3e50">${rStr} Ω</text>
                <text x="175" y="135" font-family="sans-serif" font-size="11" text-anchor="start" fill="#7f8c8d">Rno</text>

                <line x1="60" y1="100" x2="230" y2="100" stroke="#2c3e50" stroke-width="2" />
                <line x1="60" y1="200" x2="230" y2="200" stroke="#2c3e50" stroke-width="2" />
                <line x1="60" y1="120" x2="60" y2="100" stroke="#2c3e50" stroke-width="2" />
                <line x1="60" y1="180" x2="60" y2="200" stroke="#2c3e50" stroke-width="2" />
                
                <circle cx="145" cy="100" r="3.5" fill="#2c3e50" />
                <circle cx="145" cy="200" r="3.5" fill="#2c3e50" />
                
                <circle cx="235" cy="100" r="5" stroke="#8e44ad" stroke-width="2" fill="white" />
                <circle cx="235" cy="200" r="5" stroke="#2c3e50" stroke-width="2" fill="white" />
                <text x="245" y="105" font-family="sans-serif" font-size="14" font-weight="bold" fill="#8e44ad">Node ${nodeName}</text>
            </svg>
        `;
    }

    let dualDiagram = `
        <div style="display: flex; justify-content: space-around; gap: 15px; margin-top: 10px;">
            <div>
                <div style="text-align: center; margin-bottom: 8px; font-weight: bold; color: #2c3e50; font-size: 14px;">Thevenin</div>
                ${theveninSvg}
            </div>
            <div>
                <div style="text-align: center; margin-bottom: 8px; font-weight: bold; color: #2c3e50; font-size: 14px;">Norton</div>
                ${nortonSvg}
            </div>
        </div>
    `;

    Swal.fire({
        title: 'Equivalent Circuits',
        html: dualDiagram,
        confirmButtonText: 'Close',
        confirmButtonColor: '#34495e',
        width: '740px' 
    });
}