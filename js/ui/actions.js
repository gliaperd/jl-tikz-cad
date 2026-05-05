// js/ui/actions.js
import { AppState, THEME_COLORS } from '../state.js';
import { getVisualOrigin, applyRobustScale, updateDynamicGrid } from './canvas.js';
import { exportLatex } from '../parsers/latex.js';
import { clearSimAnnotations } from '../engines/spice.js';

export function saveState() {
    if (AppState.isHistoryOperating) return;
    if (AppState.historyIndex < AppState.historyStack.length - 1) {
        AppState.historyStack = AppState.historyStack.slice(0, AppState.historyIndex + 1);
    }
    
    // --- NEW: Wrap both the graph and config into a single Save Package ---
    const currentState = JSON.stringify({
        circuit: AppState.graph.toJSON(),
        spiceConfig: AppState.spiceSimConfig || {}
    });
    
    AppState.historyStack.push(currentState);
    localStorage.setItem('jlcad_autosave', currentState);
    
    if (AppState.historyStack.length > 40) AppState.historyStack.shift();
    else AppState.historyIndex++;
}

export function undo() {
    if (AppState.historyIndex <= 0) return; 
    AppState.isHistoryOperating = true;
    AppState.historyIndex--;
    
    // --- NEW: Smart Unpack for Undo ---
    let parsedData = JSON.parse(AppState.historyStack[AppState.historyIndex]);
    if (parsedData.circuit) {
        AppState.graph.fromJSON(parsedData.circuit);
        AppState.spiceSimConfig = parsedData.spiceConfig || {};
    } else {
        // Fallback just in case they have an old history state cached
        AppState.graph.fromJSON(parsedData);
    }

    clearSelection();
    clearSimAnnotations();
    exportLatex();
    AppState.isHistoryOperating = false;
}

export function redo() {
    if (AppState.historyIndex >= AppState.historyStack.length - 1) return;
    AppState.isHistoryOperating = true;
    AppState.historyIndex++;
    
    // --- NEW: Smart Unpack for Redo ---
    let parsedData = JSON.parse(AppState.historyStack[AppState.historyIndex]);
    if (parsedData.circuit) {
        AppState.graph.fromJSON(parsedData.circuit);
        AppState.spiceSimConfig = parsedData.spiceConfig || {};
    } else {
        AppState.graph.fromJSON(parsedData);
    }

    clearSelection();
    clearSimAnnotations();
    exportLatex();
    AppState.isHistoryOperating = false;
}

export function clearSelection() {
    AppState.selectedElements.forEach(el => { const v = AppState.paper.findViewByModel(el); if(v) v.unhighlight(); });
    AppState.selectedLinks.forEach(l => { const v = AppState.paper.findViewByModel(l); if(v) v.unhighlight(); });
    AppState.selectedElements = []; 
    AppState.selectedLinks = [];
    updateToolbarState();
}

export function updateToolbarState() {
    const btnRot = document.getElementById('btn-rotate');
    const btnFH = document.getElementById('btn-flip-h');
    const btnFV = document.getElementById('btn-flip-v');
    if (!btnRot || !btnFH || !btnFV) return;

    let canRot = true, canFlip = true;
    AppState.selectedElements.forEach(el => {
        let macro = el.get('latexMacro');
        let dbData = JL_DATABASE[macro];
        if (dbData) {
            if (dbData.rotatable === false) canRot = false;
            if (dbData.flippable === false) canFlip = false;
        }
    });

    btnRot.disabled = !canRot; btnFH.disabled = !canFlip; btnFV.disabled = !canFlip;
}

export function deleteSelected() { 
    [...AppState.selectedElements, ...AppState.selectedLinks].forEach(c => c.remove()); 
    clearSelection(); exportLatex(); saveState();
}

export function copySelected() { 
    if (AppState.selectedElements.length > 0 || AppState.selectedLinks.length > 0) {
        AppState.clipboard = [...AppState.selectedElements, ...AppState.selectedLinks].map(cell => cell.toJSON()); 
    }
}

export function pasteCopied() {
    if (!AppState.clipboard || AppState.clipboard.length === 0) return;
    const idMap = {}, newCellsData = [];

    AppState.clipboard.forEach(cellData => {
        const newId = 'cell-' + Math.random().toString(36).substr(2, 9);
        idMap[cellData.id] = newId;
        const newData = JSON.parse(JSON.stringify(cellData));
        newData.id = newId;
        if (newData.position) { newData.position.x += 20; newData.position.y += 20; }
        if (newData.vertices) { newData.vertices = newData.vertices.map(v => ({ x: v.x + 20, y: v.y + 20 })); }
        newCellsData.push(newData);
    });

    newCellsData.forEach(data => {
        if (data.type === 'standard.Link') {
            if (data.source && data.source.id && idMap[data.source.id]) data.source.id = idMap[data.source.id];
            else if (data.source && data.source.x !== undefined) { data.source.x += 20; data.source.y += 20; }
            if (data.target && data.target.id && idMap[data.target.id]) data.target.id = idMap[data.target.id];
            else if (data.target && data.target.x !== undefined) { data.target.x += 20; data.target.y += 20; }
        }
    });

    const models = newCellsData.map(data => {
        if (data.type === 'standard.Link') return new joint.shapes.standard.Link(data);
        if (data.type === 'jl.ConnectorDot') return new joint.shapes.jl.ConnectorDot(data);
        if (data.type === 'jl.Component') return new joint.shapes.jl.Component(data); 
        return new joint.shapes.standard.Rectangle(data);
    });

    AppState.graph.addCells(models);
    clearSelection();
    models.forEach(m => {
        if (m.isLink()) { AppState.selectedLinks.push(m); m.toBack(); } 
        else { AppState.selectedElements.push(m); }
        setTimeout(() => { const v = AppState.paper.findViewByModel(m); if (v) v.highlight(); }, 10);
    });
    exportLatex(); saveState(); updateToolbarState();
}

export function rotateSelected() {
    AppState.selectedElements.forEach(el => {
        let dbData = JL_DATABASE[el.get('latexMacro')];
        if(el.get('latexMacro') !== 'connectordot' && (!dbData || dbData.rotatable !== false)) {
            let oldPin = getVisualOrigin(el); 
            el.rotate(90); 
            let newPin = getVisualOrigin(el); 
            let p = el.position();
            el.position(p.x + (oldPin.x - newPin.x), p.y + (oldPin.y - newPin.y));
            
            if (dbData) {
                let customArgs = el.get('customArgs') || [];
                let webAngle = el.get('angle') || 0;
                let rot = (360 - webAngle) % 360;
                let flipH = el.get('flipH') ? 'h' : '';
                let flipV = el.get('flipV') ? 'v' : '';
                let flipStr = flipH && flipV ? 'hv' : (flipH || flipV || 'none');
                
                if (dbData.argDefs) {
                    dbData.argDefs.forEach(def => {
                        if (def.type === 'rotflip') customArgs[def.idx - 1] = `${rot},${flipStr}`;
                        else if (def.type === 'rotation') customArgs[def.idx - 1] = `${rot}`;
                    });
                }
                for (let i = 0; i < dbData.argsCount; i++) {
                    let argName = dbData.argNames[i] ? dbData.argNames[i].name.toLowerCase() : "";
                    if (argName.includes('horizontal') && argName.includes('vertical')) {
                         if (webAngle === 90 || webAngle === 270) customArgs[i] = 'vertical';
                         else if (webAngle === 0 || webAngle === 180) customArgs[i] = 'horizontal';
                         else customArgs[i] = 'none'; 
                    }
                }
                el.set('customArgs', customArgs);
            }
        }
    });
    exportLatex(); saveState();
}

export function flipHorizontal() {
    AppState.selectedElements.forEach(el => {
        let dbData = JL_DATABASE[el.get('latexMacro')];
        if(el.get('latexMacro') !== 'connectordot' && (!dbData || dbData.flippable !== false)) {
            let oldPin = getVisualOrigin(el);
            el.set('flipH', !(el.get('flipH') || false));
            el.rotate((360 - (el.get('angle') || 0)) % 360, true);
            applyRobustScale(el, el.get('customScale') || 1); 
            let newPin = getVisualOrigin(el);
            let p = el.position();
            el.position(p.x + (oldPin.x - newPin.x), p.y + (oldPin.y - newPin.y));
            
            if (dbData && dbData.argDefs) {
                let customArgs = el.get('customArgs') || [];
                let rot = (el.get('angle') || 0); 
                let flipH = el.get('flipH') ? 'h' : '';
                let flipV = el.get('flipV') ? 'v' : '';
                let flipStr = flipH && flipV ? 'hv' : (flipH || flipV || 'none');
                dbData.argDefs.forEach(def => {
                    if (def.type === 'rotflip') customArgs[def.idx - 1] = `${rot},${flipStr}`;
                    else if (def.type === 'flip') customArgs[def.idx - 1] = `${flipStr}`;
                    else if (def.type === 'rotation') customArgs[def.idx - 1] = `${rot}`;
                });
                el.set('customArgs', customArgs);
            }
        }
    });
    exportLatex(); saveState();
}

export function flipVertical() {
    AppState.selectedElements.forEach(el => {
        let dbData = JL_DATABASE[el.get('latexMacro')];
        if(el.get('latexMacro') !== 'connectordot' && (!dbData || dbData.flippable !== false)) {
            let oldPin = getVisualOrigin(el);
            el.set('flipV', !(el.get('flipV') || false));
            el.rotate((360 - (el.get('angle') || 0)) % 360, true);
            applyRobustScale(el, el.get('customScale') || 1);
            let newPin = getVisualOrigin(el);
            let p = el.position();
            el.position(p.x + (oldPin.x - newPin.x), p.y + (oldPin.y - newPin.y));
            
            if (dbData && dbData.argDefs) {
                let customArgs = el.get('customArgs') || [];
                let rot = (el.get('angle') || 0); 
                let flipH = el.get('flipH') ? 'h' : '';
                let flipV = el.get('flipV') ? 'v' : '';
                let flipStr = flipH && flipV ? 'hv' : (flipH || flipV || 'none');
                dbData.argDefs.forEach(def => {
                    if (def.type === 'rotflip') customArgs[def.idx - 1] = `${rot},${flipStr}`;
                    else if (def.type === 'flip') customArgs[def.idx - 1] = `${flipStr}`;
                    else if (def.type === 'rotation') customArgs[def.idx - 1] = `${rot}`;
                });
                el.set('customArgs', customArgs);
            }
        }
    });
    exportLatex(); saveState();
}

export function zoomFit() {
    let bbox = AppState.paper.getContentBBox({ useModelGeometry: true });
    if (!bbox || bbox.width === 0 || bbox.height === 0) {
        AppState.paper.translate(0, 0);
        AppState.zoom = 1.0;
        AppState.paper.scale(AppState.zoom / AppState.PPU_MULT, AppState.zoom / AppState.PPU_MULT);
        document.getElementById('zoom-level').innerText = '100%';
        updateDynamicGrid();
        return;
    }
    AppState.paper.scaleContentToFit({ padding: 150, minScale: 0.1 / AppState.PPU_MULT, maxScale: 1.5 / AppState.PPU_MULT, useModelGeometry: true });
    AppState.zoom = AppState.paper.scale().sx * AppState.PPU_MULT;
    AppState.zoom = Math.round(AppState.zoom * 100) / 100;
    document.getElementById('zoom-level').innerText = Math.round(AppState.zoom * 100) + '%';
    updateDynamicGrid();
}

export function clearCanvas() {
    Swal.fire({
        title: 'Clear entire circuit?',
        text: "This will delete everything on the canvas. You can undo this action.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, clear it!'
    }).then((result) => {
        if (result.isConfirmed) {
            AppState.graph.clear();
            localStorage.removeItem('jlcad_autosave');
            AppState.zoom = 1.0;
            AppState.paper.scale(AppState.zoom / AppState.PPU_MULT, AppState.zoom / AppState.PPU_MULT);
            AppState.paper.translate(0, 0); 
            document.getElementById('zoom-level').innerText = '100%';
            updateDynamicGrid();
			window.rawLatexCode = "";
            document.getElementById('latex-output').innerHTML = "";
            saveState(); 
        }
    });
}