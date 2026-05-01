// js/ui/canvas.js
import { AppState, THEME_COLORS } from '../state.js';
import { extractStaticTexts, evaluatePinCondition } from '../parsers/helpers.js';
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
            dot: { cx: 20, cy: 20, r: 8, fill: '#000000', stroke: 'none', 'pointer-events': 'none' }
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
            attrs: { line: { stroke: THEME_COLORS.standard.wire, strokeWidth: 1.8, targetMarker: null, 'vector-effect': 'non-scaling-stroke' } }
        }),
        useModelGeometry: true,
        cellViewNamespace: joint.shapes,
        highlighting: {
            'default': { name: 'stroke', options: { padding: 3, rx: 5, ry: 5, attrs: { 'stroke-width': 3, stroke: THEME_COLORS.standard.highlight } } }
        }
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
    let baseExtracted = extractStaticTexts(basePath);
    basePath = baseExtracted.cleanPath;
    baseExtracted.texts.forEach((t, idx) => staticTexts.push({ ...t, id: `baseTxt_${idx}` }));

    matchedLayers.forEach((layer, i) => {
        let lExtracted = extractStaticTexts(layer.path);
        layer.path = lExtracted.cleanPath;
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

        let extractedInit = extractStaticTexts(rawIconPath);
        let iconPath = extractedInit.cleanPath;

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
        
        // Safely append all overlay layers to get the true maximum bounding box
        if (data.iconLayers) {
            data.iconLayers.forEach(layer => {
                if (layer.path) {
                    measurePath += " " + extractStaticTexts(layer.path).cleanPath;
                }
            });
        }
        let bbox = { x: 0, y: 0, width: 0, height: 0 };
        if (measurePath) {
            const tempSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            const tempPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            tempPath.setAttribute('d', measurePath);
            tempSvg.appendChild(tempPath);
            Object.assign(tempSvg.style, { position: 'absolute', top: '-9999px', opacity: 0.01, pointerEvents: 'none' });
            document.body.appendChild(tempSvg);
            try { bbox = tempPath.getBBox(); } catch(e){}
            document.body.removeChild(tempSvg);
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
    container.addEventListener('dragover', (e) => {
        e.preventDefault(); 
        e.dataTransfer.dropEffect = 'copy';
    });

    container.addEventListener('drop', (e) => {
        e.preventDefault();
        const type = e.dataTransfer.getData('application/jl-component');
        if (type) {
            addComponent(type, e.clientX, e.clientY);
        }
    });
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
