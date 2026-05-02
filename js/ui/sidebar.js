// js/ui/sidebar.js
import { AppState } from '../state.js';
import { extractStaticTexts, getPaletteIconData } from '../parsers/helpers.js';
// We will import addComponent from canvas.js in a moment!
import { addComponent } from './canvas.js'; 

export function initializeSidebar() {
    populateSidebar();
    
    // Search Filter Logic
    document.getElementById('palette-search').addEventListener('input', function(e) {
        const term = e.target.value.toLowerCase().trim();
        const container = document.getElementById('items-container');
        let currentHeader = null;
        let visibleCountInCategory = 0;

        container.childNodes.forEach(node => {
            if (node.classList && node.classList.contains('category-header')) {
                if (currentHeader) currentHeader.style.display = visibleCountInCategory > 0 ? 'block' : 'none';
                currentHeader = node;
                visibleCountInCategory = 0; 
            } else if (node.classList && node.classList.contains('comp-item')) {
                const compName = node.getAttribute('data-search') || "";
                if (compName.includes(term)) {
                    node.style.display = 'flex';
                    visibleCountInCategory++;
                } else {
                    node.style.display = 'none';
                }
            }
        });
        if (currentHeader) currentHeader.style.display = visibleCountInCategory > 0 ? 'block' : 'none';
    });
}

export function populateSidebar() {
    if (typeof JL_DATABASE === 'undefined') return;
    const list = document.getElementById('items-container');
    list.innerHTML = ''; 

    const groupedComponents = {};
    if (!JL_DATABASE['connectordot']) {
        JL_DATABASE['connectordot'] = { name: 'Solder Dot', category: 'Wiring' };
    }

    Object.keys(JL_DATABASE).forEach(k => {
        const data = JL_DATABASE[k];
        const cat = data.category || 'Uncategorized'; 
        if (!groupedComponents[cat]) groupedComponents[cat] = [];
        groupedComponents[cat].push(k);
    });

    const sortedCategories = Object.keys(groupedComponents).sort();

    sortedCategories.forEach(cat => {
        const header = document.createElement('div');
        header.className = 'category-header';
        header.innerText = cat;
        list.appendChild(header);

        const itemsInCategory = groupedComponents[cat].sort((a, b) => JL_DATABASE[a].name.localeCompare(JL_DATABASE[b].name));

        itemsInCategory.forEach(k => {
            const data = JL_DATABASE[k];
            const d = document.createElement('div');
            d.className = 'comp-item';
            
            const prettyName = data.displayName || data.name;
            d.title = prettyName; 
            d.setAttribute('data-search', prettyName.toLowerCase()); 
            
            let iconSvg = '';
            let iconData = getPaletteIconData(data);
            
            let baseExtracted = extractStaticTexts(iconData.base);
            iconData.base = baseExtracted.cleanPath;
            let allPaletteTexts = [...baseExtracted.texts];

            iconData.layers.forEach(l => {
                let lExtracted = extractStaticTexts(l.path);
                l.path = lExtracted.cleanPath;
                allPaletteTexts.push(...lExtracted.texts);
            });

            let combinedPathForMath = iconData.base + " " + iconData.layers.map(l => l.path).join(" ");

            if (k === 'connectordot') {
                iconSvg = `<svg width="100%" height="100%" viewBox="-15 -15 30 30"><circle cx="0" cy="0" r="5" fill="#2c3e50"/></svg>`;
            } else if (combinedPathForMath && data.pins) {
                const xs = data.pins.map(p => p.x), ys = data.pins.map(p => p.y);
                let minX = xs.length ? Math.min(...xs) : 0; let maxX = xs.length ? Math.max(...xs) : 0;
                let minY = ys.length ? Math.min(...ys) : 0; let maxY = ys.length ? Math.max(...ys) : 0;

                let bbox = { x: 0, y: 0, width: 0, height: 0 };
                const tempPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                tempPath.setAttribute('d', combinedPathForMath); 
                
                const svgContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svgContainer.appendChild(tempPath); document.body.appendChild(svgContainer);
                try { bbox = tempPath.getBBox(); } catch(e){} document.body.removeChild(svgContainer);

                const pathMinX = bbox.x * AppState.PPU_MULT; const pathMaxX = (bbox.x + bbox.width) * AppState.PPU_MULT;
                const pathMinY = bbox.y * AppState.PPU_MULT; const pathMaxY = (bbox.y + bbox.height) * AppState.PPU_MULT;

                minX = Math.min(minX, pathMinX); maxX = Math.max(maxX, pathMaxX);
                minY = Math.min(minY, pathMinY); maxY = Math.max(maxY, pathMaxY);

                let w = maxX - minX; let h = maxY - minY;
                if (w === 0) { w = 40; minX -= 20; maxX += 20; }
                if (h === 0) { h = 40; minY -= 20; maxY += 20; }

                const padW = Math.max(w * 0.2, 10); const padH = Math.max(h * 0.2, 10);
                const vbX = minX - padW; const vbY = minY - padH;
                const vbW = w + (padW * 2); const vbH = h + (padH * 2);

                let layersHtml = iconData.layers.map(l => {
                    let stroke = "#2c3e50", strokeWidth = 1.5, fill = "none"; 
                    if (l.style) {
                        l.style.split(',').forEach(s => {
                            let parts = s.split('=');
                            if (parts.length === 2) {
                                if (parts[0].trim() === 'stroke') stroke = parts[1].trim();
                                if (parts[0].trim() === 'stroke-width') strokeWidth = parseFloat(parts[1].trim()) * (1.5/1.8); 
                                if (parts[0].trim() === 'fill') fill = parts[1].trim() === 'solid' ? '#2c3e50' : parts[1].trim();
                            }
                        });
                    }
                    return `<path d="${l.path}" transform="scale(${AppState.PPU_MULT})" style="vector-effect: non-scaling-stroke;" stroke="${stroke}" stroke-width="${strokeWidth}" fill="${fill}" />`;
                }).join('\n');

                let textsHtml = allPaletteTexts.map(t => {
                    let fw = t.style === 'bold' ? 'bold' : 'normal';
                    let fs = t.style === 'italic' ? 'italic' : 'normal';
                    return `<text x="${t.x}" y="${t.y}" font-family="var(--font-ui)" font-size="${t.size}" font-weight="${fw}" font-style="${fs}" fill="#2c3e50" text-anchor="middle" dominant-baseline="central">${t.str}</text>`;
                }).join('\n');

                iconSvg = `
                    <svg width="100%" height="100%" viewBox="${vbX} ${vbY} ${vbW} ${vbH}" preserveAspectRatio="xMidYMid meet">
                        <path d="${iconData.base}" transform="scale(${AppState.PPU_MULT})" style="vector-effect: non-scaling-stroke;" stroke="#2c3e50" stroke-width="1.5" fill="none" /> 
                        ${layersHtml}
                        <g transform="scale(${AppState.PPU_MULT})">${textsHtml}</g>
                    </svg>`;
            }
            
            d.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px; width: 100%;">
                    <div class="icon-wrapper" style="width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: #ffffff; border: 1px solid #d1d8e0; border-radius: 6px; padding: 4px; box-sizing: border-box; overflow: hidden;">
                        ${iconSvg}
                    </div>
                    <span style="font-weight: 500; font-size: 13px; color: #2c3e50; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${prettyName} 
                    </span>
                </div>
            `;
            
            d.draggable = true;
            d.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('application/jl-component', k);
                e.dataTransfer.effectAllowed = 'copy';
                const iconNode = d.querySelector('.icon-wrapper');
                if (iconNode) e.dataTransfer.setDragImage(iconNode, 21, 21);
            });
            
            d.onclick = () => addComponent(k);
            list.appendChild(d);
        });
    });
}