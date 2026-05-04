// js/ui/properties.js
import { AppState, THEME_COLORS } from '../state.js';
import { saveState } from './actions.js';
import { exportLatex } from '../parsers/latex.js';
import { getVisualOrigin, applyRobustScale, updateElementLabel, assembleIcon, updateGhostDotsVisibility } from './canvas.js';

// --- 📚 STANDARD SPICE MODEL LIBRARY (CATEGORIZED) ---
window.SPICE_MODEL_LIBRARY = {
    "D": { // Diodes
        "1N4148": ".model 1N4148 D (IS=4.352n RS=0.6458 N=1.906 TT=3.48n CJO=2.595p VJ=0.6385 M=0.262 EG=1.11 XTI=3.0 BV=110 IBV=0.0001)",
        "1N4004": ".model 1N4004 D (IS=18.8n RS=0 N=2 BV=400 IBV=5.00u CJO=30p VJ=0.333 M=0.333 TT=2.88u)"
    },
    "Q": { // Bipolar Transistors (NPN / PNP)
        "2N3904": ".model 2N3904 NPN (IS=1E-14 VAF=100 BF=300 IKF=0.4 XTB=1.5 BR=4 CJC=4E-12 CJE=8E-12 RB=20 RC=0.1 RE=0.1 TR=250E-9 TF=350E-12 ITF=1 VTF=2 XTF=3 VJC=0.75 VJE=0.75)",
        "2N3906": ".model 2N3906 PNP (IS=1E-14 VAF=100 BF=200 IKF=0.4 XTB=1.5 BR=4 CJC=4.5E-12 CJE=10E-12 RB=20 RC=0.1 RE=0.1 TR=250E-9 TF=350E-12 ITF=1 VTF=2 XTF=3 VJC=0.75 VJE=0.75)"
    },
    "M": { // MOSFETs
        "2N7002": ".model 2N7002 VDMOS (Rg=120 Vto=1.6 Rd=1.5 Rs=0.5 Rb=0.1 Kp=0.17 mtri=1.2 Cgdmax=20p Cgdmin=2p Cgs=25p Cjo=25p Is=10p m=0.3 VJ=0.75)",
        "BSS84": ".model BSS84 VDMOS (pchan Rg=120 Vto=-1.6 Rd=1.5 Rs=0.5 Rb=0.1 Kp=0.17 mtri=1.2 Cgdmax=20p Cgdmin=2p Cgs=25p Cjo=25p Is=10p m=0.3 VJ=0.75)"
    },
    "X": { // Subcircuits (Op-Amps, ICs, Logic Macros)
        "OPAMP_IDEAL": ".subckt OPAMP_IDEAL in_p in_n out\nE1 out 0 in_p in_n 1Meg\n.ends",
        "LM741_MACRO": ".subckt LM741_MACRO in_p in_n out\n* Simplified 3-pin LM741 Macro\nRin in_p in_n 2Meg\nE1 out 0 in_p in_n 200k\nRout out 0 75\n.ends",
        
        // --- Mixed-Signal Digital Macros ---
        "INV_MACRO": ".subckt INV_MACRO in out\nB1 int_node 0 V=(V(in)<2.5)*5\nR1 int_node out 1k\nC1 out 0 10p\n.ends",
        
        "AND2_MACRO": ".subckt AND2_MACRO in1 in2 out i1=0 i2=0\n* Evaluates standard and inverted inputs via absolute value math\nB1 int_node 0 V=(abs({i1} - (V(in1)>2.5)) * abs({i2} - (V(in2)>2.5))) * 5\nR1 int_node out 1k\nC1 out 0 12p\n.ends",
        
        "OR2_MACRO": ".subckt OR2_MACRO in1 in2 out i1=0 i2=0\nB1 int_node 0 V=((abs({i1} - (V(in1)>2.5)) + abs({i2} - (V(in2)>2.5))) > 0) * 5\nR1 int_node out 1k\nC1 out 0 12p\n.ends"
    }
};

// --- NATIVE GEOMETRY PARSER ---
export function parseGeomArgs(data, argsArray) {
    let angle = 0;
    let flipH = false;
    let flipV = false;
    let explicitAngle = null;

    for (let i = 0; i < data.argsCount; i++) {
        let argDef = data.argNames && data.argNames[i] ? data.argNames[i] : { name: '' };
        let desc = argDef.name.toLowerCase();
        let customDef = data.argDefs ? data.argDefs.find(d => d.idx === i + 1) : null;
        let typeMatch = customDef ? customDef.type : '';
        let val = (argsArray[i] || '').toString().toLowerCase().trim();

        if (!val) continue;

        // 1. Strict capture for Horizontal/Vertical dropdowns
        if (desc.includes('horizontal') && desc.includes('vertical')) {
            // THE FIX: Split the string in case multiple dropdowns share this argument index
            let valParts = val.split(',').map(s => s.trim());
            
            if (valParts.includes('vertical')) explicitAngle = 270;
            else if (valParts.includes('horizontal')) explicitAngle = 0;
        }

        // 2. Standard TikZ rotation/flip parsing
        if (typeMatch === 'rotflip' || (!customDef && desc.includes('rotation') && desc.includes('flip'))) {
            let parts = val.split(',');
            let tikzRot = parseFloat(parts[0]) || 0;
            angle = (360 - tikzRot) % 360;
            let f = parts[1] ? parts[1].trim() : '';
            if (f === 'h' || f === 'hv' || f === 'vh') flipH = true;
            if (f === 'v' || f === 'hv' || f === 'vh') flipV = true;
        } else if (typeMatch === 'rotation' || (!customDef && (desc.includes('rotation') || desc.includes('angle')))) {
            let tikzRot = parseFloat(val) || 0;
            angle = (360 - tikzRot) % 360;
        } else if (typeMatch === 'flip' || (!customDef && desc.includes('flip'))) {
            if (val === 'h' || val === 'hv' || val === 'vh') flipH = true;
            if (val === 'v' || val === 'hv' || val === 'vh') flipV = true;
        }
    }

    // Explicit orientation ALWAYS wins over the numeric rotation field
    if (explicitAngle !== null) {
        angle = explicitAngle;
    }

    return { angle, flipH, flipV };
}

export function initializeProperties() {
    setupGlobalHelpers();

    AppState.paper.on('cell:pointerdblclick', function(cellView) {
        try {
            let el = cellView.model;
            if (el.isLink()) return;

            if (el.get('latexMacro') === 'connectordot') {
                el.set('isGhost', !el.get('isGhost')); 
                updateGhostDotsVisibility();           
                exportLatex();                         
                saveState();
                return; 
            }

            let macro = el.get('latexMacro');
            let data = JL_DATABASE[macro];
            
            // --- ADDED: Catch missing library definitions safely ---
            if (!data) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Component Not in Library',
                        html: `The definition for <b>${macro}</b> is missing from your current palette.<br><br>Please drag and drop its <code>.json</code> file onto the canvas to load it into the library. Then you can edit its properties or descend into it!`
                    });
                }
                return;
            }
            // -------------------------------------------------------

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

            // --- THE WHITE BOX DESCEND BUTTON ---
            if (data.isCustomSubcircuit) {
                htmlForm += `
                    <div style="margin-bottom: 15px;">
                        <button type="button" id="btn-swal-descend" style="width: 100%; background: var(--primary); color: white; border: none; border-radius: 4px; padding: 10px; font-size: 14px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.2); transition: 0.2s;">
                            <i data-lucide="zoom-in" style="width: 18px; height: 18px;"></i> Edit Internal Schematic
                        </button>
                    </div>
                `;
            }

            let currentScale = el.get('customScale') || 1;
            let currentLblX = el.get('labelOffsetX') || 0;
            let currentLblY = el.get('labelOffsetY') || 0;

            // BULLETPROOF: Safely parse scales even if it was saved as a string!
            let allowedScales = data.scales || [0.5, 1, 2, 4];
            if (typeof allowedScales === 'string') {
                allowedScales = allowedScales.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
            }
            let scaleOptionsHtml = allowedScales.map(val => `<option value="${val}" ${currentScale === val ? 'selected' : ''}>${val}x</option>`).join('\n');

            const inputCSS = "width: 100%; height: 32px; font-size: 13px; margin: 0; padding: 0 8px; box-sizing: border-box; border: 1px solid var(--border-main); border-radius: 4px; background: var(--bg-panel); color: var(--text-main); outline: none;";

            htmlForm += `<div style="margin-bottom: 12px; border-bottom: 1px solid var(--border-main); padding-bottom: 10px;">
                            <label style="display:block; margin-bottom: 4px; font-weight: 600; color: var(--text-main); font-size: 12px;">Scale factor</label>
                            <select id="swal-input-scale" class="swal2-input" style="${inputCSS}">${scaleOptionsHtml}</select>
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

            let argsCount = data.argsCount || 0;
            for (let i = 0; i < argsCount; i++) {
                // BULLETPROOF: Safely extract the argument name whether it's a string or an object!
                let rawArg = (data.argNames && data.argNames[i]) ? data.argNames[i] : null;
                let safeName = rawArg ? (typeof rawArg === 'string' ? rawArg : (rawArg.name || `Arg ${i+1}`)) : `Arg ${i+1}`;
                let desc = safeName.toLowerCase();
                let val = currentArgs[i] !== undefined ? currentArgs[i] : "";

                if (val === "" && (desc === 'name' || desc === 'text')) val = el.get('displayedText') || data.name || "M1";

                let isSystem = desc.includes('position') || desc.includes('grid') || desc.includes('show');
                if (isSystem) {
                    htmlForm += `<input type="hidden" id="swal-input-${i}" value="${val}">`;
                    continue;
                }

                let customDefs = data.argDefs ? data.argDefs.filter(d => d.idx === (i + 1)) : [];

                if (customDefs.length > 0) {
                    // Safe string cast before splitting
                    let safeValStr = String(val);
                    let valParts = customDefs.length > 1 ? safeValStr.split(',').map(s => s.trim()) : [safeValStr];
                    
                    customDefs.forEach((customDef, subIdx) => {
                        let activeVal = valParts[subIdx] !== undefined && valParts[subIdx] !== "" ? valParts[subIdx] : customDef.defVal;
                        let labelText = customDef.label;
                        let inputId = customDefs.length > 1 ? `swal-input-${i}-sub-${subIdx}` : `swal-input-${i}`;

                        htmlForm += `<div style="margin-bottom: 12px; background: var(--bg-app); border: 1px solid var(--border-light); padding: 10px; border-radius: 6px;">`;
                        htmlForm += `<label style="display:block; margin-bottom: 6px; font-weight: 600; color: var(--text-main); font-size: 11px; text-transform: uppercase;">${labelText}</label>`;

                        if (customDef.type === 'select') {
                            let options = customDef.options.split(',').map(o => o.trim());
                            htmlForm += `<select id="${inputId}" class="swal2-input" style="${inputCSS}">`;
                            options.forEach(opt => htmlForm += `<option value="${opt}" ${activeVal === opt ? 'selected' : ''}>${opt}</option>`);
                            htmlForm += `</select>`;
                        } 
                        else if (customDef.type === 'rotflip') {
                            let safeActiveVal = String(activeVal || "0,none");
                            let [r, f] = safeActiveVal.split(',');
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
                                <input type="hidden" id="${inputId}" value="${safeActiveVal}">`;
                        }						
						else if (customDef.type === 'rotation') {
							htmlForm += `<input type="number" id="${inputId}" class="swal2-input rot-input-field" style="${inputCSS}" value="${activeVal || '0'}">`;
						}
						else if (customDef.type === 'flip') {
							let f = activeVal || 'none';
							htmlForm += `
								<select id="${inputId}" data-old-val="${f}" class="swal2-input" style="${inputCSS}" onchange="syncSeparateFlip('${inputId}', this)">
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
                    htmlForm += `<label style="display:block; margin-bottom: 6px; font-weight: 600; color: var(--text-main); font-size: 11px; text-transform: uppercase;">${safeName}</label>`;
                    htmlForm += `<input id="swal-input-${i}" class="swal2-input" style="${inputCSS}" value="${val}"></div>`;
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
                    if (!pinIds.includes(varName) && !spiceParams.includes(varName) && varName !== 'NAME' && !varName.startsWith('RES')) {
                        spiceParams.push(varName);
                    }
                });
            }

            let propDefs = data.propDefs || [];
            let savedSimData = el.get('simData') || {};
            let spicePropDefs = propDefs.filter(p => p.type === 'SPICE');
            let simPropDefs = propDefs.filter(p => p.type === 'SIM' || !p.type);

            if (spiceParams.length > 0 || spicePropDefs.length > 0) {
                htmlForm += `<div style="margin-top: 15px; border-top: 2px solid var(--primary); padding-top: 12px; margin-bottom: 5px;">
                                <label style="display:flex; align-items:center; gap:6px; font-size:13px; font-weight:600; color:var(--primary); margin-bottom: 10px;">
                                    <i data-lucide="zap" style="width:14px; height:14px;"></i> SPICE Parameters
                                </label>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">`;
                
                spiceParams.forEach(param => {
                    let currentVal = savedSpiceData[param] !== undefined ? savedSpiceData[param] : "";
                    
                    // --- RESTORED: CUSTOM SIGNAL BUILDER FOR SOURCES ---
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
                            for (let i=0; i<parts.length; i++) { if (parts[i] === 'DC') dcVal = parts[i+1] || '0'; }
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
                        
                    } 
                    // --- RESTORED: CUSTOM MODEL DROP-DOWN & WIZARD ---
                    else if (param === 'MODEL') {
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
                                <select id="sig-model-sel" onchange="window.updateModelSelection('${el.id}')" style="${inputCSS} border-left: 3px solid var(--primary);">
                                    ${optionsHtml}
                                </select>
                                <input type="text" id="swal-spice-MODEL" style="${inputCSS} display: ${selVal === 'CUSTOM' ? 'block' : 'none'};" value="${currentVal}" placeholder="Type custom model name...">
                            </div>`;

                        if (isZener || isMOS || isBJT || isDiode) {
                            htmlForm += `<div id="model-wizard-fields" style="display: ${selVal === 'WIZARD' ? 'block' : 'none'}; margin-top: 8px; padding: 12px; background: var(--bg-app); border: 1px dashed var(--primary); border-radius: 4px;">`;
                            
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
                    } 
                    // STANDARD TEXTBOX
                    else {
                        htmlForm += `<div>
                            <label style="display:block; margin-bottom: 4px; font-weight: 600; color: var(--text-main); font-size: 11px;">${param}</label>
                            <input type="text" id="swal-spice-${param}" style="${inputCSS} border-left: 3px solid var(--primary);" value="${currentVal}">
                        </div>`;
                    }
                });
                
                spicePropDefs.forEach(prop => {
                    let currentVal = savedSimData[prop.id] !== undefined ? savedSimData[prop.id] : prop.defVal;
                    htmlForm += `<div>
                        <label style="display:block; margin-bottom: 4px; font-weight: 600; color: var(--text-main); font-size: 11px;">${prop.label}</label>
                        <input type="text" id="swal-simprop-${prop.id}" style="${inputCSS} border-left: 3px solid var(--primary);" value="${currentVal}">
                    </div>`;
                });
                htmlForm += `</div></div>`;
            }

            if (simPropDefs.length > 0) {
                htmlForm += `<div style="margin-top: 15px; border-top: 2px solid var(--success); padding-top: 12px; margin-bottom: 5px;">
                                <label style="display:flex; align-items:center; gap:6px; font-size:13px; font-weight:600; color:var(--success); margin-bottom: 10px;">
                                    <i data-lucide="clock" style="width:14px; height:14px;"></i> Digital Timing Analysis Simulation Properties
                                </label>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">`;
                simPropDefs.forEach(prop => {
                    let currentVal = savedSimData[prop.id] !== undefined ? savedSimData[prop.id] : prop.defVal;
                    htmlForm += `<div>
                        <label style="display:block; margin-bottom: 4px; font-weight: 600; color: var(--text-main); font-size: 11px;">${prop.label}</label>
                        <input type="text" id="swal-simprop-${prop.id}" style="${inputCSS} border-left: 3px solid var(--success);" value="${currentVal}">
                    </div>`;
                });
                htmlForm += `</div></div>`;
            }

            htmlForm += '</div>'; 

            Swal.fire({
                html: `
					<!-- CLEAN DRAG HANDLE -->
					<div id="swal-drag-handle-props" style="cursor: move; background: var(--bg-toolbar); padding: 12px 15px; margin: -1em -1em 15px -1em; display: flex; justify-content: space-between; align-items: center; user-select: none; border-bottom: 1px solid var(--border-main); border-radius: 4px 4px 0 0;">
						<span style="font-size: 14px; font-weight: bold; color: #ffffff; display: flex; align-items: center; gap: 8px;">
							<i data-lucide="settings" style="width: 16px; height: 16px; color: var(--primary);"></i> Edit ${data.displayName || macro}
						</span>
					</div>
					
					${htmlForm}
				`,
                showCancelButton: true,
                confirmButtonText: 'Save',
                cancelButtonText: 'Cancel',
                backdrop: false,
                heightAuto: false,
				didOpen: () => {
                    if (typeof lucide !== 'undefined') lucide.createIcons();
                    
                    const popup = Swal.getPopup();
                    
                    // 1. The Descend Button
                    let descendBtn = document.getElementById('btn-swal-descend');
                    if (descendBtn) {
                        descendBtn.onclick = () => {
                            Swal.close();
                            if (window.descendIntoSubcircuit) window.descendIntoSubcircuit(el);
                        };
                    }

                    // 2. The NEW Stealth Drag Logic
                    const handle = document.getElementById('swal-drag-handle-props');
                    let isDragging = false, startX, startY, initialLeft, initialTop;
                    
                    const onMouseMove = (e) => { 
                        if (!isDragging) return; 
                        popup.style.left = (initialLeft + (e.clientX - startX)) + 'px'; 
                        popup.style.top = (initialTop + (e.clientY - startY)) + 'px'; 
                    };
                    
                    const onMouseUp = () => { 
                        isDragging = false; 
                        document.removeEventListener('mousemove', onMouseMove); 
                        document.removeEventListener('mouseup', onMouseUp); 
                    };
                    
                    if (handle) {
                        handle.addEventListener('mousedown', (e) => {
                            // Don't drag if they clicked a button inside the header
                            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return; 
                            isDragging = true; 
                            
                            const rect = popup.getBoundingClientRect(); 
                            popup.style.margin = '0'; 
                            popup.style.position = 'fixed'; 
                            popup.style.left = rect.left + 'px'; 
                            popup.style.top = rect.top + 'px'; 
                            
                            startX = e.clientX; 
                            startY = e.clientY; 
                            initialLeft = rect.left; 
                            initialTop = rect.top;
                            
                            document.addEventListener('mousemove', onMouseMove); 
                            document.addEventListener('mouseup', onMouseUp);
                        });
                    }

                    // 3. RESTORED: The Live Preview Logic
                    // This listens to every input/select in the modal and updates the canvas instantly
                    const updatePreview = () => {
                        let newArgs = [];
                        for (let i = 0; i < argsCount; i++) {
                            let desc = ((data.argNames && data.argNames[i]) ? (typeof data.argNames[i] === 'string' ? data.argNames[i] : (data.argNames[i].name || '')) : '').toLowerCase();
                            if (desc.includes('position')) {
                                newArgs.push(""); 
                            } else {
                                let customDefs = data.argDefs ? data.argDefs.filter(d => d.idx === (i + 1)) : [];
                                if (customDefs.length > 1) {
                                    let subVals = [];
                                    for (let j = 0; j < customDefs.length; j++) {
                                        let subEl = popup.querySelector(`#swal-input-${i}-sub-${j}`);
                                        if (subEl) subVals.push(subEl.value);
                                    }
                                    newArgs.push(subVals.join(','));
                                } else {
                                    let subEl = popup.querySelector(`#swal-input-${i}`);
                                    newArgs.push(subEl ? subEl.value : "");
                                }
                            }
                        }

                        // Apply the new geometric args (rotation, flip, etc.)
                        let geom = parseGeomArgs(data, newArgs);
                        el.set('angle', geom.angle);
                        el.set('flipH', geom.flipH);
                        el.set('flipV', geom.flipV);
                        
                        // Reassemble the icon geometry
                        assembleIcon(el, newArgs);

                        // Update the text labels
                        for (let i = 0; i < argsCount; i++) {
                            let desc = ((data.argNames && data.argNames[i]) ? (typeof data.argNames[i] === 'string' ? data.argNames[i] : (data.argNames[i].name || '')) : '').toLowerCase();
                            if (desc === 'name' || desc === 'text') {
                                let newName = newArgs[i] === '$NAME$' ? data.name : newArgs[i];
                                updateElementLabel(el, newName);
                            }
                        }
						// Re-highlight the view because changing the model forces a re-render
                        let view = AppState.paper.findViewByModel(el);
                        if (view) view.highlight();
                    };

                    // Bind the preview function to all inputs
                    let inputs = popup.querySelectorAll('input, select');
                    inputs.forEach(input => {
                        input.addEventListener('input', updatePreview);
                        input.addEventListener('change', updatePreview);
                    });
                },
                preConfirm: () => {
                    const popup = Swal.getPopup();
                    let results = { args: [], scale: parseFloat(popup.querySelector('#swal-input-scale').value), lblX: parseInt(popup.querySelector('#swal-input-lblx').value) || 0, lblY: parseInt(popup.querySelector('#swal-input-lbly').value) || 0, hideLbl: popup.querySelector('#swal-input-hidelabel').checked, spiceData: {}, simData: {} };
                    for (let i = 0; i < argsCount; i++) {
                        let desc = ((data.argNames && data.argNames[i]) ? (typeof data.argNames[i] === 'string' ? data.argNames[i] : (data.argNames[i].name || '')) : '').toLowerCase();
                        if (desc.includes('position')) results.args.push(""); 
                        else {
                            let customDefs = data.argDefs ? data.argDefs.filter(d => d.idx === (i + 1)) : [];
                            if (customDefs.length > 1) {
                                let subVals = [];
                                for (let j = 0; j < customDefs.length; j++) { let subEl = popup.querySelector(`#swal-input-${i}-sub-${j}`); if (subEl) subVals.push(subEl.value); }
                                results.args.push(subVals.join(','));
                            } else {
                                let subEl = popup.querySelector(`#swal-input-${i}`);
                                results.args.push(subEl ? subEl.value : "");
                            }
                        }
                    }
                    if (spiceParams.length > 0) {
                        spiceParams.forEach(p => { 
                            let i = popup.querySelector(`#swal-spice-${p}`); 
                            if (i) results.spiceData[p] = i.value.trim(); 
                        });
                        
                        // NEW: Capture the Wizard specific fields!
                        if (results.spiceData['MODEL'] && results.spiceData['MODEL'].startsWith('WIZ_')) {
                            let wVz = popup.querySelector('#wiz-vz'); if (wVz) results.spiceData['WIZ_VZ'] = wVz.value.trim();
                            let wVto = popup.querySelector('#wiz-vto'); if (wVto) results.spiceData['WIZ_VTO'] = wVto.value.trim();
                            let wKp = popup.querySelector('#wiz-kp'); if (wKp) results.spiceData['WIZ_KP'] = wKp.value.trim();
                            let wBf = popup.querySelector('#wiz-bf'); if (wBf) results.spiceData['WIZ_BF'] = wBf.value.trim();
                            let wVj = popup.querySelector('#wiz-vj'); if (wVj) results.spiceData['WIZ_VJ'] = wVj.value.trim();
                        }
                    }
                    if (propDefs.length > 0) propDefs.forEach(p => { let i = popup.querySelector(`#swal-simprop-${p.id}`); if (i) results.simData[p.id] = i.value.trim(); });
                    return results;
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    el.set('labelOffsetX', result.value.lblX);
                    el.set('labelOffsetY', result.value.lblY);
                    el.set('customHideLabel', result.value.hideLbl);
                    el.set('spiceData', result.value.spiceData);
                    el.set('simData', result.value.simData);
                    el.set('customArgs', result.value.args);
                    
                    let geom = parseGeomArgs(data, result.value.args);
                    el.set('angle', geom.angle); el.set('flipH', geom.flipH); el.set('flipV', geom.flipV);
                    assembleIcon(el, result.value.args);
                    if (result.value.scale !== currentScale) applyRobustScale(el, result.value.scale);
                    
                    for (let i = 0; i < argsCount; i++) {
                        let desc = ((data.argNames && data.argNames[i]) ? (typeof data.argNames[i] === 'string' ? data.argNames[i] : (data.argNames[i].name || '')) : '').toLowerCase();
                        if (desc === 'name' || desc === 'text') {
                            let newName = result.value.args[i] === '$NAME$' ? data.name : result.value.args[i];
                            updateElementLabel(el, newName);
                        }
                    }
                    exportLatex(); saveState();
                }
				else if (result.isDismissed) {
                    // Revert the main properties
                    el.set('labelOffsetX', originalState.lblX);
                    el.set('labelOffsetY', originalState.lblY);
                    el.set('customHideLabel', originalState.hideLbl);
                    el.set('spiceData', originalState.spiceData);
                    el.set('simData', originalState.simData);
                    el.set('customArgs', originalState.args);
                    el.set('angle', originalState.angle); 
                    el.set('flipH', originalState.flipH); 
                    el.set('flipV', originalState.flipV);
                    
                    // Rebuild the SVG with the old arguments
                    assembleIcon(el, originalState.args);
                    if (originalState.scale !== currentScale) {
                        applyRobustScale(el, originalState.scale);
                    }
                    
                    // Restore original labels
                    for (let i = 0; i < argsCount; i++) {
                        let desc = ((data.argNames && data.argNames[i]) ? (typeof data.argNames[i] === 'string' ? data.argNames[i] : (data.argNames[i].name || '')) : '').toLowerCase();
                        if (desc === 'name' || desc === 'text') {
                            let oldName = originalState.args[i] === '$NAME$' ? data.name : originalState.args[i];
                            updateElementLabel(el, oldName);
                        }
                    }                 
                }
				// Restore the blue bounding box once more
                    let view = AppState.paper.findViewByModel(el);
                    if (view) view.highlight();
            });
        } catch (error) {
            console.error("Properties Error:", error);
            Swal.fire('Error', `Failed to open properties:<br><b style="color:#e74c3c; font-size:12px;">${error.message}</b>`, 'error');
        }
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