// js/ui/canvas.js
import { AppState, THEME_COLORS } from '../state.js';
import { extractStaticTexts, evaluatePinCondition, getPaletteIconData } from '../parsers/helpers.js';
import { exportLatex } from '../parsers/latex.js';
import { saveState, updateToolbarState } from './actions.js';
import { clearSimAnnotations } from '../engines/spice.js'; 

export function initializeCanvas() {
    // 1. Define Custom Shapes
    window.joint.shapes.jl = {}; 
    
    joint.shapes.jl.ConnectorDot = joint.dia.Element.define('jl.ConnectorDot', {
        size: { width: 40, height: 40 },
        attrs: {
            hitbox: { width: 40, height: 40, fill: '#ffffff', 'fill-opacity': 0.01, stroke: 'none', 'pointer-events': 'all', cursor: 'pointer' },
            dot: { cx: 20, cy: 20, r: 9, fill: '#000000', stroke: 'none', 'pointer-events': 'none' }
        }
    }, { markup: [{ tagName: 'rect', selector: 'hitbox' }, { tagName: 'circle', selector: 'dot' }] });
    
    joint.shapes.jl.Component = joint.dia.Element.define('jl.Component', {
        size: { width: 40, height: 40 },
        attrs: {
            body: { refWidth: '100%', refHeight: '100%', fill: '#ffffff', fillOpacity: 0.01, stroke: 'none', 'pointer-events': 'all', cursor: 'pointer' },
            fo: { display: 'none', width: 1, height: 1, 'pointer-events': 'none' }
        }
    }, {
        markup: [{
            tagName: 'g', selector: 'rotatable', className: 'rotatable',
            children: [
                { tagName: 'text', selector: 'label' },
                { tagName: 'foreignObject', selector: 'fo' },
                { tagName: 'rect', selector: 'body' },
                { tagName: 'g', selector: 'iconGroup', children: [
                    { tagName: 'path', selector: 'iconFill' }, { tagName: 'path', selector: 'iconStroke' }  
                ]}
            ]
        }]
    });
	
	// --- NEW: Self-Healing Wire Logic ---
    const originalRemove = joint.dia.Element.prototype.remove;
    joint.shapes.jl.Component.prototype.remove = function(opt) {
        if (this.get('latexMacro') === 'currentprobe' && AppState.graph) {
            const links = AppState.graph.getConnectedLinks(this);
            
            if (links.length === 2) {
                let l1 = links[0], l2 = links[1];
                
                // Identify exactly how the severed wires were routed into the probe
                let isL1Source = l1.source().id === this.id;
                let isL2Source = l2.source().id === this.id;
                
                let ext1 = isL1Source ? l1.target() : l1.source();
                let ext2 = isL2Source ? l2.target() : l2.source();
                
                // Deep copy preserves logical IDs, Magnets, and Ports! (Fixes the T-Junction detachment)
                let sourceEnd = JSON.parse(JSON.stringify(ext1));
                let targetEnd = JSON.parse(JSON.stringify(ext2));
                
                // Safely extract and orient the L-Bend corners
                let v1 = l1.vertices() || [];
                if (isL1Source) v1.reverse(); 
                
                let v2 = l2.vertices() || [];
                if (!isL2Source) v2.reverse(); 
                
                // The center of the probe acts as the bridge vertex!
                const center = this.getBBox().center();
                const px = Math.round(center.x / 10) * 10;
                const py = Math.round(center.y / 10) * 10;
                
                let mergedVerts = [...v1, {x: px, y: py}, ...v2];
                
                // Acquire absolute endpoints to mathematically strip out overlapping colinear points
                let v1View = AppState.paper.findViewByModel(l1);
                let v2View = AppState.paper.findViewByModel(l2);
                
                if (v1View && v2View && v1View.sourcePoint && v2View.sourcePoint) {
                    let pStart = isL1Source ? v1View.targetPoint : v1View.sourcePoint;
                    let pEnd = isL2Source ? v2View.targetPoint : v2View.sourcePoint;
                    
                    let fullPath = [
                        { x: Math.round(pStart.x/10)*10, y: Math.round(pStart.y/10)*10 },
                        ...mergedVerts,
                        { x: Math.round(pEnd.x/10)*10, y: Math.round(pEnd.y/10)*10 }
                    ];

                    let cleanVerts = [];
                    for (let i = 1; i < fullPath.length - 1; i++) {
                        let prev = fullPath[i-1], curr = fullPath[i], next = fullPath[i+1];
                        // Erase points that form a straight line
                        if (prev.x === curr.x && curr.x === next.x) continue;
                        if (prev.y === curr.y && curr.y === next.y) continue;
                        if (curr.x === prev.x && curr.y === prev.y) continue;
                        cleanVerts.push(curr);
                    }
                    mergedVerts = cleanVerts;
                }

                const theme = THEME_COLORS[AppState.theme] || THEME_COLORS.standard;
                const healedLink = new joint.shapes.standard.Link({
                    attrs: { line: { stroke: theme.wire, strokeWidth: 1.8, targetMarker: null, 'vector-effect': 'non-scaling-stroke' } },
                    connector: { name: 'rounded', args: { radius: 0 } }
                });
                
                healedLink.source(sourceEnd).target(targetEnd).vertices(mergedVerts);
                AppState.graph.addCell(healedLink);
            }
        }
        return originalRemove.call(this, opt);
    };

    joint.shapes.jl.ComponentView = joint.dia.ElementView.extend({
        initialize: function() {
            joint.dia.ElementView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model, 'change:mathHtml', this.updateHTML);
            this.htmlContainer = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
            this.htmlContainer.style.cssText = 'width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; pointer-events: none;';
        },
        render: function() {
            joint.dia.ElementView.prototype.render.apply(this, arguments);
            const fo = this.el.querySelector('foreignObject');
            if (fo && !fo.contains(this.htmlContainer)) fo.appendChild(this.htmlContainer);
            this.updateHTML();
            return this;
        },
        updateHTML: function() {
            let htmlStr = this.model.get('mathHtml');
            if (htmlStr !== undefined) this.htmlContainer.innerHTML = htmlStr;
        }
    });

    // 2. Initialize JointJS Graph & Paper
    AppState.graph = new joint.dia.Graph();
    
    AppState.paper = new joint.dia.Paper({
        el: document.getElementById('my-paper'),
        model: AppState.graph,
        width: '100%', height: '100%', 
        gridSize: 40,
        background: { color: THEME_COLORS.standard.background },
        snapLinks: { radius: 15 },
        linkPinning: false,
        defaultLink: new joint.shapes.standard.Link({
            attrs: { line: { stroke: THEME_COLORS.standard.wire, strokeWidth: 1.8, targetMarker: null, 'vector-effect': 'non-scaling-stroke' } },
            // THE MAGIC: Forces wires to auto-bend at 90 degrees
            router: { name: 'orthogonal', args: { step: 10, padding: 10 } },
            connector: { name: 'rounded', args: { radius: 0 } } // Sharp corners (set radius to 5 for curved corners!)
        }),
        useModelGeometry: true,
        cellViewNamespace: joint.shapes,
        highlighting: {
            'default': { name: 'stroke', options: { padding: 3, rx: 5, ry: 5, attrs: { 'stroke-width': 3, stroke: THEME_COLORS.standard.highlight } } }
        }
    });
	
	// listener for current probe auto-split wire
	AppState.paper.on('element:pointerup', function(cellView) {
        autoSplitWire(cellView.model);
    });

    // 3. Grid & Zoom Setup
    AppState.paper.scale(1 / AppState.PPU_MULT, 1 / AppState.PPU_MULT);
    AppState.paper.on('translate scale', () => {
        updateDynamicGrid();
        // CALL THE NEW FUNCTION
        updateNetNamesVisibility(); 
    });
    AppState.graph.on('change add remove reset', () => {
        clearSimAnnotations();
        // CALL THE NEW FUNCTION
        updateNetNamesVisibility(); 
    });
	// --- TOPOLOGICAL GARBAGE COLLECTOR ---
    window.cleanOrphanedDots = () => {
        let tol = 2;
        let links = AppState.graph.getLinks();
        
        AppState.graph.getElements().forEach(dot => {
            if (dot.get('latexMacro') !== 'connectordot') return;
            
            let pt = { x: dot.position().x + 20, y: dot.position().y + 20 };
            let endpointCount = 0;
            let passThroughCount = 0;
            
            links.forEach(l => {
                let view = AppState.paper.findViewByModel(l);
                if (!view || !view.sourcePoint || !view.targetPoint) return;
                
                // Snap points to grid to strip rendering offsets
                let rawPts = [view.sourcePoint, ...(l.vertices() || []), view.targetPoint];
                let pts = rawPts.map(p => ({ x: Math.round(p.x/10)*10, y: Math.round(p.y/10)*10 }));
                pts = pts.filter((p, i, a) => i === 0 || p.x !== a[i-1].x || p.y !== a[i-1].y);
                if (pts.length < 2) return;
                
                // 1. Count True Endpoints
                let pStart = pts[0], pEnd = pts[pts.length - 1];
                if (Math.abs(pStart.x - pt.x) <= tol && Math.abs(pStart.y - pt.y) <= tol) endpointCount++;
                if (Math.abs(pEnd.x - pt.x) <= tol && Math.abs(pEnd.y - pt.y) <= tol) endpointCount++;
                
                // 2. Count True Pass-Throughs (Strictly internal segments)
                let isThrough = false;
                for (let i = 0; i < pts.length - 1; i++) {
                    let p1 = pts[i], p2 = pts[i+1];
                    if (p1.x === p2.x && Math.abs(pt.x - p1.x) <= tol) {
                        if (pt.y > Math.min(p1.y, p2.y) + tol && pt.y < Math.max(p1.y, p2.y) - tol) isThrough = true;
                    } else if (p1.y === p2.y && Math.abs(pt.y - p1.y) <= tol) {
                        if (pt.x > Math.min(p1.x, p2.x) + tol && pt.x < Math.max(p1.x, p2.x) - tol) isThrough = true;
                    }
                }
                if (isThrough) passThroughCount++;
            });
            
            // SURVIVAL RULES: 
            // 1. Y-Junction (3+ ends) 
            // 2. T-Junction (1 pass-through + 1+ ends) 
            // 3. X-Junction (2+ pass-throughs)
            let isValid = (endpointCount >= 3) || 
                          (passThroughCount >= 1 && endpointCount >= 1) || 
                          (passThroughCount >= 2);
            
            if (!isValid) {
                // SAFETY DETACH: Anchor any remaining wires to the absolute grid coordinate
                // so JointJS doesn't delete them when the dot is destroyed!
                let connectedLinks = AppState.graph.getConnectedLinks(dot);
                connectedLinks.forEach(l => {
                    if (l.source().id === dot.id) l.source({ x: pt.x, y: pt.y });
                    if (l.target().id === dot.id) l.target({ x: pt.x, y: pt.y });
                });
                
                dot.remove();
            }
        });
    };

    // Attach to ANY JointJS cell deletion (Wires, Components, or Probes)
    AppState.graph.on('remove', (cell) => {
        // Wait 20ms for the DOM to clear before sweeping the math
        setTimeout(() => { if (window.cleanOrphanedDots) window.cleanOrphanedDots(); }, 20);
    });
    updateDynamicGrid();
	
	// Center the canvas
    const container = document.getElementById('paper-container');
    container.scrollLeft = 2500 - (container.clientWidth / 2);
    container.scrollTop = 2500 - (container.clientHeight / 2);
    
    // Mousewheel Zoom Logic
    container.addEventListener('wheel', function(e) {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
            if (delta > 0) AppState.zoom = Math.min(AppState.zoom + 0.1, 3);
            else AppState.zoom = Math.max(AppState.zoom - 0.1, 0.2);
            
            let safeScale = AppState.zoom / AppState.PPU_MULT;
            AppState.paper.scale(safeScale, safeScale);
            document.getElementById('zoom-level').innerText = Math.round(AppState.zoom * 100) + '%';
        }
    }, { passive: false });
	
	// Drop-Zone Setup
	setupDropzone();
	
	// =========================================================================
    // PROFESSIONAL EDA ROUTING ENGINE
    // =========================================================================
    let activeWire = null;
    let activeWireStartConnection = null; // <--- ADD THIS LINE!
    let lastClickTime = 0;
    let permanentVertices = [];
    let wireStartPt = null;
    let bendDir = 'H';

    const paperEl = document.getElementById('my-paper');

    // --- MATH HELPER: Get Absolute Pin Coordinate ---
    const getAbsolutePinCoord = (el, portId) => {
        let port = el.getPort(portId);
        if (!port) return null;
        let pos = el.position();
        let size = el.size();
        let px = pos.x + (port.args.x || 0); 
        let py = pos.y + (port.args.y || 0);
        let cx = pos.x + size.width / 2; 
        let cy = pos.y + size.height / 2;
        let rad = (el.get('angle') || 0) * Math.PI / 180;
        let cos = Math.cos(rad); let sin = Math.sin(rad);
        return {
            x: Math.round(cos * (px - cx) - sin * (py - cy) + cx),
            y: Math.round(sin * (px - cx) + cos * (py - cy) + cy)
        };
    };
	window.getAbsolutePinCoord = getAbsolutePinCoord;

    // --- 1. THE GRAVITY WELL: Native JointJS Raycaster ---
    const findClosestSnapTarget = (pt) => {
        let bestDist = 20; 
        let target = { type: 'empty', pt: { x: Math.round(pt.x / 10) * 10, y: Math.round(pt.y / 10) * 10 } };
        
        // Priority 1: Solder Dots
        AppState.graph.getElements().forEach(el => {
            if (el.get('latexMacro') === 'connectordot') {
                const center = { x: el.position().x + 20, y: el.position().y + 20 };
                const d = Math.hypot(center.x - pt.x, center.y - pt.y);
                if (d < bestDist) {
                    bestDist = d;
                    target = { type: 'dot', el: el, pt: { x: Math.round(center.x/10)*10, y: Math.round(center.y/10)*10 } };
                }
            }
        });

        // Priority 2: Pins (Using JointJS's Native View Engine)
        const searchArea = new joint.g.Rect(pt.x - 20, pt.y - 20, 40, 40);
        const views = AppState.paper.findViewsInArea(searchArea);
        
        views.forEach(v => {
            if (v.model.isElement() && v.model.get('latexMacro') !== 'connectordot' && v.model.get('latexMacro') !== 'freetext') {
                // Loop through all ports on this component
                v.model.getPorts().forEach(port => {
                    // Ask JointJS for the exact physical rendered DOM element of this port
                    const portNode = v.el.querySelector(`[port="${port.id}"] [joint-selector="portBody"]`);
                    if (portNode) {
                        // Get the exact center of that DOM element and convert it to graph coordinates
                        const rect = portNode.getBoundingClientRect();
                        const pinCenter = AppState.paper.clientToLocalPoint({ 
                            x: rect.left + rect.width / 2, 
                            y: rect.top + rect.height / 2 
                        });
                        
                        const d = Math.hypot(pinCenter.x - pt.x, pinCenter.y - pt.y);
                        
                        // <= allows Pins to ruthlessly overwrite Wires and Dots at the exact same coordinate
                        if (d <= bestDist) { 
                            bestDist = d;
                            target = { 
                                type: 'pin', 
                                el: v.model, 
                                portId: port.id, 
                                pt: { x: Math.round(pinCenter.x/10)*10, y: Math.round(pinCenter.y/10)*10 } 
                            };
                        }
                    }
                });
            }
        });

        // Priority 3: Wires
        views.forEach(v => {
            if (v.model.isLink() && (!activeWire || v.model.id !== activeWire.id)) {
                const closestPt = v.getClosestPoint(pt);
                if (closestPt) {
                    const d = Math.hypot(closestPt.x - pt.x, closestPt.y - pt.y);
                    if (d < bestDist && d < 15) { // < 15 prevents overriding Pins!
                        bestDist = d;
                        target = { type: 'wire', el: v.model, pt: { x: Math.round(closestPt.x/10)*10, y: Math.round(closestPt.y/10)*10 } };
                    }
                }
            }
        });

        return target;
    };

    // --- 2. TOPOLOGICAL SCANNER: True Nodal Degree Mathematics ---
    const spawnJunctionIfIntersecting = (pt, activeWireObj = null) => {
        let tol = 2; 
        let hasDot = false;
        let isOnPin = false;
        let existingEndpoints = 0;
        let isTJunction = false;
        
        // 1. Check existing Dots
        AppState.graph.getElements().forEach(el => {
            if (el.get('latexMacro') === 'connectordot' && Math.abs((el.position().x + 20) - pt.x) < tol && Math.abs((el.position().y + 20) - pt.y) < tol) {
                hasDot = true;
            }
        });
        if (hasDot) return; 

        // 2. Check Pins
        AppState.graph.getElements().forEach(el => {
            if (el.get('latexMacro') !== 'connectordot' && el.get('latexMacro') !== 'freetext') {
                el.getPorts().forEach(port => {
                    const pinPt = getAbsolutePinCoord(el, port.id);
                    if (pinPt && Math.abs(pinPt.x - pt.x) < tol && Math.abs(pinPt.y - pt.y) < tol) isOnPin = true;
                });
            }
        });
        if (isOnPin) return; // EDA Rule: Never spawn a dot on a pin!

        // 3. Extract the True Entering Vector from the active wire
        let activeDx = 0, activeDy = 0;
        if (activeWireObj) {
            let activePts = [activeWireObj.getSourcePoint(), ...(activeWireObj.vertices() || []), activeWireObj.getTargetPoint()];
            activePts = activePts.map(p => ({ x: Math.round(p.x/10)*10, y: Math.round(p.y/10)*10 }));
            // THE FIX: Strip consecutive duplicates caused by L-bend logic!
            activePts = activePts.filter((p, i, a) => i === 0 || p.x !== a[i-1].x || p.y !== a[i-1].y);
            
            if (activePts.length >= 2) {
                activeDx = activePts[activePts.length-1].x - activePts[activePts.length-2].x;
                activeDy = activePts[activePts.length-1].y - activePts[activePts.length-2].y;
            }
        }

        // 4. Scan existing wires
        AppState.graph.getLinks().forEach(l => {
            if (activeWireObj && l.id === activeWireObj.id) return; 

            const linkView = AppState.paper.findViewByModel(l);
            if (!linkView || !linkView.sourcePoint || !linkView.targetPoint) return;

            let rawPts = [linkView.sourcePoint, ...(l.vertices() || []), linkView.targetPoint];
            let pts = rawPts.map(p => ({ x: Math.round(p.x/10)*10, y: Math.round(p.y/10)*10 }));
            // Clean up existing wire duplicates just in case
            pts = pts.filter((p, i, a) => i === 0 || p.x !== a[i-1].x || p.y !== a[i-1].y);
            if (pts.length < 2) return;

            // Did we snap to an existing Endpoint?
            let pStart = pts[0], pEnd = pts[pts.length - 1];
            if (Math.abs(pStart.x - pt.x) <= tol && Math.abs(pStart.y - pt.y) <= tol) existingEndpoints++;
            else if (Math.abs(pEnd.x - pt.x) <= tol && Math.abs(pEnd.y - pt.y) <= tol) existingEndpoints++;

            // Did we snap STRICTLY inside a segment?
            for (let i = 0; i < pts.length - 1; i++) {
                let p1 = pts[i], p2 = pts[i+1];
                
                // Vertical Line Check
                if (p1.x === p2.x && Math.abs(pt.x - p1.x) <= tol) {
                    let minY = Math.min(p1.y, p2.y);
                    let maxY = Math.max(p1.y, p2.y);
                    if (pt.y > minY + tol && pt.y < maxY - tol) { 
                        // It is a T-Junction if we are coming in horizontally!
                        if (!activeWireObj || Math.abs(activeDx) > 0) isTJunction = true;
                    }
                }
                // Horizontal Line Check
                else if (p1.y === p2.y && Math.abs(pt.y - p1.y) <= tol) {
                    let minX = Math.min(p1.x, p2.x);
                    let maxX = Math.max(p1.x, p2.x);
                    if (pt.x > minX + tol && pt.x < maxX - tol) { 
                        // It is a T-Junction if we are coming in vertically!
                        if (!activeWireObj || Math.abs(activeDy) > 0) isTJunction = true;
                    }
                }
            }
        });

        // 5. SPAWN RULES
        if (isTJunction || existingEndpoints >= 2) {
            let dot = new joint.shapes.jl.ConnectorDot();
            dot.addPort({ id: 'p1', group: 'absolute', args: {x: 20, y: 20}, markup: '<g/>' });
            dot.set({'latexMacro': 'connectordot', 'offsetX': -20, 'offsetY': -20});
            dot.position(pt.x - 20, pt.y - 20);
            dot.attr('dot/fill', THEME_COLORS[AppState.theme].dot);
            dot.addTo(AppState.graph);
        }
    };

    // --- 3. POST-ROUTING AUTO-HEALER: Flawless Segment Merging ---
    const mergeColinearWires = (newWire) => {
        if (!newWire) return;
        let pts = [newWire.getSourcePoint(), ...(newWire.vertices() || []), newWire.getTargetPoint()];
        // Clean up zero-length double-click artifacts
        pts = pts.filter((p, i, a) => i === 0 || Math.abs(p.x - a[i-1].x) > 1 || Math.abs(p.y - a[i-1].y) > 1);
        
        if (pts.length !== 2) return; // Only merge pure straight lines
        
        let w1_h = (Math.abs(pts[0].y - pts[1].y) < 1);
        let w1_v = (Math.abs(pts[0].x - pts[1].x) < 1);
        if (!w1_h && !w1_v) return;

        let links = AppState.graph.getLinks();
        for (let other of links) {
            if (other.id === newWire.id) continue;
            let oPts = [other.getSourcePoint(), ...(other.vertices() || []), other.getTargetPoint()];
            oPts = oPts.filter((p, i, a) => i === 0 || Math.abs(p.x - a[i-1].x) > 1 || Math.abs(p.y - a[i-1].y) > 1);
            if (oPts.length !== 2) continue; 
            
            let w2_h = (Math.abs(oPts[0].y - oPts[1].y) < 1);
            let w2_v = (Math.abs(oPts[0].x - oPts[1].x) < 1);
            
            // Merge Horizontal Overlaps
            if (w1_h && w2_h && Math.abs(pts[0].y - oPts[0].y) < 1) {
                let minX1 = Math.min(pts[0].x, pts[1].x), maxX1 = Math.max(pts[0].x, pts[1].x);
                let minX2 = Math.min(oPts[0].x, oPts[1].x), maxX2 = Math.max(oPts[0].x, oPts[1].x);
                if (Math.max(minX1, minX2) <= Math.min(maxX1, maxX2) + 1) { 
                    other.source({ x: Math.min(minX1, minX2), y: pts[0].y });
                    other.target({ x: Math.max(maxX1, maxX2), y: pts[0].y });
                    let nSrc = newWire.source(), nTgt = newWire.target();
                    if (nSrc.id) other.source(nSrc);
                    if (nTgt.id) other.target(nTgt);
                    newWire.remove(); return; 
                }
            }
            // Merge Vertical Overlaps
            else if (w1_v && w2_v && Math.abs(pts[0].x - oPts[0].x) < 1) {
                let minY1 = Math.min(pts[0].y, pts[1].y), maxY1 = Math.max(pts[0].y, pts[1].y);
                let minY2 = Math.min(oPts[0].y, oPts[1].y), maxY2 = Math.max(oPts[0].y, oPts[1].y);
                if (Math.max(minY1, minY2) <= Math.min(maxY1, maxY2) + 1) {
                    other.source({ x: pts[0].x, y: Math.min(minY1, minY2) });
                    other.target({ x: pts[0].x, y: Math.max(maxY1, maxY2) });
                    let nSrc = newWire.source(), nTgt = newWire.target();
                    if (nSrc.id) other.source(nSrc);
                    if (nTgt.id) other.target(nTgt);
                    newWire.remove(); return;
                }
            }
        }
    };

    // --- 4. THE INTERCEPTOR: Seize control of the clicks ---
    paperEl.addEventListener('mousedown', (e) => {
        if (e.button !== 0 || AppState.currentTool !== 'wire') return;
        e.stopPropagation(); 

        const rawPt = AppState.paper.clientToLocalPoint({ x: e.clientX, y: e.clientY });
        let snapTgt = findClosestSnapTarget(rawPt);
        
        if (snapTgt.type === 'empty' && e.altKey) {
            snapTgt.pt = { x: Math.round(rawPt.x / 5) * 5, y: Math.round(rawPt.y / 5) * 5 };
        }

        const jointView = AppState.paper.findView(e.target);
        const isComponentBody = jointView && jointView.model.isElement() && snapTgt.type === 'empty';

        if (!activeWire) {
            if (isComponentBody) return; 

            const theme = THEME_COLORS[AppState.theme] || THEME_COLORS.standard;
            permanentVertices = [];
            wireStartPt = snapTgt.pt;
            bendDir = 'H';
            
            activeWireStartConnection = snapTgt;

            activeWire = new joint.shapes.standard.Link({
                attrs: { line: { stroke: theme.wire, strokeWidth: 1.8, targetMarker: null, 'vector-effect': 'non-scaling-stroke' } },
                connector: { name: 'rounded', args: { radius: 0 } }
            });
            
            activeWire.source(snapTgt.pt);
            activeWire.target(snapTgt.pt);
            activeWire.addTo(AppState.graph);
            
            spawnJunctionIfIntersecting(snapTgt.pt, activeWire);
            
        } else {
            let lastPt = permanentVertices.length > 0 ? permanentVertices[permanentVertices.length - 1] : wireStartPt;
            let cornerPt = bendDir === 'H' ? { x: snapTgt.pt.x, y: lastPt.y } : { x: lastPt.x, y: snapTgt.pt.y };

            const commitFinalCorner = () => {
                if ((cornerPt.x !== lastPt.x || cornerPt.y !== lastPt.y) && (cornerPt.x !== snapTgt.pt.x || cornerPt.y !== snapTgt.pt.y)) {
                    permanentVertices.push(cornerPt);
                }
            };

            const finalizeWire = () => {
                let finishedWire = activeWire;
                activeWire = null;

                if (activeWireStartConnection.type === 'pin') finishedWire.source({ id: activeWireStartConnection.el.id, port: activeWireStartConnection.portId, magnet: 'portBody', anchor: {name:'center'}, connectionPoint: {name:'anchor'} });
                else if (activeWireStartConnection.type === 'dot') finishedWire.source({ id: activeWireStartConnection.el.id, anchor: {name:'center'}, connectionPoint: {name:'anchor'} });

                if (snapTgt.type === 'pin') finishedWire.target({ id: snapTgt.el.id, port: snapTgt.portId, magnet: 'portBody', anchor: {name:'center'}, connectionPoint: {name:'anchor'} });
                else if (snapTgt.type === 'dot') finishedWire.target({ id: snapTgt.el.id, anchor: {name:'center'}, connectionPoint: {name:'anchor'} });
                else finishedWire.target(snapTgt.pt);

                mergeColinearWires(finishedWire);
                if (typeof saveState === 'function') saveState();
                if (typeof exportLatex === 'function') exportLatex();
                if (typeof updateToolbarState === 'function') updateToolbarState();
            };

            if (snapTgt.type === 'pin' || snapTgt.type === 'dot' || snapTgt.type === 'wire') {
                commitFinalCorner();
                activeWire.vertices(permanentVertices);
                if (snapTgt.type !== 'dot') spawnJunctionIfIntersecting(snapTgt.pt, activeWire);
                finalizeWire();
            } else if (isComponentBody) {
                return; 
            } else {
                let now = Date.now();
                if (now - lastClickTime < 300) {
                    commitFinalCorner();
                    activeWire.vertices(permanentVertices);
                    spawnJunctionIfIntersecting(snapTgt.pt, activeWire);
                    finalizeWire();
                } else {
                    if (cornerPt.x !== lastPt.x || cornerPt.y !== lastPt.y) {
                        permanentVertices.push(cornerPt);
                        bendDir = bendDir === 'H' ? 'V' : 'H';
                    }
                }
            }
        }
        lastClickTime = Date.now();
    }, true);

    // --- 5. THE L-BEND LIVE PREVIEW ENGINE ---
    paperEl.addEventListener('mousemove', (e) => {
        if (AppState.currentTool !== 'wire' || !activeWire) return;
        
        const rawPt = AppState.paper.clientToLocalPoint({ x: e.clientX, y: e.clientY });
        let snapTgt = findClosestSnapTarget(rawPt);
        
        if (snapTgt.type === 'empty' && e.altKey) {
            snapTgt.pt = { x: Math.round(rawPt.x / 5) * 5, y: Math.round(rawPt.y / 5) * 5 };
        }

        let lastPt = permanentVertices.length > 0 ? permanentVertices[permanentVertices.length - 1] : wireStartPt;
        let tempVertex = bendDir === 'H' ? { x: snapTgt.pt.x, y: lastPt.y } : { x: lastPt.x, y: snapTgt.pt.y };
        
        if (snapTgt.pt.x !== lastPt.x && snapTgt.pt.y !== lastPt.y) {
            activeWire.vertices([...permanentVertices, tempVertex]);
        } else {
            activeWire.vertices(permanentVertices);
        }
        activeWire.target(snapTgt.pt);
    });

    // 3. KEYBOARD SHORTCUTS (Spacebar = Flip Bend, Escape = Cancel)
    document.addEventListener('keydown', (e) => {
        if (activeWire && e.code === 'Space') {
            e.preventDefault(); // Stop page from scrolling
            bendDir = bendDir === 'H' ? 'V' : 'H'; 
            // The preview will instantly snap to the flipped direction on the next pixel of mouse movement!
        }
        if (e.key === 'Escape' && activeWire) {
            activeWire.remove();
            activeWire = null;
        }
    });

    // 4. PROFESSIONAL EDITING: Unlock interactive segment draggers!
    AppState.paper.on('link:pointerclick', function(linkView) {
        if (activeWire) return; // Don't show handles if we are actively routing
        AppState.paper.hideTools(); 
        
        var toolsView = new joint.dia.ToolsView({
            tools: [
                new joint.linkTools.Vertices(), // Double click to add/remove corners
                new joint.linkTools.Segments(), // Click and drag an entire horizontal/vertical line segment!
                new joint.linkTools.Remove({ distance: 20 }) // Red 'X' to delete the wire
            ]
        });
        linkView.addTools(toolsView);
    });

    AppState.paper.on('blank:pointerdown', () => {
        if (!activeWire) AppState.paper.hideTools();
    });
    // =========================================================================
}

export function updateDynamicGrid() {
    if (!AppState.paper) return;
    let t = AppState.paper.translate();
    let s = AppState.paper.scale().sx;
    const theme = THEME_COLORS[AppState.theme]; 
    let dotSize = 40 * s; 
    let dotRadius = Math.max(theme.gridBase, theme.gridZoom * s); 

    $('#my-paper').css({
        'background-color': theme.background, 
        'background-image': `radial-gradient(circle at 0px 0px, ${theme.grid} ${dotRadius}px, transparent ${dotRadius + 0.5}px)`,
        'background-size': `${dotSize}px ${dotSize}px`,
        'background-position': `${t.tx}px ${t.ty}px`
    });
}

// =========================================================================
// THE COMPONENT BUILDER ENGINE
// =========================================================================

export function combineMathHtml(el) {
    let mainHtml = el.get('mathHtmlMain') || '';
    let pinsHtml = el.get('mathHtmlPins') || '';
    let combined = mainHtml + pinsHtml;
    
    el.set('mathHtml', combined);
    
    if (combined.trim() !== '') {
        el.attr('fo/display', 'block');
        el.attr('fo/x', 0);        
        el.attr('fo/y', 0);        
        el.attr('fo/width', 1);    
        el.attr('fo/height', 1);   
        el.attr('fo/style', 'overflow: visible; pointer-events: none;');
    } else {
        el.attr('fo/display', 'none');
    }
}

export function updateElementLabel(el, newText) {
    if (newText !== undefined) el.set('displayedText', newText);
    let text = el.get('displayedText') || "";
    
    let isFreeText = el.get('latexMacro') === 'freetext';
    let scale = el.get('customScale') || 1; 
    let lblOffsetX = el.get('labelOffsetX') || 0;
    let lblOffsetY = el.get('labelOffsetY') || 0;
    
    let isEmpty = text.trim() === "";
    let displayText = text;
    if (isEmpty && isFreeText) displayText = "[ Empty ]"; 

    let isMath = displayText.includes('$');
    let fontSize = isFreeText ? Math.round(14 * AppState.PPU_MULT * scale) : 12 * AppState.PPU_MULT; 
    
    let renderedContent = displayText;
    if (isMath) {
        renderedContent = displayText.replace(/\$(.*?)\$/g, (match, mathExpr) => {
            try { return katex.renderToString(mathExpr, { throwOnError: false, displayMode: false }); } 
            catch(e) { return match; }
        });
    }

    if (isFreeText) { 
        let tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.visibility = 'hidden'; 
        tempDiv.style.whiteSpace = 'nowrap';
        tempDiv.style.fontSize = fontSize + 'px';
        if (isMath) tempDiv.innerHTML = renderedContent;
        else tempDiv.innerText = displayText;
        document.body.appendChild(tempDiv);
        let dynamicW = tempDiv.offsetWidth + (30 * scale); 
        let dynamicH = tempDiv.offsetHeight + (20 * scale); 
        document.body.removeChild(tempDiv);

        let finalW = Math.max(80 * scale, dynamicW);
        let finalH = Math.max(40 * scale, dynamicH);
        el.resize(finalW, finalH);
        el.set('baseWidth', finalW / scale);
        el.set('baseHeight', finalH / scale);
    }
    
    let macro = el.get('latexMacro');
    let data = JL_DATABASE[macro];
    let centerX, centerY;

    if (data && data.labelAnchor) {
        let flipH = el.get('flipH') || false;
        let flipV = el.get('flipV') || false;
        let shiftX = (el.get('baseShiftX') !== undefined ? el.get('baseShiftX') : (el.get('shiftX') || 0)) * scale;
        let shiftY = (el.get('baseShiftY') !== undefined ? el.get('baseShiftY') : (el.get('shiftY') || 0)) * scale;

        let ax, ay;
        let currentDir = data.labelAnchor.dir;
        
        if (data.labelAnchor.auto) {
            let vTopRaw = el.get('baseVisualTop') || 0;
            let vBotRaw = el.get('baseVisualBottom') || (el.get('baseHeight') || 40);
            let vLeftRaw = el.get('baseVisualLeft') || 0;
            let vRightRaw = el.get('baseVisualRight') || (el.get('baseWidth') || 40);
            
            let rawX, rawY;
            if (currentDir === 'T') { rawX = (vLeftRaw + vRightRaw) / 2; rawY = vTopRaw; }
            else if (currentDir === 'B') { rawX = (vLeftRaw + vRightRaw) / 2; rawY = vBotRaw; }
            else if (currentDir === 'L') { rawX = vLeftRaw; rawY = (vTopRaw + vBotRaw) / 2; }
            else if (currentDir === 'R') { rawX = vRightRaw; rawY = (vTopRaw + vBotRaw) / 2; }
            
            ax = rawX * scale; ay = rawY * scale; 

            if (flipH) {
                let bw = (el.get('baseWidth') || (el.size().width / scale)) * scale;
                ax = bw - ax;
                if (currentDir === 'L') currentDir = 'R'; else if (currentDir === 'R') currentDir = 'L';
            }
            if (flipV) {
                let bh = (el.get('baseHeight') || (el.size().height / scale)) * scale;
                ay = bh - ay;
                if (currentDir === 'T') currentDir = 'B'; else if (currentDir === 'B') currentDir = 'T';
            }
        } else {
            let rawX = data.labelAnchor.x * AppState.PPU_MULT;
            let rawY = data.labelAnchor.y * AppState.PPU_MULT;
            
            if (flipH) { rawX = -rawX; if (currentDir === 'L') currentDir = 'R'; else if (currentDir === 'R') currentDir = 'L'; }
            if (flipV) { rawY = -rawY; if (currentDir === 'T') currentDir = 'B'; else if (currentDir === 'B') currentDir = 'T'; }

            ax = (rawX * scale) + shiftX; ay = (rawY * scale) + shiftY;
        }

        let gap = 10 * AppState.PPU_MULT;
        if (currentDir === 'T') ay -= gap;
        if (currentDir === 'B') ay += gap;
        if (currentDir === 'L') ax -= gap;
        if (currentDir === 'R') ax += gap;

        centerX = ax + lblOffsetX; centerY = ay + lblOffsetY;
    } else {
            let bottomY = el.size().height / 2; 
            if (!isFreeText) {
                let ports = el.getPorts();
                if (ports && ports.length > 0) bottomY = Math.max(...ports.map(p => el.portProp(p.id, 'args/y')));
                else bottomY = el.size().height; 
            }
            centerX = (el.size().width / 2) + lblOffsetX;
            centerY = (isFreeText ? el.size().height / 2 : bottomY + (10 * AppState.PPU_MULT)) + lblOffsetY;
        }

    let themeObj = THEME_COLORS[AppState.theme] || THEME_COLORS.standard;
    let txtColor = isFreeText ? themeObj.freeText : themeObj.componentLabel;

    let rawAngle = el.get('angle') || 0;
    let normalizedAngle = (rawAngle % 360 + 360) % 360;
    let localRot = 0;
    
    let isExplicitlyOriented = false;
    if (data && data.argNames) {
        let customArgs = el.get('customArgs') || [];
        for (let i = 0; i < data.argsCount; i++) {
            let desc = data.argNames[i] ? data.argNames[i].name.toLowerCase() : "";
            if (desc.includes('horizontal') && desc.includes('vertical')) {
                let val = customArgs[i] ? customArgs[i].toString().toLowerCase().trim() : "";
                if (val === 'vertical' || val === 'horizontal') isExplicitlyOriented = true;
                break;
            }
        }
    }

    if (isExplicitlyOriented) localRot = -rawAngle;
    else if (normalizedAngle >= 90 && normalizedAngle < 270) localRot = 180;
    
    if (isFreeText) {
        localRot = 0;
        if (normalizedAngle >= 90 && normalizedAngle < 270) localRot = 180;
    }

    let lblAlign = "middle";
    let htmlTransformX = "-50%";
    
    if (data && data.labelAnchor) {
        let flipH = el.get('flipH') || false; let flipV = el.get('flipV') || false;
        let effectiveDir = data.labelAnchor.dir;

        if (flipH) { if (effectiveDir === 'L') effectiveDir = 'R'; else if (effectiveDir === 'R') effectiveDir = 'L'; }
        if (flipV) { if (effectiveDir === 'T') effectiveDir = 'B'; else if (effectiveDir === 'B') effectiveDir = 'T'; }

        if (isExplicitlyOriented) {
            let visualDir = effectiveDir;
            if (normalizedAngle === 90) {
                if (effectiveDir === 'L') visualDir = 'T'; else if (effectiveDir === 'R') visualDir = 'B';
                else if (effectiveDir === 'T') visualDir = 'R'; else if (effectiveDir === 'B') visualDir = 'L';
            } else if (normalizedAngle === 180) {
                if (effectiveDir === 'L') visualDir = 'R'; else if (effectiveDir === 'R') visualDir = 'L';
                else if (effectiveDir === 'T') visualDir = 'B'; else if (effectiveDir === 'B') visualDir = 'T';
            } else if (normalizedAngle === 270) {
                if (effectiveDir === 'L') visualDir = 'B'; else if (effectiveDir === 'R') visualDir = 'T';
                else if (effectiveDir === 'T') visualDir = 'L'; else if (effectiveDir === 'B') visualDir = 'R';
            }
            if (visualDir === 'L') { lblAlign = "end"; htmlTransformX = "-100%"; }
            else if (visualDir === 'R') { lblAlign = "start"; htmlTransformX = "0%"; }
            else { lblAlign = "middle"; htmlTransformX = "-50%"; }
        } else {
            if (effectiveDir === 'L') { lblAlign = "end"; htmlTransformX = "-100%"; }
            else if (effectiveDir === 'R') { lblAlign = "start"; htmlTransformX = "0%"; }
            
            if (localRot === 180) {
                if (lblAlign === "start") { lblAlign = "end"; htmlTransformX = "-100%"; }
                else if (lblAlign === "end") { lblAlign = "start"; htmlTransformX = "0%"; }
            }
        }
    }

    let hideLabel = el.get('customHideLabel');
    if (hideLabel === undefined) hideLabel = data && data.hideLabel === true;

    if (hideLabel) {
        el.attr('label/display', 'none'); el.set('mathHtmlMain', '');
    } else if (isMath) {
        el.attr('label/display', 'none'); 
        let htmlStr = `
            <div style="position: relative; width: 0px; height: 0px;">
                <div style="position: absolute; left: ${centerX}px; top: ${centerY}px; transform: translate(${htmlTransformX}, -50%) rotate(${localRot}deg); white-space: nowrap; font-size: ${fontSize}px; color: ${txtColor}; opacity: ${isEmpty ? 0.3 : 1}; pointer-events: none;">
                    ${renderedContent}
                </div>
            </div>`;
        el.set('mathHtmlMain', htmlStr); 
    } else {
        el.attr('label/display', 'block'); 
        el.attr('label/text', displayText);
        el.attr('label/fill', txtColor);
        el.attr('label/refX', null); el.attr('label/refX2', null); 
        el.attr('label/refY', null); el.attr('label/refY2', null); 
        el.attr('label/x', centerX); el.attr('label/y', centerY);
        el.attr('label/dominant-baseline', 'central');
        el.attr('label/text-anchor', lblAlign);
        el.attr('label/transform', `rotate(${localRot}, ${centerX}, ${centerY})`);
        el.attr('label/fontSize', fontSize);
        el.attr('label/opacity', isEmpty ? 0.3 : 1);
        el.set('mathHtmlMain', ''); 
    }
    combineMathHtml(el); 
}

export function assembleIcon(el, argsArray) {
    let macro = el.get('latexMacro');
    let dbData = JL_DATABASE[macro];
    if (!dbData) return;

    let resolvedArgsArray = argsArray.map((val, idx) => {
        let argDef = dbData.argNames && dbData.argNames[idx];
        if (argDef && (argDef.name.toLowerCase() === 'name' || argDef.name.toLowerCase() === 'text')) {
            if (!val || val === '$NAME$') return el.get('displayedText') || dbData.name;
        }
        return val;
    });

    const theme = THEME_COLORS[AppState.theme] || THEME_COLORS.standard;
    let dynLabels = el.get('dynamicLabels') || [];
    let basePath = dbData.iconBase || dbData.icon || "";

    let matchedLayers = [];
    if (dbData.iconLayers) {
        dbData.iconLayers.forEach(layer => {
            if (evaluatePinCondition(layer.condition, resolvedArgsArray)) matchedLayers.push({ ...layer });
        });
    }

    if (dbData.shapeGenerator) {
        try {
            const buildShape = new Function('args', dbData.shapeGenerator);
            let jsArgs = ["", ...resolvedArgsArray];
            const generated = buildShape(jsArgs);
            
            if (generated.pins) generated.pins.forEach(p => { p.x *= AppState.PPU_MULT; p.y *= AppState.PPU_MULT; });
            
            basePath = generated.pathStr;
            matchedLayers = [];
            
            let scale = el.get('customScale') || 1;
            let shiftX = (el.get('baseShiftX') !== undefined ? el.get('baseShiftX') : (el.get('shiftX') || 0)) * scale;
            let shiftY = (el.get('baseShiftY') !== undefined ? el.get('baseShiftY') : (el.get('shiftY') || 0)) * scale;
            let flipH = el.get('flipH') || false; let flipV = el.get('flipV') || false;
            let w = el.size().width; let h = el.size().height;

            let newBasePorts = {};
            let bbox = { x: 0, y: 0, width: 0, height: 0 };
            if (generated.pathStr) {
                let cleanMeasurePath = extractStaticTexts(generated.pathStr).cleanPath;
                const tempSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                const tempPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                tempPath.setAttribute('d', cleanMeasurePath);
                tempSvg.appendChild(tempPath);
                Object.assign(tempSvg.style, { position: 'absolute', top: '-9999px', opacity: 0.01, pointerEvents: 'none' });
                document.body.appendChild(tempSvg);
                try { bbox = tempPath.getBBox(); } catch(e){}
                document.body.removeChild(tempSvg);
            }

            const xs = generated.pins.map(p => p.x); const ys = generated.pins.map(p => p.y);
            const minPinX = xs.length ? Math.min(...xs) : 0; const maxPinX = xs.length ? Math.max(...xs) : 0;
            const minPinY = ys.length ? Math.min(...ys) : 0; const maxPinY = ys.length ? Math.max(...ys) : 0;

            let hasBounds = bbox.width > 0 || bbox.height > 0;
            const absMinX = hasBounds ? Math.min(minPinX, bbox.x * AppState.PPU_MULT) : minPinX;
            const absMaxX = hasBounds ? Math.max(maxPinX, (bbox.x + bbox.width) * AppState.PPU_MULT) : maxPinX;
            const absMinY = hasBounds ? Math.min(minPinY, bbox.y * AppState.PPU_MULT) : minPinY;
            const absMaxY = hasBounds ? Math.max(maxPinY, (bbox.y + bbox.height) * AppState.PPU_MULT) : maxPinY;

            const pad = 10; 
            const boxOriginX = Math.floor((absMinX - pad) / 40) * 40;
            const boxOriginY = Math.floor((absMinY - pad) / 40) * 40;
            const boxMaxX = Math.ceil((absMaxX + pad) / 40) * 40;
            const boxMaxY = Math.ceil((absMaxY + pad) / 40) * 40;

            const boxWidth = Math.max(boxMaxX - boxOriginX, 40);
            const boxHeight = Math.max(boxMaxY - boxOriginY, 40);

            let baseShiftX = -boxOriginX; let baseShiftY = -boxOriginY;
            shiftX = baseShiftX * scale; shiftY = baseShiftY * scale;

            el.set({
                'baseWidth': boxWidth, 'baseHeight': boxHeight,
                'baseShiftX': baseShiftX, 'baseShiftY': baseShiftY,
                'baseVisualTop': absMinY - boxOriginY, 'baseVisualBottom': absMaxY - boxOriginY,
                'baseVisualLeft': absMinX - boxOriginX, 'baseVisualRight': absMaxX - boxOriginX
            });
            el.resize(boxWidth * scale, boxHeight * scale);

            let newPorts = generated.pins.map(p => {
                newBasePorts[p.id] = { x: p.x, y: p.y }; 
                let px = (p.x * scale) + shiftX; let py = (p.y * scale) + shiftY;
                if (flipH) px = w - px; if (flipV) py = h - py;
                let labelText = p.label !== undefined ? p.label : "";
                
                return {
                    id: p.id, group: 'absolute', args: { x: Math.round(px), y: Math.round(py) }, 
                    markup: [ { tagName: 'rect', selector: 'portBody' }, { tagName: 'text', selector: 'portLabel' } ],
                    attrs: {
                        portBody: { width: 8 * AppState.PPU_MULT, height: 8 * AppState.PPU_MULT, x: -4 * AppState.PPU_MULT, y: -4 * AppState.PPU_MULT, fill: theme.portBody },
                        portLabel: { text: labelText, display: 'block', fontSize: 9 * AppState.PPU_MULT, fill: theme.portLabel, fontWeight: 'bold', fontFamily: 'var(--font-code)', x: 6 * AppState.PPU_MULT, y: -6 * AppState.PPU_MULT, textAnchor: 'start' }
                    }
                };
            });
            
            el.set('basePorts', newBasePorts); 
            el.removePorts(); el.addPorts(newPorts);
        } catch (error) { console.error("Shape Generator Failed for: " + macro, error); }
    }

    let dynamicMarkup = [{
        tagName: 'g', selector: 'rotatable', className: 'rotatable', children: [
            { tagName: 'text', selector: 'label' },
            { tagName: 'foreignObject', selector: 'fo' },
            { tagName: 'rect', selector: 'body' },
            { tagName: 'g', selector: 'iconGroup', children: [
                { tagName: 'path', selector: 'iconFill' }, { tagName: 'path', selector: 'iconStroke' }
            ]}
        ]
    }];

    let staticTexts = [];
    
        // --- THE "NO-SHRED" SANITIZER ---
        const sanitizePath = (pth) => {
            if (!pth) return "";
            // 1. Split ONLY at 'M ' or 'm ' (MoveTo commands) so we don't accidentally shred 
            // words like "NaN" or "mal" into individual SVG command letters!
            return pth.split(/(?=[Mm]\s)/).filter(subPath => {
                // 2. If the sub-path contains NaN, undefined, or null, throw the whole block in the trash.
                return !/NaN|undefined|null/i.test(subPath);
            }).join(' ').trim();
        };

    let baseExtracted = extractStaticTexts(basePath);
    basePath = sanitizePath(baseExtracted.cleanPath);
    baseExtracted.texts.forEach((t, idx) => staticTexts.push({ ...t, id: `baseTxt_${idx}` }));

    matchedLayers.forEach((layer, i) => {
        let lExtracted = extractStaticTexts(layer.path);
        layer.path = sanitizePath(lExtracted.cleanPath);
        lExtracted.texts.forEach((t, idx) => staticTexts.push({ ...t, id: `lyrTxt_${i}_${idx}` }));
        dynamicMarkup[0].children[3].children.push({ tagName: 'path', selector: `overlay_${i}`, attributes: { fill: 'transparent' } });
    });

    staticTexts.forEach(t => { dynamicMarkup[0].children[3].children.push({ tagName: 'text', selector: t.id }); });
    dynLabels.forEach((lbl, i) => { dynamicMarkup[0].children[3].children.push({ tagName: 'text', selector: `dynLbl_${i}` }); });

    el.set('markup', dynamicMarkup);

    let scale = el.get('customScale') || 1;
    let shiftX = (el.get('baseShiftX') !== undefined ? el.get('baseShiftX') : (el.get('shiftX') || 0)) * scale;
    let shiftY = (el.get('baseShiftY') !== undefined ? el.get('baseShiftY') : (el.get('shiftY') || 0)) * scale;
    let flipH = el.get('flipH') || false; let flipV = el.get('flipV') || false;
    let sx = flipH ? -1 : 1; let sy = flipV ? -1 : 1;
    let w = el.size().width, h = el.size().height;

    el.attr('iconGroup/transform', `translate(${w/2},${h/2}) scale(${sx},${sy}) translate(${-w/2},${-h/2}) translate(${shiftX},${shiftY}) scale(${AppState.PPU_MULT * scale})`);

    let baseStrokeWidth = 1.8, baseStrokeColor = theme.componentIcon, baseDashed = 'none', baseLineCap = 'butt', baseLineJoin = 'miter';
    if (dbData.iconBaseStyle) {
        if (dbData.iconBaseStyle.includes('stroke-width=')) baseStrokeWidth = parseFloat(dbData.iconBaseStyle.match(/stroke-width=([\d\.]+)/)[1]);
        if (dbData.iconBaseStyle.includes('stroke=')) baseStrokeColor = dbData.iconBaseStyle.match(/stroke=([^,\]]+)/)[1].trim();
        if (dbData.iconBaseStyle.includes('stroke-dasharray')) baseDashed = '4,4';
        if (dbData.iconBaseStyle.includes('rounded=true')) { baseLineCap = 'round'; baseLineJoin = 'round'; }
    }

    el.attr('iconFill/d', basePath);
    el.attr('iconFill/fill', dbData.filled ? theme.componentIcon : 'none');
    el.attr('iconStroke/d', basePath);
    el.attr('iconStroke/stroke', el.get('latexMacro') === 'freetext' ? 'transparent' : baseStrokeColor);
    el.attr('iconStroke/stroke-width', baseStrokeWidth);
    el.attr('iconStroke/stroke-dasharray', baseDashed);
    el.attr('iconStroke/stroke-linecap', baseLineCap);
    el.attr('iconStroke/stroke-linejoin', baseLineJoin);
    el.attr('iconStroke/fill', 'none');
    el.attr('iconStroke/vector-effect', 'non-scaling-stroke');
    el.attr('iconFill/vector-effect', 'non-scaling-stroke');

    matchedLayers.forEach((layer, i) => {
        let sel = `overlay_${i}`;
        let layerStrokeWidth = 1.8, layerStrokeColor = theme.componentIcon, layerDashed = 'none', layerLineCap = 'butt', layerLineJoin = 'miter';
        if (layer.style) {
            if (layer.style.includes('stroke-width=')) layerStrokeWidth = parseFloat(layer.style.match(/stroke-width=([\d\.]+)/)[1]);
            if (layer.style.includes('stroke=')) layerStrokeColor = layer.style.match(/stroke=([^,\]]+)/)[1].trim();
            if (layer.style.includes('stroke-dasharray')) layerDashed = '4,4';
            if (layer.style.includes('rounded=true')) { layerLineCap = 'round'; layerLineJoin = 'round'; }
        }
        el.attr(`${sel}/d`, layer.path);
        el.attr(`${sel}/stroke`, layerStrokeColor);
        el.attr(`${sel}/stroke-width`, layerStrokeWidth);
        el.attr(`${sel}/stroke-dasharray`, layerDashed);
        el.attr(`${sel}/stroke-linecap`, layerLineCap);
        el.attr(`${sel}/stroke-linejoin`, layerLineJoin);
        el.attr(`${sel}/fill`, layer.style && layer.style.includes('fill=solid') ? layerStrokeColor : 'transparent');
        el.attr(`${sel}/vector-effect`, 'non-scaling-stroke');
    });

    staticTexts.forEach(t => {
        el.attr(`${t.id}/text`, t.str);
        el.attr(`${t.id}/transform`, `translate(${t.x}, ${t.y}) scale(${sx}, ${sy})`);
        el.attr(`${t.id}/x`, 0); el.attr(`${t.id}/y`, 0);
        el.attr(`${t.id}/font-size`, t.size / scale);
        el.attr(`${t.id}/font-weight`, t.style === 'bold' ? 'bold' : 'normal');
        el.attr(`${t.id}/font-style`, t.style === 'italic' ? 'italic' : 'normal');
        el.attr(`${t.id}/fill`, theme.componentIcon);
        el.attr(`${t.id}/text-anchor`, 'middle'); el.attr(`${t.id}/dominant-baseline`, 'central');
    });

    let pinsHtml = '';
    el.getPorts().forEach(port => {
        let isVisible = evaluatePinCondition(port.condition, resolvedArgsArray);
        el.portProp(port.id, 'attrs/portBody/display', (isVisible && AppState.viewOptions.showPins) ? 'block' : 'none');
        el.portProp(port.id, 'attrs/portBody/pointer-events', isVisible ? 'all' : 'none');
        el.portProp(port.id, 'attrs/portLabel/display', (isVisible && AppState.viewOptions.showPinNames) ? 'block' : 'none');
    });

    dynLabels.forEach((lbl, i) => {
        let sel = `dynLbl_${i}`;
        let isVisibleCond = evaluatePinCondition(lbl.condition, resolvedArgsArray);
        if (!isVisibleCond) { el.attr(`${sel}/display`, 'none'); return; }

        let rawText = lbl.label || lbl.id;
        let newText = function(rL, aA, aN){
            if (!rL) return ''; if (!rL.includes('$')) return rL; 
            return rL.replace(/\$(\d+)/g, (match, argNum) => {
                let idx = parseInt(argNum) - 1; let val = aA[idx];
                if (val === undefined || val === null || val.toString().trim() === "") return "";
                return val.toString().trim();
            });
        }(rawText, resolvedArgsArray, dbData.argNames);
        
        let isVisibleText = newText.trim() !== "";
        let isPlaceholder = newText.startsWith('[') && newText.endsWith(']');
        let dir = lbl.dir || 'R';

        if (isVisibleText && newText.includes('$')) {
            let mathRendered = newText.replace(/\$(.*?)\$/g, (match, mathExpr) => {
                try { return katex.renderToString(mathExpr, { throwOnError: false }); } catch(e) { return match; }
            });

            let finalX = (lbl.x * scale) + shiftX; let finalY = (lbl.y * scale) + shiftY;
            if (flipH) { finalX = w - finalX; if (dir==='L') dir='R'; else if (dir==='R') dir='L'; }
            if (flipV) { finalY = h - finalY; if (dir==='T') dir='B'; else if (dir==='B') dir='T'; }

            let htmlGap = 12 * scale; let htmlTransform = 'translate(-50%, -50%)';
            if (dir === 'T') { finalY -= htmlGap; htmlTransform = 'translate(-50%, -100%)'; }
            else if (dir === 'B') { finalY += htmlGap; htmlTransform = 'translate(-50%, 0%)'; }
            else if (dir === 'L') { finalX -= htmlGap; htmlTransform = 'translate(-100%, -50%)'; }
            else { finalX += htmlGap; htmlTransform = 'translate(0%, -50%)'; }

            pinsHtml += `<div style="position: absolute; left: ${finalX}px; top: ${finalY}px; transform: ${htmlTransform}; white-space: nowrap; font-size: ${13 * AppState.PPU_MULT}px; font-weight: bold; color: ${theme.componentLabel}; opacity: ${isPlaceholder ? 0.4 : 1}; pointer-events: none;">${mathRendered}</div>`;
            el.attr(`${sel}/display`, 'none');
        } else {
            let svgX = lbl.x / AppState.PPU_MULT; let svgY = lbl.y / AppState.PPU_MULT;
            let svgGap = 3; 

            if (sx === -1) { if (dir==='L') dir='R'; else if (dir==='R') dir='L'; }
            if (sy === -1) { if (dir==='T') dir='B'; else if (dir==='B') dir='T'; }

            let alignX = 'start', domBaseline = 'central';
            if (dir === 'T') { svgY -= svgGap; alignX = 'middle'; domBaseline = 'alphabetic'; }
            else if (dir === 'B') { svgY += svgGap; alignX = 'middle'; domBaseline = 'hanging'; }
            else if (dir === 'L') { svgX -= svgGap; alignX = 'end'; domBaseline = 'central'; }
            else { svgX += svgGap; alignX = 'start'; domBaseline = 'central'; }

            el.attr(`${sel}/text`, newText);
            el.attr(`${sel}/transform`, `translate(${svgX}, ${svgY}) scale(${sx}, ${sy})`);
            el.attr(`${sel}/x`, 0); el.attr(`${sel}/y`, 0);
            el.attr(`${sel}/fill`, theme.componentLabel);
            el.attr(`${sel}/font-size`, 11); el.attr(`${sel}/font-weight`, 'bold');
            el.attr(`${sel}/text-anchor`, alignX); el.attr(`${sel}/dominant-baseline`, domBaseline);
            el.attr(`${sel}/opacity`, isPlaceholder ? 0.4 : 1);
            el.attr(`${sel}/display`, isVisibleText ? 'block' : 'none');
        }
    });

    el.set('mathHtmlPins', pinsHtml);
    combineMathHtml(el);
    
    if (typeof AppState.paper !== 'undefined') {
        let view = AppState.paper.findViewByModel(el);
        if (view) view.render();
    }
}

export function addComponent(type, dropX = null, dropY = null) {
    const data = JL_DATABASE[type];
    let element;
    
    const container = document.getElementById('paper-container');
    const rect = container.getBoundingClientRect();
    
    let targetPos;
    if (dropX !== null && dropY !== null) {
        targetPos = AppState.paper.clientToLocalPoint({ x: dropX, y: dropY });
    } else {
        targetPos = AppState.paper.clientToLocalPoint({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    }
    
    const snappedX = Math.round(targetPos.x / 10) * 10;
    const snappedY = Math.round(targetPos.y / 10) * 10;
    
    const theme = THEME_COLORS[AppState.theme];
    
    if (type === 'connectordot') {
        element = new joint.shapes.jl.ConnectorDot();
        element.addPort({ id: 'p1', group: 'absolute', args: {x: 20, y: 20}, markup: '<g/>' });
        element.set({'latexMacro': 'connectordot', 'offsetX': -20, 'offsetY': -20});
        let snappedX = Math.round(targetPos.x / 40) * 40;
        let snappedY = Math.round(targetPos.y / 40) * 40;
        element.position(snappedX - 20, snappedY - 20);
        element.attr('dot/fill', theme.dot);
    } else {
        element = new joint.shapes.jl.Component();

        let initialArgs = [];
        for (let i = 0; i < (data.argsCount || 7); i++) {
            let argDef = data.argNames && data.argNames[i] ? data.argNames[i].name : '';
            let defaultVal = argDef.includes('/') ? argDef.split('/')[0].trim() : '';
            if (data.argDefs) {
                let customDefs = data.argDefs.filter(d => d.idx === (i + 1));
                if (customDefs.length > 1) defaultVal = customDefs.map(d => d.defVal || "").join(', ');
                else if (customDefs.length === 1) defaultVal = customDefs[0].defVal || "";
            }
            initialArgs.push(defaultVal);
        }
        if (data.previewArgs) {
            Object.keys(data.previewArgs).forEach(idx => { initialArgs[parseInt(idx) - 1] = data.previewArgs[idx]; });
        }

        let generatedDynamic = null;
        let rawIconPath = data.icon || data.iconBase || ''; 
        
        if (data.shapeGenerator) {
            try {
                const buildShape = new Function('args', data.shapeGenerator);
                let jsArgs = ["", ...initialArgs];
                generatedDynamic = buildShape(jsArgs);
                rawIconPath = generatedDynamic.pathStr;
                
                if (generatedDynamic.pins) {
                    generatedDynamic.pins.forEach(p => { p.x *= AppState.PPU_MULT; p.y *= AppState.PPU_MULT; });
                }
            } catch(e) { console.error("Shape Gen Error on Drop:", e); }
        }


        // --- THE "NO-SHRED" SANITIZER ---
        const sanitizePath = (pth) => {
            if (!pth) return "";
            // 1. Split ONLY at 'M ' or 'm ' (MoveTo commands) so we don't accidentally shred 
            // words like "NaN" or "mal" into individual SVG command letters!
            return pth.split(/(?=[Mm]\s)/).filter(subPath => {
                // 2. If the sub-path contains NaN, undefined, or null, throw the whole block in the trash.
                return !/NaN|undefined|null/i.test(subPath);
            }).join(' ').trim();
        };

        let extractedInit = extractStaticTexts(rawIconPath);
        let iconPath = sanitizePath(extractedInit.cleanPath);

        const sourcePins = (generatedDynamic && generatedDynamic.pins) ? generatedDynamic.pins : data.pins;
        const uniquePins = [];
        const seenIds = new Set();
        sourcePins.forEach(p => {
            let isDynamicText = p.id && p.id.includes('$'); 
            if (isDynamicText || !seenIds.has(p.id)) { 
                if (!isDynamicText) seenIds.add(p.id); 
                uniquePins.push({ ...p });
            } else {
                const existing = uniquePins.find(up => up.id === p.id);
                if (existing && !existing.label && p.label) existing.label = p.label;
            }
        });

        let measurePath = iconPath;
        
        if (data.iconLayers) {
            data.iconLayers.forEach(layer => {
                if (layer.path) {
                    measurePath += " " + sanitizePath(extractStaticTexts(layer.path).cleanPath);
                }
            });
        }
        
        let bbox = { x: 0, y: 0, width: 0, height: 0 };
        if (measurePath) {
            const tempSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            const tempPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            // --- DEFENSE 2: The Try/Catch Wrap ---
            try {
                tempPath.setAttribute('d', measurePath);
                tempSvg.appendChild(tempPath);
                Object.assign(tempSvg.style, { position: 'absolute', top: '-9999px', opacity: 0.01, pointerEvents: 'none' });
                document.body.appendChild(tempSvg);
                bbox = tempPath.getBBox();
                document.body.removeChild(tempSvg);
            } catch(e) {
                console.warn(`Recovered from corrupted SVG path in component drop.`);
                if (document.body.contains(tempSvg)) document.body.removeChild(tempSvg);
            }
        }

        const xs = uniquePins.map(p => p.x), ys = uniquePins.map(p => p.y);
        const minPinX = xs.length ? Math.min(...xs) : 0; const maxPinX = xs.length ? Math.max(...xs) : 0;
        const minPinY = ys.length ? Math.min(...ys) : 0; const maxPinY = ys.length ? Math.max(...ys) : 0;

        let hasBounds = bbox.width > 0 || bbox.height > 0;
        const absMinX = hasBounds ? Math.min(minPinX, bbox.x * AppState.PPU_MULT) : minPinX;
        const absMaxX = hasBounds ? Math.max(maxPinX, (bbox.x + bbox.width) * AppState.PPU_MULT) : maxPinX;
        const absMinY = hasBounds ? Math.min(minPinY, bbox.y * AppState.PPU_MULT) : minPinY;
        const absMaxY = hasBounds ? Math.max(maxPinY, (bbox.y + bbox.height) * AppState.PPU_MULT) : maxPinY;
            
        const pad = 10; 
        const boxOriginX = Math.floor((absMinX - pad) / 40) * 40;
        const boxOriginY = Math.floor((absMinY - pad) / 40) * 40;
        const boxMaxX = Math.ceil((absMaxX + pad) / 40) * 40;
        const boxMaxY = Math.ceil((absMaxY + pad) / 40) * 40;

        const boxWidth = Math.max(boxMaxX - boxOriginX, 40);
        const boxHeight = Math.max(boxMaxY - boxOriginY, 40);

        const shiftX = -boxOriginX;
        const shiftY = -boxOriginY;

        let baseStrokeWidth = 1.8; 
        let baseStrokeColor = theme.componentIcon;

        if (data.iconBaseStyle) {
            if (data.iconBaseStyle.includes('stroke-width=')) baseStrokeWidth = parseFloat(data.iconBaseStyle.match(/stroke-width=([\d\.]+)/)[1]);
            if (data.iconBaseStyle.includes('stroke=')) baseStrokeColor = data.iconBaseStyle.match(/stroke=([^,\]]+)/)[1].trim();
        }

        element.resize(boxWidth, boxHeight);
        element.attr({ 
            body: { fill: '#ffffff', fillOpacity: 0.01, stroke: 'none', 'pointer-events': 'all', cursor: 'pointer' },
            iconGroup: { transform: `translate(${shiftX}, ${shiftY}) scale(${AppState.PPU_MULT})` },
            iconFill: { d: iconPath, stroke: 'none', fill: data.filled ? theme.componentIcon : 'transparent', 'fill-rule': 'evenodd' },
            iconStroke: { d: iconPath, stroke: baseStrokeColor, strokeWidth: baseStrokeWidth, fill: 'transparent' },
            label: { text: data.name, fontSize: 12 * AppState.PPU_MULT, fill: theme.componentLabel, refX: '50%', textAnchor: 'middle', refY: '50%', refY2: 25 * AppState.PPU_MULT, 'pointer-events': 'none' }
        });
        
        if (type === 'freetext') {
            element.attr('iconStroke/stroke', 'transparent'); 
            element.attr('label/refY', '50%');          
            element.attr('label/refY2', 0);
            element.attr('label/fontSize', 14 * AppState.PPU_MULT); 
        }

        const realPins = [];
        const dynamicLabels = [];

        uniquePins.forEach(p => {
            let rawLabel = p.label || p.id;
            if (rawLabel.includes('$')) dynamicLabels.push(p); 
            else realPins.push(p);      
        });

        const ports = realPins.map(p => ({ 
            id: p.id, group: 'absolute', 
            args: { x: p.x + shiftX, y: p.y + shiftY }, 
            condition: p.condition,
            markup: [ { tagName: 'rect', selector: 'portBody' }, { tagName: 'title', selector: 'portTitle' }, { tagName: 'text', selector: 'portLabel' } ],
            attrs: { 
                portBody: { 
                    width: 8 * AppState.PPU_MULT, height: 8 * AppState.PPU_MULT, x: -4 * AppState.PPU_MULT, y: -4 * AppState.PPU_MULT, fill: theme.portBody, 
                    display: AppState.viewOptions.showPins ? 'block' : 'none' // CHECK STATE
                },
                portTitle: { text: p.label || p.id },
                portLabel: { 
                    text: p.label || '', 
                    display: (AppState.viewOptions.showPinNames && p.label) ? 'block' : 'none', // CHECK STATE
                    fontSize: 9 * AppState.PPU_MULT, fill: theme.portLabel, fontWeight: 'bold', fontFamily: 'var(--font-code)', x: 6 * AppState.PPU_MULT, y: -6 * AppState.PPU_MULT, textAnchor: 'start' 
                }
            } 
        }));
        
        let basePorts = {};
        ports.forEach(p => { basePorts[p.id] = { x: p.args.x - shiftX, y: p.args.y - shiftY }; });

        element.prop('ports', { groups: { 'absolute': { position: { name: 'absolute' } } } });
        element.addPorts(ports);
        
        if (data.previewArgs) {
            Object.keys(data.previewArgs).forEach(idx => {
                initialArgs[parseInt(idx) - 1] = data.previewArgs[idx];
            });
        }

        element.set({
            'latexMacro': data.name, 
            'offsetX': boxOriginX, 'offsetY': boxOriginY,
            'shiftX': shiftX, 'shiftY': shiftY,
            'flipH': false, 'flipV': false,
            'customArgs': initialArgs, 
            'customScale': 1,
            'baseWidth': boxWidth, 'baseHeight': boxHeight,
            'baseOffsetX': boxOriginX, 'baseOffsetY': boxOriginY,
            'baseShiftX': shiftX, 'baseShiftY': shiftY,
            'basePorts': basePorts,
            'baseVisualTop': absMinY - boxOriginY,
            'baseVisualBottom': absMaxY - boxOriginY,
            'baseVisualLeft': absMinX - boxOriginX,
            'baseVisualRight': absMaxX - boxOriginX,
            'dynamicLabels': dynamicLabels
        });
        
        let snappedOriginX = Math.round(targetPos.x / 40) * 40;
        let snappedOriginY = Math.round(targetPos.y / 40) * 40;
        
        let finalX = snappedOriginX - shiftX;
        let finalY = snappedOriginY - shiftY;
        
        if (type === 'freetext') element.attr('icon/stroke', 'transparent'); 
        updateElementLabel(element, data.name); 
        
        element.position(finalX, finalY);
        assembleIcon(element, element.get('customArgs') || []);
    }

	AppState.graph.addCell(element); 
	
	// 0. auto-split wire when current probe is dropped
    autoSplitWire(element); // Try to split a wire immediately upon drop
    
    // 1. Clear any previous selections
    AppState.selectedElements.forEach(el => { const v = AppState.paper.findViewByModel(el); if(v) v.unhighlight(); });
    AppState.selectedLinks.forEach(l => { const v = AppState.paper.findViewByModel(l); if(v) v.unhighlight(); });
    
    // 2. Set the newly dropped component as the only selected item
    AppState.selectedElements = [element];
    AppState.selectedLinks = [];
    
    // 3. Highlight it permanently (until the user clicks elsewhere)
    setTimeout(() => { 
        const v = AppState.paper.findViewByModel(element); 
        if(v) v.highlight(); 
    }, 10);
	
	exportLatex();
    saveState();
    updateToolbarState();
    
    console.log(`Successfully added: ${type}`);
}

// Bind the drag-and-drop zone
export function setupDropzone() {
    const container = document.getElementById('paper-container');

    // Helper: Check if the drag contains a palette component
    const isComponentDrag = (e) => {
        if (!e.dataTransfer || !e.dataTransfer.types) return false;
        // Search the transfer types to see if it's a JL Component
        for (let i = 0; i < e.dataTransfer.types.length; i++) {
            if (e.dataTransfer.types[i] === 'application/jl-component') return true;
        }
        return false;
    };

    // The Interceptor: Catches the drag at the absolute root of the DOM
    const handleGlobalDrag = (e) => {
        if (isComponentDrag(e)) {
            // 1. Kill the event so the JSON file importer never sees it!
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            // 2. Handle the component drop logic manually
            if (e.type === 'dragover') {
                e.dataTransfer.dropEffect = 'copy';
            } 
            else if (e.type === 'drop') {
                // Only drop if their mouse is actually over the canvas container
                if (container.contains(e.target) || e.target === container) {
                    const type = e.dataTransfer.getData('application/jl-component');
                    if (type) {
                        addComponent(type, e.clientX, e.clientY);
                    }
                }
            }
        }
    };

    // Attach to the Window in the Capture Phase (runs before all other scripts)
    window.addEventListener('dragenter', handleGlobalDrag, true);
    window.addEventListener('dragover', handleGlobalDrag, true);
    window.addEventListener('dragleave', handleGlobalDrag, true);
    window.addEventListener('drop', handleGlobalDrag, true);
}

export function getVisualOrigin(el, customPos = null) {
    let p = customPos || el.position();
    const w = el.size().width;
    const h = el.size().height;
    const rot = el.get('angle') || 0;
    
    let effOffsetX = el.get('offsetX') || 0;
    let effOffsetY = el.get('offsetY') || 0;
    
    if (el.get('flipH')) effOffsetX = -w - effOffsetX;
    if (el.get('flipV')) effOffsetY = -h - effOffsetY;
    
    const ox = p.x - effOffsetX;
    const oy = p.y - effOffsetY;
    const cx = p.x + w / 2;
    const cy = p.y + h / 2;
    
    const rad = rot * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    
    const dx = ox - cx;
    const dy = oy - cy;
    
    return {
        x: cx + (dx * cos) - (dy * sin),
        y: cy + (dx * sin) + (dy * cos)
    };
}

export function applyRobustScale(el, newScale) {
    let shiftX = el.get('baseShiftX');
    if (shiftX === undefined) {
        shiftX = el.get('shiftX') || 0;
        let shiftY = el.get('shiftY') || 0;
        
        el.set('baseWidth', el.size().width);
        el.set('baseHeight', el.size().height);
        el.set('baseOffsetX', el.get('offsetX'));
        el.set('baseOffsetY', el.get('offsetY'));
        
        let initialBasePorts = {};
        el.getPorts().forEach(p => { 
            initialBasePorts[p.id] = { x: p.args.x - shiftX, y: p.args.y - shiftY }; 
        });
        
        el.set('basePorts', initialBasePorts);
        el.set('baseShiftX', shiftX);
        el.set('baseShiftY', shiftY);
    }

    let w = Math.round(el.get('baseWidth') * newScale);
    let h = Math.round(el.get('baseHeight') * newScale);
    
    let sX = shiftX * newScale; 
    let sY = el.get('baseShiftY') * newScale;

    el.set('offsetX', Math.round(el.get('baseOffsetX') * newScale));
    el.set('offsetY', Math.round(el.get('baseOffsetY') * newScale));

    let totalScale = newScale * AppState.PPU_MULT; 
    let flipH = el.get('flipH') || false;
    let flipV = el.get('flipV') || false;
    let sx = flipH ? -1 : 1;
    let sy = flipV ? -1 : 1;

    el.attr('iconGroup/transform', `translate(${w/2}, ${h/2}) scale(${sx}, ${sy}) translate(${-w/2}, ${-h/2}) translate(${sX}, ${sY}) scale(${totalScale})`);

    let basePorts = el.get('basePorts');
    el.getPorts().forEach(port => {
        let px = (basePorts[port.id].x * newScale) + sX;
        let py = (basePorts[port.id].y * newScale) + sY;
        if (flipH) px = w - px;
        if (flipV) py = h - py;
        el.portProp(port.id, 'args/x', Math.round(px));
        el.portProp(port.id, 'args/y', Math.round(py));
    });

    el.resize(w, h);
    el.set('customScale', newScale); 
    
    assembleIcon(el, el.get('customArgs') || []);
    updateElementLabel(el);          
}

// --- VIEW OVERLAYS & TOGGLES ---

export function refreshComponentViews() {
    AppState.graph.getElements().forEach(el => {
        if (el.get('latexMacro') !== 'connectordot') {
            assembleIcon(el, el.get('customArgs') || []);
        }
    });
}

export function updateGhostDotsVisibility() {
    let theme = THEME_COLORS[AppState.theme] || THEME_COLORS.standard;
    AppState.graph.getElements().forEach(el => {
        if (el.get('latexMacro') === 'connectordot') {
            let isGhost = el.get('isGhost');
            if (isGhost) {
                if (AppState.viewOptions.showGhostDots) {
                    el.attr('./display', 'block');
                    el.attr('dot/fill', 'rgba(231, 76, 60, 0.4)'); 
                    el.attr('dot/stroke', '#e74c3c');              
                    el.attr('dot/stroke-width', 3);                
                    el.attr('dot/stroke-dasharray', '5,3');        
                    el.attr('dot/r', 16);                          
                } else {
                    el.attr('./display', 'none');
                }
            } else {
                el.attr('./display', 'block');
                el.attr('dot/fill', theme.dot);
                el.attr('dot/stroke', 'none');
                el.attr('dot/stroke-dasharray', 'none');
                el.attr('dot/r', 8);                                
            }
        }
    });
}


// --- THEME ENGINE ---
export function applyTheme(themeName) {
    const theme = THEME_COLORS[themeName];
    if (!theme) return;

    // 1. Safely turn off highlights BEFORE changing the rules
    AppState.selectedElements.forEach(el => { const v = AppState.paper.findViewByModel(el); if(v) v.unhighlight(); });
    AppState.selectedLinks.forEach(l => { const v = AppState.paper.findViewByModel(l); if(v) v.unhighlight(); });

    AppState.theme = themeName; // Update global state
    
    // Safely update the theme class for CSS overrides
    const paperEl = document.getElementById('my-paper');
    if (paperEl) {
        paperEl.classList.remove('theme-standard', 'theme-cadence');
        paperEl.classList.add('theme-' + themeName);
    }

    // 2. Paper and Grid
    AppState.paper.drawBackground({ color: theme.background });
    updateDynamicGrid(); 

    // 3. Selection Rectangle & Highlighting (via CSS var and JointJS options)
    document.documentElement.style.setProperty('--selection-color', theme.selection);
    AppState.paper.options.highlighting['default'].options.attrs.stroke = theme.highlight;

    // 4. Default Link & Existing Links
    AppState.paper.options.defaultLink.attr('line/stroke', theme.wire);
    AppState.graph.getLinks().forEach(link => link.attr('line/stroke', theme.wire));

    // 5. Update existing elements
    AppState.graph.getElements().forEach(el => {
        const macro = el.get('latexMacro');
        if (macro === 'connectordot') {
            el.attr('dot/fill', theme.dot);
        } else {
            const dbData = JL_DATABASE[macro];
            const isFreeText = (macro === 'freetext');

            el.attr('iconFill/fill', (dbData && dbData.filled) ? theme.componentIcon : 'none');
            
            let customBaseStroke = (dbData && dbData.iconBaseStyle && dbData.iconBaseStyle.includes('stroke=')) 
                ? dbData.iconBaseStyle.match(/stroke=([^,\]]+)/)[1].trim() 
                : theme.componentIcon;

            el.attr('iconStroke/stroke', isFreeText ? 'transparent' : customBaseStroke); 
            el.attr('label/fill', isFreeText ? theme.freeText : theme.componentLabel);
            
            // Force Math formulas to recalculate their new HTML color!
            if (el.get('displayedText') && el.get('displayedText').includes('$')) {
                updateElementLabel(el); 
            }
            
            el.getPorts().forEach(port => {
                el.portProp(port.id, 'attrs/portBody/fill', theme.portBody);
                el.portProp(port.id, 'attrs/portLabel/fill', theme.portLabel);
            });

            // Re-assemble the dynamic layers so they grab the new colors!
            assembleIcon(el, el.get('customArgs') || []);
        }
    });

    // 6. Turn the highlights back on with the NEW rules
    AppState.selectedElements.forEach(el => { const v = AppState.paper.findViewByModel(el); if(v) v.highlight(); });
    AppState.selectedLinks.forEach(l => { const v = AppState.paper.findViewByModel(l); if(v) v.highlight(); });
    
    updateGhostDotsVisibility();
}



export function updateNetNamesVisibility() {
    let overlay = document.getElementById('net-names-overlay');
    let chk = document.getElementById('chkShowNets');
    
    // Safety check in case the DOM isn't fully loaded yet
    if (!chk) return;

    // If turned off, clear the overlay and exit
    if (!chk.checked) {
        if (overlay) overlay.innerHTML = '';
        return;
    }

    // Create the overlay if it doesn't exist
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'net-names-overlay';
        overlay.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:1050; overflow:hidden;';
        document.getElementById('paper-container').appendChild(overlay);
    }

    // Reset the SVG container (This instantly deletes any existing net badges to prevent duplicates)
    overlay.innerHTML = '<svg id="net-lines-svg" style="position:absolute; top:0; left:0; width:100%; height:100%; overflow:visible; pointer-events:none;"></svg>';
    let linesSvg = overlay.querySelector('#net-lines-svg');

    // Extract the active circuit topology
    let topo = window.extractTopology();
    if (!topo) return;

    let getNet = (id) => topo.netMap.get(topo.uf.find(id));
    let drawnNets = new Set();
    let matrix = AppState.paper.matrix();

    topo.terminals.forEach(term => {
        let netId = getNet(term.id);
        
        // Only draw one badge per net
        if (netId && !drawnNets.has(netId)) {
            drawnNets.add(netId);
            
            let isGnd = (netId === '0');
            let color = isGnd ? 'var(--text-main)' : 'var(--primary)';
            
            // --- UPDATED: Shortened Text ---
            let text = isGnd ? '0' : netId;

            let screenX = term.x * matrix.a + matrix.e, screenY = term.y * matrix.d + matrix.f;
            // Shortened the target distance slightly so they sit tighter to the pins
            let targetX = screenX + 20, targetY = screenY - 20;

            // Draw SVG Line
            let lineEl = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            lineEl.setAttribute('x1', screenX); lineEl.setAttribute('y1', screenY); 
            lineEl.setAttribute('x2', targetX); lineEl.setAttribute('y2', targetY);
            lineEl.setAttribute('stroke', color); 
            lineEl.setAttribute('stroke-width', '1.5'); 
            linesSvg.appendChild(lineEl);

            // Draw SVG Dot
            let dotEl = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            dotEl.setAttribute('cx', screenX); dotEl.setAttribute('cy', screenY); 
            dotEl.setAttribute('r', '3'); 
            dotEl.setAttribute('fill', color); 
            linesSvg.appendChild(dotEl);

            // Draw the CSS Badge
            let badge = document.createElement('div');
            badge.style.cssText = `position:absolute; left:${targetX}px; top:${targetY - 10}px; background:${color}; color:white; padding:2px 5px; border-radius:4px; font-size:10px; font-family:var(--font-code); font-weight:bold; border:1px solid var(--border-main); box-shadow:0 2px 4px rgba(0,0,0,0.1);`;
            badge.innerText = text; 
            overlay.appendChild(badge);
        }
    });
}

let currentAnnotations = [];

export function clearDCAnnotations() {
    currentAnnotations.forEach(el => el.remove());
    currentAnnotations = [];
}

export function drawDCOperatingPoint(opData) {
    clearDCAnnotations(); // Clean up old ones first

    // 1. Draw Currents on Components
    AppState.graph.getElements().forEach(el => {
        let nameMatch = el.get('displayedText');
        if (!nameMatch) return;
        
        // Extract base name (e.g. "R1" from "R1=1k")
        let baseName = nameMatch.split('=')[0].trim(); 
        
        let currentVal = opData.currents[baseName];
        if (currentVal !== undefined) {
            let valStr = parseFloat(currentVal).toExponential(2) + "A";
            
            // Create a temporary text block with an arrow!
            let isNegative = currentVal < 0;
            let arrow = isNegative ? "←" : "→"; // Simplified: assuming horizontal for now. 
            // Pro-tip: If el.get('angle') === 90, change arrow to ↑ or ↓
            
            let annotation = new joint.shapes.standard.Rectangle();
            annotation.position(el.position().x, el.position().y - 25);
            annotation.resize(60, 20);
            annotation.attr({
                body: { fill: 'var(--bg-app)', stroke: 'var(--primary)', strokeWidth: 1, rx: 4, ry: 4 },
                label: { text: `${arrow} ${valStr}`, fill: 'var(--primary)', fontSize: 10, fontWeight: 'bold' }
            });
            
            // Mark it so it doesn't get saved to the project file
            annotation.set('isDCAnnotation', true); 
            annotation.addTo(AppState.graph);
            currentAnnotations.push(annotation);
        }
    });

    // 2. Draw Voltages on Connector Dots (Nodes)
    AppState.graph.getElements().forEach(el => {
        if (el.get('latexMacro') === 'connectordot') {
            // Note: You will need to map SPICE node names to dot IDs. 
            // Assuming you stored the SPICE node name in the dot's properties during netlisting:
            let nodeName = el.get('spiceNode'); 
            let volVal = opData.nodes[nodeName];
            
            if (volVal !== undefined) {
                let vStr = parseFloat(volVal).toExponential(2) + "V";
                let annotation = new joint.shapes.standard.Rectangle();
                annotation.position(el.position().x + 10, el.position().y - 15);
                annotation.resize(50, 16);
                annotation.attr({
                    body: { fill: 'var(--warning)', stroke: 'none', rx: 3, ry: 3 },
                    label: { text: vStr, fill: '#000', fontSize: 9, fontWeight: 'bold' }
                });
                annotation.set('isDCAnnotation', true);
                annotation.addTo(AppState.graph);
                currentAnnotations.push(annotation);
            }
        }
    });
}

// current probe automatic connection/disconnection

export function autoSplitWire(el) {
    if (el.get('latexMacro') !== 'currentprobe') return;
    
    // 1. FORCE VISIBILITY: Temporarily show the pins so JointJS can compute their exact physical bounding boxes
    el.getPorts().forEach(p => el.portProp(p.id, 'attrs/portBody/display', 'block'));

    // 2. Wait 20ms for the browser to render the visible pins into the DOM
    setTimeout(() => {
        if (!AppState.graph || AppState.graph.getConnectedLinks(el).length > 0) {
            restorePortVisibility();
            return;
        }

        const center = el.getBBox().center();
        const threshold = 25; // Snap tolerance in pixels
        const links = AppState.graph.getLinks();
        let hit = false;
        let hitSegmentIndex = -1; // <--- WE MUST TRACK EXACTLY WHICH SEGMENT WAS CUT

        for (let link of links) {
            const linkView = link.findView(AppState.paper);
            if (!linkView) continue;

            const pts = [];
            if (linkView.sourcePoint) pts.push(linkView.sourcePoint);
            else if (linkView.sourceAnchor) pts.push(linkView.sourceAnchor);

            const vertices = linkView.route || link.get('vertices') || [];
            vertices.forEach(v => pts.push(v));

            if (linkView.targetPoint) pts.push(linkView.targetPoint);
            else if (linkView.targetAnchor) pts.push(linkView.targetAnchor);

            if (pts.length < 2) continue;

            for (let i = 0; i < pts.length - 1; i++) {
                const p1 = pts[i];
                const p2 = pts[i+1];
                if (p1 && p2 && p1.x !== undefined && p2.x !== undefined) {
                    const l2 = (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2;
                    let dist = l2 === 0 ? Math.hypot(center.x - p1.x, center.y - p1.y) :
                        Math.hypot(center.x - (p1.x + Math.max(0, Math.min(1, ((center.x - p1.x) * (p2.x - p1.x) + (center.y - p1.y) * (p2.y - p1.y)) / l2)) * (p2.x - p1.x)), center.y - (p1.y + Math.max(0, Math.min(1, ((center.x - p1.x) * (p2.x - p1.x) + (center.y - p1.y) * (p2.y - p1.y)) / l2)) * (p2.y - p1.y)));
                    
                    if (dist < threshold) {
                        hit = true;
                        hitSegmentIndex = i; // Save the cut location!
                        break;
                    }
                }
            }

            if (hit) {
                const ports = el.getPorts();
                if (ports.length < 2) break;

                const elPos = el.position();
                const p1X = elPos.x + (ports[0].args.x || 0);
                const p1Y = elPos.y + (ports[0].args.y || 0);
                const p2X = elPos.x + (ports[1].args.x || 0);
                const p2Y = elPos.y + (ports[1].args.y || 0);

                const srcPos = pts[0];
                const dist1 = Math.hypot(srcPos.x - p1X, srcPos.y - p1Y);
                const dist2 = Math.hypot(srcPos.x - p2X, srcPos.y - p2Y);

                const sourcePortId = dist1 < dist2 ? ports[0].id : ports[1].id;
                const targetPortId = dist1 < dist2 ? ports[1].id : ports[0].id;

                const origSource = link.source();
                const origTarget = link.target();
                const theme = THEME_COLORS[AppState.theme] || THEME_COLORS.standard;
                
                const originalRouter = link.get('router');
                const originalConnector = link.get('connector');
                const origVertices = link.get('vertices') || []; // <--- GET ORIGINAL L-BENDS

                link.remove(); // Nuke the solid wire

                const commonAttrs = { 
                    line: { stroke: theme.wire, strokeWidth: 1.8, targetMarker: null, 'vector-effect': 'non-scaling-stroke' } 
                };

                // --- THE FIX: VERTEX SLICING & ORTHOGONAL HEALING ---
                const verts1 = origVertices.slice(0, hitSegmentIndex);
                const verts2 = origVertices.slice(hitSegmentIndex);
                
                // Determine if the cut segment was perfectly horizontal or vertical
                const pSeg1 = pts[hitSegmentIndex];
                const pSeg2 = pts[hitSegmentIndex+1];
                const isHorz = Math.abs(pSeg1.y - pSeg2.y) < 1;
                const isVert = Math.abs(pSeg1.x - pSeg2.x) < 1;

                const port1Abs = { x: p1X, y: p1Y };
                const port2Abs = { x: p2X, y: p2Y };

                // If the user dropped the probe slightly off-axis, inject a new corner to force 90 degrees!
                if (isHorz && Math.abs(port1Abs.y - pSeg1.y) > 1) verts1.push({ x: port1Abs.x, y: pSeg1.y });
                else if (isVert && Math.abs(port1Abs.x - pSeg1.x) > 1) verts1.push({ x: pSeg1.x, y: port1Abs.y });

                let v2Inject = [];
                if (isHorz && Math.abs(port2Abs.y - pSeg2.y) > 1) v2Inject.push({ x: port2Abs.x, y: pSeg2.y });
                else if (isVert && Math.abs(port2Abs.x - pSeg2.x) > 1) v2Inject.push({ x: pSeg2.x, y: port2Abs.y });
                const finalVerts2 = [...v2Inject, ...verts2];

                // Wire 1: Explicitly target the visual "portBody" magnet
                const link1 = new joint.shapes.standard.Link({ attrs: commonAttrs });
                if (originalRouter) link1.set('router', originalRouter);
                if (originalConnector) link1.set('connector', originalConnector);
                link1.source(origSource).target({ id: el.id, port: sourcePortId, magnet: 'portBody' });
                link1.vertices(verts1); // <--- RESTORE VERTICES

                // Wire 2: Explicitly target the visual "portBody" magnet
                const link2 = new joint.shapes.standard.Link({ attrs: commonAttrs });
                if (originalRouter) link2.set('router', originalRouter);
                if (originalConnector) link2.set('connector', originalConnector);
                link2.source({ id: el.id, port: targetPortId, magnet: 'portBody' }).target(origTarget);
                link2.vertices(finalVerts2); // <--- RESTORE VERTICES

                AppState.graph.addCells([link1, link2]);
                break; 
            }
        }

        restorePortVisibility();

    }, 20);

    function restorePortVisibility() {
        setTimeout(() => {
            let isVisible = AppState.viewOptions && AppState.viewOptions.showPins;
            el.getPorts().forEach(p => el.portProp(p.id, 'attrs/portBody/display', isVisible ? 'block' : 'none'));
        }, 50);
    }
}

// ghost component symbol while dragging from the palette
export function createDragGhostSVG(type) {
    const data = JL_DATABASE[type];
    if (!data) return null;

    const theme = THEME_COLORS[AppState.theme] || THEME_COLORS.standard;
    const PPU = AppState.PPU_MULT || 1;

    // --- HELPER: Silences browser console errors by stripping corrupted SVG commands ---
    const sanitizePath = (pth) => {
        if (!pth) return "";
        return pth.split(/(?=[MmLlCcQqAaZz])/).filter(cmd => !/NaN/i.test(cmd)).join(' ');
    };

    let iconData = getPaletteIconData(data);
    
    let baseExtracted = extractStaticTexts(iconData.base);
    let basePath = sanitizePath(baseExtracted.cleanPath);
    let allStaticTexts = [...baseExtracted.texts];

    let processedLayers = iconData.layers.map(l => {
        let lExtracted = extractStaticTexts(l.path);
        allStaticTexts.push(...lExtracted.texts);
        return { path: sanitizePath(lExtracted.cleanPath), style: l.style };
    });

    let combinedPathForMeasure = basePath + " " + processedLayers.map(l => l.path).join(" ");
    let pins = data.pins || [];

    if (data.shapeGenerator) {
        try {
            let initialArgs = [];
            for (let i = 0; i < (data.argsCount || 7); i++) initialArgs.push("");
            if (data.previewArgs) {
                Object.keys(data.previewArgs).forEach(idx => { initialArgs[parseInt(idx) - 1] = data.previewArgs[idx]; });
            }
            
            const buildShape = new Function('args', data.shapeGenerator);
            let generatedDynamic = buildShape(["", ...initialArgs]);
            
            if (generatedDynamic.pathStr) {
                basePath = sanitizePath(extractStaticTexts(generatedDynamic.pathStr).cleanPath);
                combinedPathForMeasure = basePath; 
                processedLayers = []; 
            }
            if (generatedDynamic.pins) {
                pins = generatedDynamic.pins.map(p => ({ x: p.x * PPU, y: p.y * PPU }));
            }
        } catch (e) { }
    }

    let bbox = { x: 0, y: 0, width: 0, height: 0 };
    if (combinedPathForMeasure) {
        const tempSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        const tempPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        try {
            tempPath.setAttribute('d', combinedPathForMeasure);
            tempSvg.appendChild(tempPath);
            Object.assign(tempSvg.style, { position: 'absolute', top: '-9999px', opacity: 0.01, pointerEvents: 'none' });
            document.body.appendChild(tempSvg);
            bbox = tempPath.getBBox();
            document.body.removeChild(tempSvg);
        } catch (e) {
            if (document.body.contains(tempSvg)) document.body.removeChild(tempSvg);
        }
    }

    const xs = pins.map(p => p.x), ys = pins.map(p => p.y);
    const minPinX = xs.length ? Math.min(...xs) : 0; 
    const maxPinX = xs.length ? Math.max(...xs) : 0;
    const minPinY = ys.length ? Math.min(...ys) : 0; 
    const maxPinY = ys.length ? Math.max(...ys) : 0;

    let hasBounds = bbox.width > 0 || bbox.height > 0;
    const absMinX = hasBounds ? Math.min(minPinX, bbox.x * PPU) : minPinX;
    const absMaxX = hasBounds ? Math.max(maxPinX, (bbox.x + bbox.width) * PPU) : maxPinX;
    const absMinY = hasBounds ? Math.min(minPinY, bbox.y * PPU) : minPinY;
    const absMaxY = hasBounds ? Math.max(maxPinY, (bbox.y + bbox.height) * PPU) : maxPinY;

    const pad = 10;
    const boxOriginX = Math.floor((absMinX - pad) / 40) * 40;
    const boxOriginY = Math.floor((absMinY - pad) / 40) * 40;
    const boxMaxX = Math.ceil((absMaxX + pad) / 40) * 40;
    const boxMaxY = Math.ceil((absMaxY + pad) / 40) * 40;

    const boxWidth = Math.max(boxMaxX - boxOriginX, 40);
    const boxHeight = Math.max(boxMaxY - boxOriginY, 40);
    const shiftX = -boxOriginX;
    const shiftY = -boxOriginY;

    // 4. Construct the physical SVG Element
    const scale = AppState.paper ? AppState.paper.scale().sx : 1;
    
    // Generous padding to prevent long text from bleeding out of the SVG boundaries
    const textPadX = 150; 
    const textPadY = 80;  
    const svgWidth = boxWidth + (textPadX * 2);
    const svgHeight = boxHeight + (textPadY * 2);

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', svgWidth * scale);
    svg.setAttribute('height', svgHeight * scale);
    svg.setAttribute('viewBox', `${-textPadX} ${-textPadY} ${svgWidth} ${svgHeight}`);
    
    // --- FIX: Keep on-screen but invisible to prevent Chrome drag-image clipping bugs! ---
    svg.style.position = 'absolute';
    svg.style.top = '0px';
    svg.style.left = '0px';
    svg.style.opacity = '0.01';
    svg.style.zIndex = '-9999';
    svg.style.pointerEvents = 'none';

    let baseStrokeWidth = 1.8;
    let baseStrokeColor = theme.componentIcon;
    if (data.iconBaseStyle) {
        if (data.iconBaseStyle.includes('stroke-width=')) baseStrokeWidth = parseFloat(data.iconBaseStyle.match(/stroke-width=([\d\.]+)/)[1]);
        if (data.iconBaseStyle.includes('stroke=')) baseStrokeColor = data.iconBaseStyle.match(/stroke=([^,\]]+)/)[1].trim();
    }

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${shiftX}, ${shiftY}) scale(${PPU})`);

    // Draw Base Path
    if (basePath) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', basePath);
        path.setAttribute('fill', data.filled ? theme.componentIcon : 'transparent');
        path.setAttribute('stroke', type === 'freetext' ? 'transparent' : baseStrokeColor);
        path.setAttribute('stroke-width', baseStrokeWidth);
        path.setAttribute('vector-effect', 'non-scaling-stroke');
        g.appendChild(path);
    }

    // Draw Layer Paths
    processedLayers.forEach(layer => {
        if (!layer.path) return;
        let layerStroke = baseStrokeColor;
        let layerStrokeWidth = baseStrokeWidth;
        let layerFill = "transparent";

        if (layer.style) {
            layer.style.split(',').forEach(s => {
                let parts = s.split('=');
                if (parts.length === 2) {
                    if (parts[0].trim() === 'stroke') layerStroke = parts[1].trim();
                    if (parts[0].trim() === 'stroke-width') layerStrokeWidth = parseFloat(parts[1].trim());
                    if (parts[0].trim() === 'fill') layerFill = parts[1].trim() === 'solid' ? layerStroke : parts[1].trim();
                }
            });
        }

        const lPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        lPath.setAttribute('d', layer.path);
        lPath.setAttribute('fill', layerFill);
        lPath.setAttribute('stroke', layerStroke);
        lPath.setAttribute('stroke-width', layerStrokeWidth);
        lPath.setAttribute('vector-effect', 'non-scaling-stroke');
        g.appendChild(lPath);
    });

    // Draw Extracted Text Blocks
    allStaticTexts.forEach(t => {
        const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textEl.setAttribute('x', t.x);
        textEl.setAttribute('y', t.y);
        textEl.setAttribute('font-family', 'Arial, sans-serif');
        textEl.setAttribute('font-size', t.size);
        textEl.setAttribute('font-weight', t.style === 'bold' ? 'bold' : 'normal');
        textEl.setAttribute('font-style', t.style === 'italic' ? 'italic' : 'normal');
        textEl.setAttribute('fill', theme.componentIcon);
        textEl.setAttribute('text-anchor', 'middle');
        textEl.setAttribute('dominant-baseline', 'central');
        textEl.textContent = t.str;
        g.appendChild(textEl);
    });

    svg.appendChild(g);

    // Draw Pin Rectangles
    pins.forEach(p => {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', p.x + shiftX - (4 * PPU));
        rect.setAttribute('y', p.y + shiftY - (4 * PPU));
        rect.setAttribute('width', 8 * PPU);
        rect.setAttribute('height', 8 * PPU);
        rect.setAttribute('fill', theme.portBody);
        svg.appendChild(rect);
    });
    
    // --- EXACT LABEL MATH REPLICATION ---
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    let textX = boxWidth / 2;
    let textY = boxHeight / 2;
    let align = 'middle';

    if (data.labelAnchor) {
        let currentDir = data.labelAnchor.dir;
        
        if (data.labelAnchor.auto) {
            let vTopRaw = absMinY - boxOriginY;
            let vBotRaw = absMaxY - boxOriginY;
            let vLeftRaw = absMinX - boxOriginX;
            let vRightRaw = absMaxX - boxOriginX;
            
            if (currentDir === 'T') { textX = (vLeftRaw + vRightRaw) / 2; textY = vTopRaw; }
            else if (currentDir === 'B') { textX = (vLeftRaw + vRightRaw) / 2; textY = vBotRaw; }
            else if (currentDir === 'L') { textX = vLeftRaw; textY = (vTopRaw + vBotRaw) / 2; }
            else if (currentDir === 'R') { textX = vRightRaw; textY = (vTopRaw + vBotRaw) / 2; }
        } else {
            textX = (data.labelAnchor.x * PPU) + shiftX;
            textY = (data.labelAnchor.y * PPU) + shiftY;
        }
        
        let gap = 10 * PPU;
        if (currentDir === 'T') textY -= gap;
        else if (currentDir === 'B') textY += gap;
        else if (currentDir === 'L') { textX -= gap; align = 'end'; }
        else if (currentDir === 'R') { textX += gap; align = 'start'; }
        
    } else {
        let bottomY = boxHeight / 2;
        if (type !== 'freetext') {
            if (pins && pins.length > 0) bottomY = Math.max(...pins.map(p => p.y + shiftY));
            else bottomY = boxHeight;
        }
        textX = boxWidth / 2;
        textY = type === 'freetext' ? boxHeight / 2 : bottomY + (10 * PPU);
    }

    text.setAttribute('x', textX);
    text.setAttribute('y', textY); 
    text.setAttribute('fill', theme.componentLabel);
    text.setAttribute('font-size', 12 * PPU);
    text.setAttribute('font-family', 'Arial, sans-serif');
    text.setAttribute('text-anchor', align);
    text.setAttribute('dominant-baseline', 'central');
    text.textContent = data.name;
    
    if (data.hideLabel) text.setAttribute('display', 'none');
    
    svg.appendChild(text);

    return { svg: svg, width: svgWidth * scale, height: svgHeight * scale };
}
