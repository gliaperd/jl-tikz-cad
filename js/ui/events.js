// js/ui/events.js
import { AppState, THEME_COLORS } from '../state.js';
import { clearSelection, saveState, updateToolbarState, copySelected, pasteCopied, deleteSelected, undo, redo } from './actions.js';
import { getVisualOrigin, updateDynamicGrid } from './canvas.js';
import { exportLatex } from '../parsers/latex.js';

export function initializeEvents() {
    const container = document.getElementById('paper-container');
    let isAltDown = false;
    let selectionRect = null, selectionStart = null;
    let dragPanStart = null, groupDragData = null;
    let drawing = false, wire = null;

    // --- KEYBOARD SHORTCUTS ---
    document.addEventListener('keydown', function(e) {
        isAltDown = e.altKey;
        if(e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return; 
        
        if (e.ctrlKey && (e.key === 'z' || e.key === 'Z')) { e.preventDefault(); undo(); }
        else if (e.ctrlKey && (e.key === 'y' || e.key === 'Y')) { e.preventDefault(); redo(); }
        else if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) copySelected();
        else if (e.ctrlKey && (e.key === 'v' || e.key === 'V')) pasteCopied();
        else if (e.key === 'Delete' || e.key === 'Backspace') deleteSelected();
        else if (e.key === 'Escape') {
            e.preventDefault();
            if (drawing && wire) { wire.remove(); drawing = false; wire = null; }
            document.getElementById('tool-pan').click();
        }
    });

    document.addEventListener('keyup', function(e) { isAltDown = e.altKey; });

    // --- TOOL SWITCHING ---
    // Inject a global override style for the crosshair (Restricted to the canvas!)
    if (!document.getElementById('wire-mode-style')) {
        const style = document.createElement('style');
        style.id = 'wire-mode-style';
        // FIX: Only apply the crosshair to the #my-paper container and its children
        style.innerHTML = '.wire-mode #my-paper, .wire-mode #my-paper * { cursor: crosshair !important; }';
        document.head.appendChild(style);
    }

    document.getElementById('tool-draw').addEventListener('click', function() { 
        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active')); 
        this.classList.add('active'); 
        AppState.currentTool = 'wire';
        document.body.classList.add('wire-mode'); // <--- ENFORCE GLOBAL CROSSHAIR
    });
    
    document.getElementById('tool-pan').addEventListener('click', function() { 
        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active')); 
        this.classList.add('active'); 
        AppState.currentTool = 'pan';
        document.body.classList.remove('wire-mode'); // <--- RESTORE CURSORS
    });

    // --- MOUSE INTERACTIONS (PAPER) ---
    AppState.paper.on('blank:pointerdown', function(evt, x, y) {
		if (AppState.currentTool === 'wire') return;
        if (evt.button === 1 || (evt.button === 0 && evt.altKey)) {
            const translate = AppState.paper.translate();
            dragPanStart = { x: evt.clientX, y: evt.clientY, tx: translate.tx, ty: translate.ty };
        } else if (evt.button === 0) {
            clearSelection();
            selectionStart = { x: evt.clientX, y: evt.clientY };
            selectionRect = document.createElement('div');
            selectionRect.className = 'joint-selection-rect';
            document.body.appendChild(selectionRect);
            container.focus();
        }
    });

    document.addEventListener('mousemove', function(evt) {
        if (dragPanStart) {
            AppState.paper.translate(
                dragPanStart.tx + (evt.clientX - dragPanStart.x), 
                dragPanStart.ty + (evt.clientY - dragPanStart.y)
            );
            updateDynamicGrid(); 
        }
        if (selectionStart && selectionRect) {
            const left = Math.min(selectionStart.x, evt.clientX), top = Math.min(selectionStart.y, evt.clientY);
            const width = Math.abs(selectionStart.x - evt.clientX), height = Math.abs(selectionStart.y - evt.clientY);
            selectionRect.style.left = left + 'px';
            selectionRect.style.top = top + 'px';
            selectionRect.style.width = width + 'px';
            selectionRect.style.height = height + 'px';
        }
    });

    document.addEventListener('mouseup', function(evt) {
        dragPanStart = null;
        if (selectionStart && selectionRect) {
            const p1 = AppState.paper.clientToLocalPoint({ x: selectionStart.x, y: selectionStart.y });
            const p2 = AppState.paper.clientToLocalPoint({ x: evt.clientX, y: evt.clientY });
            const selRect = new g.rect(Math.min(p1.x, p2.x), Math.min(p1.y, p2.y), Math.max(1, Math.abs(p1.x - p2.x)), Math.max(1, Math.abs(p1.y - p2.y)));

            AppState.graph.getElements().forEach(el => { 
                if (selRect.intersect(el.getBBox().inflate(2))) { 
                    AppState.selectedElements.push(el); 
                    const v = AppState.paper.findViewByModel(el); if(v) v.highlight(); 
                } 
            });
            AppState.graph.getLinks().forEach(link => { 
                if (selRect.intersect(link.getBBox().inflate(2))) { 
                    AppState.selectedLinks.push(link); 
                    const v = AppState.paper.findViewByModel(link); if(v) v.highlight(); 
                } 
            });

            selectionRect.remove(); selectionRect = null; selectionStart = null;
            exportLatex(); updateToolbarState();
        }
    });

    // --- GROUP DRAGGING ---
    AppState.paper.on('cell:pointerdown', function(cellView) {
		if (AppState.currentTool === 'wire') return;
        container.focus();
        let model = cellView.model;
        if (!AppState.selectedElements.includes(model) && !AppState.selectedLinks.includes(model)) {
            clearSelection();
            if (model.isLink()) AppState.selectedLinks.push(model); else AppState.selectedElements.push(model);
            cellView.highlight();
            exportLatex(); updateToolbarState();			
        }
        
        groupDragData = { originCell: model, startPos: model.isLink() ? null : model.position(), initials: new Map() };
        [...AppState.selectedElements, ...AppState.selectedLinks].forEach(c => {
            if (c.isLink()) groupDragData.initials.set(c.id, { source: _.cloneDeep(c.source()), target: _.cloneDeep(c.target()), vertices: _.cloneDeep(c.vertices() || []) });
            else groupDragData.initials.set(c.id, _.cloneDeep(c.position()));
        });
    });

    AppState.graph.on('change:position', function(cell, newPos, opt) {
        if (opt.groupMove || !groupDragData || groupDragData.originCell !== cell || !groupDragData.startPos) return;
        const dx = newPos.x - groupDragData.startPos.x, dy = newPos.y - groupDragData.startPos.y;

        AppState.selectedElements.forEach(other => {
            if (other === cell) return;
            const init = groupDragData.initials.get(other.id);
            if (init) other.position(init.x + dx, init.y + dy, { groupMove: true });
        });

        AppState.selectedLinks.forEach(other => {
            const init = groupDragData.initials.get(other.id);
            if (init) {
                const s = init.source, t = init.target;
                if (!s.id) other.source({ x: s.x + dx, y: s.y + dy }, { groupMove: true });
                if (!t.id) other.target({ x: t.x + dx, y: t.y + dy }, { groupMove: true });
                if (init.vertices.length) other.vertices(init.vertices.map(v => ({ x: v.x + dx, y: v.y + dy })));
            }
        });
        exportLatex();
    });

    AppState.graph.on('change:source change:target change:vertices', function(cell, newVal, opt) {
        if (opt.groupMove || !groupDragData || groupDragData.originCell !== cell) return;
        const init = groupDragData.initials.get(cell.id);
        if (!init) return;

        let dx = 0, dy = 0;
        const s = cell.source(), t = cell.target();
        if (s && s.x !== undefined && init.source && init.source.x !== undefined) { dx = s.x - init.source.x; dy = s.y - init.source.y; } 
        else if (t && t.x !== undefined && init.target && init.target.x !== undefined) { dx = t.x - init.target.x; dy = t.y - init.target.y; }

        if (dx === 0 && dy === 0) return;

        AppState.selectedElements.forEach(other => {
            const otherInit = groupDragData.initials.get(other.id);
            if (otherInit) other.position(otherInit.x + dx, otherInit.y + dy, { groupMove: true });
        });

        AppState.selectedLinks.forEach(other => {
            if (other === cell) return;
            const otherInit = groupDragData.initials.get(other.id);
            if (otherInit) {
                const os = otherInit.source, ot = otherInit.target;
                if (!os.id) other.source({ x: os.x + dx, y: os.y + dy }, { groupMove: true });
                if (!ot.id) other.target({ x: ot.x + dx, y: ot.y + dy }, { groupMove: true });
                if (otherInit.vertices && otherInit.vertices.length) other.vertices(otherInit.vertices.map(v => ({ x: v.x + dx, y: v.y + dy })));
            }
        });
        exportLatex();
    });

    AppState.paper.on('cell:pointerup', () => { 
        if (groupDragData) saveState(); 
        groupDragData = null; 
    });

    // --- ABSOLUTE GRID SNAPPING ---
    AppState.graph.on('change:position', function(cell, newPos, opt) {
        if (cell.isLink() || opt.snapping || opt.groupMove) return; 

        let snap = isAltDown ? 10 : 40; 
        let snX, snY;
        
        if (cell.get('latexMacro') === 'connectordot') {
            snX = Math.round((newPos.x + 20) / snap) * snap - 20;
            snY = Math.round((newPos.y + 20) / snap) * snap - 20;
        } else {
            let visOrigin = getVisualOrigin(cell, newPos);
            let snappedVisX = Math.round(visOrigin.x / snap) * snap;
            let snappedVisY = Math.round(visOrigin.y / snap) * snap;
            snX = newPos.x + (snappedVisX - visOrigin.x);
            snY = newPos.y + (snappedVisY - visOrigin.y);
        }
        
        if (Math.abs(snX - newPos.x) > 0.01 || Math.abs(snY - newPos.y) > 0.01) {
            cell.position(snX, snY, { snapping: true });
            exportLatex();
        }
    });

    AppState.graph.on('change:vertices', function(link, newVertices, opt) {
        if (opt.snapping || !newVertices || newVertices.length === 0) return;
        let snap = isAltDown ? 10 : 40; 
        let snapped = newVertices.map(v => ({ x: Math.round(v.x / snap) * snap, y: Math.round(v.y / snap) * snap }));
        if (JSON.stringify(newVertices) !== JSON.stringify(snapped)) {
            link.vertices(snapped, { snapping: true });
            exportLatex();
        }
    });

    AppState.graph.on('change:source change:target', function(link, newVal, opt) {
         if (opt.snapping) return;
         let snap = isAltDown ? 10 : 40; 
         let changed = false, s = link.source(), t = link.target();
         if (s && s.x !== undefined && !s.id) {
             let nx = Math.round(s.x / snap) * snap, ny = Math.round(s.y / snap) * snap;
             if (nx !== s.x || ny !== s.y) { s = { x: nx, y: ny }; changed = true; }
         }
         if (t && t.x !== undefined && !t.id) {
             let nx = Math.round(t.x / snap) * snap, ny = Math.round(t.y / snap) * snap;
             if (nx !== t.x || ny !== t.y) { t = { x: nx, y: ny }; changed = true; }
         }
         if (changed) {
             if (s.x !== undefined && !s.id) link.source(s, { snapping: true });
             if (t.x !== undefined && !t.id) link.target(t, { snapping: true });
             exportLatex();
         }
    });


     function getAbsolutePinCoordLocal(el, portId) {
        let port = el.getPort(portId);
        let pos = el.position(); let size = el.size();
        let px = pos.x + port.args.x; let py = pos.y + port.args.y;
        let cx = pos.x + size.width / 2; let cy = pos.y + size.height / 2;
        let rad = (el.get('angle') || 0) * Math.PI / 180;
        let cos = Math.cos(rad); let sin = Math.sin(rad);
        return {
            x: Math.round(cos * (px - cx) - sin * (py - cy) + cx),
            y: Math.round(sin * (px - cx) + cos * (py - cy) + cy)
        };
    }

}