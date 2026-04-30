// js/ui/properties.js
import { AppState, THEME_COLORS } from '../state.js';
import { saveState } from './actions.js';
import { exportLatex } from '../parsers/latex.js';
import { getVisualOrigin, applyRobustScale, updateElementLabel, assembleIcon, updateGhostDotsVisibility } from './canvas.js';

export function initializeProperties() {
    // Expose HTML-bound helpers to the global window object
    setupGlobalHelpers();

    AppState.paper.on('cell:pointerdblclick', function(cellView) {
        let el = cellView.model;
        if (el.isLink()) return;

        // --- GHOST TOGGLE FOR CONNECTOR DOTS ---
        if (el.get('latexMacro') === 'connectordot') {
            el.set('isGhost', !el.get('isGhost')); 
            updateGhostDotsVisibility();           
            exportLatex();                         
            saveState();
            return; 
        }

        let macro = el.get('latexMacro');
        let data = JL_DATABASE[macro];
        if (!data) return;

        const originalState = {
            args: [...(el.get('customArgs') || [])], 
            scale: el.get('customScale') || 1,
            lblX: el.get('labelOffsetX') || 0,
            lblY: el.get('labelOffsetY') || 0,
            angle: el.get('angle') || 0,
            flipH: el.get('flipH') || false,
            flipV: el.get('flipV') || false,
            hideLbl: el.get('customHideLabel'),
            spiceData: JSON.parse(JSON.stringify(el.get('spiceData') || {})),
            simData: JSON.parse(JSON.stringify(el.get('simData') || {}))
        };

        let currentArgs = el.get('customArgs') || [];
        let htmlForm = '<div style="text-align: left; max-height: 60vh; overflow-y: auto; overflow-x: hidden; padding: 5px 10px; color: var(--text-main);">';

        let currentScale = el.get('customScale') || 1;
        let currentLblX = el.get('labelOffsetX') || 0;
        let currentLblY = el.get('labelOffsetY') || 0;

        let allowedScales = data.scales || [0.5, 1, 2, 4];
        let scaleOptionsHtml = allowedScales.map(val => {
            let isSelected = (currentScale === val) ? 'selected' : '';
            return `<option value="${val}" ${isSelected}>${val}x</option>`;
        }).join('\n');

        // Standardized Input CSS String to keep code clean
        const inputCSS = "width: 100%; height: 32px; font-size: 13px; margin: 0; padding: 0 8px; box-sizing: border-box; border: 1px solid var(--border-main); border-radius: 4px; background: var(--bg-panel); color: var(--text-main); outline: none;";

        htmlForm += `<div style="margin-bottom: 12px; border-bottom: 1px solid var(--border-main); padding-bottom: 10px;">
                        <label style="display:block; margin-bottom: 4px; font-weight: 600; color: var(--text-main); font-size: 12px;">Scale factor</label>
                        <select id="swal-input-scale" class="swal2-input" style="${inputCSS}">
                            ${scaleOptionsHtml}
                        </select>
                    </div>`;

        htmlForm += `<div style="margin-bottom: 15px; border-bottom: 1px solid var(--border-main); padding-bottom: 10px; display: flex; gap: 10px;">
                        <div style="flex: 1;">
                            <label style="display:block; margin-bottom: 4px; font-weight: 600; color: var(--text-main); font-size: 12px;">Name Offset X</label>
                            <input type="number" id="swal-input-lblx" class="swal2-input" style="${inputCSS}" value="${currentLblX}">
                        </div>
                        <div style="flex: 1;">
                            <label style="display:block; margin-bottom: 4px; font-weight: 600; color: var(--text-main); font-size: 12px;">Name Offset Y</label>
                            <input type="number" id="swal-input-lbly" class="swal2-input" style="${inputCSS}" value="${currentLblY}">
                        </div>
                    </div>`;

        for (let i = 0; i < data.argsCount; i++) {
            let argDef = data.argNames[i] || { name: `Arg ${i+1}` };
            let desc = argDef.name.toLowerCase();
            let val = currentArgs[i] !== undefined ? currentArgs[i] : "";

            if (val === "" && (desc === 'name' || desc === 'text')) val = el.get('displayedText') || data.name;

            let isSystem = desc.includes('position') || desc.includes('grid') || desc.includes('show');
            if (isSystem) {
                htmlForm += `<input type="hidden" id="swal-input-${i}" value="${val}">`;
                continue;
            }

            let customDefs = data.argDefs ? data.argDefs.filter(d => d.idx === (i + 1)) : [];

            if (customDefs.length > 0) {
                let valParts = customDefs.length > 1 ? val.split(',').map(s => s.trim()) : [val];

                customDefs.forEach((customDef, subIdx) => {
                    let activeVal = valParts[subIdx] !== undefined ? valParts[subIdx] : customDef.defVal;
                    let labelText = customDef.label;
                    let inputId = customDefs.length > 1 ? `swal-input-${i}-sub-${subIdx}` : `swal-input-${i}`;

                    htmlForm += `<div style="margin-bottom: 12px; background: var(--bg-app); border: 1px solid var(--border-light); padding: 10px; border-radius: 6px;">`;
                    htmlForm += `<label style="display:block; margin-bottom: 6px; font-weight: 600; color: var(--text-main); font-size: 11px; letter-spacing: 0.5px; text-transform: uppercase;">${labelText}</label>`;

                    if (customDef.type === 'select') {
                        let options = customDef.options.split(',').map(o => o.trim());
                        htmlForm += `<select id="${inputId}" class="swal2-input" style="${inputCSS}">`;
                        options.forEach(opt => {
                            let selected = (activeVal === opt) ? 'selected' : '';
                            htmlForm += `<option value="${opt}" ${selected}>${opt}</option>`;
                        });
                        htmlForm += `</select>`;
                    } 
                    else if (customDef.type === 'flags') {
                        let allFlags = customDef.options.split(',').map(o => o.trim());
                        let activeFlags = activeVal.split('-').map(o => o.trim());
                        htmlForm += `<div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">`;
                        allFlags.forEach(flag => {
                            let checked = activeFlags.includes(flag) ? 'checked' : '';
                            htmlForm += `<label style="font-size:12px; display:flex; align-items:center; gap:6px; cursor:pointer;"><input type="checkbox" class="${inputId}-flag" value="${flag}" ${checked} onchange="window.updateEditorFlags('${inputId}')" style="margin:0; width:14px; height:14px;"> ${flag}</label>`;
                        });
                        htmlForm += `</div><input type="hidden" id="${inputId}" value="${activeVal}">`;
                    }
                    else if (customDef.type === 'rotflip') {
                        let [r, f] = (activeVal || "0,none").split(',');
                        if (!f) f = "none";
                        htmlForm += `
                            <div style="display: flex; gap: 8px;">
                                <input type="number" id="${inputId}-rot" class="swal2-input" style="${inputCSS}" value="${r}" oninput="window.syncRotFlip('${inputId}', 'rot')">
                                <select id="${inputId}-flip" class="swal2-input" style="${inputCSS}" onchange="window.syncRotFlip('${inputId}', 'flip')">
                                    <option value="none" ${f==='none'?'selected':''}>None</option>
                                    <option value="h" ${f==='h'?'selected':''}>Flip H</option>
                                    <option value="v" ${f==='v'?'selected':''}>Flip V</option>
                                    <option value="hv" ${f==='hv'?'selected':''}>Flip HV</option>
                                </select>
                            </div>
                            <input type="hidden" id="${inputId}" value="${activeVal || '0,none'}">`;
                    }
                    else if (customDef.type === 'rotation') {
                        htmlForm += `<input type="number" id="${inputId}" class="swal2-input rot-input-field" style="${inputCSS}" value="${activeVal || '0'}">`;
                    }
                    else if (customDef.type === 'flip') {
                        let f = activeVal || 'none';
                        htmlForm += `
                            <select id="${inputId}" data-old-val="${f}" class="swal2-input" style="${inputCSS}" onchange="window.syncSeparateFlip('${inputId}', this)">
                                <option value="none" ${f==='none'?'selected':''}>None</option>
                                <option value="h" ${f==='h'?'selected':''}>Flip H</option>
                                <option value="v" ${f==='v'?'selected':''}>Flip V</option>
                                <option value="hv" ${f==='hv'?'selected':''}>Flip HV</option>
                            </select>`;
                    }
                    else { 
                        htmlForm += `<input id="${inputId}" class="swal2-input" style="${inputCSS}" value="${activeVal}">`;
                    }
                    htmlForm += `</div>`;
                });
            } else {
                htmlForm += `<div style="margin-bottom: 12px; background: var(--bg-app); border: 1px solid var(--border-light); padding: 10px; border-radius: 6px;">`;
                htmlForm += `<label style="display:block; margin-bottom: 6px; font-weight: 600; color: var(--text-main); font-size: 11px; letter-spacing: 0.5px; text-transform: uppercase;">${argDef.name}</label>`;
                
                let inputId = `swal-input-${i}`;
                if (argDef.name.includes('/')) {
                    let options = argDef.name.split('/'); 
                    htmlForm += `<select id="${inputId}" class="swal2-input" style="${inputCSS}">`;
                    options.forEach(opt => {
                        let cleanOpt = opt.trim();
                        let selected = (val === cleanOpt || (!val && cleanOpt === options[0].trim())) ? 'selected' : '';
                        htmlForm += `<option value="${cleanOpt}" ${selected}>${cleanOpt}</option>`;
                    });
                    htmlForm += `</select>`;
                } else {
                    htmlForm += `<input id="${inputId}" class="swal2-input" style="${inputCSS}" value="${val}">`;
                }
                htmlForm += `</div>`;
            }
        }
        
        let currentHideLabel = el.get('customHideLabel');
        if (currentHideLabel === undefined) currentHideLabel = data.hideLabel === true;
        
        htmlForm += `<div style="margin-top: 15px; border-top: 1px solid var(--border-main); padding-top: 12px; margin-bottom: 5px;">
                        <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:12px; font-weight:600; color:var(--text-main);">
                            <input type="checkbox" id="swal-input-hidelabel" ${currentHideLabel ? 'checked' : ''} style="width:16px; height:16px; margin:0;">
                            Hide Component Auto-Label
                        </label>
                    </div>`;

        // --- SPICE & LOGIC PARAMETERS ---
        let spiceTemplate = data.spiceTemplate;
        let spiceParams = [];
        let savedSpiceData = el.get('spiceData') || {};

        if (spiceTemplate) {
            let matches = [...spiceTemplate.matchAll(/\{([^}]+)\}/g)];
            let pinIds = (data.pins || []).map(p => p.id); 
            matches.forEach(m => {
                let varName = m[1];
                if (!pinIds.includes(varName) && !spiceParams.includes(varName) && varName !== 'NAME') {
                    spiceParams.push(varName);
                }
            });
        }

        if (spiceParams.length > 0) {
            htmlForm += `<div style="margin-top: 15px; border-top: 2px solid var(--purple); padding-top: 12px; margin-bottom: 5px;">
                            <label style="display:flex; align-items:center; gap:6px; font-size:13px; font-weight:600; color:var(--purple); margin-bottom: 10px;">
                                <i data-lucide="zap" style="width:14px; height:14px;"></i> SPICE Parameters
                            </label>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">`;
            
            spiceParams.forEach(param => {
                let currentVal = savedSpiceData[param] !== undefined ? savedSpiceData[param] : "";
                
                // --- CUSTOM SIGNAL BUILDER FOR SOURCES ---
                if (param === 'SIGNAL') {
                    let sigType = 'DC', dcVal = '0', acVal = '0', sineOffset = '0', sineAmp = '1', sineFreq = '1k', pulseV1 = '0', pulseV2 = '5', pulseTd = '0', pulseTr = '1n', pulseTf = '1n', pulsePw = '50u', pulsePer = '100u';
                    
                    let acMatch = currentVal.match(/AC\s+([^\s]+)/);
                    if (acMatch) acVal = acMatch[1];

                    if (currentVal.startsWith('SINE')) {
                        sigType = 'SINE';
                        let m = currentVal.match(/SINE\((.*?)\)/);
                        if (m) { let p = m[1].split(' '); sineOffset = p[0]||'0'; sineAmp = p[1]||'1'; sineFreq = p[2]||'1k'; }
                    } else if (currentVal.startsWith('PULSE')) {
                        sigType = 'PULSE';
                        let m = currentVal.match(/PULSE\((.*?)\)/);
                        if (m) { let p = m[1].split(' '); pulseV1=p[0]||'0'; pulseV2=p[1]||'5'; pulseTd=p[2]||'0'; pulseTr=p[3]||'1n'; pulseTf=p[4]||'1n'; pulsePw=p[5]||'50u'; pulsePer=p[6]||'100u'; }
                    } else if (currentVal.includes('DC') || currentVal.includes('AC')) {
                        let parts = currentVal.split(' ');
                        for (let i=0; i<parts.length; i++) {
                            if (parts[i] === 'DC') dcVal = parts[i+1] || '0';
                        }
                    } else if (currentVal !== "") {
                        dcVal = currentVal; 
                    }

                    htmlForm += `
                    <div style="grid-column: span 2; background: var(--bg-app); padding: 12px; border: 1px solid var(--border-main); border-radius: 6px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; gap:10px;">
                            <div style="flex:1;">
                                <label style="font-weight: 600; color: var(--text-main); font-size: 11px; margin-bottom: 4px; display: block;">Transient Waveform</label>
                                <select id="sig-type" onchange="window.updateSignalBuilder()" style="${inputCSS}">
                                    <option value="DC" ${sigType==='DC'?'selected':''}>DC (Flat)</option>
                                    <option value="SINE" ${sigType==='SINE'?'selected':''}>SINE Wave</option>
                                    <option value="PULSE" ${sigType==='PULSE'?'selected':''}>PULSE Wave</option>
                                </select>
                            </div>
                            <div style="flex:1;">
                                <label style="font-weight: 600; color: var(--text-main); font-size: 11px; margin-bottom: 4px; display: block;">AC Amplitude (.ac sweep)</label>
                                <input type="text" id="sig-global-ac" value="${acVal}" oninput="window.updateSignalBuilder()" style="${inputCSS}" placeholder="e.g. 1">
                            </div>
                        </div>
                        <hr style="border-top:1px solid var(--border-main); margin: 12px 0;">
                        
                        <div id="sig-dc-fields" style="display:${sigType==='DC'?'block':'none'};">
                            <label style="font-size:11px; font-weight:600; color:var(--text-muted); display: block; margin-bottom: 4px;">DC Level (V/A)</label>
                            <input type="text" id="sig-dc" value="${dcVal}" oninput="window.updateSignalBuilder()" style="${inputCSS}">
                        </div>

                        <div id="sig-sine-fields" style="display:${sigType==='SINE'?'block':'none'};">
                            <div style="display:flex; gap:8px; flex-wrap:wrap;">
                                <div style="flex:1; min-width:30%;"><label style="font-size:11px; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Offset</label><input type="text" id="sig-sin-off" value="${sineOffset}" oninput="window.updateSignalBuilder()" style="${inputCSS}"></div>
                                <div style="flex:1; min-width:30%;"><label style="font-size:11px; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Amplitude</label><input type="text" id="sig-sin-amp" value="${sineAmp}" oninput="window.updateSignalBuilder()" style="${inputCSS}"></div>
                                <div style="flex:1; min-width:30%;"><label style="font-size:11px; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Freq (Hz)</label><input type="text" id="sig-sin-freq" value="${sineFreq}" oninput="window.updateSignalBuilder()" style="${inputCSS}"></div>
                            </div>
                        </div>

                        <div id="sig-pulse-fields" style="display:${sigType==='PULSE'?'block':'none'};">
                            <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:8px;">
                                <div><label style="font-size:11px; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">V1 (Start)</label><input type="text" id="sig-pul-v1" value="${pulseV1}" oninput="window.updateSignalBuilder()" style="${inputCSS}"></div>
                                <div><label style="font-size:11px; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">V2 (Peak)</label><input type="text" id="sig-pul-v2" value="${pulseV2}" oninput="window.updateSignalBuilder()" style="${inputCSS}"></div>
                                <div><label style="font-size:11px; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Delay (Td)</label><input type="text" id="sig-pul-td" value="${pulseTd}" oninput="window.updateSignalBuilder()" style="${inputCSS}"></div>
                                <div><label style="font-size:11px; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Rise (Tr)</label><input type="text" id="sig-pul-tr" value="${pulseTr}" oninput="window.updateSignalBuilder()" style="${inputCSS}"></div>
                                <div><label style="font-size:11px; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Fall (Tf)</label><input type="text" id="sig-pul-tf" value="${pulseTf}" oninput="window.updateSignalBuilder()" style="${inputCSS}"></div>
                                <div><label style="font-size:11px; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Width (Pw)</label><input type="text" id="sig-pul-pw" value="${pulsePw}" oninput="window.updateSignalBuilder()" style="${inputCSS}"></div>
                                <div style="grid-column: span 3;"><label style="font-size:11px; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Period (Per)</label><input type="text" id="sig-pul-per" value="${pulsePer}" oninput="window.updateSignalBuilder()" style="${inputCSS}"></div>
                            </div>
                        </div>
                        
                        <input type="hidden" id="swal-spice-SIGNAL" value="${currentVal}">
                    </div>`;
                    
                } else if (param === 'MODEL') {
                    // --- CUSTOM MODEL DROP-DOWN & WIZARD ---
                    let prefixMatch = spiceTemplate.match(/^([a-zA-Z])_/);
                    let compType = prefixMatch ? prefixMatch[1].toUpperCase() : null;
                    
                    let lib = window.SPICE_MODEL_LIBRARY || {};
                    let availableModels = (compType && lib[compType]) ? lib[compType] : {};

                    let isZener = macro.includes('zener');
                    let isMOS = macro.includes('mos');
                    let isBJT = macro.includes('bipolar');
                    let isDiode = macro.includes('diode') && !isZener;
                    
                    let isWizard = currentVal.startsWith('WIZ_');
                    let isCustom = !availableModels[currentVal] && currentVal !== "" && !isWizard;
                    let selVal = isWizard ? "WIZARD" : (isCustom ? "CUSTOM" : currentVal);

                    let wVz = savedSpiceData['WIZ_VZ'] || '5.1';
                    let wVto = savedSpiceData['WIZ_VTO'] || '1.0';
                    let wKp = savedSpiceData['WIZ_KP'] || '20u';
                    let wBf = savedSpiceData['WIZ_BF'] || '100';
                    let wVj = savedSpiceData['WIZ_VJ'] || '0.7'; 
                    
                    let optionsHtml = `<option value="" ${selVal===''?'selected':''}>Generic / Ideal</option>`;
                    if (isZener || isMOS || isBJT || isDiode) {
                        optionsHtml += `<option value="WIZARD" ${selVal==='WIZARD'?'selected':''}>[ Wizard ] Basic Parameters...</option>`;
                    }
                    for (let m in availableModels) {
                        optionsHtml += `<option value="${m}" ${selVal===m?'selected':''}>${m}</option>`;
                    }
                    optionsHtml += `<option value="CUSTOM" ${selVal==='CUSTOM'?'selected':''}>Other (Custom)</option>`;

                    htmlForm += `
                    <div style="grid-column: span 2;">
                        <label style="display:block; margin-bottom: 4px; font-weight: 600; color: var(--text-main); font-size: 11px;">MODEL</label>
                        <div style="display: flex; gap: 8px;">
                            <select id="sig-model-sel" onchange="window.updateModelSelection('${el.id}')" style="${inputCSS} border-left: 3px solid var(--purple);">
                                ${optionsHtml}
                            </select>
                            <input type="text" id="swal-spice-MODEL" style="${inputCSS} display: ${selVal === 'CUSTOM' ? 'block' : 'none'};" value="${currentVal}" placeholder="Type custom model name...">
                        </div>`;

                    if (isZener || isMOS || isBJT || isDiode) {
                        htmlForm += `<div id="model-wizard-fields" style="display: ${selVal === 'WIZARD' ? 'block' : 'none'}; margin-top: 8px; padding: 12px; background: var(--bg-app); border: 1px dashed var(--purple); border-radius: 4px;">`;
                        
                        if (isZener) {
                            htmlForm += `<div><label style="font-size:11px; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Zener Breakdown (BV) in Volts</label>
                                         <input type="text" id="wiz-vz" value="${wVz}" style="${inputCSS}"></div>`;
                        } else if (isMOS) {
                            htmlForm += `<div style="display:flex; gap:10px;">
                                            <div style="flex:1;"><label style="font-size:11px; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Threshold (VTO)</label><input type="text" id="wiz-vto" value="${wVto}" style="${inputCSS}"></div>
                                            <div style="flex:1;"><label style="font-size:11px; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">k' (KP)</label><input type="text" id="wiz-kp" value="${wKp}" style="${inputCSS}"></div>
                                         </div>
                                         <div style="font-size:11px; color:var(--text-main); margin-top:8px; font-weight:600; display:flex; align-items:center; gap:6px;">
                                            <i data-lucide="info" style="width:14px; height:14px;"></i> Note: Channel Length (L) and Width (W) are set in the boxes below!
                                         </div>`;
                        } else if (isBJT) {
                            htmlForm += `<div><label style="font-size:11px; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Beta (β / BF)</label>
                                         <input type="text" id="wiz-bf" value="${wBf}" style="${inputCSS}"></div>`;
                        } else if (isDiode) {
                            htmlForm += `<div><label style="font-size:11px; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Threshold / Forward Drop (VJ)</label>
                                         <input type="text" id="wiz-vj" value="${wVj}" style="${inputCSS}"></div>`;
                        }
                        htmlForm += `</div>`;
                    }
                    htmlForm += `</div>`;
                } else {
                    htmlForm += `
                    <div>
                        <label style="display:block; margin-bottom: 4px; font-weight: 600; color: var(--text-main); font-size: 11px;">${param}</label>
                        <input type="text" id="swal-spice-${param}" class="swal2-input" style="${inputCSS} border-left: 3px solid var(--purple);" value="${currentVal}">
                    </div>`;
                }
            });
            htmlForm += `</div></div>`;
        }

        let propDefs = data.propDefs || [];
        let savedSimData = el.get('simData') || {};

        if (propDefs.length > 0) {
            htmlForm += `<div style="margin-top: 15px; border-top: 2px solid var(--success); padding-top: 12px; margin-bottom: 5px;">
                            <label style="display:flex; align-items:center; gap:6px; font-size:13px; font-weight:600; color:var(--success); margin-bottom: 10px;">
                                <i data-lucide="clock" style="width:14px; height:14px;"></i> Simulation Properties
                            </label>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">`;
            
            propDefs.forEach(prop => {
                let currentVal = savedSimData[prop.id] !== undefined ? savedSimData[prop.id] : prop.defVal;
                htmlForm += `
                <div>
                    <label style="display:block; margin-bottom: 4px; font-weight: 600; color: var(--text-main); font-size: 11px;">${prop.label}</label>
                    <input type="text" id="swal-simprop-${prop.id}" class="swal2-input" style="${inputCSS} border-left: 3px solid var(--success);" value="${currentVal}">
                </div>`;
            });
            htmlForm += `</div></div>`;
        }

        htmlForm += '</div>'; 

        Swal.fire({
            html: `
                <div id="swal-drag-handle" style="cursor: grab; background: var(--bg-app); padding: 6px; border-radius: 4px; font-size: 12px; color: var(--text-muted); margin-top: 0; margin-bottom: 15px; display: flex; justify-content: center; align-items: center; gap: 8px; border: 1px solid var(--border-main);">
                    <i data-lucide="grip-horizontal" style="width: 16px; height: 16px;"></i> Drag to move
                </div>
                <div style="font-size: 16px; font-weight: 600; user-select: none; margin-bottom: 15px; color: var(--text-main); border-bottom: 1px solid var(--border-main); padding-bottom: 10px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <i data-lucide="sliders-horizontal" style="width: 18px; height: 18px;"></i> Properties: ${data.name}
                </div>
                ${htmlForm}
            `,
            showCancelButton: true,
            confirmButtonText: 'Save',
            cancelButtonText: 'Cancel',
            backdrop: false,
            heightAuto: false,
            didOpen: () => {
                // Initialize the Lucide Icons for the popup
                lucide.createIcons();

                const popup = Swal.getPopup();
                const handle = document.getElementById('swal-drag-handle');
                
                let isDragging = false, startX, startY, initialLeft, initialTop;
                const onMouseMove = (e) => { if(!isDragging) return; popup.style.left=(initialLeft+e.clientX-startX)+'px'; popup.style.top=(initialTop+e.clientY-startY)+'px'; };
                const onMouseUp = () => { isDragging = false; handle.style.cursor = 'grab'; document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp); };
                
                handle.addEventListener('mousedown', (e) => {
                    isDragging=true; handle.style.cursor='grabbing';
                    const rect=popup.getBoundingClientRect(); popup.style.margin='0'; popup.style.position='fixed'; 
                    popup.style.left=rect.left+'px'; popup.style.top=rect.top+'px'; popup.style.transform='none'; 
                    startX=e.clientX; startY=e.clientY; initialLeft=rect.left; initialTop=rect.top;
                    document.addEventListener('mousemove', onMouseMove); document.addEventListener('mouseup', onMouseUp);
                });

                const applyLivePreview = () => {
                    const popup = Swal.getPopup();
                    if (!popup) return;
                    
                    let previewScale = parseFloat(popup.querySelector('#swal-input-scale').value);
                    let previewLblX = parseInt(popup.querySelector('#swal-input-lblx').value) || 0;
                    let previewLblY = parseInt(popup.querySelector('#swal-input-lbly').value) || 0;
                    let previewHideLbl = popup.querySelector('#swal-input-hidelabel').checked;
                    
                    let previewArgs = [];
                    for (let i = 0; i < data.argsCount; i++) {
                        let desc = (data.argNames[i] || { name: '' }).name.toLowerCase();
                        if (desc.includes('position')) {
                            previewArgs.push(""); 
                        } else {
                            let customDefs = data.argDefs ? data.argDefs.filter(d => d.idx === (i + 1)) : [];
                            if (customDefs.length > 1) {
                                let subVals = [];
                                for (let j = 0; j < customDefs.length; j++) {
                                    let subEl = popup.querySelector(`#swal-input-${i}-sub-${j}`);
                                    if (subEl) subVals.push(subEl.value);
                                }
                                previewArgs.push(subVals.join(','));
                            } else {
                                let subEl = popup.querySelector(`#swal-input-${i}`);
                                previewArgs.push(subEl ? subEl.value : "");
                            }
                        }
                    }

                    let geomAngle = el.get('angle') || 0;
                    let geomFlipH = el.get('flipH') || false;
                    let geomFlipV = el.get('flipV') || false;

                    el.set('labelOffsetX', previewLblX);
                    el.set('labelOffsetY', previewLblY);
                    el.set('customHideLabel', previewHideLbl);
                    el.set('customArgs', previewArgs);
                    
                    assembleIcon(el, previewArgs);

                    if (previewScale !== currentScale) {
                        let oldPin = getVisualOrigin(el);
                        applyRobustScale(el, previewScale);
                        currentScale = previewScale; 
                        let newPin = getVisualOrigin(el);
                        let p = el.position();
                        el.position(p.x + (oldPin.x - newPin.x), p.y + (oldPin.y - newPin.y), { snapping: true });
                    }

                    for (let i = 0; i < data.argsCount; i++) {
                        let desc = (data.argNames[i] || { name: '' }).name.toLowerCase();
                        if (desc === 'name' || desc === 'text') {
                            let newName = previewArgs[i] === '$NAME$' ? data.name : previewArgs[i];
                            updateElementLabel(el, newName);
                        }
                    }
                    const view = AppState.paper.findViewByModel(el);
                    if (view) {
                        view.render();
                        if (AppState.selectedElements.includes(el)) view.highlight();
                    }
                };

                popup.addEventListener('input', (e) => { if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') applyLivePreview(); });
                popup.addEventListener('change', (e) => { if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') applyLivePreview(); });
            },
            preConfirm: () => {
                const popup = Swal.getPopup();
                let results = { 
                    args: [], 
                    scale: parseFloat(popup.querySelector('#swal-input-scale').value),
                    lblX: parseInt(popup.querySelector('#swal-input-lblx').value) || 0,
                    lblY: parseInt(popup.querySelector('#swal-input-lbly').value) || 0,
                    hideLbl: popup.querySelector('#swal-input-hidelabel').checked,
                    spiceData: {},
                    simData: {}
                };
                for (let i = 0; i < data.argsCount; i++) {
                    let desc = (data.argNames[i] || { name: '' }).name.toLowerCase();
                    if (desc.includes('position')) {
                        results.args.push(""); 
                    } else {
                        let customDefs = data.argDefs ? data.argDefs.filter(d => d.idx === (i + 1)) : [];
                        if (customDefs.length > 1) {
                            let subVals = [];
                            for (let j = 0; j < customDefs.length; j++) {
                                let subEl = popup.querySelector(`#swal-input-${i}-sub-${j}`);
                                if (subEl) subVals.push(subEl.value);
                            }
                            results.args.push(subVals.join(','));
                        } else {
                            let subEl = popup.querySelector(`#swal-input-${i}`);
                            results.args.push(subEl ? subEl.value : "");
                        }
                    }
                }
                
                if (spiceParams.length > 0) {
                    spiceParams.forEach(param => {
                        let inputEl = popup.querySelector(`#swal-spice-${param}`);
                        if (inputEl) results.spiceData[param] = inputEl.value.trim();
                    });
                }
                
                if (propDefs.length > 0) {
                    propDefs.forEach(prop => {
                        let inputEl = popup.querySelector(`#swal-simprop-${prop.id}`);
                        if (inputEl) results.simData[prop.id] = inputEl.value.trim();
                    });
                }
                return results;
            }
        }).then((result) => {
            if (result.isConfirmed) {
                let newArgs = result.value.args;
                let newScale = result.value.scale;
                
                el.set('labelOffsetX', result.value.lblX);
                el.set('labelOffsetY', result.value.lblY);
                el.set('customHideLabel', result.value.hideLbl);
                el.set('spiceData', result.value.spiceData);
                el.set('simData', result.value.simData);
                el.set('customArgs', newArgs);

                assembleIcon(el, newArgs);

                if (newScale !== currentScale) {
                    let oldPin = getVisualOrigin(el);
                    applyRobustScale(el, newScale);
                    let newPin = getVisualOrigin(el);
                    let p = el.position();
                    el.position(p.x + (oldPin.x - newPin.x), p.y + (oldPin.y - newPin.y), { snapping: true });
                }

                for (let i = 0; i < data.argsCount; i++) {
                    let desc = (data.argNames[i] || { name: '' }).name.toLowerCase();
                    if (desc === 'name' || desc === 'text') {
                        let newName = newArgs[i] === '$NAME$' ? data.name : newArgs[i];
                        updateElementLabel(el, newName);
                    }
                }
                exportLatex(); saveState();
                
            } else if (result.isDismissed) {
                el.set('labelOffsetX', originalState.lblX);
                el.set('labelOffsetY', originalState.lblY);
                el.set('customHideLabel', originalState.hideLbl);
                el.set('spiceData', originalState.spiceData);
                el.set('customArgs', originalState.args);

                assembleIcon(el, originalState.args);

                if (originalState.scale !== currentScale) {
                    let oldPin = getVisualOrigin(el);
                    applyRobustScale(el, originalState.scale);
                    currentScale = originalState.scale; 
                    let newPin = getVisualOrigin(el);
                    let p = el.position();
                    el.position(p.x + (oldPin.x - newPin.x), p.y + (oldPin.y - newPin.y), { snapping: true });
                }

                for (let i = 0; i < data.argsCount; i++) {
                    let desc = (data.argNames[i] || { name: '' }).name.toLowerCase();
                    if (desc === 'name' || desc === 'text') {
                        let fallbackName = originalState.args[i] || data.name;
                        let oldName = fallbackName === '$NAME$' ? data.name : fallbackName;
                        updateElementLabel(el, oldName);
                    }
                }
                const view = AppState.paper.findViewByModel(el);
                if (view) {
                    view.render();
                    if (AppState.selectedElements.includes(el)) view.highlight();
                }
            }
        });
    });
}

function setupGlobalHelpers() {
    window.updateEditorFlags = function(inputId) {
        const popup = Swal.getPopup();
        if (!popup) return;
        let checkboxes = popup.querySelectorAll(`.${inputId}-flag`);
        let selected = [];
        checkboxes.forEach(cb => { if (cb.checked) selected.push(cb.value); });
        let hiddenInput = popup.querySelector(`#${inputId}`);
        if (hiddenInput) {
            hiddenInput.value = selected.join('-');
            hiddenInput.dispatchEvent(new Event('change', { bubbles: true })); 
        }
    };

    window.syncRotFlip = function(inputId, source = 'rot') {
        const popup = Swal.getPopup();
        if (!popup) return;
        let rotInput = popup.querySelector(`#${inputId}-rot`);
        let flipSelect = popup.querySelector(`#${inputId}-flip`);
        let hidden = popup.querySelector(`#${inputId}`);
        if (!rotInput || !flipSelect || !hidden) return;
        
        let r = parseFloat(rotInput.value) || 0;
        let f = flipSelect.value;

        if (source === 'flip') {
            let oldVal = hidden.value || "0,none";
            let oldParts = oldVal.split(',');
            let oldF = oldParts[1] ? oldParts[1].trim() : 'none';

            let oldH = oldF === 'h' || oldF === 'hv' || oldF === 'vh';
            let oldV = oldF === 'v' || oldF === 'hv' || oldF === 'vh';
            let newH = f === 'h' || f === 'hv' || f === 'vh';
            let newV = f === 'v' || f === 'hv' || f === 'vh';

            if (oldH !== newH) r = (360 - r) % 360;
            if (oldV !== newV) r = (360 - r) % 360;
            rotInput.value = r; 
        }
        hidden.value = `${r},${f}`;
        hidden.dispatchEvent(new Event('change', { bubbles: true }));
    };

    window.syncSeparateFlip = function(inputId, selectEl) {
        const popup = Swal.getPopup();
        if (!popup) return;
        let f = selectEl.value;
        let oldF = selectEl.getAttribute('data-old-val') || 'none';

        let oldH = oldF === 'h' || oldF === 'hv' || oldF === 'vh';
        let oldV = oldF === 'v' || oldF === 'hv' || oldF === 'vh';
        let newH = f === 'h' || f === 'hv' || f === 'vh';
        let newV = f === 'v' || f === 'hv' || f === 'vh';

        let rotInput = popup.querySelector('.rot-input-field');
        if (rotInput) {
            let r = parseFloat(rotInput.value) || 0;
            if (oldH !== newH) r = (360 - r) % 360;
            if (oldV !== newV) r = (360 - r) % 360;
            rotInput.value = r; 
            rotInput.dispatchEvent(new Event('input', { bubbles: true })); 
        }
        selectEl.setAttribute('data-old-val', f);
        selectEl.dispatchEvent(new Event('change', { bubbles: true }));
    };
	
	window.updateSignalBuilder = function() {
        let type = document.getElementById('sig-type').value;
        let finalStr = "";
        let globalAc = document.getElementById('sig-global-ac').value;
        let acStr = (globalAc && globalAc !== '0') ? ` AC ${globalAc}` : '';

        document.getElementById('sig-dc-fields').style.display = type === 'DC' ? 'block' : 'none';
        document.getElementById('sig-sine-fields').style.display = type === 'SINE' ? 'block' : 'none';
        document.getElementById('sig-pulse-fields').style.display = type === 'PULSE' ? 'block' : 'none';

        if (type === 'DC') {
            let d = document.getElementById('sig-dc').value; 
            if (d && d !== '0') finalStr += `DC ${d}`;
            finalStr += acStr;
            if (!finalStr && d === '0') finalStr = '0';
        } else if (type === 'SINE') {
            finalStr = `SINE(${document.getElementById('sig-sin-off').value} ${document.getElementById('sig-sin-amp').value} ${document.getElementById('sig-sin-freq').value})` + acStr;
        } else if (type === 'PULSE') {
            finalStr = `PULSE(${document.getElementById('sig-pul-v1').value} ${document.getElementById('sig-pul-v2').value} ${document.getElementById('sig-pul-td').value} ${document.getElementById('sig-pul-tr').value} ${document.getElementById('sig-pul-tf').value} ${document.getElementById('sig-pul-pw').value} ${document.getElementById('sig-pul-per').value})` + acStr;
        }
        document.getElementById('swal-spice-SIGNAL').value = finalStr.trim();
    };

    window.updateModelSelection = function(elId) {
        let sel = document.getElementById('sig-model-sel').value;
        let txt = document.getElementById('swal-spice-MODEL');
        let wizDiv = document.getElementById('model-wizard-fields');
        
        txt.style.display = sel === 'CUSTOM' ? 'block' : 'none';
        if (wizDiv) wizDiv.style.display = sel === 'WIZARD' ? 'block' : 'none';
        
        let lib = window.SPICE_MODEL_LIBRARY || {};
        // Find if it exists in any category
        let isKnown = false;
        for (let cat in lib) { if (lib[cat][txt.value]) isKnown = true; }

        if (sel === 'CUSTOM') {
            if (isKnown || txt.value.startsWith('WIZ_')) txt.value = ""; 
        } else if (sel === 'WIZARD') {
            txt.value = "WIZ_" + (elId || "123").replace(/-/g, '').substring(0, 6);
        } else {
            txt.value = sel;
        }
    };
}