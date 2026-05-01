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
        html += `<svg width="${svgWidth}" height="${svgHeight}" style="font-family: var(--font-code); background: var(--bg-panel); display: block;" xmlns="http://www.w3.org/2000/svg">`;
        
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
        filterChecksHtml += `<label style="display:flex; align-items:center; gap:8px; cursor:pointer; padding:6px 12px; margin:0; font-size:12px; color:var(--text-main);"><input type="checkbox" class="timing-filter-chk" value="${id}" checked style="margin:0;"> ${probes[id]}</label>`;
    });

    // Helper for export button hover effects
	const btnHover = `onmouseover="this.style.background='rgba(128, 128, 128, 0.2)'" onmouseout="this.style.background='transparent'"`;

    Swal.fire({
        width: 'auto', 
        padding: 0, 
        background: 'transparent', 
        backdrop: false, 
        showConfirmButton: false, 
        heightAuto: false,
        customClass: {
            popup: 'timing-modal-override',
            htmlContainer: 'timing-modal-override'
        },
        html: `
            <style>
                .swal2-popup.timing-modal-override { padding: 0 !important; background: transparent !important; border: none !important; }
                .swal2-html-container.timing-modal-override { padding: 0 !important; margin: 0 !important; overflow: hidden !important; }
            </style>
            <div id="timing-true-window" style="width: 1000px; max-width: 95vw; height: auto; min-height: 200px; max-height: 80vh; resize: both; overflow: hidden; display: flex; flex-direction: column; background: var(--bg-panel); border-radius: 6px; box-shadow: 0 4px 25px rgba(0,0,0,0.5); border: 1px solid var(--border-main); pointer-events: auto;">
                
                <div id="timing-drag-handle" style="flex: 0 0 42px; cursor: move; background: var(--bg-toolbar); color: var(--text-inverse); padding: 0 10px; display: flex; justify-content: space-between; align-items: center; user-select: none; border-bottom: 1px solid var(--border-main);">
                    
                    <span style="font-size: 14px; font-weight: bold; display:flex; align-items:center; gap:6px; flex-shrink: 0; white-space: nowrap;">
                        <i data-lucide="clock" style="width: 16px; height: 16px; color: var(--primary);"></i> Timing
                    </span>
                    
                    <div style="display:flex; gap: 8px; align-items: center; flex-grow: 1; justify-content: flex-end; overflow: visible;">
                        
                        <div style="display:flex; align-items: center; gap: 3px; background: rgba(0,0,0,0.2); padding: 3px 8px; border-radius: 4px; white-space: nowrap;">
                            <span style="font-size: 11px; font-weight: bold;">Crop (ns):</span>
                            <input type="number" id="timing-start" value="0" min="0" step="1" style="width: 45px; font-size: 11px; padding: 1px 2px; border-radius: 3px; border: none; outline: none; background: var(--bg-panel); color: var(--text-main); text-align: center;">
                            <span style="font-size: 11px; font-weight: bold;">-</span>
                            <input type="number" id="timing-stop" value="${totalNs}" min="0" step="1" style="width: 45px; font-size: 11px; padding: 1px 2px; border-radius: 3px; border: none; outline: none; background: var(--bg-panel); color: var(--text-main); text-align: center;">
                        </div>
                        
                        <!-- EXPORT DROPDOWN -->
                        <div style="position: relative; margin: 0; white-space: nowrap;">
                            <button id="btn-export-toggle" style="padding: 3px 8px; font-size: 11px; font-weight: bold; background: rgba(0,0,0,0.2); border: none; border-radius: 4px; color: var(--text-inverse); display: flex; align-items: center; gap: 4px; cursor: pointer;">
                                <i data-lucide="download" style="width: 12px; height: 12px;"></i> Export ▼
                            </button>
                            <div id="menu-export" style="display: none; position: absolute; right: 0; top: calc(100% + 5px); background: var(--bg-panel); box-shadow: 0 4px 15px rgba(0,0,0,0.5); border: 1px solid var(--border-main); border-radius: 4px; padding: 5px 0; z-index: 10000; min-width: 180px;">
                                <button id="btn-export-dig-csv" ${btnHover} style="display:block; width:100%; text-align:left; padding:8px 12px; background:transparent; border:none; color:var(--text-main); cursor:pointer; font-size:12px; transition: background 0.1s;">Export CSV</button>
                                <button id="btn-export-dig-png" ${btnHover} style="display:block; width:100%; text-align:left; padding:8px 12px; background:transparent; border:none; color:var(--text-main); cursor:pointer; font-size:12px; transition: background 0.1s;">Export PNG</button>
                                <button id="btn-export-dig-tex" ${btnHover} style="display:block; width:100%; text-align:left; padding:8px 12px; background:transparent; border:none; color:var(--text-main); cursor:pointer; font-size:12px; transition: background 0.1s;">Export TikZ (.sty)</button>
                                <button id="btn-export-dig-standalone-tex" ${btnHover} style="display:block; width:100%; text-align:left; padding:8px 12px; background:transparent; border:none; color:var(--text-main); cursor:pointer; font-size:12px; transition: background 0.1s;">Export Standalone LaTeX</button>
                                <button id="btn-export-dig-mat" ${btnHover} style="display:block; width:100%; text-align:left; padding:8px 12px; background:transparent; border:none; color:var(--text-main); cursor:pointer; font-size:12px; transition: background 0.1s;">Export MATLAB</button>
                            </div>
                        </div>

                        <!-- FILTER DROPDOWN -->
                        <div style="position: relative; margin: 0; white-space: nowrap;">
                            <button id="btn-filter-toggle" style="padding: 3px 8px; font-size: 11px; font-weight: bold; background: rgba(0,0,0,0.2); border: none; border-radius: 4px; color: var(--text-inverse); display: flex; align-items: center; gap: 4px; cursor: pointer;">
                                <i data-lucide="filter" style="width: 12px; height: 12px;"></i> Filter ▼
                            </button>
                            <div id="menu-filter" style="display: none; position: absolute; right: 0; top: calc(100% + 5px); max-height: 250px; overflow-y: auto; background: var(--bg-panel); box-shadow: 0 4px 15px rgba(0,0,0,0.5); border: 1px solid var(--border-main); border-radius: 4px; padding: 5px 0; z-index: 10000; min-width: 160px;">
                                ${filterChecksHtml}
                            </div>
                        </div>
                        
                        <div style="display:flex; align-items: center; gap: 3px; background: rgba(0,0,0,0.2); padding: 3px 8px; border-radius: 4px; white-space: nowrap;">
                            <i data-lucide="grid" style="width: 12px; height: 12px;"></i>
                            <select id="timing-grid" style="font-size: 11px; margin: 0; padding: 0; border-radius: 3px; border: none; background: transparent; color: var(--text-inverse); outline: none; cursor: pointer; font-weight: bold;">
                                <option value="0" style="color: black;">Off</option> <option value="1" style="color: black;">Coarse</option> <option value="2" selected style="color: black;">Medium</option> <option value="4" style="color: black;">Fine</option> <option value="10" style="color: black;">Ultra</option>
                            </select>
                        </div>
                        
                        <div style="display:flex; align-items: center; gap: 3px; background: rgba(0,0,0,0.2); padding: 3px 8px; border-radius: 4px; white-space: nowrap;" title="Vertical Zoom">
                            <i data-lucide="move-vertical" style="width: 12px; height: 12px;"></i>
                            <input type="range" id="timing-vzoom" min="20" max="120" step="5" value="45" style="width: 45px; cursor: ew-resize; margin: 0;">
                        </div>
                        
                        <div style="display:flex; align-items: center; gap: 3px; background: rgba(0,0,0,0.2); padding: 3px 8px; border-radius: 4px; white-space: nowrap;" title="Horizontal Zoom">
                            <i data-lucide="move-horizontal" style="width: 12px; height: 12px;"></i>
                            <input type="range" id="timing-zoom" min="1" max="100" step="1" value="1" style="width: 45px; cursor: ew-resize; margin: 0;">
                        </div>
                    </div>
                    
                    <button onclick="Swal.close()" style="flex-shrink: 0; background: none; border: none; color: var(--text-inverse); cursor: pointer; font-weight: bold; font-size: 18px; line-height: 1; padding: 0 0 0 10px; margin-left: 10px;" title="Close Window">✖</button>
                </div>
                
                <div id="timing-diagram-container" style="flex: 1; overflow: auto; background: var(--bg-panel); position: relative; display: flex; flex-direction: column;"></div>
            </div>
        `,
        didOpen: () => {
            lucide.createIcons();
            const popup = Swal.getPopup(); 
            const handle = document.getElementById('timing-drag-handle');
            const container = document.getElementById('timing-diagram-container'); 
            const windowContainer = document.getElementById('timing-true-window');
            const zoomSlider = document.getElementById('timing-zoom'); 
            const vZoomSlider = document.getElementById('timing-vzoom');
            const gridSelect = document.getElementById('timing-grid');
            const startInput = document.getElementById('timing-start'); 
            const stopInput = document.getElementById('timing-stop');

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

            zoomSlider.addEventListener('input', (e) => { currentHZoom = parseFloat(e.target.value); refreshDiagram(); });
            vZoomSlider.addEventListener('input', (e) => { currentVZoom = parseInt(e.target.value); refreshDiagram(); });
            gridSelect.addEventListener('change', (e) => { currentGrid = parseInt(e.target.value); refreshDiagram(); });

            const handleCropChange = () => {
                let st = parseFloat(startInput.value); let sp = parseFloat(stopInput.value);
                if (isNaN(st) || st < 0) st = 0; if (isNaN(sp) || sp > totalNs) sp = totalNs; if (st >= sp) st = sp - 1;
                startInput.value = st; stopInput.value = sp; currentStartNs = st; currentStopNs = sp; refreshDiagram();
            };

            startInput.addEventListener('change', handleCropChange); stopInput.addEventListener('change', handleCropChange);
            document.querySelectorAll('.timing-filter-chk').forEach(chk => { chk.addEventListener('change', (e) => { if (e.target.checked) visibleProbes.add(e.target.value); else visibleProbes.delete(e.target.value); refreshDiagram(); }); });

            // --- JAVASCRIPT DROPDOWN TOGGLE LOGIC ---
            const btnExportToggle = document.getElementById('btn-export-toggle');
            const menuExport = document.getElementById('menu-export');
            const btnFilterToggle = document.getElementById('btn-filter-toggle');
            const menuFilter = document.getElementById('menu-filter');

            const closeAllMenus = () => {
                if(menuExport) menuExport.style.display = 'none';
                if(menuFilter) menuFilter.style.display = 'none';
            };

            if (btnExportToggle) {
                btnExportToggle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    let isVis = menuExport.style.display === 'block';
                    closeAllMenus();
                    if (!isVis) menuExport.style.display = 'block';
                });
            }

            if (btnFilterToggle) {
                btnFilterToggle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    let isVis = menuFilter.style.display === 'block';
                    closeAllMenus();
                    if (!isVis) menuFilter.style.display = 'block';
                });
            }

            if (menuFilter) menuFilter.addEventListener('click', (e) => e.stopPropagation());
            popup.addEventListener('click', closeAllMenus);
            
            document.querySelectorAll('#menu-export button').forEach(btn => {
                btn.addEventListener('click', closeAllMenus);
            });

            // --- ADVANCED EXPORT HANDLERS ---
            async function downloadData(content, defaultFilename, mimeType, description) {
                if (window.showSaveFilePicker) {
                    try {
                        const handle = await window.showSaveFilePicker({
                            suggestedName: defaultFilename,
                            types: [{ description: description, accept: { [mimeType]: [`.${defaultFilename.split('.').pop()}`] } }]
                        });
                        const writable = await handle.createWritable();
                        await writable.write(content);
                        await writable.close();
                    } catch (e) {
                        if (e.name !== 'AbortError') console.error(e);
                    }
                } else {
                    const blob = new Blob([content], { type: mimeType });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url; a.download = defaultFilename;
                    document.body.appendChild(a); a.click();
                    document.body.removeChild(a); URL.revokeObjectURL(url);
                }
            }

            document.getElementById('btn-export-dig-csv').onclick = () => {
                let active = allProbeNetIds.filter(id => visibleProbes.has(id));
                let times = new Set([currentStartNs, currentStopNs]);
                active.forEach(id => {
                    history[id].time.forEach(t => { let t_ns = t * 1e9; if(t_ns >= currentStartNs && t_ns <= currentStopNs) times.add(t_ns); });
                });
                let sortedTimes = Array.from(times).sort((a,b) => a - b);
                
                let csv = "Time (ns)," + active.map(id => probes[id]).join(",") + "\n";
                sortedTimes.forEach(t => {
                    let row = [t];
                    active.forEach(id => row.push(getStateAtTime(history[id], t)));
                    csv += row.join(",") + "\n";
                });
                downloadData(csv, "digital_timing.csv", "text/csv", "CSV Data File");
            };

            function generateTikzCore(active, windowNs) {
                let allTimes = new Set([currentStartNs, currentStopNs]);
                active.forEach(id => {
                    history[id].time.forEach(t => { 
                        let tns = t * 1e9; 
                        if (tns >= currentStartNs && tns <= currentStopNs) allTimes.add(Math.round(tns * 1000) / 1000); 
                    });
                });
                let sortedTimes = Array.from(allTimes).sort((a, b) => a - b);
                
                let minDelta = windowNs;
                for (let i = 1; i < sortedTimes.length; i++) {
                    let d = sortedTimes[i] - sortedTimes[i-1];
                    if (d > 0.01 && d < minDelta) minDelta = d;
                }

                let maxChars = 150; 
                let sampleStep = Math.max(minDelta, windowNs / maxChars);
                let samples = Math.floor(windowNs / sampleStep);
                if (samples < 1) samples = 1;

                let tex = "";
                for (let i = 0; i < active.length; i += 4) {
                    let chunk = active.slice(i, i + 4);
                    let args = [];
                    for (let j = 0; j < 4; j++) {
                        if (j < chunk.length) {
                            // Reorder logic: Output the UI-Top signal as the LaTeX-Top signal
                            let netId = chunk[chunk.length - 1 - j];
                            let name = probes[netId];
                            let stream = "";
                            for (let k = 0; k < samples; k++) {
                                let t = currentStartNs + k * sampleStep + (sampleStep / 2);
                                let state = getStateAtTime(history[netId], t);
                                stream += (state === 1 ? '1' : (state === 0 ? '0' : 'X'));
                            }
                            args.push(`{${stream}-${name}}`); 
                        } else {
                            args.push(`{}`);
                        }
                    }
                    
                    // Maintain precise stacking spacing for multiple chunks
                    let offset = 2 * (chunk.length - 1) + 2 * i; 
                    tex += `\\timingdiagram{(0, -${offset})}${args[0]}${args[1]}${args[2]}${args[3]}{gridon}{}\n`;
                }
                return tex;
            }

            document.getElementById('btn-export-dig-tex').onclick = () => {
                let active = allProbeNetIds.filter(id => visibleProbes.has(id));
                let tex = "% Auto-generated Adaptive Timing Diagram (requires tikz_electronic_parts.sty)\n\\begin{tikzpictureJL}\n";
                tex += generateTikzCore(active, currentStopNs - currentStartNs);
                tex += "\\end{tikzpictureJL}";
                downloadData(tex, "digital_timing.tex", "text/plain", "LaTeX File");
            };

            document.getElementById('btn-export-dig-standalone-tex').onclick = () => {
                let active = allProbeNetIds.filter(id => visibleProbes.has(id));
                let tex = `\\documentclass{standalone}\n\n% Required packages for the style file\n\\usepackage{amsmath}\n\\usepackage{tikz}\n\\usepackage{xstring}\n\\usepackage{xparse}\n\\usepackage{etoolbox}\n\\usepackage{calculator}\n\\usepackage{accents}\n\\usepackage{xcolor}\n\n% Load your specific electronic parts style file\n\\usepackage{tikz_electronic_parts}\n\\standaloneenv{tikzpictureJL}\n\n\\begin{document}\n\\settikzlinewidth{1.2}\n\\tikzset{every picture/.style={line width=\\tikzlinewidth}}\n\n\\begin{tikzpictureJL}[scale=0.245]\n`;
                tex += generateTikzCore(active, currentStopNs - currentStartNs);
                tex += `\\end{tikzpictureJL}\n\n\\end{document}`;
                downloadData(tex, "digital_timing_standalone.tex", "text/plain", "LaTeX Standalone File");
            };

            document.getElementById('btn-export-dig-mat').onclick = () => {
                let active = allProbeNetIds.filter(id => visibleProbes.has(id));
                let mat = "% MATLAB Digital Timing Diagram\nfigure;\nhold on;\n";
                active.forEach((netId, idx) => {
                    let h = history[netId];
                    let offset = (active.length - 1 - idx) * 1.5; 
                    let tArr = [currentStartNs];
                    let yArr = [getStateAtTime(h, currentStartNs) === 1 ? 1 + offset : 0 + offset];
                    
                    h.time.forEach((t_sec, i) => {
                        let t_ns = t_sec * 1e9;
                        if(t_ns > currentStartNs && t_ns <= currentStopNs) {
                            tArr.push(t_ns);
                            yArr.push(h.states[i] === 1 ? 1 + offset : 0 + offset);
                        }
                    });
                    tArr.push(currentStopNs);
                    yArr.push(yArr[yArr.length-1]);
                    
                    mat += `t_${idx} = [${tArr.join(', ')}];\n`;
                    mat += `y_${idx} = [${yArr.join(', ')}];\n`;
                    mat += `stairs(t_${idx}, y_${idx}, 'LineWidth', 1.5, 'DisplayName', '${probes[netId]}');\n`;
                });
                mat += "yticks([]); ylabel('Signals'); xlabel('Time (ns)');\nlegend('show');\n";
                downloadData(mat, "digital_timing.m", "text/plain", "MATLAB File");
            };

            document.getElementById('btn-export-dig-png').onclick = () => {
                let svgEl = container.querySelector('svg');
                if (!svgEl) return;
                
                let svgData = new XMLSerializer().serializeToString(svgEl)
                    .replace(/var\(--bg-panel\)/g, '#ffffff')
                    .replace(/var\(--bg-app\)/g, '#f8f9fa')
                    .replace(/var\(--border-main\)/g, '#bdc3c7')
                    .replace(/var\(--text-main\)/g, '#2c3e50')
                    .replace(/var\(--border-light\)/g, '#ecf0f1');
                    
                let img = new Image();
                img.onload = () => {
                    let cvs = document.createElement('canvas');
                    cvs.width = svgEl.getAttribute('width') || 800;
                    cvs.height = svgEl.getAttribute('height') || 600;
                    let ctx = cvs.getContext('2d');
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, cvs.width, cvs.height);
                    ctx.drawImage(img, 0, 0);
                    
                    cvs.toBlob(async (blob) => {
                        if (window.showSaveFilePicker) {
                            try {
                                const handle = await window.showSaveFilePicker({
                                    suggestedName: 'digital_timing.png',
                                    types: [{ description: 'PNG Image', accept: { 'image/png': ['.png'] } }]
                                });
                                const writable = await handle.createWritable();
                                await writable.write(blob);
                                await writable.close();
                            } catch (e) {
                                if (e.name !== 'AbortError') console.error(e);
                            }
                        } else {
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.download = 'digital_timing.png';
                            a.href = url; a.click(); URL.revokeObjectURL(url);
                        }
                    });
                };
                img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
            };

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