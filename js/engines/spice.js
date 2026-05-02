// js/engines/spice.js
import { AppState, THEME_COLORS } from '../state.js';
import { parseSpiceToNumber } from '../parsers/helpers.js';
import { saveFileAs } from '../parsers/io.js';

// --- SIMULATION LOG ENGINE ---
let latexWindowWasVisible = false;
let outputPanelWasCollapsed = false; // Tracks the user's UI state

export const SimLog = {
    init: function() {
        if (!document.getElementById('sim-log-animations')) {
            let style = document.createElement('style');
            style.id = 'sim-log-animations';
            style.innerHTML = `
                @keyframes pulse-error-border {
                    0%   { border-color: var(--danger, #e74c3c); box-shadow: inset 0 0 12px rgba(231, 76, 60, 0.5); }
                    50%  { border-color: rgba(231, 76, 60, 0.3); box-shadow: inset 0 0 2px rgba(231, 76, 60, 0.1); }
                    100% { border-color: var(--danger, #e74c3c); box-shadow: inset 0 0 12px rgba(231, 76, 60, 0.5); }
                }
                .sim-log-error-state {
                    animation: pulse-error-border 2s ease-in-out infinite !important;
                }
            `;
            document.head.appendChild(style);
        }

        let logContainer = document.getElementById('sim-log-terminal');
        if (!logContainer) {
            logContainer = document.createElement('div');
            logContainer.id = 'sim-log-terminal';
            
            // CHANGED: Converted to Flexbox, removed padding/scrolling from the outer wrapper
            logContainer.style.cssText = `
                display: none; flex-direction: column; position: absolute; top: 0; left: 0; 
                width: 100%; height: 100%; z-index: 100;
                background: var(--bg-app, #111); color: var(--text-main, #eee);
                border-radius: inherit; box-sizing: border-box; overflow: hidden;
                border: 2px solid transparent; 
                transition: border-color 0.3s, box-shadow 0.3s;
            `;
            
            let targetArea = document.getElementById('output-panel') || document.body;
            if (window.getComputedStyle(targetArea).position === 'static') {
                targetArea.style.position = 'relative';
            }
            targetArea.appendChild(logContainer);
        }
    },
    show: function() {
        this.init();
        
        let targetArea = document.getElementById('output-panel');
        if (targetArea) {
            outputPanelWasCollapsed = targetArea.classList.contains('collapsed');
            targetArea.classList.remove('collapsed');
        }

        let latexWin = document.getElementById('latex-output');
        let latexBtns = document.querySelector('#output-panel .floating-buttons');
        
        if (latexWin) {
            latexWindowWasVisible = latexWin.style.display !== 'none';
            latexWin.style.display = 'none';
        }
        if (latexBtns) latexBtns.style.display = 'none';
        
        let logContainer = document.getElementById('sim-log-terminal');
        logContainer.style.display = 'flex'; // CHANGED: Must be flex, not block
        logContainer.classList.remove('sim-log-error-state');
        
        // CHANGED: Injects a permanent header and a scrollable content box
        logContainer.innerHTML = `
            <!-- FIXED HEADER -->
            <div style="flex: 0 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 6px 15px; background: rgba(0,0,0,0.15); border-bottom: 1px solid var(--border-main);">
                <span style="font-size: 11px; font-weight: 700; color: var(--text-muted, #888); letter-spacing: 0.5px; text-transform: uppercase;">>_ Simulation Log</span>
                <button id="sim-log-close-btn" style="background: none; border: none; color: var(--text-muted, #888); cursor: pointer; font-size: 14px; font-weight: bold; line-height: 1; padding: 0 5px; transition: color 0.2s;" title="Close Terminal">✖</button>
            </div>
            
            <!-- SCROLLABLE CONTENT -->
            <div id="sim-log-content" style="flex: 1; overflow-y: auto; padding: 12px 15px; font-family: var(--font-code, monospace); font-size: 13px;">
                <div style="color: var(--primary, #3498db); font-weight:bold; margin-bottom: 8px; border-bottom: 1px solid var(--border-main); padding-bottom: 4px;">[ SYSTEM ] Initializing NGSpice Engine...</div>
            </div>
        `;
        
        let closeBtn = document.getElementById('sim-log-close-btn');
        closeBtn.onclick = () => this.hide();
        closeBtn.onmouseover = () => closeBtn.style.color = 'var(--danger, #e74c3c)';
        closeBtn.onmouseout = () => closeBtn.style.color = 'var(--text-muted, #888)';
    },
    hide: function() {
        let logContainer = document.getElementById('sim-log-terminal');
        if (logContainer) logContainer.style.display = 'none';
        
        let targetArea = document.getElementById('output-panel');
        if (targetArea && outputPanelWasCollapsed) {
            targetArea.classList.add('collapsed');
        }

        let latexWin = document.getElementById('latex-output');
        let latexBtns = document.querySelector('#output-panel .floating-buttons');
        
        if (latexWin && latexWindowWasVisible) latexWin.style.display = 'block';
        if (latexBtns && latexWindowWasVisible) latexBtns.style.display = ''; 
    },
    print: function(msg, isError = false) {
        let logContainer = document.getElementById('sim-log-terminal');
        let contentArea = document.getElementById('sim-log-content'); // CHANGED: Grab inner box
        if (!logContainer || !contentArea) return;
        
        let line = document.createElement('div');
        line.style.marginBottom = '3px';
        line.style.whiteSpace = 'pre-wrap';
        
        let lowerMsg = msg.toLowerCase();
        
        if (isError || lowerMsg.includes('fatal') || lowerMsg.includes('error')) {
            logContainer.classList.add('sim-log-error-state'); // Apply flash to outer wrapper
            
            line.style.color = 'var(--danger, #e74c3c)'; 
            line.style.fontWeight = 'bold';
            line.innerText = lowerMsg.startsWith('error') ? msg : `[ ERROR ] ${msg}`;
            
        } else if (lowerMsg.includes('warning')) {
            line.style.color = 'var(--warning, #f39c12)';
            line.style.fontWeight = 'bold';
            line.innerText = msg;
            
        } else {
            line.style.color = 'var(--text-main, #d4d4d4)';
            line.innerText = msg;
        }
        
        // CHANGED: Append text and scroll the inner box only
        contentArea.appendChild(line);
        contentArea.scrollTop = contentArea.scrollHeight;
    }
};

let isSpiceInitialized = false;

// -----------------------------------------
// 1. NETLIST GENERATION
// -----------------------------------------
function buildSpiceCommands(mode) {
    // FIXED: Using AppState instead of window, with a safety fallback
    let c = AppState.spiceSimConfig || {}; 
    let cmds = "";
    
    // Force SPICE to calculate internal branch currents (Crucial for DC/Tran).
    // We strictly skip this for AC analysis to prevent "vector has zero length" errors!
    if (mode !== 'ac') {
        cmds += ".options savecurrents\n";
    }
    
    if (c.modelsContent) cmds += c.modelsContent + "\n\n";
    if (c.customCmds) cmds += c.customCmds + "\n";
    
    if (mode === 'tran') {
        cmds += `.tran ${c.tranStep || '1u'} ${c.tranStop || '1m'} ${c.tranStart || '0'}\n`;
    } else if (mode === 'ac') {
        cmds += `.ac ${c.acType || 'dec'} ${c.acPoints || '10'} ${c.acStart || '1'} ${c.acStop || '10k'}\n`;
    }
    
    cmds += ".end\n";
    return cmds;
}

export function formatEng(val, unit = 'V') {
    if (val === 0 || Math.abs(val) < 1e-15) return "0.00 " + unit;
    let abs = Math.abs(val);
    let sign = val < 0 ? "-" : "";
    
    // We use 0.995 thresholds so that numbers like 0.999e-6 get correctly 
    // bumped up into the 'micro' bracket as 1.00 µ instead of 1000.00 n
    if (abs >= 0.995e9) return sign + (abs / 1e9).toFixed(2) + " G" + unit;
    if (abs >= 0.995e6) return sign + (abs / 1e6).toFixed(2) + " M" + unit;
    if (abs >= 0.995e3) return sign + (abs / 1e3).toFixed(2) + " k" + unit;
    if (abs >= 0.995) return sign + abs.toFixed(2) + " " + unit;
    if (abs >= 0.995e-3) return sign + (abs * 1e3).toFixed(2) + " m" + unit;
    if (abs >= 0.995e-6) return sign + (abs * 1e6).toFixed(2) + " µ" + unit;
    if (abs >= 0.995e-9) return sign + (abs * 1e9).toFixed(2) + " n" + unit;
    if (abs >= 0.995e-12) return sign + (abs * 1e12).toFixed(2) + " p" + unit;
    if (abs >= 0.995e-15) return sign + (abs * 1e15).toFixed(2) + " f" + unit;
    
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
        if (macro === 'freetext' || macro === 'connectordot' || macro === 'groundterminal' || macro === 'ioport' || macro === 'ioportdot') return;

        let dbData = JL_DATABASE[macro];
        let baseName = (el.get('displayedText') || "comp").replace(/\s+/g, '');
        let name = baseName + "_" + el.id.split('-')[0].substring(0, 4);

        if (!dbData || !dbData.spiceTemplate) {
            errors.push(`Component <b>${name}</b> does not have a SPICE Template.`);
            return;
        }

        let template = dbData.spiceTemplate.replace(/\\n/g, '\n');
        let spiceData = el.get('spiceData') || {};
        let simData = el.get('simData') || {}; // <-- ADDED: Fetch simData for the switch properties
        template = template.replace(/\{NAME\}/g, name);
		
		// ==========================================
        // NEW: DYNAMIC OP-AMP PIN SWAPPING
        // ==========================================
        if (macro === 'opamplifier') {
            let args = el.get('customArgs') || [];
            if (args[2] === 'flip') {
                // If flipped visually, swap the physical SPICE connections!
                template = template.replace('{pin1}', '{TEMP}').replace('{pin2}', '{pin1}').replace('{TEMP}', '{pin2}');
            }
        }
        // ==========================================

        el.getPorts().forEach(port => {
            let pt = window.getAbsolutePinCoord(el, port.id);
            let netId = getNetForPin(pt);
            if (netId === null || netPopulation[netId] === 1) errors.push(`Component <b>${name}</b> has an unconnected/floating pin.`);
            template = template.replace(new RegExp(`\\{${port.id}\\}`, 'g'), netId || "NC");
        });

        let remainingParams = [...template.matchAll(/\{([^}]+)\}/g)].map(m => m[1]);
        remainingParams.forEach(param => {
            let val = spiceData[param] !== undefined ? spiceData[param] : "";

            // ==========================================
            // ADDED: DYNAMIC SWITCH RESISTANCE LOGIC
            // ==========================================
            if (param.startsWith('RES') && macro.includes('switch')) {
                let args = el.get('customArgs') || [];
                let ron = simData['RON'] || '1m'; 
                let roff = simData['ROFF'] || '100Meg';
                
                // 1. Handle SPDT (3-port) Switch
                if (macro === 'mechanicalswitchthreeport') {
                    let state = args[2] ? args[2].toString().toLowerCase() : 'state1';
                    if (param === 'RES1') val = (state === 'state1') ? ron : roff;
                    if (param === 'RES2') val = (state === 'state2') ? ron : roff;
                } 
                // 2. Handle Controlled Switch Box (Logic 0/1 + N/P type)
                else if (macro === 'controlledswitchbox') {
                    let ctrlVal = args[2] ? args[2].toString() : '0';
                    let type = args[3] ? args[3].toString().toLowerCase() : 'n';
                    
                    // Determine if the bridge is visually closed
                    let isClosed = false;
                    if (type === 'n' && ctrlVal.includes('1')) isClosed = true;
                    if (type === 'p' && ctrlVal.includes('0')) isClosed = true;
                    
                    val = isClosed ? ron : roff;
                }
                // 3. Handle Standard Mechanical / Controlled Switches
                else {
                    let state = args[2] ? args[2].toString().toLowerCase() : 'open'; 
                    val = (state === 'closed') ? ron : roff;
                }
            }
            // ==========================================

            if (param === 'MODEL') {
                let userModels = AppState.spiceSimConfig.modelsContent || "";
                
                // 1. Fetch from standard Library (e.g. LM741_MACRO, 2N3904)
                if (val && !val.startsWith('WIZ_')) {
                    let lib = window.SPICE_MODEL_LIBRARY || {};
                    for (let cat in lib) {
                        if (lib[cat][val]) {
                            if (!userModels.includes(val)) includedModels.add(lib[cat][val]);
                            break;
                        }
                    }
                } 
                // 2. Generate Wizard Models dynamically
                else if (val.startsWith('WIZ_')) {
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
            // Track warnings globally so the UI can see them
            if (!window.spiceFallbacksUsed) window.spiceFallbacksUsed = [];

            if (val === "") {
                if (param === 'SIGNAL') val = "0";
                if (param === 'W') val = "1u";
                if (param === 'L') val = "1u";
                if (param === 'VALUE') {
                    if (macro.includes('resistor')) { val = "1k"; window.spiceFallbacksUsed.push(baseName); }
                    else if (macro.includes('capacitor')) { val = "1u"; window.spiceFallbacksUsed.push(baseName); }
                    else if (macro.includes('inductor')) { val = "1m"; window.spiceFallbacksUsed.push(baseName); }
                    else { val = "1"; window.spiceFallbacksUsed.push(baseName); }
                }
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
export async function runSimulation(mode, customNetlist = null) {
    if (typeof Module === 'undefined') return;

    if (!customNetlist) {
        let c = AppState.spiceSimConfig || {};
        let MAX_SAFE_POINTS = 200000; 
        
        if (mode === 'tran') {
            let step = parseSpiceToNumber(c.tranStep || '1u');
            let stop = parseSpiceToNumber(c.tranStop || '1m');
            let start = parseSpiceToNumber(c.tranStart || '0');
            if (step > 0) {
                let pts = (stop - start) / step;
                if (pts > MAX_SAFE_POINTS) {
                    Swal.fire('Simulation Aborted', `Requested <b>${Math.round(pts).toLocaleString()}</b> data points.<br><br>Please increase your Time Step or decrease your Stop Time.`, 'error');
                    return;
                }
            }
        } else if (mode === 'ac') {
            let pts = parseInt(c.acPoints || '10');
            let start = parseSpiceToNumber(c.acStart || '1');
            let stop = parseSpiceToNumber(c.acStop || '10k');
            let totalPts = (c.acType === 'lin') ? pts : (pts * Math.log10(stop / start));
            if (totalPts > MAX_SAFE_POINTS) {
                Swal.fire('Simulation Aborted', `Requested <b>~${Math.round(totalPts).toLocaleString()}</b> data points.<br><br>Decrease points.`, 'error');
                return; 
            }
        }
    }

    Swal.fire({ title: 'Simulating...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    setTimeout(() => {
        try {
            try { Module.FS.mkdir('/tmp'); } catch(e) {}
            let safeRam = "MemTotal:       524288 kB\nMemFree:        524288 kB\nMemAvailable:   524288 kB\n";
            try { Module.FS.writeFile('/tmp/meminfo', safeRam); } catch(e) {}

            window.spiceErrorFlag = false;
            window.spiceErrorMsg = "";

            if (!isSpiceInitialized) {
                let sendCharCallback = Module.addFunction(function(textPtr) {
                    let msg = Module.UTF8ToString(textPtr).trim();
                    if (!msg) return 0;
                    
                    console.warn("[SPICE]:", msg); 
                    
                    let isErr = msg.startsWith('stderr Error') || (msg.startsWith('stderr') && msg.toLowerCase().includes('error'));
                    
                    if (typeof SimLog !== 'undefined' && SimLog.print) SimLog.print(msg.replace('stderr', '').trim(), isErr);

                    if (isErr) {
                        window.spiceErrorFlag = true;
                        window.spiceErrorMsg = msg.replace('stderr Error', '').trim();
                    }
                    return 0; 
                }, 'iiii'); 
                Module.ccall('ngSpice_Init', 'number', ['number','number','number','number','number','number','number'], [sendCharCallback, 0, 0, 0, 0, 0, 0]);
                isSpiceInitialized = true;
            }

            let cleanNetlist = "";
            let topo = null;

            if (customNetlist) {
                cleanNetlist = customNetlist.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
                if (typeof window.extractTopology === 'function') topo = window.extractTopology(); 
            } else {
                let simCommands = "\n" + buildSpiceCommands(mode);
                let netlistData = generateSpiceNetlistStr(simCommands); 

                if (netlistData.errors && netlistData.errors.length > 0) {
                    let errorHtml = `<ul style="text-align: left; font-size: 13px; color: var(--danger);">` + 
                                    netlistData.errors.map(e => `<li style="margin-bottom: 5px;">${e}</li>`).join('') + 
                                    `</ul>`;
                    Swal.fire('Error', 'There are errors in the schematic.<br><br>' + errorHtml, 'error');
                    return;
                }
                cleanNetlist = netlistData.code.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
                topo = netlistData.topo;
            }

            // Bring up the terminal. If it errors out, the border will start flashing red!
            if (typeof SimLog !== 'undefined' && SimLog.show) SimLog.show();

            Module.FS.writeFile('/circuit.cir', cleanNetlist);
            Module.ccall('ngSpice_Command', 'number', ['string'], ['destroy all']);
            Module.ccall('ngSpice_Command', 'number', ['string'], ['remcirc']);
            Module.ccall('ngSpice_Command', 'number', ['string'], ['source /circuit.cir']);

            // KILLED THE SWAL: We just cleanly abort and let the terminal flash
            if (window.spiceErrorFlag) {
                Swal.close(); 
                return;
            }

            if (mode === 'op') Module.ccall('ngSpice_Command', 'number', ['string'], ['op']);
            else Module.ccall('ngSpice_Command', 'number', ['string'], ['run']);

            Module.ccall('ngSpice_Command', 'number', ['string'], ['set filetype=ascii']);
            try { Module.FS.unlink('/output.raw'); } catch(e) {}
            
            Module.ccall('ngSpice_Command', 'number', ['string'], ['write /output.raw']);

            try {
                let rawOutput = Module.FS.readFile('/output.raw', { encoding: 'utf8' });
                
                if (mode === 'op') {
                    if (typeof annotateDCOperatingPointFromRaw === 'function') {
                        annotateDCOperatingPointFromRaw(rawOutput, topo);
                    }
                } else {
                    let parsedData = parseSpiceRaw(rawOutput);
                    let title = mode === 'tran' ? 'Transient Analysis' : 'AC Analysis';
                    if (typeof plotSimulationResults === 'function') {
                        plotSimulationResults(parsedData, title);
                    } else {
                        let errMsg = "plotSimulationResults function is missing or not exported!";
                        console.error(errMsg);
                        if (typeof SimLog !== 'undefined' && SimLog.print) SimLog.print(errMsg, true);
                    }
                }
            } catch(e) {
                // KILLED THE SWAL: We just print to the terminal and let it flash
                Swal.close();
                console.error("💥 FATAL SIMULATION JS ERROR:", e);
                if (typeof SimLog !== 'undefined' && SimLog.print) SimLog.print("FATAL SIMULATION JS ERROR: " + e.message, true);
            }
        } catch (error) { 
            // KILLED THE SWAL: We just print to the terminal and let it flash
            Swal.close();
            console.error("💥 WASM Engine Crash:", error); 
            if (typeof SimLog !== 'undefined' && SimLog.print) SimLog.print("WASM Engine Crash: " + error.message, true);
        }
    }, 100);
}

// -----------------------------------------
// 3. PARSING & CHARTING
// -----------------------------------------
function parseSpiceValue(valStr) {
    if (valStr.includes(',')) {
        let parts = valStr.split(',');
        let re = parseFloat(parts[0]); 
        let im = parseFloat(parts[1]);
        return { mag: Math.sqrt(re*re + im*im), phase: Math.atan2(im, re) * (180 / Math.PI) };
    }
    return parseFloat(valStr);
}

function parseSpiceRaw(rawOutput) {
    let lines = rawOutput.split('\n');
    let mode = ''; 
    let vars = []; 
    let points = []; 
    let currentPoint = [];

    for (let i = 0; i < lines.length; i++) {
        let l = lines[i].trim();
        if (!l) continue;
        
        // Reset memory safely if a new plot block starts
        if (l.startsWith('Variables:')) { 
            mode = 'vars'; 
            vars = []; 
            points = []; 
            currentPoint = [];
            continue; 
        }
        if (l.startsWith('Values:')) { 
            mode = 'vals'; 
            continue; 
        }

        if (mode === 'vars') {
            let parts = l.split(/\s+/);
            if (parts.length >= 3 && !isNaN(parts[0])) {
                vars.push({ idx: parseInt(parts[0]), name: parts[1], type: parts[2] });
            }
        } else if (mode === 'vals') {
            // Safety Check: If we hit a text header like "Plotname:", stop trying to parse numbers!
            if (l.startsWith('Plotname:') || l.startsWith('Title:') || l.startsWith('Date:')) {
                mode = '';
                continue;
            }
            
            let parts = l.split(/\s+/);
            let startIndex = (currentPoint.length === 0 && parts.length > 1 && !parts[0].includes('.') && !parts[0].includes('e')) ? 1 : 0;
            
            for (let j = startIndex; j < parts.length; j++) {
                currentPoint.push(parseSpiceValue(parts[j]));
            }
            
            if (currentPoint.length === vars.length) { 
                points.push(currentPoint); 
                currentPoint = []; 
            }
        }
    }
    return { vars, points };
}

function plotSimulationResults(parsedData, title) {
	// --- THE FIX: Nuke lingering Chart.js instances before proceeding! ---
    if (window.simChartInstance) {
        window.simChartInstance.destroy();
        window.simChartInstance = null;
    }
	
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
        title += ` <span style="font-size: 11px; color: var(--text-muted); font-weight: normal;">(Decimated)</span>`;
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
	
	// Helper for high-contrast export button hover effects
    const btnHover = `onmouseover="this.style.background='var(--primary)'; this.style.color='#ffffff'" onmouseout="this.style.background='transparent'; this.style.color='var(--text-main)'"`;

    Swal.fire({
        width: 'auto', padding: 0, background: 'transparent', backdrop: false, showConfirmButton: false, heightAuto: false,
        customClass: { popup: 'spice-modal-override', htmlContainer: 'spice-modal-override' },
        
        // --- THE FIX: Nuke Chart.js when the window closes to prevent hover crashes ---
        willClose: () => {
            if (window.simChartInstance) {
                window.simChartInstance.destroy();
                window.simChartInstance = null;
            }
        },
        // ------------------------------------------------------------------------------

        html: `
            <style>
                .swal2-popup.spice-modal-override { padding: 0 !important; background: transparent !important; border: none !important; }
                .swal2-html-container.spice-modal-override { padding: 0 !important; margin: 0 !important; overflow: hidden !important; }
            </style>
            <div id="sim-true-window" style="width: 800px; height: 500px; min-width: 400px; min-height: 300px; resize: both; overflow: hidden; display: flex; flex-direction: column; background: var(--bg-panel); border-radius: 6px; box-shadow: 0 4px 25px rgba(0,0,0,0.5); border: 1px solid var(--border-main); pointer-events: auto;">
                
                <div id="swal-drag-handle-sim" style="flex: 0 0 42px; cursor: move; background: var(--bg-toolbar); color: var(--text-inverse); padding: 0 10px; display: flex; justify-content: space-between; align-items: center; user-select: none; border-bottom: 1px solid var(--border-main);">
                    
                    <span style="font-size: 14px; font-weight: bold; display:flex; align-items:center; gap:6px; flex-shrink: 0; white-space: nowrap;">
                        <i data-lucide="line-chart" style="width: 16px; height: 16px; color: var(--primary);"></i> ${title} 
                    </span>
                    
                    <div style="display:flex; gap: 8px; align-items: center; flex-grow: 1; justify-content: flex-end; overflow: visible;">
                        
                        <!-- EXPORT DROPDOWN -->
                        <div style="position: relative; margin: 0; white-space: nowrap;">
                            <button id="btn-export-sim-toggle" style="padding: 3px 8px; font-size: 11px; font-weight: bold; background: rgba(0,0,0,0.2); border: none; border-radius: 4px; color: var(--text-inverse); display: flex; align-items: center; gap: 4px; cursor: pointer;">
                                <i data-lucide="download" style="width: 12px; height: 12px;"></i> Export ▼
                            </button>
                            <div id="menu-export-sim" style="display: none; position: absolute; right: 0; top: calc(100% + 5px); background: var(--bg-panel); box-shadow: 0 4px 15px rgba(0,0,0,0.5); border: 1px solid var(--border-main); border-radius: 4px; padding: 5px 0; z-index: 10000; min-width: 180px;">
                                <button id="btn-export-csv" ${btnHover} style="display:block; width:100%; text-align:left; padding:8px 12px; background:transparent; border:none; color:var(--text-main); cursor:pointer; font-size:12px; transition: background 0.1s;">Export CSV</button>
                                <button id="btn-export-json" ${btnHover} style="display:block; width:100%; text-align:left; padding:8px 12px; background:transparent; border:none; color:var(--text-main); cursor:pointer; font-size:12px; transition: background 0.1s;">Export JSON</button>
                                <button id="btn-export-tikz" ${btnHover} style="display:block; width:100%; text-align:left; padding:8px 12px; background:transparent; border:none; color:var(--text-main); cursor:pointer; font-size:12px; transition: background 0.1s;">Export TikZ (.tex)</button>
                                <button id="btn-export-png" ${btnHover} style="display:block; width:100%; text-align:left; padding:8px 12px; background:transparent; border:none; color:var(--text-main); cursor:pointer; font-size:12px; transition: background 0.1s;">Export PNG</button>
                            </div>
                        </div>

                    </div>
                    <button onclick="Swal.close()" style="flex-shrink: 0; background: none; border: none; color: var(--text-inverse); cursor: pointer; font-weight: bold; font-size: 18px; line-height: 1; padding: 0 0 0 10px; margin-left: 10px;" title="Close Window">✖</button>
                </div>
                
                <div style="flex: 1; padding: 15px; box-sizing: border-box; overflow: hidden; background: var(--bg-panel);">
                    <div style="position: relative; width: 100%; height: 100%;"><canvas id="simChart"></canvas></div>
                </div>
            </div>
        `,
        didOpen: () => {
            lucide.createIcons();
            const popup = Swal.getPopup(); 
            const htmlContainer = Swal.getHtmlContainer();
            const handle = document.getElementById('swal-drag-handle-sim');
            
            // THE FIX: Surgical padding overrides
            popup.style.background = 'transparent'; 
            popup.style.boxShadow = 'none';
            popup.style.setProperty('padding', '0', 'important');
            if (htmlContainer) {
                htmlContainer.style.setProperty('padding', '0', 'important');
                htmlContainer.style.setProperty('margin', '0', 'important');
                htmlContainer.style.overflow = 'hidden';
            }

            // --- JAVASCRIPT DROPDOWN TOGGLE LOGIC ---
            const btnExportToggle = document.getElementById('btn-export-sim-toggle');
            const menuExport = document.getElementById('menu-export-sim');

            const closeMenu = () => { if(menuExport) menuExport.style.display = 'none'; };

            if (btnExportToggle) {
                btnExportToggle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    let isVis = menuExport.style.display === 'block';
                    closeMenu();
                    if (!isVis) menuExport.style.display = 'block';
                });
            }

            popup.addEventListener('click', closeMenu);
            document.querySelectorAll('#menu-export-sim button').forEach(btn => {
                btn.addEventListener('click', closeMenu);
            });

            // 1. SMART CSV EXPORT 
            document.getElementById('btn-export-csv').onclick = async () => {
                let isAC = window.currentSimIsAC;
                let csvContent = isAC ? "Frequency (Hz)," : "Time (s),";
                
                let headers = [];
                for (let i = 1; i < parsedData.vars.length; i++) {
                    if (isAC) {
                        headers.push(parsedData.vars[i].name + " (Magnitude)");
                        headers.push(parsedData.vars[i].name + " (Phase deg)");
                    } else {
                        headers.push(parsedData.vars[i].name);
                    }
                }
                csvContent += headers.join(",") + "\n";
                
                for (let i = 0; i < parsedData.points.length; i++) {
                    let pt = parsedData.points[i];
                    let row = [ getX(pt) ];
                    for (let j = 1; j < parsedData.vars.length; j++) {
                        let val = pt[j];
                        if (isAC) {
                            row.push(typeof val === 'object' ? val.mag : val);
                            row.push(typeof val === 'object' ? val.phase : 0);
                        } else {
                            row.push(val); 
                        }
                    }
                    csvContent += row.join(",") + "\n";
                }

                if (window.showSaveFilePicker) {
                    try {
                        const fileHandle = await window.showSaveFilePicker({
                            suggestedName: `simulation_${title.split(' ')[0]}.csv`,
                            types: [{ description: 'CSV Data', accept: { 'text/csv': ['.csv'] } }],
                        });
                        const writable = await fileHandle.createWritable();
                        await writable.write(csvContent);
                        await writable.close();
                    } catch (err) { if (err.name !== 'AbortError') console.error(err); }
                } else {
                    let blob = new Blob([csvContent], { type: 'text/csv' });
                    downloadFile(URL.createObjectURL(blob), `simulation_${title.split(' ')[0]}.csv`, true);
                }
            };

            // 2. SMART JSON EXPORT
            document.getElementById('btn-export-json').onclick = async () => {
                let rawJson = JSON.stringify(parsedData, null, 2);
                if (window.showSaveFilePicker) {
                    try {
                        const fileHandle = await window.showSaveFilePicker({
                            suggestedName: 'sim_data.json',
                            types: [{ description: 'JSON Data', accept: { 'application/json': ['.json'] } }],
                        });
                        const writable = await fileHandle.createWritable();
                        await writable.write(rawJson);
                        await writable.close();
                    } catch (err) { if (err.name !== 'AbortError') console.error(err); }
                } else {
                    let blob = new Blob([rawJson], { type: "application/json" });
                    downloadFile(URL.createObjectURL(blob), `sim_data.json`, true);
                }
            };

            // 3. TIKZ & PNG WIRING
            document.getElementById('btn-export-tikz').onclick = () => exportSimTikz();
            document.getElementById('btn-export-png').onclick = () => exportSimImage();

            // Drag Logic
            let isDragging = false, startX, startY, initialLeft, initialTop;
            const onMouseMove = (e) => { if (!isDragging) return; popup.style.left = (initialLeft + (e.clientX - startX)) + 'px'; popup.style.top = (initialTop + (e.clientY - startY)) + 'px'; };
            const onMouseUp = () => { isDragging = false; document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp); };
            handle.addEventListener('mousedown', (e) => {
                if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return; 
                isDragging = true; const rect = popup.getBoundingClientRect(); popup.style.margin = '0'; popup.style.position = 'fixed'; 
                popup.style.left = rect.left + 'px'; popup.style.top = rect.top + 'px'; startX = e.clientX; startY = e.clientY; initialLeft = rect.left; initialTop = rect.top;
                document.addEventListener('mousemove', onMouseMove); document.addEventListener('mouseup', onMouseUp);
            });

            // Render Chart
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
// 4. DC BACK-ANNOTATION & TABLE
// -----------------------------------------

export function clearSimAnnotations() {
    let overlay = document.getElementById('dc-annotation-overlay');
    if (overlay) overlay.remove(); 

    if (AppState && AppState.graph) {
        AppState.graph.getElements().forEach(el => {
            let view = el.findView(AppState.paper);
            if (view && view.el) {
                view.el.style.filter = '';
                view.el.style.transition = '';
            }
        });
    }
}

export function annotateDCOperatingPointFromRaw(rawOutput, topo) {
    let voltages = {};
    let rawCurrents = {};
    let powers = {};

    let lines = rawOutput.split('\n');
    let inVars = false, inVals = false, vars = [], vals = [];

    lines.forEach(line => {
        let l = line.trim();
        
        // THE FIX: Wipe memory on new variable blocks
        if (l.startsWith('Variables:')) { 
            inVars = true; 
            inVals = false;
            vars = []; 
            vals = []; 
            return; 
        }
        if (l.startsWith('Values:')) { inVars = false; inVals = true; return; }
        
        if (inVars) { 
            let p = l.split(/\s+/); 
            // Also explicitly checking !isNaN ensures we don't grab header text
            if (p.length >= 3 && !isNaN(p[0])) vars.push(p[1].toUpperCase()); 
        } else if (inVals && l !== '') {
            let p = l.split(/\s+/);
            if (vals.length === 0 && p.length > 1 && !p[0].includes('.') && !p[0].includes('e')) {
                vals.push(parseFloat(p[1])); 
            } else if (p.length > 0) {
                vals.push(parseFloat(p[0]));
            }
        }
    });

    for (let i = 0; i < vars.length; i++) {
        let varName = vars[i];
        let val = vals[i];

        let mV = varName.match(/^V\(([^)]+)\)$/i);
        if (mV) voltages[mV[1]] = val;

        let mI = varName.match(/^I\(([^)]+)\)$/i) || varName.match(/^([A-Z0-9_]+)#BRANCH$/i);
        if (mI) rawCurrents[mI[1].toUpperCase()] = val;

        let mDevI = varName.match(/^@([A-Z0-9_]+)\[I\]$/i) || varName.match(/^@([A-Z0-9_]+)\[ID\]$/i);
        if (mDevI) rawCurrents[mDevI[1].toUpperCase()] = val;

        let mDevP = varName.match(/^@([A-Z0-9_]+)\[P\]$/i) || varName.match(/^@([A-Z0-9_]+)\[POWER\]$/i);
        if (mDevP) powers[mDevP[1].toUpperCase()] = val;
    }

    let overlay = document.getElementById('dc-annotation-overlay');
    if (overlay) overlay.remove(); 

    overlay = document.createElement('div'); 
    overlay.id = 'dc-annotation-overlay';
    overlay.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:1100; overflow:visible;';
    document.getElementById('paper-container').appendChild(overlay);
    
    overlay.innerHTML = '<svg id="dc-lines-svg" xmlns="http://www.w3.org/2000/svg" style="position:absolute; top:0; left:0; width:100%; height:100%; overflow:visible; pointer-events:none;"><g id="net-highlight-layer"></g></svg>';
    
    let beautifulCurrents = {}; 

    AppState.graph.getElements().forEach(el => {
        let macro = el.get('latexMacro');
        if (macro === 'connectordot' || macro === 'groundterminal') return;
        
        let nameMatch = el.get('displayedText');
        if (!nameMatch) return;
        
        let baseName = nameMatch.split('=')[0].trim().toUpperCase(); 
        let shortId = el.id.split('-')[0].substring(0, 4).toUpperCase();
        let searchPattern = `${baseName}_${shortId}`;

        let rawKey = Object.keys(rawCurrents).find(k => k.includes(searchPattern) || k === `V_${baseName}` || k === `I_${baseName}` || k === baseName);
        let currentVal = rawKey ? rawCurrents[rawKey] : undefined;

        // SPICE templates for these parts use {pin2} {pin1} instead of {pin1} {pin2}. 
        // We flip the sign so the UI vector math draws the arrow correctly.
        if (currentVal !== undefined && (macro === 'dcbattery' || macro === 'dcvoltagesource')) {
            currentVal = -currentVal;
        }

        // --- NEW: Find the matching Power value ---
        let rawPKey = Object.keys(powers).find(k => k.includes(searchPattern) || k === `V_${baseName}` || k === `I_${baseName}` || k === baseName);
        let powerVal = rawPKey ? powers[rawPKey] : undefined;

        // --- ADDED: Calculate power manually if NGSpice didn't provide it ---
        if (powerVal === undefined && currentVal !== undefined) {
            try {
                let getNetForPin = (pt) => {
                    let cluster = topo.terminals.find(t => Math.abs(t.x - pt.x) < 5 && Math.abs(t.y - pt.y) < 5);
                    return cluster ? topo.netMap.get(topo.uf.find(cluster.id)) : null;
                };

                let pt1 = window.getAbsolutePinCoord ? window.getAbsolutePinCoord(el, 'pin1') : null;
                let pt2 = window.getAbsolutePinCoord ? window.getAbsolutePinCoord(el, 'pin2') : null;
                
                if (pt1 && pt2) {
                    let net1 = getNetForPin(pt1);
                    let net2 = getNetForPin(pt2);
                    
                    // Fetch the voltages at the two pins (default to 0 if grounded or disconnected)
                    let v1 = (String(net1) === '0' || !net1) ? 0.0 : (voltages[net1] || 0.0);
                    let v2 = (String(net2) === '0' || !net2) ? 0.0 : (voltages[net2] || 0.0);
                    
                    // Power = |V_drop| * |I|
                    powerVal = Math.abs(v1 - v2) * Math.abs(currentVal);
                }
            } catch (err) {
                console.warn("Could not calculate power for " + baseName, err);
            }
        }

        let spiceData = el.get('spiceData') || {};
        let valText = spiceData['VALUE'];
        if (!valText) {
            if (macro.includes('resistor')) valText = "1k";
            else if (macro.includes('capacitor')) valText = "1u";
            else if (macro.includes('inductor')) valText = "1m";
            else valText = "";
        }

        // --- NEW: Include power in the object ---
        if (currentVal !== undefined || powerVal !== undefined) {
            beautifulCurrents[el.id] = { 
                name: `${baseName} (${shortId})`, 
                compVal: valText,
                val: currentVal,
                power: powerVal
            };
        }
    });

    showDCOperatingPointTable({ nodes: voltages, currents: beautifulCurrents, powers: powers }, topo);
}


export function showDCOperatingPointTable(opData, topo) {
    let tableHtml = `
        <div style="max-height: 350px; overflow-y: auto; text-align: left; background: var(--bg-app); border-bottom-left-radius: 6px; border-bottom-right-radius: 6px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: var(--text-main);">
                <thead style="position: sticky; top: 0; background: var(--bg-panel); border-bottom: 1px solid var(--border-main); z-index: 10;">
                    <tr>
                        <th style="padding: 10px;">Item</th>
                        <th style="padding: 10px;">Type</th>
                        <th style="padding: 10px; text-align: right;">Value</th>
                    </tr>
                </thead>
                <tbody>
    `;

    for (let [node, vol] of Object.entries(opData.nodes || {})) {
        tableHtml += `<tr style="border-bottom: 1px solid var(--border-main); cursor: pointer; transition: background 0.15s;" data-net="${node}" class="dc-table-row">
            <td style="padding: 8px; font-weight: 600;">Net ${node}</td>
            <td style="padding: 8px; color: var(--text-muted);">Voltage</td>
            <td style="padding: 8px; text-align: right; font-family: var(--font-code);">${formatEng(vol, 'V')}</td>
        </tr>`;
    }

    for (let [compId, data] of Object.entries(opData.currents || {})) {
        let displayName = data.compVal ? `${data.name} <span style="color:var(--text-muted); font-weight:normal;">(${data.compVal})</span>` : data.name;
        
        // 1. Render Current Row
        if (data.val !== undefined) {
            tableHtml += `<tr style="border-bottom: 1px solid var(--border-main); cursor: pointer; transition: background 0.15s;" data-comp-id="${compId}" class="dc-table-row">
                <td style="padding: 8px; font-weight: 600;">${displayName}</td>
                <td style="padding: 8px; color: var(--text-muted);">Current</td>
                <td style="padding: 8px; text-align: right; font-family: var(--font-code);">${formatEng(data.val, 'A')}</td>
            </tr>`;
        }

        // 2. Render Power Row (using var(--warning) for a nice visual distinction)
        if (data.power !== undefined) {
            // SPICE conventionally reports negative power for generating sources and positive for consuming loads.
            // You can use Math.abs(data.power) here if you just want pure dissipation magnitudes.
            tableHtml += `<tr style="border-bottom: 1px solid var(--border-main); cursor: pointer; transition: background 0.15s;" data-comp-id="${compId}" class="dc-table-row">
                <td style="padding: 8px; font-weight: 600;">${displayName}</td>
                <td style="padding: 8px; color: var(--warning);">Power</td>
                <td style="padding: 8px; text-align: right; font-family: var(--font-code);">${formatEng(data.power, 'W')}</td>
            </tr>`;
        }
    }

    tableHtml += `</tbody></table></div>`;

    const btnStyle = "border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.2); color: #ffffff; border-radius: 4px; padding: 4px 10px; cursor: pointer; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 6px; transition: opacity 0.2s;";

    Swal.fire({
        width: 500, padding: 0, background: 'transparent', backdrop: false, showConfirmButton: false, heightAuto: false,
        customClass: { popup: 'spice-modal-override', htmlContainer: 'spice-modal-override' },
        html: `
            <style>
                .swal2-popup.spice-modal-override { padding: 0 !important; background: transparent !important; border: none !important; }
                .swal2-html-container.spice-modal-override { padding: 0 !important; margin: 0 !important; overflow: hidden !important; }
            </style>
            <div id="sim-dc-window" style="display: flex; flex-direction: column; background: var(--bg-panel); border-radius: 6px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); border: 1px solid var(--border-main); pointer-events: auto;">
                <div id="swal-drag-handle-dc" style="flex: 0 0 45px; cursor: move; background: #2c3e50; padding: 0 15px; display: flex; justify-content: space-between; align-items: center; user-select: none; border-top-left-radius: 6px; border-top-right-radius: 6px; border-bottom: 2px solid #3498db;">
                    <span style="font-size: 15px; font-weight: bold; display:flex; align-items:center; gap:8px; color: #ffffff;"> 
                        <i data-lucide="activity" style="color: #3498db;"></i> DC Op. Point Results 
                    </span>
                    <div style="display:flex; gap: 8px; align-items: center;">
                        <button id="btn-export-dc-csv" style="${btnStyle}" onmouseover="this.style.opacity=0.7" onmouseout="this.style.opacity=1">
                            <i data-lucide="download" style="width:14px;height:14px;"></i> CSV
                        </button>
                        <button onclick="Swal.close()" style="${btnStyle}" onmouseover="this.style.opacity=0.7" onmouseout="this.style.opacity=1">
                            ✖ Close
                        </button>
                    </div>
                </div>
                ${tableHtml}
            </div>
        `,
        willClose: () => {
            clearSimAnnotations(); 
            if (typeof SimLog !== 'undefined' && SimLog.hide) SimLog.hide();
        },
        didOpen: () => {
            if (typeof lucide !== 'undefined') lucide.createIcons();
            const popup = Swal.getPopup(); 
            const htmlContainer = Swal.getHtmlContainer();
            const handle = document.getElementById('swal-drag-handle-dc');
            
            // THE FIX: Surgical padding overrides
            popup.style.background = 'transparent'; 
            popup.style.boxShadow = 'none';
            popup.style.setProperty('padding', '0', 'important');
            if (htmlContainer) {
                htmlContainer.style.setProperty('padding', '0', 'important');
                htmlContainer.style.setProperty('margin', '0', 'important');
                htmlContainer.style.overflow = 'hidden';
            }

            let activeBadges = []; let activeGlowElements = []; let activeRow = null;

            const clearCanvas = () => {
                let currentHlLayer = document.getElementById('net-highlight-layer') || document.querySelector('#net-highlight-layer');
                if (currentHlLayer) currentHlLayer.innerHTML = ''; 
                activeGlowElements.forEach(el => { if (el && el.style) el.style.filter = ''; }); 
                activeGlowElements = [];
                activeBadges.forEach(b => { if (b && b.remove) b.remove(); });
                activeBadges = [];
            };

            popup.addEventListener('mousemove', (e) => {
                let row = e.target.closest('.dc-table-row');
                if (row !== activeRow) {
                    if (activeRow) { activeRow.style.background = 'transparent'; clearCanvas(); }
                    activeRow = row;
                    if (activeRow) {
                        activeRow.style.background = 'rgba(52, 152, 219, 0.15)'; 
                        try {
                            let currentOverlay = document.getElementById('dc-annotation-overlay');
                            if (!currentOverlay) {
                                currentOverlay = document.createElement('div');
                                currentOverlay.id = 'dc-annotation-overlay';
                                currentOverlay.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:1100; overflow:visible;';
                                let container = document.getElementById('paper-container') || document.body;
                                container.appendChild(currentOverlay);
                            }

                            let currentHlLayer = document.getElementById('net-highlight-layer') || currentOverlay.querySelector('#net-highlight-layer');
                            if (!currentHlLayer) {
                                currentOverlay.innerHTML = '<svg id="dc-lines-svg" xmlns="http://www.w3.org/2000/svg" style="position:absolute; top:0; left:0; width:100%; height:100%; overflow:visible; pointer-events:none;"><g id="net-highlight-layer"></g></svg>';
                                currentHlLayer = currentOverlay.querySelector('#net-highlight-layer');
                            }

                            let matrix = AppState.paper.matrix();
                            let getNet = (id) => topo.netMap.get(topo.uf.find(id));
                            let net = activeRow.getAttribute('data-net');
                            let compId = activeRow.getAttribute('data-comp-id');

                            if (net) {
                                let v = String(net) === '0' ? 0.0 : opData.nodes[net];
                                let drawnBadges = []; // <-- NEW: Array to track badge locations
                                
                                topo.terminals.forEach(term => {
                                    let termNet = getNet(term.id);
                                    if (termNet !== null && termNet !== undefined && String(termNet) === String(net)) {
                                        let cx = term.x * matrix.a + matrix.e; let cy = term.y * matrix.d + matrix.f;
                                        
                                        // Always draw the blue glow so the wire path is fully highlighted
                                        let glow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                                        glow.setAttribute('cx', cx); glow.setAttribute('cy', cy);
                                        glow.setAttribute('r', '15'); glow.setAttribute('fill', '#3498db'); glow.setAttribute('opacity', '0.5');
                                        currentHlLayer.appendChild(glow);

                                        if (v !== undefined) {
                                            // NEW: Spatial filter - only draw text if no other badge is within 70 pixels
                                            let isTooClose = drawnBadges.some(b => Math.hypot(b.x - cx, b.y - cy) < 70);
                                            
                                            if (!isTooClose) {
                                                drawnBadges.push({ x: cx, y: cy }); // Record this location

                                                let targetX = cx + 25, targetY = cy - 35; 
                                                let lineEl = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                                                lineEl.setAttribute('x1', cx); lineEl.setAttribute('y1', cy); 
                                                lineEl.setAttribute('x2', targetX); lineEl.setAttribute('y2', targetY);
                                                lineEl.setAttribute('stroke', '#7f8c8d'); lineEl.setAttribute('stroke-width', '1.5'); 
                                                currentHlLayer.appendChild(lineEl); 

                                                let dotEl = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                                                dotEl.setAttribute('cx', cx); dotEl.setAttribute('cy', cy); 
                                                dotEl.setAttribute('r', '3'); dotEl.setAttribute('fill', '#7f8c8d'); 
                                                currentHlLayer.appendChild(dotEl);

                                                let badge = document.createElement('div');
                                                badge.style.cssText = `position:absolute; left:${targetX}px; top:${targetY}px; transform:translate(-50%, -50%); background:#3498db; color:#ffffff; padding:4px 7px; border-radius:4px; font-size:11px; font-family:monospace; font-weight:bold; border:1px solid #2980b9; pointer-events:none; z-index:1105; box-shadow: 0 2px 4px rgba(0,0,0,0.2); white-space:nowrap;`;
                                                badge.innerText = formatEng(v, 'V'); 
                                                currentOverlay.appendChild(badge); activeBadges.push(badge); 
                                            }
                                        }
                                    }
                                });
                            }

                            if (compId) {
                                let el = AppState.graph.getCell(compId);
                                if (el) {
                                    let view = el.findView(AppState.paper);
                                    if (view && view.el) {
                                        view.el.style.filter = 'drop-shadow(0px 0px 8px #3498db)';
                                        view.el.style.transition = 'filter 0.15s';
                                        activeGlowElements.push(view.el);
                                    }

                                    let compData = opData.currents[compId];
                                    if (compData && compData.val !== undefined) {
                                        let currentVal = compData.val; let arrowStr = "";
                                        if (Math.abs(currentVal) > 1e-12) {
                                            let pt1 = window.getAbsolutePinCoord ? window.getAbsolutePinCoord(el, 'pin1') : null;
                                            let pt2 = window.getAbsolutePinCoord ? window.getAbsolutePinCoord(el, 'pin2') : null;
                                            if (pt1 && pt2) {
                                                let dx = pt2.x - pt1.x; let dy = pt2.y - pt1.y;
                                                if (Math.abs(dx) > Math.abs(dy)) arrowStr = (dx > 0) ? (currentVal > 0 ? "→ " : "← ") : (currentVal > 0 ? "← " : "→ ");
                                                else arrowStr = (dy > 0) ? (currentVal > 0 ? "↓ " : "↑ ") : (currentVal > 0 ? "↑ " : "↓ ");
                                            } else {
                                                let isNegative = currentVal < 0; let arrow = isNegative ? "←" : "→"; 
                                                let angle = el.get('angle') || 0;
                                                if (angle === 90 || angle === 270) arrow = isNegative ? "↑" : "↓";
                                                arrowStr = arrow + " ";
                                            }
                                        }

                                        let bbox = el.getBBox();
                                        let screenX = (bbox.x + bbox.width/2) * matrix.a + matrix.e;
                                        let screenY = (bbox.y + bbox.height/2) * matrix.d + matrix.f;
                                        let targetX = screenX; let targetY = screenY - 45; 

                                        let lineEl = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                                        lineEl.setAttribute('x1', screenX); lineEl.setAttribute('y1', screenY - 15);
                                        lineEl.setAttribute('x2', targetX); lineEl.setAttribute('y2', targetY);
                                        lineEl.setAttribute('stroke', '#7f8c8d'); lineEl.setAttribute('stroke-width', '1.5'); 
                                        currentHlLayer.appendChild(lineEl);

                                        let dotEl = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                                        dotEl.setAttribute('cx', screenX); dotEl.setAttribute('cy', screenY - 15);
                                        dotEl.setAttribute('r', '3'); dotEl.setAttribute('fill', '#7f8c8d'); 
                                        currentHlLayer.appendChild(dotEl);

                                        let badgeArr = document.createElement('div');
                                        badgeArr.style.cssText = `position:absolute; left:${targetX}px; top:${targetY}px; transform:translate(-50%, -50%); background:#3498db; color:#ffffff; padding:4px 7px; border-radius:4px; font-size:11px; font-family:monospace; font-weight:bold; border:1px solid #2980b9; z-index:1105; pointer-events:none; box-shadow: 0 2px 4px rgba(0,0,0,0.2); white-space:nowrap;`;
                                        badgeArr.innerText = arrowStr + formatEng(Math.abs(currentVal), 'A'); 
                                        currentOverlay.appendChild(badgeArr); activeBadges.push(badgeArr);
                                    }
                                }
                            }
                        } catch (e) { console.error("DOM Error during drawing:", e); }
                    }
                }
            });

            popup.addEventListener('mouseleave', () => {
                if (activeRow) { activeRow.style.background = 'transparent'; activeRow = null; clearCanvas(); }
            });

            document.getElementById('btn-export-dc-csv').onclick = async () => {
                let csv = "Item,Parameter,Type,Value\n";
                for (let [n, v] of Object.entries(opData.nodes||{})) csv += `Net ${n},,Voltage,${formatEng(v, 'V')}\n`;
                for (let [c, data] of Object.entries(opData.currents||{})) {
                    if (data.val !== undefined) csv += `"${data.name}","${data.compVal || ''}",Current,${formatEng(data.val, 'A')}\n`;
                    if (data.power !== undefined) csv += `"${data.name}","${data.compVal || ''}",Power,${formatEng(data.power, 'W')}\n`;
                }
                if (window.showSaveFilePicker) {
                    try {
                        const fileHandle = await window.showSaveFilePicker({ suggestedName: 'dc_operating_point.csv', types: [{ description: 'CSV Data', accept: { 'text/csv': ['.csv'] } }] });
                        const writable = await fileHandle.createWritable(); await writable.write(csv); await writable.close();
                    } catch (err) { if (err.name !== 'AbortError') console.error(err); }
                } else {
                    const blob = new Blob([csv], { type: 'text/csv' }); downloadFile(URL.createObjectURL(blob), 'dc_operating_point.csv', true);
                }
            };

            let isDragging = false, startX, startY, initialLeft, initialTop;
            const onMouseMove = (e) => { if (!isDragging) return; popup.style.left = (initialLeft + (e.clientX - startX)) + 'px'; popup.style.top = (initialTop + (e.clientY - startY)) + 'px'; };
            const onMouseUp = () => { isDragging = false; document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp); };
            handle.addEventListener('mousedown', (e) => {
                if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return; 
                isDragging = true; const rect = popup.getBoundingClientRect(); popup.style.margin = '0'; popup.style.position = 'fixed'; 
                popup.style.left = rect.left + 'px'; popup.style.top = rect.top + 'px'; startX = e.clientX; startY = e.clientY; initialLeft = rect.left; initialTop = rect.top;
                document.addEventListener('mousemove', onMouseMove); document.addEventListener('mouseup', onMouseUp);
            });
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
        let errorHtml = `<ul style="text-align: left; font-size: 13px; color: var(--danger);">` + 
                        netlistData.errors.map(e => `<li style="margin-bottom: 5px;">${e}</li>`).join('') + 
                        `</ul>`;
        Swal.fire('Error', 'There are errors in the schematic.<br><br>' + errorHtml, 'error');
        return;
    }

    let cleanNetlist = netlistData.code.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

Swal.fire({
        title: '<div style="display:flex; align-items:center; justify-content:center; gap:8px;"><i data-lucide="file-code" style="width: 20px; height: 20px;"></i> SPICE Netlist Editor</div>',
        width: '800px',
        html: `
            <!-- FIX 1: Moved the paragraph OUTSIDE the flex container -->
            <p style="margin-top:0; color:var(--text-muted); font-size: 13px; text-align: left; margin-bottom: 12px;">
                You can manually edit the generated netlist before running the simulation.<br>
                <b>Note:</b> Edits made here are temporary and will not be saved back to the canvas.
            </p>
            <div style="display: flex; height: 400px; border: 1px solid var(--border-main); border-radius: 6px; overflow: hidden; text-align: left; background: var(--bg-panel);">
                <!-- Line Numbers Gutter -->
                <div id="spice-lines" style="width: 40px; background: var(--bg-app); color: var(--text-muted); padding: 10px 5px; font-family: 'JetBrains Mono', monospace; font-size: 13px; text-align: right; overflow: hidden; user-select: none; border-right: 1px solid var(--border-main);">
                    1
                </div>
                <!-- Text Editor -->
                <textarea id="custom-netlist-editor" spellcheck="false" style="flex: 1; border: none; outline: none; padding: 10px; font-family: 'JetBrains Mono', monospace; font-size: 13px; background: transparent; color: var(--text-main); resize: none; white-space: pre; overflow-wrap: normal; overflow-x: auto;">${cleanNetlist}</textarea>
            </div>
        `,
        showCancelButton: true,
        showDenyButton: true,
        denyButtonColor: '#34495e', // A nice neutral dark gray for the Save button
        confirmButtonText: '<div style="display:flex; align-items:center; gap:6px;"><i data-lucide="play" style="width:14px; height:14px;"></i> Run Simulation</div>',
        denyButtonText: '<div style="display:flex; align-items:center; gap:6px;"><i data-lucide="save" style="width:14px; height:14px;"></i> Save to File</div>',
        cancelButtonText: 'Cancel',
        didOpen: () => {
            if (typeof lucide !== 'undefined') lucide.createIcons();
            
            const editor = document.getElementById('custom-netlist-editor');
            const lines = document.getElementById('spice-lines');

            // Function to update the line numbers based on text breaks
            const updateLines = () => {
                const lineCount = editor.value.split('\n').length;
                lines.innerHTML = Array(lineCount).fill(0).map((_, i) => i + 1).join('<br>');
            };

            // Sync scrolling
            editor.addEventListener('scroll', () => {
                lines.scrollTop = editor.scrollTop;
            });

            // Update numbers on typing
            editor.addEventListener('input', updateLines);
            
            // Initialize
            updateLines();
        },
        preConfirm: () => {
            return document.getElementById('custom-netlist-editor').value;
        },
        // FIX 2: Capture the value before the DOM is destroyed!
        preDeny: () => {
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
            // Read the text we successfully captured in preDeny
            let code = result.value; 
            
            // FIX 3: Passed arguments in the correct order: (content, filename, mimetype, description)
            saveFileAs(code, 'circuit.cir', 'text/plain', 'SPICE Netlist');
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
            icon: 'info'
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

export function executeTheveninSolver(targetNode) {
    if (typeof Module === 'undefined') {
        console.error("[Thevenin Tool] Fatal Error: WASM Module is undefined.");
        return;
    }

    Swal.fire({ title: 'Calculating Vth and Rth...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    setTimeout(() => {
        try {
            // THE FIX: The Virtual RAM Patch!
            try { Module.FS.mkdir('/tmp'); } catch(e) {}
            let safeRam = "MemTotal:       524288 kB\nMemFree:        524288 kB\nMemAvailable:   524288 kB\n";
            try { Module.FS.writeFile('/tmp/meminfo', safeRam); } catch(e) {}

            if (!isSpiceInitialized) {
                let sendCharCallback = Module.addFunction(function(textPtr) {
                    let msg = Module.UTF8ToString(textPtr).trim();
                    if (!msg) return 0;
                    let isErr = msg.startsWith('stderr Error') || (msg.startsWith('stderr') && msg.toLowerCase().includes('error'));
                    if (isErr) {
                        window.spiceErrorFlag = true;
                        window.spiceErrorMsg = msg.replace('stderr Error', '').trim();
                    }
                    return 0; 
                }, 'iiii'); 
                Module.ccall('ngSpice_Init', 'number', ['number','number','number','number','number','number','number'], [sendCharCallback, 0, 0, 0, 0, 0, 0]);
                isSpiceInitialized = true;
            }

            window.spiceErrorFlag = false;
            window.spiceErrorMsg = "";

            let netlistData = generateSpiceNetlistStr("");
            if (netlistData.errors && netlistData.errors.length > 0) {
                Swal.fire('Error', 'Fix schematic errors before running the solver.', 'error');
                return;
            }

            // Inject 0A dummy source and lock execution in a control block
            let customCommands = `
I_THEV_TEST ${targetNode} 0 DC 0
.control
set filetype=ascii
op
write /output_op.raw
tf v(${targetNode}) I_THEV_TEST
write /output_tf.raw
.endc
.end
`;
            let tfNetlist = netlistData.code.replace('.end', customCommands);
            tfNetlist = tfNetlist.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

            try { Module.FS.unlink('/output_op.raw'); } catch(e) {}
            try { Module.FS.unlink('/output_tf.raw'); } catch(e) {}

            Module.FS.writeFile('/circuit_thev.cir', tfNetlist);
            Module.ccall('ngSpice_Command', 'number', ['string'], ['destroy all']);
            Module.ccall('ngSpice_Command', 'number', ['string'], ['remcirc']);
            Module.ccall('ngSpice_Command', 'number', ['string'], ['source /circuit_thev.cir']);

            if (window.spiceErrorFlag) {
                Swal.fire('Circuit Error', 'SPICE failed to solve the circuit:<br><br><b style="color:var(--danger);">' + window.spiceErrorMsg + '</b>', 'error');
                return;
            }

            let Vth = 0, Rth = null;

            // 1. Parse OP for Vth
            try {
                let rawOp = Module.FS.readFile('/output_op.raw', { encoding: 'utf8' });
                let parsedOp = parseSpiceRaw(rawOp);
                let vIndex = parsedOp.vars.findIndex(v => v.name.toLowerCase() === `v(${targetNode})`);
                if (vIndex !== -1 && parsedOp.points.length > 0) {
                    let val = parsedOp.points[0][vIndex];
                    Vth = typeof val === 'object' ? val.mag : val;
                }
            } catch(e) { console.error("[Thevenin Tool] Error reading OP:", e); }

            // 2. Parse TF for Rth
            try {
                let rawTf = Module.FS.readFile('/output_tf.raw', { encoding: 'utf8' });
                let parsedTf = parseSpiceRaw(rawTf);
                
                if (parsedTf && parsedTf.points.length > 0) {
                    let pt = parsedTf.points[0];
                    
                    parsedTf.vars.forEach((v, i) => {
                        let name = v.name.toLowerCase();
                        let val = typeof pt[i] === 'object' ? pt[i].mag : pt[i];
                        if (name.includes('transfer') || name.includes('output') || name.includes('out_imp')) {
                            Rth = val;
                        }
                    });

                    // THE FIX: Bulletproof Fallback
                    // When probing with a dummy current source, the Transfer Function (Gain) V/I is literally the resistance R.
                    if (Rth === null && parsedTf.vars.length >= 3) {
                        Rth = typeof pt[0] === 'object' ? pt[0].mag : pt[0];
                    }
                }
            } catch(e) { console.error("[Thevenin Tool] Error reading TF:", e); }

            if (Rth === null) Rth = 0; 
            if (Rth < 1e-6) Rth = 0; 

            Swal.close();
            
            // Short buffer to let the Swal close animation finish
            setTimeout(() => {
                drawTheveninEquivalent(Vth, Rth, targetNode);
            }, 150);

        } catch (error) { 
            console.error("[Thevenin Tool] Exception:", error); 
            Swal.fire('Simulation Error', 'An unexpected error occurred. See console.', 'error');
        }
    }, 150);
}

export function drawTheveninEquivalent(Vth, Rth, nodeName) {
    let absVth = Math.abs(Vth);
    let vStr = absVth < 1e-6 ? "0" : absVth.toPrecision(3);
    let isVthPos = (Vth >= 0);
    let vTopSign = isVthPos ? "+" : "-";
    let vBotSign = isVthPos ? "-" : "+";
    
    let rStr = Rth >= 1e9 ? "∞" :
               Rth >= 1e6 ? (Rth/1e6).toPrecision(3) + ' M' : 
               Rth >= 1e3 ? (Rth/1e3).toPrecision(3) + ' k' : 
               Rth > 0 && Rth < 1 ? (Rth*1000).toPrecision(3) + ' m' : Math.round(Rth).toString();

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
        theveninSvg = `<div style="width:340px; height:280px; background: var(--bg-panel); border: 1px dashed var(--border-main); border-radius: 8px; display:flex; align-items:center; justify-content:center; text-align:center; padding: 20px; box-sizing:border-box;"><span style="color:var(--text-muted); font-size:13px;">Thevenin Equivalent N/A<br>(Ideal Current Source / Rth = ∞)</span></div>`;
    } else {
        theveninSvg = `
            <svg width="340" height="280" viewBox="-50 0 350 280" xmlns="http://www.w3.org/2000/svg" style="background: var(--bg-panel); border: 1px dashed var(--border-main); border-radius: 8px;">
                <path d="M 100 200 L 100 220 M 80 220 L 120 220 M 87 228 L 113 228 M 94 236 L 106 236" stroke="var(--text-main)" stroke-width="2" fill="none" stroke-linecap="round"/>
                <circle cx="60" cy="150" r="30" stroke="var(--text-main)" stroke-width="2" fill="var(--bg-app)" />
                <text x="60" y="135" font-family="monospace" font-size="20" font-weight="bold" text-anchor="middle" fill="var(--danger)">${vTopSign}</text>
                <text x="60" y="178" font-family="monospace" font-size="24" font-weight="bold" text-anchor="middle" fill="var(--primary)">${vBotSign}</text>
                <text x="25" y="155" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="end" fill="var(--text-main)">${vStr} V</text>
                <text x="25" y="135" font-family="sans-serif" font-size="11" text-anchor="end" fill="var(--text-muted)">Vth</text>
                <path d="M 60 120 L 60 100 L 100 100" stroke="var(--text-main)" stroke-width="2" fill="none" />
                <path d="M 100 100 L 110 85 L 130 115 L 150 85 L 170 115 L 180 100" stroke="var(--text-main)" stroke-width="2" fill="none" stroke-linejoin="round" />
                <text x="140" y="65" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="var(--text-main)">${rStr} Ω</text>
                <text x="140" y="45" font-family="sans-serif" font-size="11" text-anchor="middle" fill="var(--text-muted)">Rth</text>
                <line x1="180" y1="100" x2="230" y2="100" stroke="var(--text-main)" stroke-width="2" />
                <path d="M 60 180 L 60 200 L 230 200" stroke="var(--text-main)" stroke-width="2" fill="none" />
                <circle cx="100" cy="200" r="3.5" fill="var(--text-main)" /> <circle cx="235" cy="100" r="5" stroke="var(--warning)" stroke-width="2" fill="var(--bg-app)" />
                <circle cx="235" cy="200" r="5" stroke="var(--text-main)" stroke-width="2" fill="var(--bg-app)" />
                <text x="245" y="105" font-family="sans-serif" font-size="14" font-weight="bold" fill="var(--warning)">Node ${nodeName}</text>
            </svg>
        `;
    }

    let nortonSvg = '';
    if (Rth === 0) {
        nortonSvg = `<div style="width:340px; height:280px; background: var(--bg-panel); border: 1px dashed var(--border-main); border-radius: 8px; display:flex; align-items:center; justify-content:center; text-align:center; padding: 20px; box-sizing:border-box;"><span style="color:var(--text-muted); font-size:13px;">Norton Equivalent N/A<br>(Ideal Voltage Source / Rth = 0)</span></div>`;
    } else {
        nortonSvg = `
            <svg width="340" height="280" viewBox="-50 0 350 280" xmlns="http://www.w3.org/2000/svg" style="background: var(--bg-panel); border: 1px dashed var(--border-main); border-radius: 8px;">
                <path d="M 145 200 L 145 220 M 125 220 L 165 220 M 132 228 L 158 228 M 139 236 L 151 236" stroke="var(--text-main)" stroke-width="2" fill="none" stroke-linecap="round"/>
                <circle cx="60" cy="150" r="30" stroke="var(--text-main)" stroke-width="2" fill="var(--bg-app)" />
                <path d="${iArrowPath}" stroke="var(--danger)" stroke-width="2" fill="none" stroke-linejoin="round" />
                <text x="25" y="155" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="end" fill="var(--text-main)">${iStr} A</text>
                <text x="25" y="135" font-family="sans-serif" font-size="11" text-anchor="end" fill="var(--text-muted)">Ino</text>
                <path d="M 145 100 L 145 120 L 130 130 L 160 150 L 130 170 L 145 180 L 145 200" stroke="var(--text-main)" stroke-width="2" fill="none" stroke-linejoin="round" />
                <text x="175" y="155" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="start" fill="var(--text-main)">${rStr} Ω</text>
                <text x="175" y="135" font-family="sans-serif" font-size="11" text-anchor="start" fill="var(--text-muted)">Rno</text>
                <line x1="60" y1="100" x2="230" y2="100" stroke="var(--text-main)" stroke-width="2" />
                <line x1="60" y1="200" x2="230" y2="200" stroke="var(--text-main)" stroke-width="2" />
                <line x1="60" y1="120" x2="60" y2="100" stroke="var(--text-main)" stroke-width="2" />
                <line x1="60" y1="180" x2="60" y2="200" stroke="var(--text-main)" stroke-width="2" />
                <circle cx="145" cy="100" r="3.5" fill="var(--text-main)" />
                <circle cx="145" cy="200" r="3.5" fill="var(--text-main)" />
                <circle cx="235" cy="100" r="5" stroke="var(--warning)" stroke-width="2" fill="var(--bg-app)" />
                <circle cx="235" cy="200" r="5" stroke="var(--text-main)" stroke-width="2" fill="var(--bg-app)" />
                <text x="245" y="105" font-family="sans-serif" font-size="14" font-weight="bold" fill="var(--warning)">Node ${nodeName}</text>
            </svg>
        `;
    }

    let dualDiagram = `
        <div style="padding: 20px; background: var(--bg-app); text-align: center;">
            <div style="margin-bottom: 20px; padding: 12px; background: rgba(52, 152, 219, 0.1); border-left: 4px solid var(--primary); border-radius: 4px; text-align: left; font-size: 13px; color: var(--text-muted); line-height: 1.5;">
                <b style="color: var(--primary);">Understanding these results:</b><br>
                These equivalents represent the <b>DC Steady-State, Small-Signal linear approximation</b> of your circuit at Node ${nodeName}. Reactive components (L/C) are treated as ideal DC shorts/opens, and nonlinear components are linearized exactly at their DC bias point.
            </div>
            <div style="display: flex; justify-content: space-around; gap: 15px;">
                <div>
                    <div style="margin-bottom: 8px; font-weight: bold; color: var(--text-main); font-size: 14px;">Thevenin</div>
                    ${theveninSvg}
                </div>
                <div>
                    <div style="margin-bottom: 8px; font-weight: bold; color: var(--text-main); font-size: 14px;">Norton</div>
                    ${nortonSvg}
                </div>
            </div>
            <div style="margin-top: 20px; text-align: right;">
                <button onclick="Swal.close()" style="border: 1px solid #555; background: #333333; color: #ffffff; border-radius: 4px; padding: 8px 25px; cursor: pointer; font-size: 13px; font-weight: bold; transition: opacity 0.2s;" onmouseover="this.style.opacity=0.7" onmouseout="this.style.opacity=1">Close</button>
            </div>
        </div>
    `;

    Swal.fire({
        width: 760, padding: 0, background: 'none', backdrop: true, showConfirmButton: false, heightAuto: false,
        customClass: { popup: 'spice-modal-override', htmlContainer: 'spice-modal-override' },
        html: `
            <style>
                .swal2-popup.spice-modal-override { padding: 0 !important; background: transparent !important; border: none !important; }
                .swal2-html-container.spice-modal-override { padding: 0 !important; margin: 0 !important; overflow: hidden !important; }
            </style>
            <div id="sim-thev-res-window" style="display: flex; flex-direction: column; background: var(--bg-app); border-radius: 6px; box-shadow: 0 4px 25px rgba(0,0,0,0.5); border: 1px solid var(--border-main); pointer-events: auto; overflow: hidden;">
                
                <div id="swal-drag-handle-thev-res" style="cursor: move; background: #2c3e50; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; user-select: none; border-bottom: 2px solid #3498db;">
                    <span style="font-size: 15px; font-weight: bold; display:flex; align-items:center; gap:8px; color: #ffffff;"> 
                        <i data-lucide="zap" style="color: #f1c40f; width: 18px; height: 18px;"></i> Equivalent Circuits
                    </span>
                    <button onclick="Swal.close()" style="background:none; border:none; color:#ffffff; font-size:18px; cursor:pointer; padding:0; line-height:1;" title="Close Window">✖</button>
                </div>
                ${dualDiagram}
            </div>
        `,
        didOpen: () => {
            if (typeof lucide !== 'undefined') lucide.createIcons();
            const popup = Swal.getPopup(); 
            const htmlContainer = Swal.getHtmlContainer();
            const handle = document.getElementById('swal-drag-handle-thev-res');
            
            popup.style.background = 'transparent'; 
            popup.style.boxShadow = 'none';
            popup.style.setProperty('padding', '0', 'important');
            if (htmlContainer) {
                htmlContainer.style.setProperty('padding', '0', 'important');
                htmlContainer.style.setProperty('margin', '0', 'important');
                htmlContainer.style.overflow = 'hidden';
            }

            let isDragging = false, startX, startY, initialLeft, initialTop;
            const onMouseMove = (e) => { if (!isDragging) return; popup.style.left = (initialLeft + (e.clientX - startX)) + 'px'; popup.style.top = (initialTop + (e.clientY - startY)) + 'px'; };
            const onMouseUp = () => { isDragging = false; document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp); };
            handle.addEventListener('mousedown', (e) => {
                if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return; 
                isDragging = true; const rect = popup.getBoundingClientRect(); popup.style.margin = '0'; popup.style.position = 'fixed'; 
                popup.style.left = rect.left + 'px'; popup.style.top = rect.top + 'px'; startX = e.clientX; startY = e.clientY; initialLeft = rect.left; initialTop = rect.top;
                document.addEventListener('mousemove', onMouseMove); document.addEventListener('mouseup', onMouseUp);
            });
        }
    });
}

// --- SPICE FILE EXPORT ---
export function downloadSpiceNetlist() {
    // Grab the global commands, or default to a standard operating point analysis
    let cmds = window.spiceSimulationCommands || "\n.op\n.end\n";
    
    // Call the core netlist generator (which already exists in your spice.js)
    let result = generateSpiceNetlistStr(cmds);
    
    // If the circuit has floating pins or missing grounds, stop and warn the user!
    if (result.errors && result.errors.length > 0) {
        let errorHtml = `<ul style="text-align: left; font-size: 13px; color: var(--danger, #c0392b);">` + 
                        result.errors.map(e => `<li style="margin-bottom: 5px;">${e}</li>`).join('') + 
                        `</ul>`;
        Swal.fire({ 
            icon: 'error', 
            title: 'SPICE Netlist Errors', 
            html: `Please fix the following issues before exporting:<br><br>${errorHtml}` 
        });
        return;
    }
    
    // Everything is good, trigger the download!
    saveFileAs(result.code, 'circuit.cir', 'text/plain', 'SPICE Netlist');
}



// --- EXPORT HELPER ---
function downloadFile(content, fileName, isUrl = false) {
    const encodedUri = isUrl ? content : encodeURI(content);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function exportSimTikz() {
    if (!window.currentSimData) return;

    Swal.fire({
        title: '<div style="display:flex; align-items:center; justify-content:center; gap:8px;"><i data-lucide="pen-tool" style="width: 20px; height: 20px;"></i> TikZ Export Resolution</div>',
        width: '450px',
        html: `
            <div style="font-size: 13px; color: var(--text-main); text-align: left;">
                <p style="margin-top: 0; color: var(--text-muted);">
                    High-resolution SPICE datasets can create massive <code>.tex</code> files that cause LaTeX compilers to freeze or run out of memory. 
                </p>
                <div style="text-align: center; margin: 15px 0;">
                    <label style="font-weight: bold; color: var(--primary); font-size: 12px; display: block; margin-bottom: 5px;">Max Data Points</label>
                    <input type="number" id="tikz-max-pts" value="1000" style="width: 120px; padding: 6px; font-size: 14px; text-align: center; border: 1px solid var(--border-main); border-radius: 4px; background: var(--bg-app); color: var(--text-main);">
                </div>
                <p style="font-size: 11px; color: var(--text-muted); text-align: center; margin: 0;">(Enter <b>0</b> to export the raw, un-decimated dataset)</p>
            </div>
        `,
        showCancelButton: true,
        confirmButtonColor: 'var(--primary)',
        cancelButtonColor: 'var(--bg-btn)',
        confirmButtonText: 'Export .tex',
        didOpen: () => {
            lucide.createIcons();
        },
        preConfirm: () => {
            let val = parseInt(document.getElementById('tikz-max-pts').value);
            return isNaN(val) ? 1000 : val;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            let maxPts = result.value;
            let data = window.currentSimData;
            let isAC = window.currentSimIsAC;
            let title = window.currentSimTitle || 'Simulation';

            // --- SMART DOWNSAMPLING FOR TIKZ ---
            let exportPoints = data.points;
            if (maxPts > 0 && exportPoints.length > maxPts) {
                let step = Math.ceil(exportPoints.length / maxPts);
                exportPoints = exportPoints.filter((_, index) => index % step === 0);
            }

            let tex = `% Compile with pdflatex or lualatex\n`;
            tex += `\\documentclass[border=5mm]{standalone}\n`;
            tex += `\\usepackage{pgfplots}\n`;
            tex += `\\pgfplotsset{compat=1.18}\n\n`;
            tex += `\\begin{document}\n`;
            tex += `\\begin{tikzpicture}\n`;
            tex += `\\pgfplotsset{set layers} % Ensure axes don't overlap awkwardly\n\n`;

            let colors = ['red', 'blue', 'green!70!black', 'orange', 'purple', 'brown', 'cyan', 'magenta'];

            if (isAC) {
                // ==========================================
                // AC SWEEP: DUAL Y-AXIS (BODE PLOT)
                // ==========================================
                
                // 1. MAGNITUDE AXIS (Left)
                tex += `\\begin{axis}[\n`;
                tex += `    scale only axis,\n`;
                tex += `    title={${title}},\n`;
                tex += `    axis y line*=left,\n`;
                tex += `    xlabel={Frequency (Hz)},\n`;
                tex += `    ylabel={Magnitude},\n`;
                tex += `    xmode=log,\n`;
                tex += `    grid=both,\n`;
                tex += `    width=12cm,\n`;
                tex += `    height=8cm,\n`;
                tex += `    legend style={at={(1.15,1)}, anchor=north west}\n`;
                tex += `]\n\n`;

                for (let i = 1; i < data.vars.length; i++) {
                    let color = colors[(i-1) % colors.length];
                    let safeVarName = data.vars[i].name.replace(/_/g, '\\_');

                    tex += `\\addplot[color=${color}, thick, mark=none] table {\n`;
                    exportPoints.forEach(p => {
                        let xVal = typeof p[0] === 'object' ? p[0].mag : p[0];
                        let yVal = typeof p[i] === 'object' ? p[i].mag : p[i]; // Safe fallback
                        tex += `${xVal.toExponential(4)} ${yVal.toExponential(4)}\n`;
                    });
                    tex += `};\n`;
                    tex += `\\addlegendentry{${safeVarName} (Mag)}\n\n`;
                }
                tex += `\\end{axis}\n\n`;

                // 2. PHASE AXIS (Right)
                tex += `\\begin{axis}[\n`;
                tex += `    scale only axis,\n`;
                tex += `    axis y line*=right,\n`;
                tex += `    axis x line=none, % Hide X-axis to prevent bolding\n`;
                tex += `    ylabel={Phase (Degrees)},\n`;
                tex += `    xmode=log,\n`;
                tex += `    width=12cm,\n`;
                tex += `    height=8cm,\n`;
                tex += `    legend style={at={(1.15,0.5)}, anchor=north west} % Offset phase legend\n`;
                tex += `]\n\n`;

                for (let i = 1; i < data.vars.length; i++) {
                    let color = colors[(i-1) % colors.length];
                    let safeVarName = data.vars[i].name.replace(/_/g, '\\_');

                    tex += `\\addplot[color=${color}, thick, dashed, mark=none] table {\n`;
                    exportPoints.forEach(p => {
                        let xVal = typeof p[0] === 'object' ? p[0].mag : p[0];
                        let yPhase = typeof p[i] === 'object' ? p[i].phase : 0; // Safe fallback
                        tex += `${xVal.toExponential(4)} ${yPhase.toExponential(4)}\n`;
                    });
                    tex += `};\n`;
                    tex += `\\addlegendentry{${safeVarName} (Phase)}\n\n`;
                }
                tex += `\\end{axis}\n`;

            } else {
                // ==========================================
                // TRANSIENT: SINGLE Y-AXIS
                // ==========================================
                tex += `\\begin{axis}[\n`;
                tex += `    title={${title}},\n`;
                tex += `    xlabel={Time (s)},\n`;
                tex += `    ylabel={Magnitude},\n`;
                tex += `    grid=both,\n`;
                tex += `    width=12cm,\n`;
                tex += `    height=8cm,\n`;
                tex += `    legend style={at={(1.05,1)}, anchor=north west}\n`;
                tex += `]\n\n`;

                for (let i = 1; i < data.vars.length; i++) {
                    let color = colors[(i-1) % colors.length];
                    let safeVarName = data.vars[i].name.replace(/_/g, '\\_');

                    tex += `\\addplot[color=${color}, thick, mark=none] table {\n`;
                    exportPoints.forEach(p => {
                        let xVal = typeof p[0] === 'object' ? p[0].mag : p[0];
                        let yVal = typeof p[i] === 'object' ? p[i].mag : p[i];
                        tex += `${xVal.toExponential(4)} ${yVal.toExponential(4)}\n`;
                    });
                    tex += `};\n`;
                    tex += `\\addlegendentry{${safeVarName}}\n\n`;
                }
                tex += `\\end{axis}\n`;
            }

            tex += `\\end{tikzpicture}\n`;
            tex += `\\end{document}\n`;

            // Uses your modular saveFileAs function
            saveFileAs(tex, title.replace(/\s+/g, '_') + '_PGFPlot.tex', 'text/plain', 'TikZ/PGFPlots');
        }
    });
}

export function exportSimImage() {
    let canvas = document.getElementById('simChart');
    if (!canvas) return;
    
    // Create a temporary canvas to fill the transparent background
    let tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    let ctx = tempCanvas.getContext('2d');
    
    // Grab the current theme's panel background color, fallback to white
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-panel').trim() || '#ffffff';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    ctx.drawImage(canvas, 0, 0);
    
    tempCanvas.toBlob(async (blob) => {
        let defaultName = (window.currentSimTitle || 'Simulation').replace(/\s+/g, '_') + '_Plot.png';
        
        if (window.showSaveFilePicker) {
            try {
                const fileHandle = await window.showSaveFilePicker({
                    suggestedName: defaultName,
                    types: [{ description: 'PNG Image', accept: { 'image/png': ['.png'] } }],
                });
                const writable = await fileHandle.createWritable();
                await writable.write(blob);
                await writable.close();
            } catch (err) { 
                if (err.name !== 'AbortError') console.error(err); 
            }
        } else {
            // Fallback for older browsers
            let url = URL.createObjectURL(blob);
            downloadFile(url, defaultName, true);
        }
    }, 'image/png');
}

// Transfer Function SOLVER

export function promptTransferFunction() {
    let netlistData = generateSpiceNetlistStr("");
    if (netlistData.errors && netlistData.errors.length > 0) {
        Swal.fire('Error', 'Fix schematic errors before running the solver.', 'error');
        return;
    }

    let topo = null;
    if (typeof window.extractTopology === 'function') topo = window.extractTopology();

    let sources = [];
    let nodes = new Set();

    let lines = netlistData.code.split('\n');
    lines.forEach(line => {
        let l = line.trim();
        if (!l || l.startsWith('*') || l.startsWith('.')) return;
        let parts = l.split(/\s+/);
        if (parts.length < 3) return;
        let compName = parts[0].toUpperCase();
        if (compName.startsWith('V') || compName.startsWith('I')) sources.push(compName);
        let possibleNodes = (compName.startsWith('Q') || compName.startsWith('M') || compName.startsWith('J')) ? [parts[1], parts[2], parts[3]] : [parts[1], parts[2]];
        possibleNodes.forEach(n => { if (n && String(n) !== '0' && n.toUpperCase() !== 'GND') nodes.add(n); });
    });

    if (sources.length === 0) {
        Swal.fire('No Sources Found', 'You need at least one independent Voltage (V) or Current (I) source.', 'warning');
        return;
    }

    let sourceOptions = sources.map(s => `<option value="${s}">${s}</option>`).join('');
    let nodeOptions = Array.from(nodes).sort((a,b) => a.localeCompare(b, undefined, {numeric: true})).map(n => `<option value="v(${n})">v(${n})</option>`).join('');

    const btnPrimary = "flex: 1; border: 1px solid rgba(255,255,255,0.2); background: var(--primary); color: #ffffff; border-radius: 4px; padding: 8px 10px; cursor: pointer; font-size: 13px; font-weight: bold; transition: opacity 0.2s;";
    const btnClose = "flex: 1; border: 1px solid #555; background: #333333; color: #ffffff; border-radius: 4px; padding: 8px 10px; cursor: pointer; font-size: 13px; font-weight: bold; transition: opacity 0.2s;";

    Swal.fire({
        width: 380, padding: 0, background: 'none', backdrop: false, showConfirmButton: false, heightAuto: false,
        customClass: { popup: 'spice-modal-override', htmlContainer: 'spice-modal-override' },
        html: `
            <style>
                .swal2-popup.spice-modal-override { padding: 0 !important; background: transparent !important; border: none !important; }
                .swal2-html-container.spice-modal-override { padding: 0 !important; margin: 0 !important; overflow: hidden !important; }
            </style>
            <div id="sim-tf-window" style="display: flex; flex-direction: column; background: var(--bg-panel); border-radius: 6px; box-shadow: 0 4px 25px rgba(0,0,0,0.5); border: 1px solid var(--border-main); pointer-events: auto; overflow: hidden;">
                <div id="swal-drag-handle-tf" style="cursor: move; background: #2c3e50; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; user-select: none; border-bottom: 2px solid #3498db;">
                    <span style="font-size: 15px; font-weight: bold; display:flex; align-items:center; gap:8px; color: #ffffff;"> 
                        <i data-lucide="bar-chart-2" style="color: #3498db; width: 18px; height: 18px;"></i> SPICE Transfer Function
                    </span>
                    <button onclick="Swal.close()" style="background:none; border:none; color:#ffffff; font-size:18px; cursor:pointer; padding:0; line-height:1;" title="Close Window">✖</button>
                </div>

                <div style="padding: 18px; text-align: left; font-size: 13px; color: var(--text-main);">
                    <p style="color: var(--text-main); font-weight: 500; margin-top: 0; line-height: 1.5; font-size: 13px; margin-bottom: 15px;">
                        Select your input and output to calculate the SPICE Transfer Function.
                    </p>

                    <div style="margin-bottom: 15px;">
                        <label style="display:block; margin-bottom: 5px; font-weight: bold; color: var(--warning);">Output Variable (Node)</label>
                        <select id="tf-out" style="width: 100%; padding: 8px; border: 1px solid var(--border-main); border-radius: 4px; background: var(--bg-app); color: var(--text-main); font-family: var(--font-code);">
                            ${nodeOptions}
                            <option value="custom">-- Custom Variable... --</option>
                        </select>
                    </div>
                    
                    <div id="tf-out-custom-wrap" style="display: none; margin-bottom: 15px;">
                        <input id="tf-out-custom" type="text" placeholder="e.g., I(V1) or V(out)" style="width: 100%; padding: 8px; border: 1px solid var(--border-main); border-radius: 4px; background: var(--bg-app); color: var(--text-main); font-family: var(--font-code);">
                    </div>

                    <div style="margin-bottom: 20px;">
                        <label style="display:block; margin-bottom: 5px; font-weight: bold; color: var(--primary);">Input Source (Component)</label>
                        <select id="tf-in" style="width: 100%; padding: 8px; border: 1px solid var(--border-main); border-radius: 4px; background: var(--bg-app); color: var(--text-main); font-family: var(--font-code);">
                            ${sourceOptions}
                        </select>
                    </div>

                    <div style="display: flex; gap: 10px;">
                        <button id="btn-tf-calc" style="${btnPrimary}" onmouseover="this.style.opacity=0.7" onmouseout="this.style.opacity=1">Calculate</button>
                        <button id="btn-tf-cancel" style="${btnClose}" onmouseover="this.style.opacity=0.7" onmouseout="this.style.opacity=1">Close</button>
                    </div>
                </div>
            </div>
        `,
        willClose: () => {
            let overlay = document.getElementById('tf-annotation-overlay');
            if (overlay) overlay.remove(); 
            if (AppState && AppState.graph) {
                AppState.graph.getElements().forEach(el => {
                    let view = el.findView(AppState.paper);
                    if (view && view.el) { view.el.style.filter = ''; view.el.style.transition = ''; }
                });
            }
        },
        didOpen: () => {
            if (typeof lucide !== 'undefined') lucide.createIcons();
            const popup = Swal.getPopup(); 
            const htmlContainer = Swal.getHtmlContainer();
            const handle = document.getElementById('swal-drag-handle-tf');
            
            popup.style.background = 'transparent'; 
            popup.style.boxShadow = 'none';
            popup.style.setProperty('padding', '0', 'important');
            if (htmlContainer) {
                htmlContainer.style.setProperty('padding', '0', 'important');
                htmlContainer.style.setProperty('margin', '0', 'important');
                htmlContainer.style.overflow = 'hidden';
            }

            let activeGlowElements = [];
            const updateHighlights = () => {
                let outVar = document.getElementById('tf-out').value;
                let inSrc = document.getElementById('tf-in').value;
                let overlay = document.getElementById('tf-annotation-overlay');
                if (!overlay) {
                    overlay = document.createElement('div');
                    overlay.id = 'tf-annotation-overlay';
                    overlay.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:1000; overflow:visible;';
                    document.getElementById('paper-container').appendChild(overlay);
                }
                overlay.innerHTML = '<svg id="tf-hl-svg" xmlns="http://www.w3.org/2000/svg" style="position:absolute; top:0; left:0; width:100%; height:100%; overflow:visible; pointer-events:none;"><g id="tf-hl-layer"></g></svg>';
                let hlLayer = overlay.querySelector('#tf-hl-layer');

                activeGlowElements.forEach(el => { if (el && el.style) el.style.filter = ''; }); 
                activeGlowElements = [];
                if (!topo) return;
                let matrix = AppState.paper.matrix();
                let getNet = (id) => topo.netMap.get(topo.uf.find(id));

                if (inSrc) {
                    AppState.graph.getElements().forEach(el => {
                        let shortId = el.id.split('-')[0].substring(0, 4).toUpperCase();
                        if (inSrc.includes(shortId)) {
                            let view = el.findView(AppState.paper);
                            if (view && view.el) {
                                view.el.style.filter = 'drop-shadow(0px 0px 10px var(--primary))';
                                view.el.style.transition = 'filter 0.15s';
                                activeGlowElements.push(view.el);
                            }
                        }
                    });
                }

                let m = outVar.match(/^v\(([^)]+)\)$/i);
                if (m) {
                    let net = m[1];
                    topo.terminals.forEach(term => {
                        let termNet = getNet(term.id);
                        if (termNet !== null && termNet !== undefined && String(termNet) === String(net)) {
                            let cx = term.x * matrix.a + matrix.e; let cy = term.y * matrix.d + matrix.f;
                            let glow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                            glow.setAttribute('cx', cx); glow.setAttribute('cy', cy);
                            glow.setAttribute('r', '15'); glow.setAttribute('fill', 'var(--warning)'); glow.setAttribute('opacity', '0.6');
                            hlLayer.appendChild(glow);
                        }
                    });
                }
            };

            document.getElementById('tf-out').addEventListener('change', function() {
                document.getElementById('tf-out-custom-wrap').style.display = this.value === 'custom' ? 'block' : 'none';
                updateHighlights();
            });
            document.getElementById('tf-in').addEventListener('change', updateHighlights);
            updateHighlights();

            document.getElementById('btn-tf-cancel').onclick = () => Swal.close();
            document.getElementById('btn-tf-calc').onclick = () => {
                try {
                    let outVar = document.getElementById('tf-out').value;
                    if (outVar === 'custom') outVar = document.getElementById('tf-out-custom').value.trim();
                    let inSrc = document.getElementById('tf-in').value;
                    if (!outVar || !inSrc) return;
                    Swal.close(); 
                    setTimeout(() => { executeTransferFunction(outVar, inSrc); }, 150);
                } catch(e) { console.error("TF UI Click Error:", e); }
            };

            let isDragging = false, startX, startY, initialLeft, initialTop;
            const onMouseMove = (e) => { if (!isDragging) return; popup.style.left = (initialLeft + (e.clientX - startX)) + 'px'; popup.style.top = (initialTop + (e.clientY - startY)) + 'px'; };
            const onMouseUp = () => { isDragging = false; document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp); };
            handle.addEventListener('mousedown', (e) => {
                if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return; 
                isDragging = true; const rect = popup.getBoundingClientRect(); popup.style.margin = '0'; popup.style.position = 'fixed'; 
                popup.style.left = rect.left + 'px'; popup.style.top = rect.top + 'px'; startX = e.clientX; startY = e.clientY; initialLeft = rect.left; initialTop = rect.top;
                document.addEventListener('mousemove', onMouseMove); document.addEventListener('mouseup', onMouseUp);
            });
        }
    });
}

export function executeTransferFunction(outVar, inSrc) {
    if (typeof Module === 'undefined') {
        console.error("[TF Tool] Fatal Error: WASM Module is undefined.");
        return;
    }
    
    console.log(`[TF Tool] Starting execution for ${outVar} / ${inSrc}`);

    if (typeof SimLog !== 'undefined') {
        SimLog.show();
        SimLog.print(`\n> Executing Transfer Function (.tf) for ${outVar} / ${inSrc}...`);
    }

    setTimeout(() => {
        try {
            // THE FIX: The Missing Linux RAM Patch!
            try { Module.FS.mkdir('/tmp'); } catch(e) {}
            let safeRam = "MemTotal:       524288 kB\nMemFree:        524288 kB\nMemAvailable:   524288 kB\n";
            try { Module.FS.writeFile('/tmp/meminfo', safeRam); } catch(e) {}
            console.log("[TF Tool] Virtual RAM patch applied.");

            if (!isSpiceInitialized) {
                console.log("[TF Tool] Initializing SPICE Engine...");
                let sendCharCallback = Module.addFunction(function(textPtr) {
                    let msg = Module.UTF8ToString(textPtr).trim();
                    if (!msg) return 0;
                    let isErr = msg.startsWith('stderr Error') || (msg.startsWith('stderr') && msg.toLowerCase().includes('error'));
                    if (isErr) {
                        window.spiceErrorFlag = true;
                        window.spiceErrorMsg = msg.replace('stderr Error', '').trim();
                    }
                    return 0; 
                }, 'iiii'); 
                Module.ccall('ngSpice_Init', 'number', ['number','number','number','number','number','number','number'], [sendCharCallback, 0, 0, 0, 0, 0, 0]);
                isSpiceInitialized = true;
                console.log("[TF Tool] SPICE Engine Initialized.");
            }

            window.spiceErrorFlag = false;
            window.spiceErrorMsg = "";

            let netlistData = generateSpiceNetlistStr("");
            if (netlistData.errors && netlistData.errors.length > 0) {
                if (typeof SimLog !== 'undefined') {
                    SimLog.print(`Schematic contains errors. Fix them before running.`, true);
                }
                return;
            }
            console.log("[TF Tool] Netlist Generated successfully.");

            let customCommands = `
.control
tf ${outVar} ${inSrc}
set filetype=ascii
write /output_tf_tool.raw
.endc
.end
`;
            let tfNetlist = netlistData.code.replace('.end', customCommands);
            tfNetlist = tfNetlist.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

            try { Module.FS.unlink('/output_tf_tool.raw'); } catch(e) {}

            Module.FS.writeFile('/circuit_tf_tool.cir', tfNetlist);
            Module.ccall('ngSpice_Command', 'number', ['string'], ['destroy all']);
            Module.ccall('ngSpice_Command', 'number', ['string'], ['remcirc']);
            
            console.log("[TF Tool] Executing SPICE Source command...");
            Module.ccall('ngSpice_Command', 'number', ['string'], ['source /circuit_tf_tool.cir']);

            if (window.spiceErrorFlag) {
                console.error("[TF Tool] SPICE Engine threw an error during execution.");
                return; 
            }

            console.log("[TF Tool] Execution finished. Reading RAW file...");
            let gain = null, zIn = null, zOut = null;

            try {
                let rawTf = Module.FS.readFile('/output_tf_tool.raw', { encoding: 'utf8' });
                let parsedTf = parseSpiceRaw(rawTf);
                
                if (parsedTf && parsedTf.points.length > 0) {
                    let pt = parsedTf.points[0];
                    
                    parsedTf.vars.forEach((v, i) => {
                        let name = v.name.toLowerCase();
                        let val = typeof pt[i] === 'object' ? pt[i].mag : pt[i];
                        
                        if (name.includes('transfer')) gain = val;
                        else if (name.includes('input') || name.includes('in_')) zIn = val;
                        else if (name.includes('output') || name.includes('out_')) zOut = val;
                    });

                    // BULLETPROOF INDEX FALLBACK
                    if (gain === null && parsedTf.vars.length >= 3) {
                        gain = typeof pt[0] === 'object' ? pt[0].mag : pt[0];
                        zOut = typeof pt[1] === 'object' ? pt[1].mag : pt[1];
                        zIn  = typeof pt[2] === 'object' ? pt[2].mag : pt[2];
                    }
                }
            } catch(e) { console.error("[TF Tool] Error reading raw file:", e); }

            if (gain === null || zIn === null || zOut === null) {
                console.warn("[TF Tool] Failed to extract Gain, Zin, or Zout from the data.");
                if (typeof SimLog !== 'undefined') {
                    SimLog.print(`Analysis Failed. Ensure '${inSrc}' is an independent source and the DC path is valid.`, true);
                }
                return;
            }

            console.log("[TF Tool] Math successful! Displaying results...");
            showTransferFunctionResults(outVar, inSrc, gain, zIn, zOut);

        } catch (error) { 
            console.error("[TF Tool] Fatal Exception:", error); 
            if (typeof SimLog !== 'undefined') {
                SimLog.print(`Fatal Exception: ${error.message}`, true);
            }
        }
    }, 100);
}

export function showTransferFunctionResults(outVar, inSrc, gain, zIn, zOut) {
    let gainStr = Math.abs(gain) < 1e-6 ? "0" : gain.toPrecision(4);
    let zinStr = zIn > 1e9 ? "∞" : formatEng(zIn, 'Ω');
    let zoutStr = zOut < 1e-6 ? "0" : formatEng(zOut, 'Ω');

    if (typeof SimLog !== 'undefined') {
        SimLog.print(`\n=========================================\n SPICE TRANSFER FUNCTION\n=========================================\n Output Variable  : ${outVar}\n Input Source     : ${inSrc}\n-----------------------------------------\n Voltage Gain     : ${gainStr}\n Input Impedance  : ${zinStr}\n Output Impedance : ${zoutStr}\n=========================================`);
    }

    const btnStyle = "border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.2); color: #ffffff; border-radius: 4px; padding: 4px 10px; cursor: pointer; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 6px; transition: opacity 0.2s;";

    let tableHtml = `
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: var(--text-main); text-align: left;">
            <thead style="background: var(--bg-panel); border-bottom: 1px solid var(--border-main);">
                <tr>
                    <th style="padding: 10px 15px;">Parameter</th>
                    <th style="padding: 10px 15px; text-align: right;">Value</th>
                </tr>
            </thead>
            <tbody>
                <tr style="border-bottom: 1px solid var(--border-main);">
                    <td style="padding: 12px 15px; font-weight: bold;">Voltage Gain (V/V)</td>
                    <td style="padding: 12px 15px; text-align: right; font-family: var(--font-code); color: var(--text-main); font-weight:bold; font-size: 14px;">${gainStr}</td>
                </tr>
                <tr style="border-bottom: 1px solid var(--border-main);">
                    <td style="padding: 12px 15px; font-weight: bold;">Input Impedance</td>
                    <td style="padding: 12px 15px; text-align: right; font-family: var(--font-code); color: var(--text-main); font-weight:bold; font-size: 14px;">${zinStr}</td>
                </tr>
                <tr>
                    <td style="padding: 12px 15px; font-weight: bold;">Output Impedance</td>
                    <td style="padding: 12px 15px; text-align: right; font-family: var(--font-code); color: var(--text-main); font-weight:bold; font-size: 14px;">${zoutStr}</td>
                </tr>
            </tbody>
        </table>
    `;

    Swal.fire({
        width: 400, padding: 0, background: 'none', backdrop: false, showConfirmButton: false, heightAuto: false,
        customClass: { popup: 'spice-modal-override', htmlContainer: 'spice-modal-override' },
        html: `
            <style>
                .swal2-popup.spice-modal-override { padding: 0 !important; background: transparent !important; border: none !important; }
                .swal2-html-container.spice-modal-override { padding: 0 !important; margin: 0 !important; overflow: hidden !important; }
            </style>
            <div id="sim-tf-res-window" style="display: flex; flex-direction: column; background: var(--bg-app); border-radius: 6px; box-shadow: 0 4px 25px rgba(0,0,0,0.5); border: 1px solid var(--border-main); pointer-events: auto; overflow: hidden;">
                <div id="swal-drag-handle-tf-res" style="cursor: move; background: #2c3e50; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; user-select: none; border-bottom: 2px solid #3498db;">
                    <span style="font-size: 14px; font-weight: bold; display:flex; align-items:center; gap:8px; color: #ffffff;"> 
                        <i data-lucide="bar-chart-2" style="color: #3498db; width: 16px; height: 16px;"></i> SPICE Transfer Function
                    </span>
                    <div style="display:flex; gap: 8px; align-items: center;">
                        <button id="btn-export-tf-csv" style="${btnStyle}" onmouseover="this.style.opacity=0.7" onmouseout="this.style.opacity=1">
                            <i data-lucide="download" style="width:14px;height:14px;"></i> CSV
                        </button>
                        <button onclick="Swal.close()" style="${btnStyle}" onmouseover="this.style.opacity=0.7" onmouseout="this.style.opacity=1" title="Close">
                            ✖
                        </button>
                    </div>
                </div>
                <div style="background: var(--bg-toolbar); padding: 8px 15px; font-size: 12px; color: var(--text-muted); border-bottom: 1px solid var(--border-main); text-align: center;">
                    Ratio of <b style="color:var(--warning);">${outVar}</b> to <b style="color:var(--primary);">${inSrc}</b>
                </div>
                ${tableHtml}
            </div>
        `,
        didOpen: () => {
            if (typeof lucide !== 'undefined') lucide.createIcons();
            const popup = Swal.getPopup(); 
            const htmlContainer = Swal.getHtmlContainer();
            const handle = document.getElementById('swal-drag-handle-tf-res');
            
            popup.style.background = 'transparent'; 
            popup.style.boxShadow = 'none';
            popup.style.setProperty('padding', '0', 'important');
            if (htmlContainer) {
                htmlContainer.style.setProperty('padding', '0', 'important');
                htmlContainer.style.setProperty('margin', '0', 'important');
                htmlContainer.style.overflow = 'hidden';
            }
            
            document.getElementById('btn-export-tf-csv').onclick = async () => {
                let csv = "Parameter,Value\n";
                csv += `Output Variable,${outVar}\n`;
                csv += `Input Source,${inSrc}\n`;
                csv += `Voltage Gain,${gain}\n`;
                csv += `Input Impedance (Ohms),${zIn}\n`;
                csv += `Output Impedance (Ohms),${zOut}\n`;
                
                if (window.showSaveFilePicker) {
                    try {
                        const fileHandle = await window.showSaveFilePicker({ suggestedName: 'spice_transfer_function.csv', types: [{ description: 'CSV Data', accept: { 'text/csv': ['.csv'] } }] });
                        const writable = await fileHandle.createWritable(); await writable.write(csv); await writable.close();
                    } catch (err) { if (err.name !== 'AbortError') console.error(err); }
                } else {
                    const blob = new Blob([csv], { type: 'text/csv' }); downloadFile(URL.createObjectURL(blob), 'spice_transfer_function.csv', true);
                }
            };

            let isDragging = false, startX, startY, initialLeft, initialTop;
            const onMouseMove = (e) => { if (!isDragging) return; popup.style.left = (initialLeft + (e.clientX - startX)) + 'px'; popup.style.top = (initialTop + (e.clientY - startY)) + 'px'; };
            const onMouseUp = () => { isDragging = false; document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp); };
            handle.addEventListener('mousedown', (e) => {
                if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return; 
                isDragging = true; const rect = popup.getBoundingClientRect(); popup.style.margin = '0'; popup.style.position = 'fixed'; 
                popup.style.left = rect.left + 'px'; popup.style.top = rect.top + 'px'; startX = e.clientX; startY = e.clientY; initialLeft = rect.left; initialTop = rect.top;
                document.addEventListener('mousemove', onMouseMove); document.addEventListener('mouseup', onMouseUp);
            });
        }
    });
}

