// js/engines/packer.js
import { AppState } from '../state.js';
import { generateSpiceNetlistStr } from './spice.js';
import { saveFileAs } from '../parsers/io.js';
import { importSubcircuitToDatabase } from '../parsers/io.js'; 
import { exportLatex } from '../parsers/latex.js'; 
import { populateSidebar } from '../ui/sidebar.js'; 
import { zoomFit } from '../ui/actions.js';
import { updateElementLabel, assembleIcon } from '../ui/canvas.js';

export function packCurrentCircuit(preProvidedName = null) {
    let elements = AppState.graph.getElements();
    let links = AppState.graph.getLinks();

    // ==========================================
    // GEOMETRIC SCANNER: True Spatial Connectivity
    // ==========================================
    const isPointConnected = (pt, excludeId) => {
        let tol = 2;
        let connected = false;

        // 1. Check other pins & dots
        elements.forEach(el => {
            if (el.id === excludeId) return;
            if (el.get('latexMacro') === 'connectordot') {
                if (Math.abs(el.position().x + 20 - pt.x) <= tol && Math.abs(el.position().y + 20 - pt.y) <= tol) connected = true;
            } else if (el.get('latexMacro') !== 'freetext') {
                el.getPorts().forEach(port => {
                    let pinPt = window.getAbsolutePinCoord(el, port.id);
                    if (pinPt && Math.abs(pinPt.x - pt.x) <= tol && Math.abs(pinPt.y - pt.y) <= tol) connected = true;
                });
            }
        });

        if (connected) return true;

        // 2. Check Wires
        links.forEach(l => {
            if (l.id === excludeId) return;
            const view = AppState.paper.findViewByModel(l);
            if (!view || !view.sourcePoint || !view.targetPoint) return;

            let rawPts = [view.sourcePoint, ...(l.vertices() || []), view.targetPoint];
            let pts = rawPts.map(p => ({ x: Math.round(p.x/10)*10, y: Math.round(p.y/10)*10 }));
            pts = pts.filter((p, i, a) => i === 0 || p.x !== a[i-1].x || p.y !== a[i-1].y);

            // Check endpoints
            if (pts.length > 0) {
                if (Math.abs(pts[0].x - pt.x) <= tol && Math.abs(pts[0].y - pt.y) <= tol) connected = true;
                if (Math.abs(pts[pts.length-1].x - pt.x) <= tol && Math.abs(pts[pts.length-1].y - pt.y) <= tol) connected = true;
            }

            // Check segments
            for (let i = 0; i < pts.length - 1; i++) {
                let p1 = pts[i], p2 = pts[i+1];
                if (p1.x === p2.x && Math.abs(pt.x - p1.x) <= tol) {
                    if (pt.y >= Math.min(p1.y, p2.y) - tol && pt.y <= Math.max(p1.y, p2.y) + tol) connected = true;
                } else if (p1.y === p2.y && Math.abs(pt.y - p1.y) <= tol) {
                    if (pt.x >= Math.min(p1.x, p2.x) - tol && pt.x <= Math.max(p1.x, p2.x) + tol) connected = true;
                }
            }
        });

        return connected;
    };

    // ==========================================
    // STAGE 1: FATAL PRE-FLIGHT DIAGNOSTICS
    // ==========================================
    let fatalFloatingPins = [];
    let ioPortElements = [];

    elements.forEach(el => {
        let macro = el.get('latexMacro');
        
        if (macro === 'ioport' || macro === 'ioportdot') ioPortElements.push(el);

        if (macro !== 'connectordot' && macro !== 'freetext') {
            el.getPorts().forEach(port => {
                let pt = window.getAbsolutePinCoord(el, port.id);
                if (pt && !isPointConnected(pt, el.id)) {
                    let compName = el.get('displayedText') || macro;
                    let pinName = el.portProp(port.id, 'attrs/portTitle/text') || port.id;
                    fatalFloatingPins.push(`<b>${compName}</b> (Pin: ${pinName})`);
                }
            });
        }
    });

    if (ioPortElements.length === 0) {
        return Swal.fire('Error', 'No IO Ports found. Add at least one "ioport" to create a subcircuit.', 'error');
    }

    if (fatalFloatingPins.length > 0) {
        let errorHtml = `<div style="text-align: left; font-size: 13px;"><p>Subcircuits cannot contain floating (unconnected) pins, as this causes singular matrix errors in SPICE.</p><ul style="color: var(--danger);">` 
            + fatalFloatingPins.map(p => `<li>${p}</li>`).join('') + `</ul></div>`;
        return Swal.fire('Fatal Error: Floating Pins', errorHtml, 'error');
    }

    // ==========================================
    // STAGE 2: GET NAME (If passed checks)
    // ==========================================
    if (!preProvidedName) {
        Swal.fire({
            title: 'Name Your Packed Circuit',
            input: 'text',
            inputPlaceholder: 'e.g. custom_amplifier',
            showCancelButton: true,
            confirmButtonText: 'Next',
            confirmButtonColor: '#8e44ad'
        }).then(result => {
            if (result.isConfirmed && result.value) runWarningsAndCompile(result.value);
        });
    } else {
        runWarningsAndCompile(preProvidedName);
    }

    // ==========================================
    // STAGE 3 & 4: WARNINGS AND COMPILATION
    // ==========================================
    function runWarningsAndCompile(customName) {
        let warningDanglingWires = 0;
        let portsToRename = [];
        let usedNames = new Set();

        // 1. Check Dangling Wires geometrically
        links.forEach(l => {
            const view = AppState.paper.findViewByModel(l);
            if (!view || !view.sourcePoint || !view.targetPoint) return;
            let rawPts = [view.sourcePoint, ...(l.vertices() || []), view.targetPoint];
            let pts = rawPts.map(p => ({ x: Math.round(p.x/10)*10, y: Math.round(p.y/10)*10 }));
            pts = pts.filter((p, i, a) => i === 0 || p.x !== a[i-1].x || p.y !== a[i-1].y);
            
            if (pts.length > 0) {
                if (!isPointConnected(pts[0], l.id)) warningDanglingWires++;
                if (!isPointConnected(pts[pts.length-1], l.id)) warningDanglingWires++;
            }
        });

        // 2. Check Unnamed / Duplicate IO Ports
        ioPortElements.forEach((el, index) => {
            let rawName = el.get('displayedText');
            let needsRenaming = false;
            
            if (!rawName || rawName === 'ioport' || rawName === 'ioportdot') {
                needsRenaming = true;
                rawName = "P" + (index + 1);
            }

            let safeName = rawName.replace(/\s+/g, '_');
            let uniqueName = safeName;
            let counter = 1;
            
            while (usedNames.has(uniqueName)) {
                uniqueName = safeName + "_" + counter;
                counter++;
                needsRenaming = true;
            }
            
            usedNames.add(uniqueName);
            if (needsRenaming) portsToRename.push({ el: el, newName: uniqueName });
        });

        // 3. The Gatekeeper Warning
        if (portsToRename.length > 0 || warningDanglingWires > 0) {
            let warnHtml = `<div style="text-align: left; font-size: 14px;">`;
            if (portsToRename.length > 0) warnHtml += `<p><b>${portsToRename.length} Unnamed/Duplicate IO Ports</b> detected. They will be automatically renamed on the canvas to guarantee SPICE compatibility.</p>`;
            if (warningDanglingWires > 0) warnHtml += `<p><b>${warningDanglingWires} Dangling Wire Endpoint(s)</b> detected. They lead nowhere and will be ignored by SPICE.</p>`;
            warnHtml += `<hr><p style="margin-bottom:0;">Do you want to proceed and pack the circuit?</p></div>`;

            Swal.fire({
                title: 'Pre-Flight Warnings',
                html: warnHtml,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#f39c12',
                cancelButtonColor: '#7f8c8d',
                confirmButtonText: 'Auto-Fix & Pack',
                cancelButtonText: 'Cancel'
            }).then(result => {
                if (result.isConfirmed) executePack(customName, ioPortElements, portsToRename);
            });
        } else {
            executePack(customName, ioPortElements, []); 
        }
    }
}

// ==========================================
// STAGE 5: THE CORE COMPILER
// ==========================================
function executePack(customName, ioPortElements, portsToRename) {
    
    // 1. Visually Auto-Heal the Canvas!
    portsToRename.forEach(item => {
        let el = item.el;
        let args = el.get('customArgs') || [];
        args[1] = item.newName; 
        el.set('customArgs', args);
        
        if (typeof updateElementLabel === 'function') updateElementLabel(el, item.newName);
        if (typeof assembleIcon === 'function') assembleIcon(el, args);
    });

    // 2. Gather Finalized Data
    let finalIoPorts = [];
    ioPortElements.forEach(el => {
        let args = el.get('customArgs') || [];
        let pinName = el.get('displayedText'); 
        let dir = args[2] ? args[2].toString().toLowerCase() : 'input';
        let anchorDir = dir === 'output' ? 'R' : (dir === 'top' ? 'T' : (dir === 'bottom' ? 'B' : 'L'));
        finalIoPorts.push({ name: pinName, dir: anchorDir, netId: el.id });
    });

    let leftPins = finalIoPorts.filter(p => p.dir === 'L'), rightPins = finalIoPorts.filter(p => p.dir === 'R');
    let topPins = finalIoPorts.filter(p => p.dir === 'T'), botPins = finalIoPorts.filter(p => p.dir === 'B');
    let maxVertPins = Math.max(leftPins.length, rightPins.length);
    let maxHorzPins = Math.max(topPins.length, botPins.length);
    let symbolWidth = Math.max(120, (maxHorzPins + 1) * 40), symbolHeight = Math.max(80, (maxVertPins + 1) * 40);

    let finalPorts = [];
    leftPins.forEach((p, i) => finalPorts.push({ id: p.name, x: 0, y: (i + 1) * 40, dir: p.dir }));
    rightPins.forEach((p, i) => finalPorts.push({ id: p.name, x: symbolWidth, y: (i + 1) * 40, dir: p.dir }));
    topPins.forEach((p, i) => finalPorts.push({ id: p.name, x: (i + 1) * 40, y: 0, dir: p.dir }));
    botPins.forEach((p, i) => finalPorts.push({ id: p.name, x: (i + 1) * 40, y: symbolHeight, dir: p.dir }));

    let netlistData = generateSpiceNetlistStr("\n.op\n.end\n");
    let criticalErrors = netlistData.errors ? netlistData.errors.filter(e => !e.includes("No Ground")) : [];
    if (criticalErrors.length > 0) {
        let errorHtml = `<ul style="text-align: left; font-size: 13px; color: var(--danger);">` + criticalErrors.map(e => `<li style="margin-bottom: 5px;">${e}</li>`).join('') + `</ul>`;
        return Swal.fire('Spice Error', 'Fix internal schematic logic before packing.<br><br>' + errorHtml, 'error');
    }

    // 3. Geometric Port Mapping (Convert internal nodes to external ports)
    let portNames = [];
    let portNetMap = {};
    let topo = netlistData.topo;

    finalIoPorts.forEach(p => {
        portNames.push(p.name);
        if (topo) {
            let portEl = AppState.graph.getCell(p.netId);
            let pt = window.getAbsolutePinCoord(portEl, 'pin3') || window.getAbsolutePinCoord(portEl, 'pin1');
            if (pt) {
                let cluster = topo.terminals.find(t => Math.abs(t.x - pt.x) < 10 && Math.abs(t.y - pt.y) < 10);
                if (cluster) {
                    let foundNet = topo.netMap.get(topo.uf.find(cluster.id));
                    if (foundNet !== null && String(foundNet) !== '0') portNetMap[String(foundNet)] = p.name;
                }
            }
        }
    });

    let pureCircuitCode = netlistData.code.split("* --- Component Models & Subcircuits ---")[0];
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
        let translatedParts = parts.map((part, idx) => (idx > 0 && portNetMap[part]) ? portNetMap[part] : part);
        internalSpice.push(translatedParts.join(" "));
    }

    let macroName = customName.toLowerCase().replace(/[^a-z]/g, '') || "customblock";
    let extraModels = document.getElementById('sim-models') ? document.getElementById('sim-models').value.trim() : '';
    let requiredLibModels = new Set();
    let lib = window.SPICE_MODEL_LIBRARY || {};
    
    AppState.graph.getElements().forEach(el => {
        let modelVal = (el.get('spiceData') || {})['MODEL'];
        if (modelVal && !modelVal.startsWith('WIZ_')) {
            for (let cat in lib) { if (lib[cat][modelVal]) requiredLibModels.add(lib[cat][modelVal]); }
        }
    });

    let combinedSpiceModel = `.subckt ${macroName} ${portNames.join(" ")}\n${internalSpice.join('\n')}\n.ends`;
    if (extraModels || requiredLibModels.size > 0) {
        combinedSpiceModel += `\n\n* --- Dependencies for ${macroName} ---\n${extraModels}\n`;
        requiredLibModels.forEach(m => combinedSpiceModel += m + '\n');
    }

    let portTemplateList = portNames.map(p => `{${p}}`).join(" ");
    let packageJSON = {
        macroName: macroName, displayName: customName, type: "subcircuit",
        symbol: { width: symbolWidth, height: symbolHeight, ports: finalPorts },
        spiceTemplate: `X_{NAME} ${portTemplateList} ${macroName}`,
        spiceModel: combinedSpiceModel, internalSchematic: AppState.graph.toJSON()
    };

    let jsonString = JSON.stringify(packageJSON, null, 2);
    Swal.fire({
        title: 'Circuit Packed Successfully!', text: `What would you like to do with ${packageJSON.displayName}?`, icon: 'success',
        showDenyButton: true, showCancelButton: true,
        confirmButtonText: '<i data-lucide="palette"></i> Add to Palette', denyButtonText: '<i data-lucide="download"></i> Download JSON', cancelButtonText: 'Do Both',
        confirmButtonColor: '#8e44ad', denyButtonColor: '#3498db', cancelButtonColor: '#27ae60',
        didOpen: () => { if (typeof lucide !== 'undefined') lucide.createIcons(); }
    }).then((result) => {
        if (result.isConfirmed) { importSubcircuitToDatabase(packageJSON, true); populateSidebar(); Swal.fire({ toast: true, position: 'bottom-end', icon: 'success', title: 'Added to Palette!', showConfirmButton: false, timer: 2000 }); }
        else if (result.isDenied) { saveFileAs(jsonString, `${macroName}.json`, 'application/json', 'JL Subcircuit'); }
        else if (result.dismiss === Swal.DismissReason.cancel) { importSubcircuitToDatabase(packageJSON, true); populateSidebar(); saveFileAs(jsonString, `${macroName}.json`, 'application/json', 'JL Subcircuit'); Swal.fire({ toast: true, position: 'bottom-end', icon: 'success', title: 'Added & Downloaded!', showConfirmButton: false, timer: 2000 }); }
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
            
            // 3. Update Breadcrumbs and Auto-Fit!
            window.updateBreadcrumbs();
            setTimeout(() => { zoomFit(); exportLatex(); }, 50);
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
        setTimeout(() => { zoomFit(); exportLatex(); }, 50);
        
        // Recursive Ascend: Keep triggering if we haven't hit our target level yet!
        if (window._targetAscendLevel !== undefined && AppState.hierarchyStack.length > window._targetAscendLevel) {
            setTimeout(() => { window.ascendHierarchy(doSave); }, 100);
        } else {
            window._targetAscendLevel = undefined; 
            Swal.fire({ toast: true, position: 'bottom-end', icon: 'success', title: 'Hierarchy Saved', showConfirmButton: false, timer: 2000 });
        }
    }
};