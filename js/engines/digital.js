// js/engines/digital.js
import { AppState } from '../state.js';
import { parseSpiceToNumber } from '../parsers/helpers.js';

function getInvertStr(el) { return (el.get('customArgs') || [])[0] || ""; }
function applyInv(val, char) { return char === '1' ? (val === 1 ? 0 : (val === 0 ? 1 : undefined)) : val; }

export const LOGIC_MODELS = {
    'andtwo': { inputs: ['pin1', 'pin2'], outputs: ['pin3'], eval: (i, st, li, el) => { let s=getInvertStr(el); let i0=applyInv(i[0], s[0]), i1=applyInv(i[1], s[1]); return [(i0==1 && i1==1)?1:0]; }},
    'nandtwo': { inputs: ['pin1', 'pin2'], outputs: ['pin3'], eval: (i, st, li, el) => { let s=getInvertStr(el); let i0=applyInv(i[0], s[0]), i1=applyInv(i[1], s[1]); return [(i0==1 && i1==1)?0:1]; }},
    'ortwo': { inputs: ['pin1', 'pin2'], outputs: ['pin3'], eval: (i, st, li, el) => { let s=getInvertStr(el); let i0=applyInv(i[0], s[0]), i1=applyInv(i[1], s[1]); return [(i0==1 || i1==1)?1:0]; }},
    'nortwo': { inputs: ['pin1', 'pin2'], outputs: ['pin3'], eval: (i, st, li, el) => { let s=getInvertStr(el); let i0=applyInv(i[0], s[0]), i1=applyInv(i[1], s[1]); return [(i0==1 || i1==1)?0:1]; }},
    'xortwo': { inputs: ['pin1', 'pin2'], outputs: ['pin3'], eval: (i, st, li, el) => { let s=getInvertStr(el); let i0=applyInv(i[0], s[0]), i1=applyInv(i[1], s[1]); return [(i0!==undefined && i1!==undefined && i0!==i1)?1:0]; }},
    'xnortwo': { inputs: ['pin1', 'pin2'], outputs: ['pin3'], eval: (i, st, li, el) => { let s=getInvertStr(el); let i0=applyInv(i[0], s[0]), i1=applyInv(i[1], s[1]); return [(i0!==undefined && i1!==undefined && i0===i1)?1:0]; }},
    
    'andthree': { inputs: ['pin1', 'pin2', 'pin3'], outputs: ['pin4'], eval: (i, st, li, el) => { let s=getInvertStr(el); let i0=applyInv(i[0],s[0]), i1=applyInv(i[1],s[1]), i2=applyInv(i[2],s[2]); return [(i0==1 && i1==1 && i2==1)?1:0]; }},
    'nandthree': { inputs: ['pin1', 'pin2', 'pin3'], outputs: ['pin4'], eval: (i, st, li, el) => { let s=getInvertStr(el); let i0=applyInv(i[0],s[0]), i1=applyInv(i[1],s[1]), i2=applyInv(i[2],s[2]); return [(i0==1 && i1==1 && i2==1)?0:1]; }},
    'orthree': { inputs: ['pin1', 'pin2', 'pin3'], outputs: ['pin4'], eval: (i, st, li, el) => { let s=getInvertStr(el); let i0=applyInv(i[0],s[0]), i1=applyInv(i[1],s[1]), i2=applyInv(i[2],s[2]); return [(i0==1 || i1==1 || i2==1)?1:0]; }},
    'northree': { inputs: ['pin1', 'pin2', 'pin3'], outputs: ['pin4'], eval: (i, st, li, el) => { let s=getInvertStr(el); let i0=applyInv(i[0],s[0]), i1=applyInv(i[1],s[1]), i2=applyInv(i[2],s[2]); return [(i0==1 || i1==1 || i2==1)?0:1]; }},

    'inverter': { inputs: ['pin1'], outputs: ['pin2'], eval: (i) => [(i[0]==1)?0:(i[0]==0?1:undefined)] },
    'invertersmall': { inputs: ['pin1'], outputs: ['pin2'], eval: (i) => [(i[0]==1)?0:(i[0]==0?1:undefined)] },
    'buffer': { inputs: ['pin1'], outputs: ['pin2'], eval: (i) => [i[0]] },

    'dflipflop': {
        inputs: ['pin1', 'pin2', 'pin3'], outputs: ['pin4', 'pin5'],
        eval: (i, state, last_i, el) => {
            if (state.q === undefined) state.q = 0;
            let args = el.get('customArgs') || [];
            let rstType = args[3] || 'noreset'; let trgType = args[4] || 'positive';
            if ((rstType === 'reset' && i[2] === 1) || (rstType === 'resetn' && i[2] === 0)) state.q = 0;
            else {
                let edge = (trgType === 'positive' && i[1] === 1 && last_i[1] === 0) || (trgType === 'negative' && i[1] === 0 && last_i[1] === 1);
                if (edge && i[0] !== undefined) state.q = i[0];
            }
            return [state.q, state.q === 1 ? 0 : 1];
        }
    },
    'jkflipflop': {
        inputs: ['pin1', 'pin3', 'pin2', 'pin4', 'pin7'], outputs: ['pin5', 'pin6'],
        eval: (i, state, last_i, el) => {
            if (state.q === undefined) state.q = 0;
            let args = el.get('customArgs') || [];
            let rstType = args[3] || 'noreset'; let trgType = args[4] || 'negative';
            if ((rstType === 'reset' && i[3] === 1) || (rstType === 'resetn' && i[4] === 0)) state.q = 0;
            else {
                let edge = (trgType === 'positive' && i[2] === 1 && last_i[2] === 0) || (trgType === 'negative' && i[2] === 0 && last_i[2] === 1);
                if (edge && i[0] !== undefined && i[1] !== undefined) {
                    if (i[0] === 1 && i[1] === 1) state.q = state.q === 1 ? 0 : 1;
                    else if (i[0] === 1 && i[1] === 0) state.q = 1;
                    else if (i[0] === 0 && i[1] === 1) state.q = 0;
                }
            }
            return [state.q, state.q === 1 ? 0 : 1];
        }
    },
    'tflipflop': {
        inputs: ['pin1', 'pin2', 'pin3'], outputs: ['pin4', 'pin5'],
        eval: (i, state, last_i, el) => {
            if (state.q === undefined) state.q = 0;
            let args = el.get('customArgs') || [];
            let rstType = args[3] || 'noreset'; let trgType = args[4] || 'positive';
            if ((rstType === 'reset' && i[2] === 1) || (rstType === 'resetn' && i[2] === 0)) state.q = 0;
            else {
                let edge = (trgType === 'positive' && i[1] === 1 && last_i[1] === 0) || (trgType === 'negative' && i[1] === 0 && last_i[1] === 1);
                if (edge && i[0] === 1) state.q = state.q === 1 ? 0 : 1;
            }
            return [state.q, state.q === 1 ? 0 : 1];
        }
    },
    'dlatch': {
        inputs: ['pin1', 'pin2'], outputs: ['pin4', 'pin5'],
        eval: (i, state) => {
            if (state.q === undefined) state.q = 0;
            if (i[1] === 1 && i[0] !== undefined) state.q = i[0];
            return [state.q, state.q === 1 ? 0 : 1];
        }
    }
};

export function runDigitalSimulation() {
    let savedConfig = JSON.parse(localStorage.getItem('jlcad_logic_config') || '{}');
    AppState.spiceSimConfig = { ...AppState.spiceSimConfig, ...savedConfig };
    
    let c = AppState.spiceSimConfig || {};
    let defStop = c.logicStop || "10u";
    let defStep = c.logicStep || "Auto";
    let defMaxSteps = c.maxSteps || "200000";

    const inputCSS = "width:100%; height:32px; font-size:13px; margin:0; padding:0 10px; box-sizing:border-box; border:1px solid var(--border-main); border-radius:4px; background:var(--bg-panel); color:var(--text-main); outline:none;";

    Swal.fire({
        title: '<div style="display:flex; align-items:center; justify-content:center; gap:8px;"><i data-lucide="clock" style="width: 20px; height: 20px;"></i> Digital Timing Analysis</div>',
        html: `
            <div style="text-align: left; font-size: 13px; background: var(--bg-app); padding: 15px; border: 1px solid var(--border-main); border-radius: 6px;">
                <label style="font-weight:600; color:var(--text-main); display:block; margin-bottom:4px;">Simulation Duration</label>
                <input type="text" id="logic-stop" class="swal2-input" value="${defStop}" style="${inputCSS}" placeholder="e.g. 10u (10 microseconds)">
                
                <label style="font-weight:600; color:var(--text-main); margin-top:12px; display:block; margin-bottom:4px;">Engine Time Step (Resolution)</label>
                <input type="text" id="logic-step" class="swal2-input" value="${defStep}" style="${inputCSS}" placeholder="Type 'Auto' or a value like 1n">
                
                <label style="font-weight:600; color:var(--text-main); margin-top:12px; display:block; margin-bottom:4px;">Safety Limit (Max Steps)</label>
                <input type="number" id="logic-max-steps" class="swal2-input" value="${defMaxSteps}" style="${inputCSS}" placeholder="e.g. 200000">
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: '<div style="display:flex; align-items:center; gap:6px;"><i data-lucide="play" style="width:14px; height:14px;"></i> Run Analysis</div>',
        cancelButtonText: 'Cancel',
        didOpen: () => {
            lucide.createIcons();
        },
        preConfirm: () => {
            return { 
                stop: document.getElementById('logic-stop').value.trim(), 
                step: document.getElementById('logic-step').value.trim(),
                maxSteps: document.getElementById('logic-max-steps').value.trim()
            };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            AppState.spiceSimConfig.logicStop = result.value.stop;
            AppState.spiceSimConfig.logicStep = result.value.step;
            AppState.spiceSimConfig.maxSteps = result.value.maxSteps;
            
            AppState.graph.set('spiceSimConfig', AppState.spiceSimConfig);
            localStorage.setItem('jlcad_logic_config', JSON.stringify({
                logicStop: result.value.stop,
                logicStep: result.value.step,
                maxSteps: result.value.maxSteps
            }));

            executeDigitalBatch(result.value.stop, result.value.step, result.value.maxSteps);
        }
    });
}

function executeDigitalBatch(stopStr, stepStr, maxStepsStr) {
    let tStop = parseSpiceToNumber(stopStr);
    let maxStepsLimit = parseInt(maxStepsStr) || 200000;

    if (!tStop || tStop <= 0) return Swal.fire('Error', 'Invalid simulation duration.', 'error');

    let dt;
    let isAutoStep = stepStr.trim().toLowerCase() === 'auto';

    if (isAutoStep) {
        let minEventTime = Infinity;
        
        AppState.graph.getElements().forEach(el => {
            let delayStr = (el.get('simData') || {})['DELAY'];
            if (delayStr) {
                let d = parseSpiceToNumber(delayStr);
                if (d > 0 && d < minEventTime) minEventTime = d;
            }
            if (el.get('latexMacro') === 'clocksource') {
                let freq = parseSpiceToNumber((el.get('simData') || {})['FREQ'] || "1Meg") || 1e6;
                let halfPeriod = 1.0 / (2 * freq);
                if (halfPeriod > 0 && halfPeriod < minEventTime) minEventTime = halfPeriod;
            }
        });

        if (minEventTime === Infinity) dt = 1e-9; 
        else dt = minEventTime / 4; 

        let maxSafeStep = tStop / maxStepsLimit;
        if (dt < maxSafeStep) {
            dt = maxSafeStep;
            console.warn(`[Auto-Step] Clamped resolution to ${dt}s`);
        }
    } else {
        dt = parseSpiceToNumber(stepStr);
    }

    if (!dt || dt <= 0) return Swal.fire('Error', 'Invalid time step.', 'error');

    let steps = Math.floor(tStop / dt);
    if (steps > maxStepsLimit) {
        return Swal.fire({
            title: 'Simulation Aborted',
            html: `You requested <b>~${steps.toLocaleString()}</b> calculation steps, exceeding the safety limit.`,
            icon: 'error'
        });
    }

    let topo = window.extractTopology(); 
    let nets = {}; let prevNets = {}; let events = []; let history = {}; let probes = {}; let t = 0;

    topo.gndNodes.forEach(gndStr => {
        let netId = topo.netMap.get(topo.uf.find(gndStr));
        if (netId) nets[netId] = 0;
    });

    AppState.graph.getElements().forEach(el => {
        if (el.get('latexMacro') === 'testprobe') {
            let pt = window.getAbsolutePinCoord(el, 'pin1');
            let cluster = topo.terminals.find(term => Math.abs(term.x - pt.x) < 5 && Math.abs(term.y - pt.y) < 5);
            if (cluster) {
                let netId = topo.netMap.get(topo.uf.find(cluster.id));
                probes[netId] = el.get('displayedText') || 'TP';
                history[netId] = { time: [], states: [] };
            }
        }
    });

    if (Object.keys(probes).length === 0) return Swal.fire('No Probes', 'Please attach Test Probes to the circuit.', 'warning');

    AppState.graph.getElements().forEach(el => el.logicState = {});

    function getNetId(el, pinId) {
        let pt = window.getAbsolutePinCoord(el, pinId);
        let cluster = topo.terminals.find(term => Math.abs(term.x - pt.x) < 5 && Math.abs(term.y - pt.y) < 5);
        return cluster ? topo.netMap.get(topo.uf.find(cluster.id)) : null;
    }

    Swal.fire({ 
        title: 'Simulating...', text: `Processing ${steps.toLocaleString()} steps.`,
        allowOutsideClick: false, showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
            requestAnimationFrame(() => { setTimeout(() => { runHeavySimulationLoop(); }, 50); });
        }
    });

    function runHeavySimulationLoop() {
        for (let step = 0; step <= steps; step++) {
            
            // 1. Process Event Queue
            let remainingEvents = [];
            for (let i = 0; i < events.length; i++) {
                if (events[i].time <= t + (dt / 2)) nets[events[i].netId] = events[i].state;
                else remainingEvents.push(events[i]);
            }
            events = remainingEvents;

            // 2. Update Sources
            AppState.graph.getElements().forEach(el => {
                let macro = el.get('latexMacro');
                if (macro === 'dcvoltagesource' || macro === 'voltagesource' || macro === 'dcbattery') {
                    let outNet = getNetId(el, 'pin2'); 
                    if (outNet) {
                        let valStr = (el.get('spiceData') || {})['SIGNAL'] || "5";
                        nets[outNet] = (parseFloat(valStr) >= 1 || valStr === "5") ? 1 : 0;
                    }
                }
                if (macro === 'clocksource') {
                    let simData = el.get('simData') || {};
                    let freq = parseSpiceToNumber(simData['FREQ'] || "1Meg") || 1e6;
                    let period = 1.0 / freq;
                    let init = parseInt(simData['INIT']) || 0;
                    
                    let phase = (t + 1e-12) % period; 
                    let isPhaseHigh = phase < (period / 2);
                    let expectedState = init === 1 ? (isPhaseHigh ? 1 : 0) : (isPhaseHigh ? 0 : 1);
                    
                    let outNet = getNetId(el, 'pin1');
                    if (outNet) nets[outNet] = expectedState;
                }
            });

            // 3. Resolve Cascading Logic Instantly!
            let logicChanged = true;
            let maxIters = 10;
            let iters = 0;
            
            while (logicChanged && iters < maxIters) {
                logicChanged = false;
                iters++;
                
                AppState.graph.getElements().forEach(el => {
                    let macro = el.get('latexMacro');
                    let model = LOGIC_MODELS[macro];
                    
                    if (!model && macro.includes('ninputs')) {
                        let n = parseInt((el.get('customArgs')||[])[2]) || 2;
                        let inArr = []; for(let k=1; k<=n; k++) inArr.push('pin'+k);
                        let opType = macro.replace('ninputs', '');
                        model = {
                            inputs: inArr, outputs: ['pinRight'],
                            eval: (i) => {
                                let vIns = i.slice(0, n).filter(v => v !== undefined);
                                if (vIns.length < n && opType !== 'or') return [undefined];
                                if (opType === 'and') return [vIns.every(v=>v===1)?1:0];
                                if (opType === 'nand') return [vIns.every(v=>v===1)?0:1];
                                if (opType === 'or') return [vIns.some(v=>v===1)?1:0];
                                if (opType === 'nor') return [vIns.some(v=>v===1)?0:1];
                                return [undefined];
                            }
                        };
                    }
                    
                    if (!model && macro === 'muxninputs') {
                        let n = parseInt((el.get('customArgs')||[])[2]) || 2;
                        let selCount = Math.ceil(Math.log2(n));
                        let inArr = []; for(let k=1; k<=n; k++) inArr.push('pin'+k);
                        for(let k=1; k<=selCount; k++) inArr.push('pinSelect'+k);
                        model = {
                            inputs: inArr, outputs: ['pinOutput'],
                            eval: (i) => {
                                let selVal = 0, valid = true;
                                for (let s = 0; s < selCount; s++) {
                                    let bit = i[n + s];
                                    if (bit === undefined) { valid = false; break; }
                                    selVal += (bit << s);
                                }
                                if (!valid || selVal >= n) return [undefined];
                                return [i[selVal]];
                            }
                        };
                    }

                    if (model) {
                        let inStates = model.inputs.map(pinId => nets[getNetId(el, pinId)]);
                        let lastInStates = model.inputs.map(pinId => prevNets[getNetId(el, pinId)]);
                        
                        let outStates = model.eval(inStates, el.logicState, lastInStates, el);
                        let delaySec = parseSpiceToNumber((el.get('simData') || {})['DELAY'] || "1n"); 

                        model.outputs.forEach((pinId, idx) => {
                            let netId = getNetId(el, pinId);
                            if (netId && outStates[idx] !== undefined) {
                                
                                // Only process if state wants to change
                                if (nets[netId] !== outStates[idx]) {
                                    
                                    if (delaySec < dt) {
                                        // 🌟 THE FIX: Instant Propagation for sub-step delays!
                                        nets[netId] = outStates[idx];
                                        logicChanged = true;
                                        events = events.filter(e => e.netId !== netId);
                                    } else {
                                        // 🌟 Real Macro Delay: Put it in the queue
                                        let targetEvent = events.find(e => e.netId === netId);
                                        if (!targetEvent || targetEvent.state !== outStates[idx]) {
                                            events = events.filter(e => e.netId !== netId);
                                            events.push({ time: t + delaySec, netId: netId, state: outStates[idx] });
                                        }
                                    }
                                }
                            }
                        });
                    }
                });
            }

            // 4. Record Probes
            Object.keys(probes).forEach(netId => {
                let state = nets[netId] !== undefined ? nets[netId] : 'U';
                let h = history[netId];
                if (h.states.length === 0 || h.states[h.states.length - 1] !== state || step === steps) {
                    h.time.push(t);
                    h.states.push(state);
                }
            });

            Object.assign(prevNets, nets);
            t += dt;
        }

        Swal.close();
        renderBatchTimingDiagram(probes, history, tStop);
    }
}

function renderBatchTimingDiagram(probes, history, maxTime) {
    let allProbeNetIds = Object.keys(probes);
    if (allProbeNetIds.length === 0) return;

    let rowHeight = 45;
    let totalNs = maxTime * 1e9;
    
    const TRACE_COLORS = ['#e74c3c', '#2980b9', '#27ae60', '#f39c12', '#8e44ad', '#d35400', '#16a085', '#2c3e50'];

    function getStateAtTime(h, timeNs) {
        let state = h.states[0] !== undefined ? h.states[0] : 'U';
        for (let i = 0; i < h.time.length; i++) {
            if (h.time[i] * 1e9 > timeNs) break;
            state = h.states[i];
        }
        return state;
    }

    function generateDiagramHTML(zoomFactor, containerWidth, gridDensity, containerHeight, rowHeight, visibleProbes, startNs, stopNs) {
        let activeProbes = allProbeNetIds.filter(id => visibleProbes.has(id));
        
        if (startNs < 0) startNs = 0;
        if (stopNs > totalNs) stopNs = totalNs;
        if (startNs >= stopNs) startNs = stopNs - 1; 
        
        let windowNs = stopNs - startNs;

        let availableWidth = Math.max(600, containerWidth - 85); 
        let basePixelsPerNs = availableWidth / windowNs;
        if (basePixelsPerNs < 0.00001) basePixelsPerNs = 0.00001; 

        let pixelsPerNs = basePixelsPerNs * zoomFactor;
        let labelWidth = 85;
        let svgWidth = Math.max(availableWidth, (windowNs * pixelsPerNs) + 20);
        
        let contentHeight = (activeProbes.length * rowHeight) + 40;
        let svgHeight = Math.max(contentHeight, containerHeight || 0);
        let numRows = Math.ceil(svgHeight / rowHeight);

        let gridStep = windowNs / (10 * zoomFactor); 
        let exponent = Math.floor(Math.log10(gridStep || 1));
        let fraction = gridStep / Math.pow(10, exponent);
        let niceFraction = fraction <= 1.5 ? 1 : (fraction <= 3.5 ? 2 : (fraction <= 7.5 ? 5 : 10));
        let chosenStep = niceFraction * Math.pow(10, exponent);
        if (chosenStep === 0) chosenStep = 1;

        let densityNum = parseInt(gridDensity) || 0;
        let minorStep = densityNum > 0 ? chosenStep / densityNum : chosenStep;

        let html = `<div style="display: flex; min-width: min-content; position: relative; background: var(--bg-panel); min-height: 100%;">`;
        
        html += `<div style="position: sticky; left: 0; z-index: 10; width: ${labelWidth}px; background: var(--bg-panel); border-right: 2px solid var(--border-main); flex-shrink: 0; box-shadow: 2px 0 5px rgba(0,0,0,0.1);">`;
        html += `<div style="height: 20px;"></div>`; 
        
        for (let i = 0; i < numRows; i++) {
            let content = "";
            let colorStyle = "border-left: 4px solid transparent;";
            if (i < activeProbes.length) {
                let netId = activeProbes[i];
                let origIndex = allProbeNetIds.indexOf(netId);
                let color = TRACE_COLORS[origIndex % TRACE_COLORS.length];
                content = probes[netId];
                colorStyle = `color: ${color}; border-left: 4px solid ${color};`;
            }
            html += `<div style="height: ${rowHeight}px; display: flex; align-items: center; padding-left: 10px; background: ${i % 2 === 0 ? 'var(--bg-panel)' : 'var(--bg-app)'}; font-weight: bold; font-size: 13px; box-sizing: border-box; ${colorStyle}">${content}</div>`;
        }
        html += `</div>`;

        html += `<div style="flex-grow: 1; background: var(--bg-panel);">`;
        html += `<svg width="${svgWidth}" height="${svgHeight}" style="font-family: var(--font-code); background: var(--bg-panel); display: block;">`;
        
        for (let i = 0; i < numRows; i++) {
            let baseY = 20 + (i * rowHeight);
            html += `<rect x="0" y="${baseY}" width="${svgWidth}" height="${rowHeight}" fill="${i % 2 === 0 ? 'var(--bg-panel)' : 'var(--bg-app)'}" stroke="none" />`;
        }

        html += `<g stroke="var(--border-light)" stroke-width="1">`;
        let firstGridMark = Math.ceil(startNs / minorStep) * minorStep;
        
        for (let t = firstGridMark; t <= stopNs; t += minorStep) {
            let x = (t - startNs) * pixelsPerNs;
            
            let isMajor = false;
            if (densityNum === 0) isMajor = true;
            else {
                let stepsFromZero = Math.round(t / minorStep);
                isMajor = (stepsFromZero % densityNum === 0);
            }
            
            if (isMajor) {
                html += `<line x1="${x}" y1="20" x2="${x}" y2="${svgHeight}" stroke="var(--border-main)" stroke-width="1" />`;
                let tLabel = t; let unit = "ns";
                if (t >= 1e6) { tLabel = t / 1e6; unit = "ms"; }
                else if (t >= 1e3) { tLabel = t / 1e3; unit = "µs"; }
                html += `<text x="${x}" y="14" font-size="11" font-weight="bold" fill="var(--text-main)" stroke="none" text-anchor="middle">${parseFloat(tLabel.toFixed(2))} ${unit}</text>`;
            } else {
                html += `<line x1="${x}" y1="20" x2="${x}" y2="${svgHeight}" stroke="var(--border-main)" stroke-width="1" stroke-dasharray="2 4" opacity="0.6" />`;
            }
        }
        html += `</g>`;

        activeProbes.forEach((netId, index) => {
            let h = history[netId];
            let origIndex = allProbeNetIds.indexOf(netId);
            let color = TRACE_COLORS[origIndex % TRACE_COLORS.length];
            
            let baseY = 20 + (index * rowHeight);
            let padY = rowHeight * 0.2; 
            let highY = baseY + padY;
            let lowY  = baseY + rowHeight - padY;
            let midY  = baseY + (rowHeight / 2);

            html += `<line x1="0" y1="${lowY}" x2="${svgWidth}" y2="${lowY}" stroke="var(--border-main)" stroke-width="0.5" stroke-dasharray="2 2"/>`;

            let initialState = getStateAtTime(h, startNs);
            let lastState = initialState;
            
            let initialY = initialState === 1 ? highY : (initialState === 0 ? lowY : midY);
            let pathD = `M 0 ${initialY} `;

            for (let i = 0; i < h.time.length; i++) {
                let t_ns = h.time[i] * 1e9;
                if (t_ns <= startNs) continue; 
                if (t_ns > stopNs) break;      
                
                let state = h.states[i];
                let xCurrent = (t_ns - startNs) * pixelsPerNs;
                let y = state === 1 ? highY : (state === 0 ? lowY : midY);
                let yPrev = lastState === 1 ? highY : (lastState === 0 ? lowY : midY);
                
                pathD += `L ${xCurrent} ${yPrev} L ${xCurrent} ${y} `;
                lastState = state;
            }
            
            let finalX = windowNs * pixelsPerNs;
            let finalY = lastState === 1 ? highY : (lastState === 0 ? lowY : midY);
            pathD += `L ${finalX} ${finalY}`;

            html += `<path d="${pathD}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round"/>`;
        });

        html += `</svg></div></div>`;
        return html;
    }

    let filterChecksHtml = '';
    allProbeNetIds.forEach(id => {
        filterChecksHtml += `<label style="display:flex; align-items:center; gap:8px; cursor:pointer; padding:6px 12px; margin:0; transition:background 0.2s; font-size:12px; color:var(--text-main);"><input type="checkbox" class="timing-filter-chk" value="${id}" checked style="margin:0;"> ${probes[id]}</label>`;
    });

    Swal.fire({
        width: 'auto', padding: '0', background: 'transparent', backdrop: false, showConfirmButton: false, heightAuto: false,
        html: `
            <div id="timing-true-window" style="width: 1000px; max-width: 95vw; height: auto; min-height: 200px; max-height: 80vh; resize: both; overflow: hidden; display: flex; flex-direction: column; background: var(--bg-panel); border-radius: 6px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); border: 1px solid var(--border-main); pointer-events: auto;">
                <div id="timing-drag-handle" style="flex: 0 0 40px; cursor: move; background: var(--bg-toolbar); color: var(--text-inverse); padding: 0 15px; display: flex; justify-content: space-between; align-items: center; user-select: none;">
                    <span style="font-size: 14px; font-weight: bold; display:flex; align-items:center; gap:8px;"><i data-lucide="clock" style="width: 18px; height: 18px;"></i> Digital Timing Diagram </span>
                    <div style="display:flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                        <div style="display:flex; align-items: center; gap: 5px; background: rgba(0,0,0,0.2); padding: 2px 10px; border-radius: 4px;">
                            <span style="font-size: 11px; font-weight: bold;">Crop (ns):</span>
                            <input type="number" id="timing-start" value="0" min="0" step="1" style="width: 60px; font-size: 11px; padding: 1px 4px; border-radius: 3px; border: none; outline: none; background: var(--bg-panel); color: var(--text-main);">
                            <span style="font-size: 11px; font-weight: bold;">to</span>
                            <input type="number" id="timing-stop" value="${totalNs}" min="0" step="1" style="width: 60px; font-size: 11px; padding: 1px 4px; border-radius: 3px; border: none; outline: none; background: var(--bg-panel); color: var(--text-main);">
                        </div>
                        <div class="toolbar-dropdown" style="margin: 0;">
                            <button class="tool-btn" style="padding: 2px 10px; font-size: 11px; font-weight: bold; background: rgba(0,0,0,0.2); border: none; color: var(--text-inverse); display: flex; align-items: center; gap: 4px;">
                                <i data-lucide="filter" style="width: 12px; height: 12px;"></i> Filter ▼
                            </button>
                            <div class="toolbar-dropdown-content" style="right: 0; left: auto; max-height: 250px; overflow-y: auto; background: var(--bg-panel); box-shadow: 0 4px 10px rgba(0,0,0,0.3); border-radius: 4px; padding: 5px 0;">
                                ${filterChecksHtml}
                            </div>
                        </div>
                        <div style="display:flex; align-items: center; gap: 5px; background: rgba(0,0,0,0.2); padding: 2px 10px; border-radius: 4px;">
                            <span style="font-size: 11px; font-weight: bold;">Grid:</span>
                            <select id="timing-grid" style="font-size: 11px; margin: 0; padding: 1px; border-radius: 3px; border: none; background: var(--bg-panel); color: var(--text-main); outline: none; cursor: pointer;">
                                <option value="0">Off</option> <option value="1">Coarse</option> <option value="2" selected>Medium</option> <option value="4">Fine</option> <option value="10">Ultra</option>
                            </select>
                        </div>
                        <div style="display:flex; align-items: center; gap: 5px; background: rgba(0,0,0,0.2); padding: 2px 10px; border-radius: 4px;" title="Vertical Zoom">
                            <i data-lucide="move-vertical" style="width: 12px; height: 12px;"></i>
                            <input type="range" id="timing-vzoom" min="20" max="120" step="5" value="45" style="width: 50px; cursor: ew-resize; margin: 0;">
                        </div>
                        <div style="display:flex; align-items: center; gap: 5px; background: rgba(0,0,0,0.2); padding: 2px 10px; border-radius: 4px;" title="Horizontal Zoom">
                            <i data-lucide="move-horizontal" style="width: 12px; height: 12px;"></i>
                            <input type="range" id="timing-zoom" min="1" max="100" step="1" value="1" style="width: 60px; cursor: ew-resize; margin: 0;">
                            <span id="timing-zoom-val" style="font-size: 11px; font-weight: bold; width: 25px; text-align: right;">1x</span>
                        </div>
                        <button onclick="Swal.close()" style="background: none; border: none; color: white; cursor: pointer; font-weight: bold; font-size: 16px; line-height: 1; padding: 0 0 0 5px;" title="Close">✖</button>
                    </div>
                </div>
                <div id="timing-diagram-container" style="flex: 1; overflow: auto; background: var(--bg-panel); position: relative; display: flex; flex-direction: column;"></div>
            </div>
        `,
        didOpen: () => {
			lucide.createIcons();
            const popup = Swal.getPopup(); const htmlContainer = Swal.getHtmlContainer(); const handle = document.getElementById('timing-drag-handle');
            const container = document.getElementById('timing-diagram-container'); const windowContainer = document.getElementById('timing-true-window');
            const zoomSlider = document.getElementById('timing-zoom'); const vZoomSlider = document.getElementById('timing-vzoom');
            const zoomVal = document.getElementById('timing-zoom-val'); const gridSelect = document.getElementById('timing-grid');
            const startInput = document.getElementById('timing-start'); const stopInput = document.getElementById('timing-stop');
            
            popup.style.background = 'transparent'; popup.style.boxShadow = 'none';
            if (htmlContainer) { htmlContainer.style.overflow = 'visible'; htmlContainer.style.padding = '0'; htmlContainer.style.margin = '0'; }

            let currentHZoom = 1.0; let currentVZoom = 45; let currentGrid = 2; let currentStartNs = 0; let currentStopNs = totalNs;
            let currentWidth = container.clientWidth; let currentHeight = container.clientHeight; let visibleProbes = new Set(allProbeNetIds);

            const refreshDiagram = () => { container.innerHTML = generateDiagramHTML(currentHZoom, currentWidth, currentGrid, currentHeight, currentVZoom, visibleProbes, currentStartNs, currentStopNs); };
            refreshDiagram();

            const resizeObserver = new ResizeObserver(() => {
                if ((container.clientWidth !== currentWidth || container.clientHeight !== currentHeight) && container.clientWidth > 0) {
                    currentWidth = container.clientWidth; currentHeight = container.clientHeight; refreshDiagram();
                }
            });
            resizeObserver.observe(windowContainer);

            zoomSlider.addEventListener('input', (e) => { currentHZoom = parseFloat(e.target.value); zoomVal.innerText = currentHZoom + 'x'; refreshDiagram(); });
            vZoomSlider.addEventListener('input', (e) => { currentVZoom = parseInt(e.target.value); refreshDiagram(); });
            gridSelect.addEventListener('change', (e) => { currentGrid = parseInt(e.target.value); refreshDiagram(); });

            const handleCropChange = () => {
                let st = parseFloat(startInput.value); let sp = parseFloat(stopInput.value);
                if (isNaN(st) || st < 0) st = 0; if (isNaN(sp) || sp > totalNs) sp = totalNs; if (st >= sp) st = sp - 1;
                startInput.value = st; stopInput.value = sp; currentStartNs = st; currentStopNs = sp; refreshDiagram();
            };

            startInput.addEventListener('change', handleCropChange); stopInput.addEventListener('change', handleCropChange);
            document.querySelectorAll('.timing-filter-chk').forEach(chk => { chk.addEventListener('change', (e) => { if (e.target.checked) visibleProbes.add(e.target.value); else visibleProbes.delete(e.target.value); refreshDiagram(); }); });

            let isDragging = false, startX, startY, initialLeft, initialTop;
            const onMouseMove = (e) => { if (!isDragging) return; popup.style.left = (initialLeft + (e.clientX - startX)) + 'px'; popup.style.top = (initialTop + (e.clientY - startY)) + 'px'; };
            const onMouseUp = () => { isDragging = false; document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp); };
            
            handle.addEventListener('mousedown', (e) => {
                if (['BUTTON', 'INPUT', 'SELECT', 'OPTION', 'LABEL'].includes(e.target.tagName)) return; 
                isDragging = true; const rect = popup.getBoundingClientRect(); popup.style.margin = '0'; popup.style.position = 'fixed'; 
                popup.style.left = rect.left + 'px'; popup.style.top = rect.top + 'px'; popup.style.transform = 'none'; 
                startX = e.clientX; startY = e.clientY; initialLeft = rect.left; initialTop = rect.top;
                document.addEventListener('mousemove', onMouseMove); document.addEventListener('mouseup', onMouseUp);
            });
        }
    });
}