// js/parsers/io.js
import { downloadLatex } from './latex.js';
import { downloadSpiceNetlist } from '../engines/spice.js';
import { AppState, THEME_COLORS } from '../state.js';
import { exportLatex } from './latex.js';
import { getVisualOrigin, applyRobustScale, assembleIcon, updateElementLabel, applyTheme, updateGhostDotsVisibility, updateNetNamesVisibility } from '../ui/canvas.js';
import { extractStaticTexts } from './helpers.js';
import { saveState, clearSelection, zoomFit } from '../ui/actions.js';
import { clearSimAnnotations } from '../engines/spice.js';
import { forceExportLatex } from './latex.js';
import { populateSidebar } from '../ui/sidebar.js'; 

export async function saveFileAs(content, defaultFilename, mimeType, description) {
    if (window.showSaveFilePicker) {
        try {
            const handle = await window.showSaveFilePicker({
                suggestedName: defaultFilename,
                types: [{ description: description, accept: { [mimeType]: [defaultFilename.substring(defaultFilename.lastIndexOf('.'))] } }],
            });
            const writable = await handle.createWritable();
            await writable.write(content);
            await writable.close();
        } catch (err) {
            if (err.name !== 'AbortError') console.error('Save failed:', err);
        }
    } else {
        const blob = new Blob([content], { type: mimeType });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = defaultFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
    }
}

// --- PROJECT FILE EXPORT (.json) ---
export function saveProjectToFile() { 
    // =========================================================================
    // FIX: PREVENT SAVING WHILE DESCENDED
    // =========================================================================
    if (AppState.hierarchyStack && AppState.hierarchyStack.length > 0) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'warning',
                title: 'Cannot Save Project Here',
                html: 'You are currently editing inside a subcircuit!<br><br>Please click <b>Save & Return</b> (or Cancel) to ascend to the Main Schematic before saving your project file.'
            });
        }
        return;
    }
    // =========================================================================

    const latexOutput = document.getElementById('latex-output');
    const currentLatex = latexOutput ? latexOutput.innerText : "";
    
    // Save the LaTeX and Simulation Config into the graph metadata
    AppState.graph.set('customLatex', currentLatex);
    AppState.graph.set('spiceSimConfig', AppState.spiceSimConfig || window.spiceSimConfig); 
    
    // Convert the entire JointJS graph to a JSON string
    const jsonString = JSON.stringify(AppState.graph.toJSON());
    
    // Trigger the actual download
    saveFileAs(jsonString, 'circuit.json', 'application/json', 'JointJS Diagram');
    
    // Clear the autosave since we just did a hard save!
    localStorage.removeItem('jlcad_autosave');
}

export function importProject(e) { 
    const inputElement = e.target || e;
    const files = inputElement.files; 
    if(!files || files.length === 0) return; 
    
    // Read all files asynchronously
    let readPromises = Array.from(files).map(file => {
        return new Promise((resolve) => {
            const r = new FileReader();
            r.onload = ev => resolve({ name: file.name, content: ev.target.result.trim() });
            r.readAsText(file);
        });
    });

    Promise.all(readPromises).then(results => {
        let subcircuitsImported = 0;
        let masterSchematicData = null;
        let isVirtuoso = false;
        let isLatex = false;

        // 1. Process all files
        results.forEach(fileData => {
            let fileContent = fileData.content;
            let isJSON = fileContent.startsWith('{'); 

            try {
                if (!isJSON && fileContent.includes('\\begin{tikzpictureJL}')) {
                    masterSchematicData = fileContent;
                    isLatex = true;
                } else if (isJSON) {
                    let parsedData = JSON.parse(fileContent);
                    
                    // Route Subcircuits directly to the Database (Silently!)
                    if (parsedData.type === "subcircuit") {
                        importSubcircuitToDatabase(parsedData, true);
                        subcircuitsImported++;
                    } 
                    // Route Virtuoso Maps
                    else if (parsedData.instances && parsedData.wires) {
                        masterSchematicData = parsedData;
                        isVirtuoso = true;
                    } 
                    // Route Native JL Schematics
                    else if (Array.isArray(parsedData.cells)) {
                        masterSchematicData = parsedData;
                    }
                }
            } catch (err) {
                console.error(`Import Error on ${fileData.name}:`, err);
            }
        });

        // 2. Refresh the UI once if any subcircuits were bulk loaded
        if (subcircuitsImported > 0) {
            populateSidebar();
            if (!masterSchematicData) {
                Swal.fire({ toast: true, position: 'bottom-end', icon: 'success', title: `${subcircuitsImported} Component(s) added to Palette!`, showConfirmButton: false, timer: 3000 });
            }
        }

        // 3. Load the Master Schematic (if one was included in the selection)
        if (masterSchematicData) {
            
            // =========================================================================
            // FIX: RESET HIERARCHY STATE ON NEW PROJECT LOAD
            // =========================================================================
            if (AppState.hierarchyStack) {
                AppState.hierarchyStack = [];
            }
            let hBar = document.getElementById('hierarchy-bar');
            if (hBar) hBar.style.display = 'none';
            // =========================================================================

            if (isLatex) {
                executeLatexConversion(masterSchematicData);
            } else if (isVirtuoso) {
                // (Your existing Virtuoso logic goes here...)
                const uniqueCells = new Set();
                let vMap = window.VIRTUOSO_MAP || (typeof VIRTUOSO_MAP !== 'undefined' ? VIRTUOSO_MAP : {});
                masterSchematicData.instances.forEach(inst => { if (vMap[inst.cell] || true) uniqueCells.add(inst.cell); });
                let checkboxesHtml = '<div style="font-size: 13px; color: var(--text-main); margin-bottom: 12px;">Select which components should display their parameter values on the canvas:</div><div style="display:flex; flex-direction:column; gap:10px; text-align:left; background:var(--bg-app); border: 1px solid var(--border-light); padding:15px; border-radius:6px; max-height:250px; overflow-y:auto;"><label style="font-size:12px; display:flex; align-items:center; gap:8px; cursor:not-allowed; font-weight:600; color:var(--text-muted);"><input type="checkbox" id="v-opt-pins" checked disabled style="margin:0; width:14px; height:14px;">I/O Pins (Always Show Names)</label><hr style="margin:2px 0; border:none; border-top:1px solid var(--border-main);">';
                uniqueCells.forEach(cell => {
                    if (!['ipin', 'opin', 'iopin'].includes(cell)) checkboxesHtml += `<label style="font-size:12px; display:flex; align-items:center; gap:8px; cursor:pointer; color:var(--text-main);"><input type="checkbox" class="v-val-toggle" value="${cell}" checked style="margin:0; width:14px; height:14px;">Display values for <b style="font-weight:600;">${cell}</b></label>`;
                });
                checkboxesHtml += '</div>';

                Swal.fire({
                    title: '<div style="font-size: 18px;">Virtuoso Schematic Detected!</div>', html: checkboxesHtml, showCancelButton: true, confirmButtonText: 'Import to Canvas', confirmButtonColor: 'var(--primary)', background: 'var(--bg-panel)', color: 'var(--text-main)'
                }).then((result) => {
                    if (result.isConfirmed) {
                        const allowedCells = new Set(['ipin', 'opin', 'iopin']);
                        document.querySelectorAll('.v-val-toggle').forEach(cb => { if (cb.checked) allowedCells.add(cb.value); });
                        if (typeof executeVirtuosoConversion === 'function') executeVirtuosoConversion(masterSchematicData, allowedCells);
                        else if (window.executeVirtuosoConversion) window.executeVirtuosoConversion(masterSchematicData, allowedCells);
                    }
                });
            } else {
                // Native JointJS
                // Phantom Dot Cleanup
                masterSchematicData.cells = masterSchematicData.cells.filter(cell => {
                    if (cell.type === 'standard.Link' && cell.source && cell.target) {
                        if (cell.source.x === cell.target.x && cell.source.y === cell.target.y && (!cell.vertices || cell.vertices.length === 0)) return false; 
                    }
                    return true; 
                });

                // =========================================================================
                // NEW: MISSING COMPONENT SCANNER
                // =========================================================================
                let missingDependencies = new Set();
                
                if (masterSchematicData && masterSchematicData.cells) {
                    masterSchematicData.cells.forEach(cell => {
                        if (cell.type !== 'standard.Link' && cell.latexMacro) {
                            // Ignore standard structural macros
                            if (!['connectordot', 'freetext', 'groundterminal', 'ioport', 'ioportdot'].includes(cell.latexMacro)) {
                                if (!JL_DATABASE[cell.latexMacro]) {
                                    missingDependencies.add(cell.latexMacro);
                                }
                            }
                        }
                    });
                }

                if (missingDependencies.size > 0) {
                    let missingListHtml = `<ul style="text-align: left; font-family: var(--font-code); font-size: 13px; color: var(--danger); margin-top: 10px;">`;
                    missingDependencies.forEach(dep => {
                        missingListHtml += `<li>${dep}.json</li>`;
                    });
                    missingListHtml += `</ul>`;

                    if (typeof Swal !== 'undefined') {
                        Swal.fire({
                            icon: 'warning',
                            title: 'Missing Custom Libraries',
                            html: `This schematic uses custom subcircuits that are not currently loaded in your palette.<br>
                                   <br>Please drag and drop the following files onto the canvas to view and edit them:<br>
                                   ${missingListHtml}`
                        });
                    }
                }
                // =========================================================================

                AppState.graph.fromJSON(masterSchematicData); 
                if (window.syncVisibilityFromUI) window.syncVisibilityFromUI();
                let loadedConfig = AppState.graph.get('spiceSimConfig');
                if (loadedConfig) { window.spiceSimConfig = { ...window.spiceSimConfig, ...loadedConfig }; AppState.spiceSimConfig = window.spiceSimConfig; }
                if (window.finalizeCanvasAndMath) setTimeout(() => window.finalizeCanvasAndMath('Project loaded successfully!'), 50);
                setTimeout(() => { forceExportLatex(); }, 50);
            }
        }
    });

    if (inputElement) inputElement.value = '';
}

// THE MISSING LINK: Smart LaTeX Argument Parser
function parseLatexArgs(argsStr) {
    let args = [], currentArg = '', depth = 0, inArg = false;
    for (let i = 0; i < argsStr.length; i++) {
        let char = argsStr[i];
        if (char === '{' || char === '[') {
            if (depth === 0) { inArg = true; currentArg = ''; } 
            else { currentArg += char; }
            depth++;
        } else if (char === '}' || char === ']') {
            depth--;
            if (depth === 0) { args.push(currentArg); inArg = false; } 
            else { currentArg += char; }
        } else {
            if (inArg) currentArg += char;
        }
    }
    return args;
}

function executeLatexConversion(latexStr) {
    let jointjs_cells = [];
    const GRID_SIZE = 40;
    const ORIGIN_X = 2000;
    const ORIGIN_Y = 2000;
    const PPU_MULT = AppState.PPU_MULT;
    
    let themeSelector = document.getElementById('theme-selector');
    const theme = THEME_COLORS[themeSelector ? themeSelector.value : 'standard'] || THEME_COLORS.standard;

    const lines = latexStr.split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0 && !l.startsWith('%') && !l.startsWith('\\begin') && !l.startsWith('\\end') && !l.startsWith('\\settikz'));

    let wire_counter = 0;
    let comp_counter = 0;

    lines.forEach(line => {
        if (line.startsWith('\\draw')) {
            const pointsRegex = /\(([-0-9.]+),\s*([-0-9.]+)\)/g;
            let match;
            const points = [];
            
            while ((match = pointsRegex.exec(line)) !== null) {
                points.push({
                    x: ORIGIN_X + (parseFloat(match[1]) * GRID_SIZE),
                    y: ORIGIN_Y - (parseFloat(match[2]) * GRID_SIZE)
                });
            }

            for (let i = 0; i < points.length - 1; i++) {
                jointjs_cells.push({
                    type: "standard.Link",
                    id: `wire-lx-${wire_counter++}`,
                    source: { x: points[i].x, y: points[i].y },
                    target: { x: points[i+1].x, y: points[i+1].y },
                    attrs: {
                        line: { stroke: "var(--text-main)", strokeWidth: 1.8, targetMarker: null, sourceMarker: null, "vector-effect": "non-scaling-stroke" }
                    }
                });
            }
        } 
        else if (line.startsWith('\\')) {
            const macroRegex = /^\\([a-zA-Z0-9_]+)\{\(([-0-9.]+),\s*([-0-9.]+)\)\}(.*)/;
            const match = line.match(macroRegex);
            
            if (match) {
                const macroName = match[1];
                const baseX = ORIGIN_X + (parseFloat(match[2]) * GRID_SIZE);
                const baseY = ORIGIN_Y - (parseFloat(match[3]) * GRID_SIZE);
                const restOfLine = match[4];

                let extractedArgs = parseLatexArgs(restOfLine);
                const parsedArgs = ["", ...extractedArgs];

                const dbData = JL_DATABASE[macroName];
                
                if (macroName === 'connectordot') {
                    jointjs_cells.push({
                        type: "jl.ConnectorDot",
                        id: `dot-lx-${comp_counter++}`,
                        position: { x: baseX - 20, y: baseY - 20 },
                        latexMacro: "connectordot",
                        offsetX: -20, offsetY: -20
                    });
                    return; 
                }

                if (!dbData) {
                    console.warn(`Unrecognized LaTeX macro: ${macroName}`);
                    return;
                }

                let angle = 0, flipH = false, flipV = false;
                let isVertical = false;
                let explicitOrientAngle = null; // <--- NEW: Track explicit orientation

                for (let i = 0; i < (dbData.argsCount || 7); i++) {
                    let desc = (dbData.argNames && dbData.argNames[i] ? dbData.argNames[i].name.toLowerCase() : '');
                    let val = parsedArgs[i+1] || "";

                    // Track legacy raw string
                    if (typeof val === 'string' && val.includes('vertical')) isVertical = true;

                    // NEW: Strict capture of horizontal/vertical dropdown args
                    if (desc.includes('horizontal') && desc.includes('vertical')) {
                        let orientVal = val.toLowerCase().trim();
                        if (orientVal === 'vertical') explicitOrientAngle = 270;
                        else if (orientVal === 'horizontal') explicitOrientAngle = 0;
                    }

                    if (desc.includes('rotation') && desc.includes('flip')) {
                        let parts = val.split(',');
                        let tikzRot = parseFloat(parts[0]) || 0;
                        angle = (360 - tikzRot) % 360;
                        if (parts.length > 1) {
                            let fStr = parts[1].trim();
                            if (fStr === 'hv' || fStr === 'vh') { flipH = true; flipV = true; }
                            else if (fStr === 'h') flipH = true;
                            else if (fStr === 'v') flipV = true;
                        }
                    } 
                    else if (desc.includes('rotation') || desc.includes('angle')) {
                        let tikzRot = parseFloat(val) || 0;
                        angle = (360 - tikzRot) % 360;
                    }
                    else if (desc.includes('flip')) {
                        let fStr = val.trim();
                        if (fStr === 'hv' || fStr === 'vh') { flipH = true; flipV = true; }
                        else if (fStr === 'h') flipH = true;
                        else if (fStr === 'v') flipV = true;
                    }
                }

                // Apply explicit orientation (overrides standard rotation)
                if (explicitOrientAngle !== null) {
                    angle = explicitOrientAngle;
                } else if (isVertical && angle === 0) {
                    angle = 270; 
                }

                if (isVertical && angle === 0) angle = 270; 

                let display_text = parsedArgs[1] || "";
                
                // --- NEW: Process Dynamic Shapes exactly like Drop ---
                let generatedDynamic = null;
                let rawIconPath = dbData.icon || dbData.iconBase || '';
                
                if (dbData.shapeGenerator) {
                    try {
                        const buildShape = new Function('args', dbData.shapeGenerator);
                        generatedDynamic = buildShape(parsedArgs);
                        rawIconPath = generatedDynamic.pathStr;
                        if (generatedDynamic.pins) {
                            generatedDynamic.pins.forEach(p => { p.x *= PPU_MULT; p.y *= PPU_MULT; });
                        }
                    } catch(e) { console.error("Shape Gen Error on Import:", e); }
                }

                let extractedInit = extractStaticTexts(rawIconPath);
                let iconPath = extractedInit.cleanPath;

                let bbox = { x: 0, y: 0, width: 0, height: 0 };
                if (iconPath) {
                    const tempSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                    const tempPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    tempPath.setAttribute('d', iconPath);
                    tempSvg.appendChild(tempPath);
                    Object.assign(tempSvg.style, { position: 'absolute', top: '-9999px', opacity: 0.01, pointerEvents: 'none' });
                    document.body.appendChild(tempSvg);
                    try { bbox = tempPath.getBBox(); } catch(e){}
                    document.body.removeChild(tempSvg);
                }

                const sourcePins = (generatedDynamic && generatedDynamic.pins) ? generatedDynamic.pins : (dbData.pins || []);
                const uniquePins = [];
                const seenIds = new Set();
                sourcePins.forEach(p => {
                    let isDynamicText = p.id && p.id.includes('$'); 
                    if (isDynamicText || !seenIds.has(p.id)) { 
                        if (!isDynamicText) seenIds.add(p.id); 
                        uniquePins.push({ ...p });
                    }
                });

                const xs = uniquePins.map(p => p.x), ys = uniquePins.map(p => p.y);
                const minPinX = xs.length ? Math.min(...xs) : 0; const maxPinX = xs.length ? Math.max(...xs) : 0;
                const minPinY = ys.length ? Math.min(...ys) : 0; const maxPinY = ys.length ? Math.max(...ys) : 0;

                let hasBounds = bbox.width > 0 || bbox.height > 0;
                const absMinX = hasBounds ? Math.min(minPinX, bbox.x * PPU_MULT) : minPinX;
                const absMaxX = hasBounds ? Math.max(maxPinX, (bbox.x + bbox.width) * PPU_MULT) : maxPinX;
                const absMinY = hasBounds ? Math.min(minPinY, bbox.y * PPU_MULT) : minPinY;
                const absMaxY = hasBounds ? Math.max(maxPinY, (bbox.y + bbox.height) * PPU_MULT) : maxPinY;
                    
                const pad = 10; 
                const boxOriginX = Math.floor((absMinX - pad) / 40) * 40;
                const boxOriginY = Math.floor((absMinY - pad) / 40) * 40;
                const boxMaxX = Math.ceil((absMaxX + pad) / 40) * 40;
                const boxMaxY = Math.ceil((absMaxY + pad) / 40) * 40;

                const boxWidth = Math.max(boxMaxX - boxOriginX, 40);
                const boxHeight = Math.max(boxMaxY - boxOriginY, 40);
                const shiftX = -boxOriginX;
                const shiftY = -boxOriginY;

                const realPins = [];
                const dynamicLabels = [];
                uniquePins.forEach(p => {
                    if ((p.label || p.id).includes('$')) dynamicLabels.push(p);
                    else realPins.push(p);
                });

                const portsJson = {
                    groups: { 'absolute': { position: { name: 'absolute' } } },
                    items: realPins.map(p => ({
                        id: p.id, group: 'absolute',
                        args: { x: p.x + shiftX, y: p.y + shiftY },
                        condition: p.condition,
                        markup: [ { tagName: 'rect', selector: 'portBody' }, { tagName: 'title', selector: 'portTitle' }, { tagName: 'text', selector: 'portLabel' } ],
                        attrs: { 
                            portBody: { width: 8 * PPU_MULT, height: 8 * PPU_MULT, x: -4 * PPU_MULT, y: -4 * PPU_MULT, fill: theme.portBody, display: 'block' },
                            portTitle: { text: p.label || p.id },
                            portLabel: { text: p.label || '', display: 'block', fontSize: 9 * PPU_MULT, fill: theme.portLabel, fontWeight: 'bold', fontFamily: 'var(--font-code)', x: 6 * PPU_MULT, y: -6 * PPU_MULT, textAnchor: 'start' }
                        }
                    }))
                };

                let basePorts = {};
                portsJson.items.forEach(p => { basePorts[p.id] = { x: p.args.x - shiftX, y: p.args.y - shiftY }; });

                jointjs_cells.push({
                    type: "jl.Component",
                    id: `cell-lx-${comp_counter++}`,
                    position: { x: baseX - shiftX, y: baseY - shiftY },
                    size: { width: boxWidth, height: boxHeight },
                    ports: portsJson,
                    latexMacro: macroName,
                    customArgs: parsedArgs,
                    angle: 0,             
                    flipH: false,
                    flipV: false,
                    intendedAngle: angle, 
                    intendedFlipH: flipH,
                    intendedFlipV: flipV,
                    displayedText: display_text,
                    customScale: 1.0,
                    offsetX: boxOriginX, offsetY: boxOriginY, shiftX: shiftX, shiftY: shiftY,
                    baseWidth: boxWidth, baseHeight: boxHeight, baseOffsetX: boxOriginX, baseOffsetY: boxOriginY, baseShiftX: shiftX, baseShiftY: shiftY,
                    basePorts: basePorts, baseVisualTop: absMinY - boxOriginY, baseVisualBottom: absMaxY - boxOriginY, baseVisualLeft: absMinX - boxOriginX, baseVisualRight: absMaxX - boxOriginX,
                    dynamicLabels: dynamicLabels
                });
            }
        }
    });

    AppState.graph.fromJSON({ cells: jointjs_cells });
    setTimeout(() => { finalizeCanvasAndMath('LaTeX code imported successfully!'); }, 50);
}

// Virtuoso map and execution remains the same, assuming it was working correctly
const VIRTUOSO_SCALE_FACTOR = 640;
const VIRTUOSO_MAP = {
    "nch_lvt": { macro: "mostransistorcds", args: ["", "$NAME$", "n", "dot", "{ROT}", "", ""], intrinsicAngle: 0, scale: 1.0, offset: {x:120, y:0} },
    "pch_lvt": { macro: "mostransistorcds", args: ["", "$NAME$", "p", "dot", "{ROT}", "", ""], intrinsicAngle: 0, scale: 1.0, offset: {x:120, y:0} },
    "gnd":     { macro: "groundterminal", args: ["", "$NAME$", "{ROT}", "", ""], intrinsicAngle: 0, scale: 1.0, offset: {x:0, y:0} },
    "vdd":     { macro: "supplyterminal", args: ["", "$NAME$", "{ROT}", "", ""], intrinsicAngle: 0, scale: 1.0, offset: {x:0, y:0} },
    "res":     { macro: "resistorcds", args: ["", "$NAME$", "none", "fixed", "{ROT}", "", ""], intrinsicAngle: 90, scale: 1.0, offset: {x:-120, y:120} },
    "cap":     { macro: "capacitorcds", args: ["", "$NAME$", "none", "none", "{ROT}", "", ""], intrinsicAngle: 90, scale: 1.0, offset: {x:-80, y:120} },
    "ind":     { macro: "inductorcds", args: ["", "$NAME$", "none", "fixed", "{ROT}", "", ""], intrinsicAngle: 90, scale: 1.0, offset: {x:-120, y:120} },
    "isource": { macro: "currentsource", args: ["", "$NAME$", "none", "standard", "{ROT}", "", ""], intrinsicAngle: 90, scale: 1.0, offset: {x:0, y:120} },
    "ipin":    { macro: "ioport", args: ["", "$NAME$", "input", "{ROT}", "", ""], intrinsicAngle: 0, scale: 1.0, offset: {x:-40, y:0} },
    "opin":    { macro: "ioport", args: ["", "$NAME$", "output", "{ROT}", "", ""], intrinsicAngle: 0, scale: 1.0, offset: {x:40, y:0} },
    "iopin":   { macro: "ioport", args: ["", "$NAME$", "input", "{ROT}", "", ""], intrinsicAngle: 0, scale: 1.0, offset: {x:0, y:0} }
};

function parseVirtuosoOrient(orientStr, intrinsicAngle) {
    let angle = 0, flipH = false, flipV = false;
    if (orientStr === "R90") angle = 90;
    else if (orientStr === "R180") angle = 180;
    else if (orientStr === "R270") angle = 270;
    else if (orientStr === "MX") flipV = true;
    else if (orientStr === "MY") flipH = true;
    else if (orientStr === "MXR90") { flipV = true; angle = 90; }
    else if (orientStr === "MYR90") { flipH = true; angle = 90; }
    
    angle = (angle + intrinsicAngle) % 360;
    
    let flipStr = "none";
    if (flipH && flipV) flipStr = "hv";
    else if (flipH) flipStr = "h";
    else if (flipV) flipStr = "v";
    
    return { angle, flipH, flipV, rotFlipArg: `${angle},${flipStr}` };
}

function convertVirtuosoCoords(x, y) {
    return { x: Math.round(x * VIRTUOSO_SCALE_FACTOR) + 2000, y: Math.round(-y * VIRTUOSO_SCALE_FACTOR) + 2000 };
}

function executeVirtuosoConversion(rawData, allowedValueCells) {
			let jointjs_cells = [];
			let bulk_pins = new Set();
			const PPU_MULT = 4;
			const theme = THEME_COLORS[document.getElementById('theme-selector').value] || THEME_COLORS.standard;

			// 1. PROCESS INSTANCES
			rawData.instances.forEach(inst => {
				const cell_type = inst.cell;
				if (!VIRTUOSO_MAP[cell_type]) return;

				const mapping = VIRTUOSO_MAP[cell_type];
				const dbData = JL_DATABASE[mapping.macro];
				if (!dbData) return;

				const basePos = convertVirtuosoCoords(inst.x, inst.y);
				const orient = parseVirtuosoOrient(inst.orient, mapping.intrinsicAngle);
				
				const final_x = basePos.x + mapping.offset.x;
				const final_y = basePos.y + mapping.offset.y;

				// Display Value Logic
				let val = (inst.value || "").trim();
				let display_text = inst.name;

				if (val && allowedValueCells.has(cell_type)) {
					if (['ipin', 'opin', 'iopin'].includes(cell_type)) display_text = val; 
					else if (['nch_lvt', 'pch_lvt'].includes(cell_type)) display_text = `${inst.name} (${val})`;
					else display_text = `${inst.name}=${val}`;
				}

				const custom_args = mapping.args.map(v => v.replace("{ROT}", orient.rotFlipArg).replace("$NAME$", display_text));

				// --- NATIVE CAD GEOMETRY & PIN ENGINE ---
				let rawIconPath = dbData.icon || dbData.iconBase || '';
				let extractedInit = extractStaticTexts(rawIconPath);
				let iconPath = extractedInit.cleanPath;

				// Measure true Bounding Box
				let bbox = { x: 0, y: 0, width: 0, height: 0 };
				if (iconPath) {
					const tempSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
					const tempPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
					tempPath.setAttribute('d', iconPath);
					tempSvg.appendChild(tempPath);
					Object.assign(tempSvg.style, { position: 'absolute', top: '-9999px', opacity: 0.01, pointerEvents: 'none' });
					document.body.appendChild(tempSvg);
					try { bbox = tempPath.getBBox(); } catch(e){}
					document.body.removeChild(tempSvg);
				}

				// Separate dynamic labels from physical pins
				const sourcePins = dbData.pins || [];
				const uniquePins = [];
				const seenIds = new Set();
				sourcePins.forEach(p => {
					let isDynamicText = p.id && p.id.includes('$'); 
					if (isDynamicText || !seenIds.has(p.id)) { 
						if (!isDynamicText) seenIds.add(p.id); 
						uniquePins.push({ ...p });
					}
				});

				// Calculate Box padding and mathematical offsets (shiftX / shiftY)
				const xs = uniquePins.map(p => p.x), ys = uniquePins.map(p => p.y);
				const minPinX = xs.length ? Math.min(...xs) : 0; const maxPinX = xs.length ? Math.max(...xs) : 0;
				const minPinY = ys.length ? Math.min(...ys) : 0; const maxPinY = ys.length ? Math.max(...ys) : 0;

				let hasBounds = bbox.width > 0 || bbox.height > 0;
				const absMinX = hasBounds ? Math.min(minPinX, bbox.x * PPU_MULT) : minPinX;
				const absMaxX = hasBounds ? Math.max(maxPinX, (bbox.x + bbox.width) * PPU_MULT) : maxPinX;
				const absMinY = hasBounds ? Math.min(minPinY, bbox.y * PPU_MULT) : minPinY;
				const absMaxY = hasBounds ? Math.max(maxPinY, (bbox.y + bbox.height) * PPU_MULT) : maxPinY;
					
				const pad = 10; 
				const boxOriginX = Math.floor((absMinX - pad) / 40) * 40;
				const boxOriginY = Math.floor((absMinY - pad) / 40) * 40;
				const boxMaxX = Math.ceil((absMaxX + pad) / 40) * 40;
				const boxMaxY = Math.ceil((absMaxY + pad) / 40) * 40;

				const boxWidth = Math.max(boxMaxX - boxOriginX, 40);
				const boxHeight = Math.max(boxMaxY - boxOriginY, 40);

				const shiftX = -boxOriginX;
				const shiftY = -boxOriginY;

				const realPins = [];
				const dynamicLabels = [];
				uniquePins.forEach(p => {
					if ((p.label || p.id).includes('$')) dynamicLabels.push(p);
					else realPins.push(p);
				});

				// Build the JointJS Ports Object!
				const portsJson = {
					groups: { 'absolute': { position: { name: 'absolute' } } },
					items: realPins.map(p => ({
						id: p.id, group: 'absolute',
						args: { x: p.x + shiftX, y: p.y + shiftY },
						condition: p.condition,
						markup: [
							{ tagName: 'rect', selector: 'portBody' },
							{ tagName: 'title', selector: 'portTitle' }, 
							{ tagName: 'text', selector: 'portLabel' }   
						],
						attrs: { 
							portBody: { width: 8 * PPU_MULT, height: 8 * PPU_MULT, x: -4 * PPU_MULT, y: -4 * PPU_MULT, fill: theme.portBody, display: 'block' },
							portTitle: { text: p.label || p.id },
							portLabel: { text: p.label || '', display: 'block', fontSize: 9 * PPU_MULT, fill: theme.portLabel, fontWeight: 'bold', fontFamily: 'monospace', x: 6 * PPU_MULT, y: -6 * PPU_MULT, textAnchor: 'start' }
						}
					}))
				};

				let basePorts = {};
				portsJson.items.forEach(p => { basePorts[p.id] = { x: p.args.x - shiftX, y: p.args.y - shiftY }; });
				// --- END NATIVE GEOMETRY ENGINE ---

				// Inject everything into the component object
                jointjs_cells.push({
                    type: "jl.Component",
                    id: `cell-${inst.name}`,
                    position: { x: final_x - shiftX, y: final_y - shiftY }, // Offset so the 0,0 anchors properly
                    size: { width: boxWidth, height: boxHeight },
                    ports: portsJson,
                    latexMacro: mapping.macro,
                    customArgs: custom_args,
                    angle: 0,                    // <--- FORCE 0 FOR PERFECT ANCHOR
                    flipH: false,
                    flipV: false,
                    intendedAngle: orient.angle, // <--- SAVE INTENDED GEOMETRY
                    intendedFlipH: orient.flipH,
                    intendedFlipV: orient.flipV,
                    displayedText: display_text,
					customScale: mapping.scale,
					offsetX: boxOriginX,
					offsetY: boxOriginY,
					shiftX: shiftX,
					shiftY: shiftY,
					baseWidth: boxWidth,
					baseHeight: boxHeight,
					baseOffsetX: boxOriginX,
					baseOffsetY: boxOriginY,
					baseShiftX: shiftX,
					baseShiftY: shiftY,
					basePorts: basePorts,
					baseVisualTop: absMinY - boxOriginY,
					baseVisualBottom: absMaxY - boxOriginY,
					baseVisualLeft: absMinX - boxOriginX,
					baseVisualRight: absMaxX - boxOriginX,
					dynamicLabels: dynamicLabels
				});

				// Bulk Pin Logic
				if (['nch_lvt', 'pch_lvt'].includes(cell_type)) {
					let bx = 0.25, by = 0.0;
					if (inst.orient === "R90") { bx = 0.0; by = 0.25; }
					else if (inst.orient === "R180") { bx = -0.25; by = 0.0; }
					else if (inst.orient === "R270") { bx = 0.0; by = -0.25; }
					else if (inst.orient === "MX") { bx = 0.25; by = 0.0; }
					else if (inst.orient === "MY") { bx = -0.25; by = 0.0; }
					
					let bPos = convertVirtuosoCoords(inst.x + bx, inst.y + by);
					bulk_pins.add(`${bPos.x},${bPos.y}`);
				}
			});

			// 2. PRUNE BULK WIRES
			let adj = {};
			let wire_segments = [];
			
			rawData.wires.forEach((w, i) => {
				if (w.length !== 2) return;
				let p1 = convertVirtuosoCoords(w[0][0], w[0][1]);
				let p2 = convertVirtuosoCoords(w[1][0], w[1][1]);
				let p1Str = `${p1.x},${p1.y}`;
				let p2Str = `${p2.x},${p2.y}`;
				
				wire_segments.push({p1, p2, p1Str, p2Str});
				if (!adj[p1Str]) adj[p1Str] = [];
				if (!adj[p2Str]) adj[p2Str] = [];
				adj[p1Str].push(i);
				adj[p2Str].push(i);
			});

			let to_remove = new Set();
			bulk_pins.forEach(bpStr => {
				if (!adj[bpStr]) return;
				let queue = [bpStr];
				let visited = new Set([bpStr]);
				
				while (queue.length > 0) {
					let curr = queue.shift();
					let active_segs = adj[curr].filter(i => !to_remove.has(i));
					
					active_segs.forEach(seg_idx => {
						to_remove.add(seg_idx);
						let seg = wire_segments[seg_idx];
						let other = (seg.p1Str === curr) ? seg.p2Str : seg.p1Str;
						
						if (adj[other].length < 3 && !visited.has(other)) {
							visited.add(other);
							queue.push(other);
						}
					});
				}
			});

			// 3. GENERATE WIRES AND DOTS
			let point_counts = {};
			let wire_counter = 0;

			wire_segments.forEach((seg, i) => {
				if (to_remove.has(i)) return;
				
				point_counts[seg.p1Str] = (point_counts[seg.p1Str] || 0) + 1;
				point_counts[seg.p2Str] = (point_counts[seg.p2Str] || 0) + 1;

				jointjs_cells.push({
					type: "standard.Link",
					id: `wire-${wire_counter++}`,
					source: { x: seg.p1.x, y: seg.p1.y },
					target: { x: seg.p2.x, y: seg.p2.y },
					attrs: {
						line: { stroke: "#333333", strokeWidth: 1.8, targetMarker: null, sourceMarker: null, "vector-effect": "non-scaling-stroke" }
					}
				});
			});

			for (let ptStr in point_counts) {
				if (point_counts[ptStr] >= 3) {
					let [x, y] = ptStr.split(',').map(Number);
					jointjs_cells.push({
						type: "jl.ConnectorDot",
						id: `dot-${x}-${y}`,
						position: { x: x - 20, y: y - 20 },
						latexMacro: "connectordot",
						offsetX: -20, offsetY: -20
					});
				}
			}

			// 4. LOAD INTO CANVAS
			AppState.graph.fromJSON({ cells: jointjs_cells });
			
			// 5. ASSEMBLE ICONS AND ROTATE
            AppState.graph.getElements().forEach(el => {
                if (el.get('type') === 'jl.Component') {
                    // 1. Draw the actual SVG shapes based on the database
                    assembleIcon(el, el.get('customArgs') || []);
                    
                    // 2. Apply the intended Virtuoso rotation safely
                    let intendedAngle = el.get('intendedAngle');
                    if (intendedAngle) {
                        el.set('angle', intendedAngle);
                    }
                    
                    // 3. Apply intended flips
                    if (el.get('intendedFlipH')) el.set('flipH', true);
                    if (el.get('intendedFlipV')) el.set('flipV', true);

                    // 4. THE FIX: Force the label to render on the canvas!
                    let labelText = el.get('displayedText');
                    if (labelText) {
                        updateElementLabel(el, labelText);
                    }
                }
            });
			
			// Trigger the UI updates and math engine
			if (window.syncVisibilityFromUI) window.syncVisibilityFromUI();
			
			if (window.finalizeCanvasAndMath) {
				setTimeout(() => window.finalizeCanvasAndMath('Virtuoso Schematic imported!'), 50);
			}
	}

// Master UI Cleanup Function for all import paths
export function finalizeCanvasAndMath(successMessage) {
    let themeSelector = document.getElementById('theme-selector');
    if (themeSelector) applyTheme(themeSelector.value);

    AppState.graph.getElements().forEach(el => {
        if (el.get('latexMacro') && el.get('latexMacro') !== 'connectordot') {
            let intendedAngle = el.get('intendedAngle');
            if (intendedAngle !== undefined) {
                let oldPin = getVisualOrigin(el);
                el.rotate(intendedAngle, true);
                el.set('flipH', el.get('intendedFlipH'));
                el.set('flipV', el.get('intendedFlipV'));
                applyRobustScale(el, el.get('customScale') || 1);
                let newPin = getVisualOrigin(el);
                let p = el.position();
                el.position(p.x + (oldPin.x - newPin.x), p.y + (oldPin.y - newPin.y), { snapping: true });
                el.unset('intendedAngle'); el.unset('intendedFlipH'); el.unset('intendedFlipV');
            } else {
                assembleIcon(el, el.get('customArgs') || []);
                updateElementLabel(el, el.get('displayedText'));
            }
        }
    });

    AppState.graph.getElements().forEach(el => {
        let view = AppState.paper.findViewByModel(el);
        if (view) view.render();
    });

    AppState.graph.getLinks().forEach(link => {
        link.toBack();
        link.attr('line/strokeWidth', 1.8);
        link.attr('line/vector-effect', 'non-scaling-stroke');
        link.attr('line/targetMarker', null);
        link.attr('line/sourceMarker', null);
    });

    zoomFit(); 
    clearSelection();
    exportLatex(); 
    saveState(); 

    // Update floating overlays immediately
    if (typeof updateGhostDotsVisibility === 'function') updateGhostDotsVisibility();
    if (typeof updateNetNamesVisibility === 'function') updateNetNamesVisibility();

    if (successMessage) Swal.fire({ title: 'Success', text: successMessage, icon: 'success', timer: 2000, showConfirmButton: false });

    const renderMath = () => {
        if (typeof renderMathInElement !== 'undefined') {
            renderMathInElement(document.body, {
                delimiters: [
                    {left: '$$', right: '$$', display: true},
                    {left: '$', right: '$', display: false}, 
                    {left: '\\(', right: '\\)', display: false},
                    {left: '\\[', right: '\\]', display: true}
                ],
                throwOnError: false 
            });
        }
    };

    requestAnimationFrame(() => {
        renderMath();
        setTimeout(renderMath, 100);
        setTimeout(renderMath, 500);
    });
}

// --- EXPORT DIALOG (USING HTML TEMPLATE) ---
export function openExportDialog() {
    // 1. Fetch the template from index.html
    const template = document.getElementById('tpl-export-dialog');
    
    if (!template) {
        Swal.fire('Error', 'Export template (#tpl-export-dialog) not found in index.html!', 'error');
        return;
    }

    Swal.fire({
        title: '<span style="font-size: 20px;">Export</span>',
        html: template.innerHTML, // Grab the HTML directly from your template!
        showCancelButton: true,
        confirmButtonText: 'Export',
        cancelButtonText: 'Cancel',
        confirmButtonColor: 'var(--primary)',
        didOpen: () => {
            const formatSelect = document.getElementById('export-format');
            const svgOptions = document.getElementById('svg-options-container');
            
            if (formatSelect && svgOptions) {
                formatSelect.addEventListener('change', (e) => {
                    if (e.target.value === 'svg') svgOptions.style.display = 'block';
                    else svgOptions.style.display = 'none';
                });
            }

            const slider = document.getElementById('exp-weight-scale');
            const valDisplay = document.getElementById('weight-val');
            const previewStrokes = document.querySelectorAll('.preview-stroke');

            if (slider && valDisplay) {
                slider.addEventListener('input', (e) => {
                    const scale = parseFloat(e.target.value);
                    valDisplay.innerText = Math.round(scale * 100) + '%';
                    
                    previewStrokes.forEach(path => {
                        const baseW = parseFloat(path.getAttribute('data-base-width'));
                        if (baseW) path.setAttribute('stroke-width', baseW * scale);
                    });
                });
            }
        },
        preConfirm: () => {
            // Safely fetch all values from the DOM
            return {
                format: document.getElementById('export-format') ? document.getElementById('export-format').value : 'svg',
                grid: document.getElementById('exp-grid') ? document.getElementById('exp-grid').checked : false,
                pins: document.getElementById('exp-pins') ? document.getElementById('exp-pins').checked : false,
                pinnames: document.getElementById('exp-pinnames') ? document.getElementById('exp-pinnames').checked : false,
                compnames: document.getElementById('exp-compnames') ? document.getElementById('exp-compnames').checked : false,
                freetext: document.getElementById('exp-freetext') ? document.getElementById('exp-freetext').checked : false,
                mono: document.getElementById('exp-mono') ? document.getElementById('exp-mono').checked : false,
                weightScale: document.getElementById('exp-weight-scale') ? parseFloat(document.getElementById('exp-weight-scale').value) : 1.0
            };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            if (result.value.format === 'svg') {
                downloadAdvancedSVG(result.value);
            } else if (result.value.format === 'tikz') {
                downloadLatex(false);
            } else if (result.value.format === 'standalone') {
                downloadLatex(true);
            } else if (result.value.format === 'spice') {
                downloadSpiceNetlist(); 
            }
        }
    });
}

// --- ADVANCED SVG EXPORT (WITH FILTERS) ---
function downloadAdvancedSVG(options) {
    const bbox = AppState.paper.getContentBBox({ useModelGeometry: true }); 
    if (!bbox || bbox.width === 0 || bbox.height === 0) {
        Swal.fire({ icon: 'info', title: 'Empty Canvas', text: 'There is nothing to export.'});
        return;
    }

    const expPadding = 120;
    const x = bbox.x - expPadding;
    const y = bbox.y - expPadding;
    const width = bbox.width + expPadding * 2;
    const height = bbox.height + expPadding * 2;

    const svgNode = AppState.paper.svg.cloneNode(true);
    const viewport = svgNode.querySelector('.viewport');
    if (viewport) viewport.removeAttribute('transform');

    svgNode.setAttribute('viewBox', `${x} ${y} ${width} ${height}`);
    svgNode.setAttribute('width', width);
    svgNode.setAttribute('height', height);

    svgNode.querySelectorAll('.joint-highlighted, .joint-selection-rect, [class*="highlight"]').forEach(el => el.remove());

    const scaleFactor = options.weightScale;
    const baseThickness = 1.8; 

    svgNode.querySelectorAll('path[joint-selector="line"]').forEach(n => {
        n.setAttribute('stroke-width', (baseThickness * AppState.PPU_MULT) * scaleFactor);
        n.setAttribute('stroke', '#000000'); 
        n.setAttribute('stroke-linejoin', 'round');
        n.setAttribute('stroke-linecap', 'round');
        n.removeAttribute('vector-effect');
        if (n.style.vectorEffect) n.style.vectorEffect = '';
    });

    svgNode.querySelectorAll('path, rect, circle, ellipse, polygon, polyline').forEach(n => {
        if (n.getAttribute('joint-selector') === 'line') return; 
        if (n.tagName.toLowerCase() === 'text' || n.closest('text') || n.closest('foreignObject')) return;

        n.removeAttribute('vector-effect');
        if (n.style.vectorEffect) n.style.vectorEffect = '';

        if (n.getAttribute('stroke') && n.getAttribute('stroke') !== 'none' && n.getAttribute('stroke') !== 'transparent') {
            n.setAttribute('stroke', '#000000');
        }
        
        if (n.getAttribute('fill') && n.getAttribute('fill') !== 'none' && n.getAttribute('fill') !== 'transparent' && n.getAttribute('fill') !== '#ffffff' && n.getAttribute('fill-opacity') !== '0.01') {
            n.setAttribute('fill', '#000000');
        }

        let currentWidthAttr = n.getAttribute('stroke-width');
        if (currentWidthAttr && currentWidthAttr !== 'none' && currentWidthAttr !== '0') {
            let currentWidth = parseFloat(currentWidthAttr);
            n.setAttribute('stroke-width', currentWidth * scaleFactor);
        }
    });

    if (!options.freetext) {
        AppState.graph.getElements().filter(e => e.get('latexMacro') === 'freetext').forEach(e => {
            let node = svgNode.querySelector(`[model-id="${e.id}"]`);
            if (node) node.remove();
        });
    }

    if (!options.compnames) {
        AppState.graph.getElements().filter(e => e.get('latexMacro') !== 'freetext' && e.get('latexMacro') !== 'connectordot').forEach(e => {
            let node = svgNode.querySelector(`[model-id="${e.id}"]`);
            if (node) {
                let label = node.querySelector('text[joint-selector="label"]');
                if (label) label.remove();
                let fo = node.querySelector('foreignObject');
                if (fo) fo.remove();
            }
        });
    }

    if (!options.pins) {
        svgNode.querySelectorAll('[joint-selector="portBody"]').forEach(n => n.remove());
    }

    if (!options.pinnames) {
        svgNode.querySelectorAll('[joint-selector="portLabel"]').forEach(n => n.remove());
    }

    if (options.mono) {
        svgNode.querySelectorAll('*').forEach(n => {
            let stroke = n.getAttribute('stroke');
            let fill = n.getAttribute('fill');
            
            if (stroke && stroke !== 'none' && stroke !== 'transparent') n.setAttribute('stroke', '#000000');
            
            if (fill && fill !== 'none' && fill !== 'transparent' && fill.toLowerCase() !== '#ffffff' && n.getAttribute('fill-opacity') !== '0.01') {
                n.setAttribute('fill', '#000000');
            }
            
            if (n.tagName === 'div' || n.tagName === 'span') n.style.color = '#000000'; 
        });
    }

    if (options.grid) {
        let defs = svgNode.querySelector('defs') || document.createElementNS("http://www.w3.org/2000/svg", "defs");
        if (!svgNode.querySelector('defs')) svgNode.prepend(defs);
        
        let pattern = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
        pattern.setAttribute("id", "exportGrid");
        pattern.setAttribute("width", "40");
        pattern.setAttribute("height", "40");
        pattern.setAttribute("patternUnits", "userSpaceOnUse");
        
        let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", "0");
        circle.setAttribute("cy", "0");
        circle.setAttribute("r", "1.5");
        circle.setAttribute("fill", options.mono ? "#cccccc" : "#bdc3c7"); 
        
        pattern.appendChild(circle);
        defs.appendChild(pattern);
        
        let gridRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        gridRect.setAttribute("x", x);
        gridRect.setAttribute("y", y);
        gridRect.setAttribute("width", width);
        gridRect.setAttribute("height", height);
        gridRect.setAttribute("fill", "url(#exportGrid)");
        
        svgNode.insertBefore(gridRect, viewport); 
    }
    
    let styleTag = document.createElementNS("http://www.w3.org/2000/svg", "style");
    styleTag.textContent = "@import url('https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css');";
    svgNode.insertBefore(styleTag, svgNode.firstChild);

    svgNode.querySelectorAll('foreignObject').forEach(fo => {
        fo.setAttribute('width', '500'); 
        fo.setAttribute('height', '500');
        fo.style.overflow = 'visible';
        
        let innerDiv = fo.firstElementChild;
        if (innerDiv) {
            innerDiv.style.overflow = 'visible';
            innerDiv.style.display = 'inline-block';
            innerDiv.style.whiteSpace = 'nowrap';
        }
    });

    let svgString = new XMLSerializer().serializeToString(svgNode);
    if (!svgString.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
        svgString = svgString.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    
    saveFileAs(svgString, 'circuit.svg', 'image/svg+xml', 'SVG Vector Graphic');
}

// --- SIMULATION EXPORTS ---
export function attachSimulationExports(plotDivId, simData, simType) {
    const toolbarHtml = `
        <div style="display: flex; gap: 10px; justify-content: center; margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--border-main);">
            <button id="btn-exp-csv" class="swal2-confirm swal2-styled" style="background: var(--success); font-size: 13px;"><i data-lucide="file-spreadsheet"></i> Export CSV</button>
            <button id="btn-exp-svg" class="swal2-confirm swal2-styled" style="background: var(--primary); font-size: 13px;"><i data-lucide="image"></i> Export SVG</button>
            <button id="btn-exp-matlab" class="swal2-confirm swal2-styled" style="background: var(--warning); color: #000; font-size: 13px;"><i data-lucide="code"></i> MATLAB / Python</button>
        </div>
    `;
    
    // Append to the Swal popup or plot container
    const container = document.getElementById(plotDivId).parentElement;
    container.insertAdjacentHTML('beforeend', toolbarHtml);
    if (window.lucide) lucide.createIcons();

    // 1. CSV Export
    document.getElementById('btn-exp-csv').onclick = () => {
        let csvContent = "data:text/csv;charset=utf-8,Time/Freq,";
        let traces = simData.traces || [];
        csvContent += traces.map(t => t.name).join(",") + "\n";
        
        let length = traces[0].x.length;
        for (let i = 0; i < length; i++) {
            let row = [traces[0].x[i]];
            traces.forEach(t => row.push(t.y[i]));
            csvContent += row.join(",") + "\n";
        }
        downloadFile(csvContent, `simulation_${simType}.csv`);
    };

    // 2. SVG Export (via Plotly)
    document.getElementById('btn-exp-svg').onclick = () => {
        Plotly.downloadImage(plotDivId, {format: 'svg', width: 800, height: 600, filename: `plot_${simType}`});
    };

    // 3. MATLAB/Python Data Export
    document.getElementById('btn-exp-matlab').onclick = () => {
        let rawJson = JSON.stringify(simData, null, 2);
        let blob = new Blob([rawJson], { type: "application/json" });
        downloadFile(URL.createObjectURL(blob), `sim_data_${simType}.json`, true);
    };
}

function downloadFile(content, fileName, isUrl = false) {
    const encodedUri = isUrl ? content : encodeURI(content);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// --- SUBCIRCUIT IMPORTER ---
export function importSubcircuitToDatabase(jsonData, isSilent = false) { 
    let ppu = typeof AppState !== 'undefined' ? AppState.PPU_MULT : 4;

    let w = jsonData.symbol.width / ppu;
    let h = jsonData.symbol.height / ppu;

    // 1. Draw the main bounding box for the symbol
    let iconPath = `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z`;

    // 2. Map the ports and draw little wire stubs for the pins
    let pins = jsonData.symbol.ports.map(p => {
        let px = p.x / ppu;
        let py = p.y / ppu;
        let pinX = p.x;
        let pinY = p.y;

        if (p.dir === 'L') { iconPath += ` M ${px} ${py} L ${px - 10} ${py}`; pinX -= 40; }
        if (p.dir === 'R') { iconPath += ` M ${px} ${py} L ${px + 10} ${py}`; pinX += 40; }
        if (p.dir === 'T') { iconPath += ` M ${px} ${py} L ${px} ${py - 10}`; pinY -= 40; }
        if (p.dir === 'B') { iconPath += ` M ${px} ${py} L ${px} ${py + 10}`; pinY += 40; }

        return {
            id: p.id,
            x: pinX,     
            y: pinY,     
            dir: p.dir,
            label: p.id
        };
    });

    // 3. Inject it directly into the global database!
    JL_DATABASE[jsonData.macroName] = {
        name: jsonData.macroName,
        displayName: jsonData.displayName,
        category: "Custom Subcircuits",
        
        isCustomSubcircuit: true, // Tells latex.js to unroll this into raw SVG drawing paths
        
        argsCount: 5, 
        argNames: [
            { name: "position", optional: false },
            { name: "name", optional: false },
            { name: "rotation,flip", optional: false },
            { name: "grid", optional: false },
            { name: "show", optional: false }
        ],
        argDefs: [
            { idx: 3, type: "rotflip", label: "Rotation & Flip", defVal: "0,none", options: "" }
        ],
        
        iconBase: iconPath,
        filled: false,
        pins: pins,
        spiceTemplate: jsonData.spiceTemplate,
        spiceModel: jsonData.spiceModel,
        internalSchematic: jsonData.internalSchematic,
        labelAnchor: { dir: 'B', auto: true } 
    };

    // 4. Handle UI notifications based on the silent flag
    if (!isSilent) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                toast: true, position: 'bottom-end', icon: 'success', 
                title: `${jsonData.displayName} added to library!`, 
                showConfirmButton: false, timer: 2000 
            });
        }
        // Refresh the sidebar so the user can drag it onto the canvas instantly
        if (typeof populateSidebar === 'function') populateSidebar(); 
    }
}

// =========================================================================
// GLOBAL DRAG AND DROP HANDLER
// =========================================================================
window.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.body;

    // 1. Prevent the browser from opening the file!
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // 2. Add a visual cue when dragging over the window
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            // Dim the whole app slightly to indicate it's ready to receive a file
            document.body.style.filter = 'brightness(0.7)'; 
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            // Restore brightness
            document.body.style.filter = 'none'; 
        }, false);
    });

    // 3. Route the dropped files to our existing importer
    dropZone.addEventListener('drop', (e) => {
        let dt = e.dataTransfer;
        let files = dt.files;

        if (files && files.length > 0) {
            // We pass a mock event object so importProject can read it just like an <input>
            importProject({ files: files });
        }
    }, false);
});