// js/engines/packer.js
import { AppState } from '../state.js';
import { generateSpiceNetlistStr } from './spice.js';
import { saveFileAs } from '../parsers/io.js';
import { importSubcircuitToDatabase } from '../parsers/io.js'; 
import { populateSidebar } from '../ui/sidebar.js'; 
import { zoomFit } from '../ui/actions.js';

export function packCurrentCircuit(customName) {
    let elements = AppState.graph.getElements();
    let ioPorts = [];
    
    // 1. Gather all Input/Output ports from the canvas
    elements.forEach(el => {
        let macro = el.get('latexMacro');
        if (macro === 'ioport' || macro === 'ioportdot') {
            let args = el.get('customArgs') || [];
            // Use the displayed text as the pin name, fallback to a generic name
            let pinName = el.get('displayedText') || "P" + ioPorts.length;
            let dir = args[2] ? args[2].toString().toLowerCase() : 'input';
            
            // Map the visual orientation to CAD anchor directions
            let anchorDir = 'L';
            if (dir === 'output') anchorDir = 'R';
            else if (dir === 'top') anchorDir = 'T';
            else if (dir === 'bottom') anchorDir = 'B';
            
            ioPorts.push({
                name: pinName.replace(/\s+/g, '_'), // SPICE-safe name
                dir: anchorDir,
                netId: el.id
            });
        }
    });

    if (ioPorts.length === 0) {
        return Swal.fire('Error', 'No IO Ports found. Add at least one "ioport" component to define the subcircuit pins.', 'error');
    }

    // 2. Build the Visual Symbol Dimensions
    // We space pins by 40 pixels (1 grid block)
    let leftPins = ioPorts.filter(p => p.dir === 'L');
    let rightPins = ioPorts.filter(p => p.dir === 'R');
    let topPins = ioPorts.filter(p => p.dir === 'T');
    let botPins = ioPorts.filter(p => p.dir === 'B');

    let maxVertPins = Math.max(leftPins.length, rightPins.length);
    let maxHorzPins = Math.max(topPins.length, botPins.length);

    let symbolWidth = Math.max(120, (maxHorzPins + 1) * 40);
    let symbolHeight = Math.max(80, (maxVertPins + 1) * 40);

    let finalPorts = [];
    leftPins.forEach((p, i) => finalPorts.push({ id: p.name, x: 0, y: (i + 1) * 40, dir: p.dir }));
    rightPins.forEach((p, i) => finalPorts.push({ id: p.name, x: symbolWidth, y: (i + 1) * 40, dir: p.dir }));
    topPins.forEach((p, i) => finalPorts.push({ id: p.name, x: (i + 1) * 40, y: 0, dir: p.dir }));
    botPins.forEach((p, i) => finalPorts.push({ id: p.name, x: (i + 1) * 40, y: symbolHeight, dir: p.dir }));

    // 3. Generate the Internal SPICE Netlist
    // We run the standard netlister, passing an empty string to skip adding simulation commands (.tran, .op, etc.)
    let netlistData = generateSpiceNetlistStr("");
    
    // Check for errors (like floating pins), but IGNORE the "No Ground" error
    // Subcircuits often don't have an internal ground, they inherit it from the master circuit!
    let criticalErrors = [];
    if (netlistData.errors) {
        criticalErrors = netlistData.errors.filter(e => !e.includes("No Ground"));
    }

    if (criticalErrors.length > 0) {
        let errorHtml = `<ul style="text-align: left; font-size: 13px; color: var(--danger);">` + 
                        criticalErrors.map(e => `<li style="margin-bottom: 5px;">${e}</li>`).join('') + 
                        `</ul>`;
        return Swal.fire('Error', 'Fix schematic errors before packing.<br><br>' + errorHtml, 'error');
    }

    // Extract the raw component list
    let rawSpiceLines = netlistData.code.split('\n');
    let internalSpice = [];
    for (let line of rawSpiceLines) {
        // STRICT match for .end so we don't accidentally strip .ends!
        if (line.startsWith('*') || line.startsWith('.op') || line.trim() === '.end' || line.startsWith('.end ') || line.trim() === '') continue;
        internalSpice.push(line);
    }

    // 4. Map the Top-Level Ports to the Subcircuit Nodes
    let topo = netlistData.topo;
    let getNetForPin = (pt) => {
        let cluster = topo.terminals.find(t => Math.abs(t.x - pt.x) < 5 && Math.abs(t.y - pt.y) < 5);
        return cluster ? topo.netMap.get(topo.uf.find(cluster.id)) : null;
    };

    let subcktNodes = [];
    ioPorts.forEach(port => {
        let portEl = AppState.graph.getCell(port.netId);
        // Ensure we grab the exact pin coordinate that the wire attaches to on your ioport macro (usually pin3)
        let pt = window.getAbsolutePinCoord(portEl, 'pin3'); 
        let spiceNodeId = getNetForPin(pt) || "NC";
        subcktNodes.push(spiceNodeId);
    });

    let portNameList = ioPorts.map(p => p.name).join(" ");
    let portTemplateList = ioPorts.map(p => `{${p.name}}`).join(" "); // <-- Wraps them in {}
    let finalSpiceBody = internalSpice.join('\n');
    
    // Replace the internal node IDs with our clean port names
    subcktNodes.forEach((nodeId, idx) => {
        let nodeRegex = new RegExp(`\\b${nodeId}\\b`, 'g');
        finalSpiceBody = finalSpiceBody.replace(nodeRegex, ioPorts[idx].name);
    });

    // 5. Build the Final Package
    let macroName = customName.toLowerCase().replace(/[^a-z]/g, '');
    if (!macroName) macroName = "customblock";
    
    let extraModels = document.getElementById('sim-models') ? document.getElementById('sim-models').value.trim() : '';
    
    // --- NEW: Sweep the internal components and grab their Library Models! ---
    let requiredLibModels = new Set();
    let lib = window.SPICE_MODEL_LIBRARY || {};
    elements.forEach(el => {
        let modelVal = (el.get('spiceData') || {})['MODEL'];
        if (modelVal && !modelVal.startsWith('WIZ_')) {
            for (let cat in lib) {
                if (lib[cat][modelVal]) requiredLibModels.add(lib[cat][modelVal]);
            }
        }
    });
    
    // Use portNameList (no braces) for the definition!
    let combinedSpiceModel = `.subckt ${macroName} ${portNameList}\n${finalSpiceBody}\n.ends`;
    
    // Bundle the user's manual models AND the library models into the subcircuit
    if (extraModels || requiredLibModels.size > 0) {
        combinedSpiceModel += `\n\n* --- Dependencies for ${macroName} ---\n${extraModels}\n`;
        requiredLibModels.forEach(m => combinedSpiceModel += m + '\n');
    }
    
    let packageJSON = {
        macroName: macroName,
        displayName: customName,
        type: "subcircuit",
        symbol: {
            width: symbolWidth,
            height: symbolHeight,
            ports: finalPorts
        },
        spiceTemplate: `X_{NAME} ${portTemplateList} ${macroName}`,
        spiceModel: combinedSpiceModel, // <-- Now contains the subcircuit AND its models!
        internalSchematic: AppState.graph.toJSON()
    };

    // 6. Provide Workflow Options
    let jsonString = JSON.stringify(packageJSON, null, 2);
    
    Swal.fire({
        title: 'Circuit Packed Successfully!',
        text: `What would you like to do with ${packageJSON.displayName}?`,
        icon: 'success',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: '<i data-lucide="palette"></i> Add to Palette',
        denyButtonText: '<i data-lucide="download"></i> Download JSON',
        cancelButtonText: 'Do Both',
        confirmButtonColor: '#8e44ad',
        denyButtonColor: '#3498db',
        cancelButtonColor: '#27ae60',
        didOpen: () => {
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // Add to Palette Only
            importSubcircuitToDatabase(packageJSON, true);
            populateSidebar();
            Swal.fire({ toast: true, position: 'bottom-end', icon: 'success', title: 'Added to Palette!', showConfirmButton: false, timer: 2000 });
        } else if (result.isDenied) {
            // Download Only
            saveFileAs(jsonString, `${macroName}.json`, 'application/json', 'JL Subcircuit');
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            // Cancel button repurposed as "Do Both"
            importSubcircuitToDatabase(packageJSON, true);
            populateSidebar();
            saveFileAs(jsonString, `${macroName}.json`, 'application/json', 'JL Subcircuit');
            Swal.fire({ toast: true, position: 'bottom-end', icon: 'success', title: 'Added & Downloaded!', showConfirmButton: false, timer: 2000 });
        }
    });
}

// =========================================================================
// HIERARCHY NAVIGATION (WHITE BOX EDITING ENGINE)
// =========================================================================

// Ensure the hierarchy stack exists
if (typeof AppState !== 'undefined' && !AppState.hierarchyStack) {
    AppState.hierarchyStack = [];
}

// --- DYNAMIC BREADCRUMBS & DEEP ASCEND ---
window.updateBreadcrumbs = function() {
    let bar = document.getElementById('hierarchy-bar');
    let breadcrumbs = document.getElementById('hierarchy-breadcrumbs');
    if (!bar || !breadcrumbs) return;

    if (AppState.hierarchyStack.length === 0) {
        bar.style.display = 'none';
        return;
    }

    bar.style.display = 'flex';
    let pathHtml = `<span style="cursor:pointer; color:var(--primary); font-weight:bold; text-decoration:underline;" onclick="window.ascendToTop(true)">Main</span>`;
    
    AppState.hierarchyStack.forEach((state, idx) => {
        if (idx === AppState.hierarchyStack.length - 1) {
            pathHtml += ` <span style="margin: 0 5px;">&gt;</span> ${state.displayName}`;
        } else {
            pathHtml += ` <span style="margin: 0 5px;">&gt;</span> <span style="cursor:pointer; color:var(--primary); font-weight:bold; text-decoration:underline;" onclick="window.ascendToLevel(${idx + 1}, true)">${state.displayName}</span>`;
        }
    });
    breadcrumbs.innerHTML = pathHtml;
};

window.ascendToTop = function(saveChanges) {
    window.ascendToLevel(0, saveChanges);
};

window.ascendToLevel = function(targetLevel, saveChanges) {
    if (!AppState.hierarchyStack || AppState.hierarchyStack.length <= targetLevel) return;
    window._targetAscendLevel = targetLevel; // Set a target flag
    window.ascendHierarchy(saveChanges);     // Fire the first ascend!
};

// --- THE DESCENT ENGINE ---
window.descendIntoSubcircuit = function(element) {
    let macro = element.get('latexMacro');
    let data = JL_DATABASE[macro];
    
    if (!data || !data.isCustomSubcircuit || !data.internalSchematic) {
        return Swal.fire('Error', 'This component does not have an internal schematic to edit.', 'error');
    }

    // 1. Pre-Flight Dependency Check
    let missingDependencies = new Set();
    if (data.internalSchematic && data.internalSchematic.cells) {
        data.internalSchematic.cells.forEach(cell => {
            if (cell.type !== 'standard.Link' && cell.latexMacro) {
                if (!JL_DATABASE[cell.latexMacro]) missingDependencies.add(cell.latexMacro);
            }
        });
    }

    if (missingDependencies.size > 0) {
        let missingListHtml = `<ul style="text-align: left; font-family: monospace; font-size: 13px; color: var(--danger); margin-top: 10px;">`;
        missingDependencies.forEach(dep => { missingListHtml += `<li>${dep}.json</li>`; });
        missingListHtml += `</ul>`;

        return Swal.fire({
            icon: 'warning',
            title: 'Missing Dependencies',
            html: `You cannot edit this subcircuit because it contains nested components that are not currently loaded in your palette.<br><br>Please drag and drop the following files onto the canvas to load them:<br>${missingListHtml}`
        });
    }

    // 2. The Entry Warning Gatekeeper
    Swal.fire({
        title: '<div style="display:flex; align-items:center; justify-content:center; gap:8px;"><i data-lucide="alert-triangle" style="color:var(--warning); width:24px; height:24px;"></i> Editing Subcircuit</div>',
        html: `
            <div style="text-align: left; font-size: 13px; line-height: 1.6; color: var(--text-main);">
                <p style="margin-top:0;">You are descending into a packed component. To ensure the parent symbol continues to simulate correctly:</p>
                <div style="background: rgba(231, 76, 60, 0.1); border-left: 4px solid var(--danger); padding: 10px; margin: 15px 0; border-radius: 4px;">
                    <ul style="margin: 0; padding-left: 20px; font-weight: 600; color: var(--danger);">
                        <li style="margin-bottom: 5px;">Do NOT change the number of IO Ports.</li>
                        <li>Do NOT change the names of existing IO Ports.</li>
                    </ul>
                </div>
                <p style="margin-bottom:0; color: var(--text-muted);">If you need a different pinout, please return to the main schematic and create a brand new packed component.</p>
            </div>
        `,
        confirmButtonText: 'I Understand',
        confirmButtonColor: 'var(--primary)',
        backdrop: true,
        allowOutsideClick: false,
        didOpen: () => { if (typeof lucide !== 'undefined') lucide.createIcons(); }
    }).then((result) => {
        if (result.isConfirmed) {
            AppState.hierarchyStack.push({
                macroName: macro,
                parentState: AppState.graph.toJSON(),
                elementId: element.id,
                displayName: data.displayName
            });

            AppState.graph.clear();
            AppState.graph.fromJSON(data.internalSchematic);
            
            // Rebuild breadcrumbs and Auto-Fit the view!
            window.updateBreadcrumbs();
            setTimeout(() => zoomFit(), 50);
        }
    });
};

// --- THE ASCENT ENGINE ---
window.ascendHierarchy = function(saveChanges) {
    if (!AppState.hierarchyStack || AppState.hierarchyStack.length === 0) return;

    let currentState = AppState.hierarchyStack[AppState.hierarchyStack.length - 1]; // Peek!

    if (saveChanges) {
        // 1. PIN SIGNATURE CHECK
        let ioPorts = AppState.graph.getElements().filter(e => e.get('latexMacro') === 'ioport' || e.get('latexMacro') === 'ioportdot');
        let currentIOPortCount = ioPorts.length;
        
        let dbEntry = JL_DATABASE[currentState.macroName];
        let expectedIOPortCount = 0;
        if (dbEntry && dbEntry.basePorts) expectedIOPortCount = Object.keys(dbEntry.basePorts).length;
        else if (dbEntry && dbEntry.pins) expectedIOPortCount = dbEntry.pins.length;

        if (currentIOPortCount !== expectedIOPortCount) {
            return Swal.fire({
                title: 'Symbol/Schematic Mismatch!',
                html: `The top-level symbol for <b>${currentState.displayName}</b> expects exactly <b>${expectedIOPortCount}</b> pins, but you have <b>${currentIOPortCount}</b> IO ports on the canvas.<br><br>Changing the number of pins will fatally crash the parent schematic. Please restore the original pin count.`,
                icon: 'error'
            });
        }

        if (typeof generateSpiceNetlistStr === 'function') {
            let netlistData = generateSpiceNetlistStr("\n.op\n.end\n");
            let criticalErrors = netlistData.errors ? netlistData.errors.filter(e => !e.includes("No Ground")) : [];

            // 2. MANUAL FLOATING IO PORT CHECK
            let topo = netlistData.topo || window.extractTopology();
            let netPopulation = {};
            
            AppState.graph.getElements().forEach(el => {
                let macro = el.get('latexMacro');
                if (macro !== 'connectordot' && macro !== 'freetext') {
                    el.getPorts().forEach(port => {
                        let pt = window.getAbsolutePinCoord(el, port.id);
                        let cluster = topo.terminals.find(t => Math.abs(t.x - pt.x) < 10 && Math.abs(t.y - pt.y) < 10);
                        let netId = cluster ? topo.netMap.get(topo.uf.find(cluster.id)) : null;
                        if (netId) netPopulation[netId] = (netPopulation[netId] || 0) + 1;
                    });
                }
            });

            ioPorts.forEach(portEl => {
                let pt = window.getAbsolutePinCoord(portEl, 'pin3') || window.getAbsolutePinCoord(portEl, 'pin1');
                if (pt) {
                    let cluster = topo.terminals.find(t => Math.abs(t.x - pt.x) < 10 && Math.abs(t.y - pt.y) < 10);
                    let netId = cluster ? topo.netMap.get(topo.uf.find(cluster.id)) : null;
                    let name = portEl.get('displayedText') || "IO Port";
                    if (!netId || netPopulation[netId] <= 1) {
                        criticalErrors.push(`Subcircuit pin <b>${name}</b> is floating (not connected to internal components).`);
                    }
                }
            });
            
            // 3. WARNING DIALOG
            if (criticalErrors.length > 0) {
                let errorHtml = `<ul style="text-align: left; font-size: 13px; color: var(--danger);">` + criticalErrors.map(e => `<li style="margin-bottom: 5px;">${e}</li>`).join('') + `</ul>`;
                Swal.fire({
                    title: 'Internal Schematic Errors',
                    html: `Your packed subcircuit has errors. If you save and return now, simulations using this block will fail!<br><br>${errorHtml}`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#e74c3c',
                    cancelButtonColor: '#3498db',
                    confirmButtonText: 'Save Anyway',
                    cancelButtonText: 'Cancel & Fix'
                }).then((result) => { if (result.isConfirmed) executeAscend(true); });
                return;
            }
        }
    }
    
    executeAscend(saveChanges);

    function executeAscend(doSave) {
        let state = AppState.hierarchyStack.pop();

        if (doSave) {
            JL_DATABASE[state.macroName].internalSchematic = AppState.graph.toJSON();
            let netlistData = generateSpiceNetlistStr("\n.op\n.end\n");
            
            if (netlistData) {
                let ioPorts = AppState.graph.getElements().filter(e => e.get('latexMacro') === 'ioport' || e.get('latexMacro') === 'ioportdot');
                let portNames = [];
                let portNetMap = {};
                let topo = netlistData.topo;

                ioPorts.forEach(p => {
                    let args = p.get('customArgs') || [];
                    let pName = args[1] || p.get('displayedText') || "P";
                    portNames.push(pName);

                    if (topo) {
                        let bbox = p.getBBox();
                        bbox.x -= 10; bbox.y -= 10; bbox.width += 20; bbox.height += 20;
                        let foundNet = null;
                        topo.terminals.forEach(t => {
                            if (t.x >= bbox.x && t.x <= bbox.x + bbox.width && t.y >= bbox.y && t.y <= bbox.y + bbox.height) {
                                foundNet = topo.netMap.get(topo.uf.find(t.id));
                            }
                        });
                        if (foundNet !== null && String(foundNet) !== '0') portNetMap[String(foundNet)] = pName;
                    }
                });
                
                let portNameList = portNames.join(" ");
                let rawCode = netlistData.code;
                let pureCircuitCode = rawCode.split("* --- Component Models & Subcircuits ---")[0];
                let spiceLines = pureCircuitCode.split('\n');
                let internalSpice = [];
                let skipBlock = false;
                
                for (let line of spiceLines) {
                    let trimmed = line.trim();
                    if (trimmed.startsWith('*') || trimmed.startsWith('.op') || trimmed === '.end' || trimmed === '') continue;
                    if (trimmed.toLowerCase().startsWith('.subckt') || trimmed.toLowerCase().startsWith('.model')) skipBlock = true;
                    if (skipBlock) {
                        if (trimmed.toLowerCase() === '.ends') skipBlock = false;
                        continue;
                    }
                    let parts = trimmed.split(/\s+/);
                    let translatedParts = parts.map((part, idx) => {
                        if (idx > 0 && portNetMap[part]) return portNetMap[part];
                        return part;
                    });
                    internalSpice.push(translatedParts.join(" "));
                }
                
                let extraModels = document.getElementById('sim-models') ? document.getElementById('sim-models').value.trim() : '';
                let requiredLibModels = new Set();
                let lib = window.SPICE_MODEL_LIBRARY || {};
                
                AppState.graph.getElements().forEach(el => {
                    let modelVal = (el.get('spiceData') || {})['MODEL'];
                    if (modelVal && !modelVal.startsWith('WIZ_')) {
                        for (let cat in lib) { if (lib[cat][modelVal]) requiredLibModels.add(lib[cat][modelVal]); }
                    }
                });
                
                let combinedSpiceModel = `.subckt ${state.macroName} ${portNameList}\n${internalSpice.join('\n')}\n.ends`;
                if (extraModels || requiredLibModels.size > 0) {
                    combinedSpiceModel += `\n\n* --- Dependencies for ${state.macroName} ---\n${extraModels}\n`;
                    requiredLibModels.forEach(m => combinedSpiceModel += m + '\n');
                }
                
                JL_DATABASE[state.macroName].spiceModel = combinedSpiceModel;
            }
        }

        AppState.graph.clear();
        AppState.graph.fromJSON(state.parentState);

        window.updateBreadcrumbs();
        setTimeout(() => zoomFit(), 50);
        
        // Recursive Ascend: Keep triggering if we haven't hit our target level yet!
        if (window._targetAscendLevel !== undefined && AppState.hierarchyStack.length > window._targetAscendLevel) {
            setTimeout(() => { window.ascendHierarchy(doSave); }, 100);
        } else {
            window._targetAscendLevel = undefined; 
            Swal.fire({ toast: true, position: 'bottom-end', icon: 'success', title: 'Hierarchy Saved', showConfirmButton: false, timer: 2000 });
        }
    }
};