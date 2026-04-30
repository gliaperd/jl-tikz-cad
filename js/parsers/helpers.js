// js/parsers/helpers.js

export function extractStaticTexts(pathStr) {
    let texts = [];
    if (!pathStr) return { cleanPath: "", texts: [] };
    
    let cleanPath = pathStr.replace(/[Mm]\s+([-+]?[\d\.]+)\s+([-+]?[\d\.]+)\s*[Ll]\s*[-+]?[\d\.]+\s*[-+]?[\d\.]+\s*\/\*TEXT:([^,]+),([^,]+),(.*?)\*\//g, (match, x, y, size, style, str) => {
        texts.push({ x: parseFloat(x), y: parseFloat(y), size: parseFloat(size), style: style, str: str });
        return ""; 
    }).trim();
    
    cleanPath = cleanPath.replace(/[Mm]\s*[-+]?[\d\.]+\s*[-+]?[\d\.]+\s*[Ll]\s*[-+]?[\d\.]+\s*[-+]?[\d\.]+\s*\/\*TEXT:.*?\*\//g, '').trim();
    cleanPath = cleanPath.replace(/\/\*TEXT:.*?\*\//g, '').trim();
    
    return { cleanPath, texts };
}

export function evaluatePinCondition(condStr, argsArray) {
    if (!condStr || condStr.trim() === '' || condStr === '1~=') return true;
    try {
        let parsedStr = condStr.replace(/(\d+)\s*(==|!=|~=)\s*([^&|()\s]*)/g, function(match, arg, op, val) {
            let argVal = (argsArray[parseInt(arg) - 1] || "").toString().trim();
            if (op === '==') return `("${argVal}" === "${val}")`;
            if (op === '!=') return `("${argVal}" !== "${val}")`;
            if (op === '~=') return `("${argVal}".includes("${val}"))`;
            return 'false';
        });
        return eval(parsedStr);
    } catch (e) {
        console.warn("Logic parsing error:", condStr);
        return false;
    }
}

export function getPaletteIconData(data) {
    let base = data.iconBase || data.icon || '';
    let layers = [];
    
    let defaultArgs = [];
    for (let i = 0; i < (data.argsCount || 7); i++) {
        let argDef = data.argNames && data.argNames[i] ? data.argNames[i].name : '';
        let defaultVal = argDef.includes('/') ? argDef.split('/')[0].trim() : '';

        if (data.argDefs) {
            let customDefs = data.argDefs.filter(d => d.idx === (i + 1));
            if (customDefs.length > 1) defaultVal = customDefs.map(d => d.defVal || "").join(', ');
            else if (customDefs.length === 1) defaultVal = customDefs[0].defVal || "";
        }
        defaultArgs.push(defaultVal);
    }

    if (data.previewArgs) {
        Object.keys(data.previewArgs).forEach(idx => { defaultArgs[parseInt(idx) - 1] = data.previewArgs[idx]; });
    }

    if (data.variantArg && data.icons) {
        let defaultVariant = defaultArgs[data.variantArg - 1];
        base = data.icons[defaultVariant] ? data.icons[defaultVariant] : Object.values(data.icons)[0] || base;
    }
    
    if (data.shapeGenerator) {
        try {
            const buildShape = new Function('args', data.shapeGenerator);
            let jsArgs = ["", ...defaultArgs];
            const generated = buildShape(jsArgs);
            base = generated.pathStr; 
        } catch(e) { console.error("Palette Generation Error:", e); }
    }

    if (data.iconLayers) {
        data.iconLayers.forEach(layer => {
            if (evaluatePinCondition(layer.condition, defaultArgs)) {
                layers.push({ ...layer });
            }
        });
    }
    return { base, layers };
}

import { AppState } from '../state.js';

export function parseSpiceToNumber(valStr) {
    if (!valStr) return 0;
    let str = valStr.toString().trim();
    let lowerStr = str.toLowerCase();
    let mult = 1;
    
    if (lowerStr.endsWith('meg')) { mult = 1e6; str = lowerStr.replace('meg', ''); }
    else if (lowerStr.endsWith('mil')) { mult = 25.4e-6; str = lowerStr.replace('mil', ''); } 
    else if (lowerStr.endsWith('t')) { mult = 1e12; str = lowerStr.replace('t', ''); }
    else if (lowerStr.endsWith('g')) { mult = 1e9; str = lowerStr.replace('g', ''); }
    else if (lowerStr.endsWith('k')) { mult = 1e3; str = lowerStr.replace('k', ''); }
    else if (str.endsWith('M')) { mult = 1e6; str = str.replace('M', ''); }
    else if (str.endsWith('m')) { mult = 1e-3; str = str.replace('m', ''); }
    else if (lowerStr.endsWith('u')) { mult = 1e-6; str = lowerStr.replace('u', ''); }
    else if (lowerStr.endsWith('n')) { mult = 1e-9; str = lowerStr.replace('n', ''); }
    else if (lowerStr.endsWith('p')) { mult = 1e-12; str = lowerStr.replace('p', ''); }
    else if (lowerStr.endsWith('f')) { mult = 1e-15; str = lowerStr.replace('f', ''); }

    let num = parseFloat(str);
    return isNaN(num) ? 0 : num * mult;
}

class UnionFind {
    constructor() { this.parent = {}; }
    find(i) {
        if (this.parent[i] === undefined) this.parent[i] = i;
        if (this.parent[i] === i) return i;
        return this.parent[i] = this.find(this.parent[i]);
    }
    union(i, j) {
        let rootI = this.find(i); let rootJ = this.find(j);
        if (rootI !== rootJ) this.parent[rootI] = rootJ;
    }
}

export function getAbsolutePinCoord(el, portId) {
    let port = el.getPort(portId);
    let pos = el.position();
    let size = el.size();
    
    let px = pos.x + port.args.x;
    let py = pos.y + port.args.y;
    
    let cx = pos.x + size.width / 2;
    let cy = pos.y + size.height / 2;
    
    let angle = el.get('angle') || 0;
    let rad = angle * Math.PI / 180;
    let cos = Math.cos(rad);
    let sin = Math.sin(rad);
    
    let nx = cos * (px - cx) - sin * (py - cy) + cx;
    let ny = sin * (px - cx) + cos * (py - cy) + cy;
    
    return { x: Math.round(nx), y: Math.round(ny) };
}

function isPointOnLine(pt, p1, p2) {
    let tol = 1; 
    if (Math.abs(p1.x - p2.x) < tol && Math.abs(pt.x - p1.x) < tol) return pt.y >= Math.min(p1.y, p2.y) - tol && pt.y <= Math.max(p1.y, p2.y) + tol;
    if (Math.abs(p1.y - p2.y) < tol && Math.abs(pt.y - p1.y) < tol) return pt.x >= Math.min(p1.x, p2.x) - tol && pt.x <= Math.max(p1.x, p2.x) + tol;
    let cross = Math.abs((pt.y - p1.y) * (p2.x - p1.x) - (pt.x - p1.x) * (p2.y - p1.y));
    if (cross > 50) return false; 
    let dot = (pt.x - p1.x) * (p2.x - p1.x) + (pt.y - p1.y) * (p2.y - p1.y);
    let lenSq = (p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2;
    return dot >= -tol && dot <= lenSq + tol;
}

export function extractTopology() {
    let uf = new UnionFind();
    let explicitTerminals = [];
    let gndNodes = new Set();
    
    AppState.graph.getElements().forEach(el => {
        let macro = el.get('latexMacro');
        if (macro === 'connectordot') {
            let p = el.position();
            explicitTerminals.push({ x: p.x + 20, y: p.y + 20, isGnd: false });
        } else if (macro !== 'freetext') {
            let isGnd = (macro === 'groundterminal');
            el.getPorts().forEach(port => {
                let pt = getAbsolutePinCoord(el, port.id);
                explicitTerminals.push({ x: pt.x, y: pt.y, isGnd: isGnd });
            });
        }
    });

    let terminals = [];
    explicitTerminals.forEach(rt => {
        let cluster = terminals.find(t => Math.abs(t.x - rt.x) < 5 && Math.abs(t.y - rt.y) < 5);
        if (cluster) { if (rt.isGnd) gndNodes.add(cluster.id); } 
        else {
            let newId = `${Math.round(rt.x)},${Math.round(rt.y)}`;
            terminals.push({ x: rt.x, y: rt.y, id: newId, isExplicit: true });
            if (rt.isGnd) gndNodes.add(newId);
        }
    });

    let wireEndpoints = [];
    let links = AppState.graph.getLinks();
    links.forEach(link => {
        let pts = [link.getSourcePoint(), ...(link.vertices() || []), link.getTargetPoint()];
        wireEndpoints.push({ pt: pts[0], linkId: link.id });
        wireEndpoints.push({ pt: pts[pts.length - 1], linkId: link.id });
    });

    let endpointClusters = [];
    wireEndpoints.forEach(we => {
        let cluster = endpointClusters.find(c => Math.abs(c.x - we.pt.x) < 5 && Math.abs(c.y - we.pt.y) < 5);
        if (cluster) { if (!cluster.linkIds.includes(we.linkId)) cluster.linkIds.push(we.linkId); } 
        else { endpointClusters.push({ x: we.pt.x, y: we.pt.y, linkIds: [we.linkId] }); }
    });

    endpointClusters.forEach(ec => {
        let hasExplicit = terminals.some(t => Math.abs(t.x - ec.x) < 5 && Math.abs(t.y - ec.y) < 5);
        if (hasExplicit) return; 
        let middleTouches = 0;
        links.forEach(link => {
            if (ec.linkIds.includes(link.id)) return;
            let pts = [link.getSourcePoint(), ...(link.vertices() || []), link.getTargetPoint()];
            for (let i = 0; i < pts.length - 1; i++) {
                if (isPointOnLine(ec, pts[i], pts[i+1])) { middleTouches++; break; }
            }
        });
        if (ec.linkIds.length === 2 && middleTouches === 0) {
            let newId = `${Math.round(ec.x)},${Math.round(ec.y)}`;
            terminals.push({ x: ec.x, y: ec.y, id: newId, isExplicit: false });
        }
    });

    links.forEach(link => {
        let pts = [link.getSourcePoint(), ...(link.vertices() || []), link.getTargetPoint()];
        let linkTerminals = [];
        terminals.forEach(term => {
            for (let i = 0; i < pts.length - 1; i++) {
                if (isPointOnLine(term, pts[i], pts[i+1])) { linkTerminals.push(term.id); break; }
            }
        });
        for (let i = 1; i < linkTerminals.length; i++) uf.union(linkTerminals[0], linkTerminals[i]);
        if (linkTerminals.length > 0) uf.union(link.id, linkTerminals[0]);
    });

    let netMap = new Map();
    let netCounter = 1;
    gndNodes.forEach(gndStr => { netMap.set(uf.find(gndStr), "0"); });

    terminals.forEach(term => {
        let root = uf.find(term.id);
        if (!netMap.has(root)) { netMap.set(root, netCounter.toString()); netCounter++; }
    });
    links.forEach(link => {
        let root = uf.find(link.id);
        if (!netMap.has(root)) { netMap.set(root, netCounter.toString()); netCounter++; }
    });

    return { uf, netMap, terminals, gndNodes };
}

// Attach these to window so digital.js can see them during the timeout loop
window.extractTopology = extractTopology;
window.getAbsolutePinCoord = getAbsolutePinCoord;