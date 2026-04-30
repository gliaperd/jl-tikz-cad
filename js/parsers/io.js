// js/parsers/io.js
import { AppState, THEME_COLORS } from '../state.js';
import { generateSpiceNetlistStr } from '../engines/spice.js';
import { clearSelection } from '../ui/actions.js';
import { syncFromLatex, exportLatex } from './latex.js';

// --- UNIVERSAL SAVE FUNCTION (With Native Folder Picker) ---
export async function saveFileAs(suggestedName, content, mimeType, description, extension) {
    if (window.showSaveFilePicker) {
        try {
            const handle = await window.showSaveFilePicker({
                suggestedName: suggestedName,
                types: [{ description: description, accept: { [mimeType]: [extension] } }],
            });
            const writable = await handle.createWritable();
            await writable.write(content);
            await writable.close();
            Swal.fire({ toast: true, position: 'bottom-end', icon: 'success', title: 'Saved Successfully', showConfirmButton: false, timer: 2000, background: '#f8f9fa' });
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error("Save error:", err);
                Swal.fire('Error', 'Could not save the file.', 'error');
            }
        }
    } else {
        const blob = new Blob([content], { type: mimeType });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = suggestedName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        Swal.fire({ toast: true, position: 'bottom-end', icon: 'info', title: 'Saved to Downloads', showConfirmButton: false, timer: 2000 });
    }
}

// --- NATIVE PROJECT SAVE/LOAD ---
export async function saveProjectToFile() {
    clearSelection();
    const projectData = {
        version: "2.0",
        state: AppState.graph.toJSON(),
        zoom: AppState.zoom,
        theme: AppState.theme
    };
    const jsonStr = JSON.stringify(projectData, null, 2);
    await saveFileAs('circuit.json', jsonStr, 'application/json', 'JL CAD Project File', '.json');
	localStorage.removeItem('jlcad_autosave');
}

export function loadProjectFromFile(file) {
    if (!file) return;
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const contents = e.target.result;
        if (file.name.endsWith('.json')) {
            try {
                const data = JSON.parse(contents);
                const graphData = data.state ? data.state : data; 
                AppState.graph.clear();
                AppState.graph.fromJSON(graphData);
                
                AppState.graph.getElements().forEach(el => {
                    if (el.get('latexMacro') !== 'connectordot') el.set('customScale', el.get('customScale') || 1); 
                });

                exportLatex();
                Swal.fire({ toast: true, position: 'bottom-end', icon: 'success', title: 'Project Loaded', showConfirmButton: false, timer: 2000, background: '#f8f9fa' });
            } catch (err) {
                Swal.fire('Error', 'Failed to parse JSON project file.', 'error');
            }
        } else if (file.name.endsWith('.tex') || file.name.endsWith('.txt')) {
            const outputBox = document.getElementById('latex-output');
            if (outputBox) {
                let cleanTex = contents;
                let match = contents.match(/\\begin\{tikzpictureJL\}([\s\S]*?)\\end\{tikzpictureJL\}/);
                if (match) cleanTex = "\\begin{tikzpictureJL}" + match[1] + "\\end{tikzpictureJL}";
                
                outputBox.innerText = cleanTex;
                AppState.graph.clear();
                syncFromLatex();
            }
        }
    };
    reader.readAsText(file);
}

// --- CENTRALIZED EXPORT DIALOG ---
export function openExportDialog() {
    // 1. Grab the HTML cleanly from the DOM template
    const templateHtml = document.getElementById('tpl-export-dialog').innerHTML;

    Swal.fire({
        title: '<span style="font-size: 20px;">Export</span>',
        html: templateHtml, // 2. Inject it
        showCancelButton: true,
        confirmButtonText: 'Export',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#e84393',
        didOpen: () => {
            // Dynamic display of SVG options based on dropdown
            const formatSelect = document.getElementById('export-format');
            const svgOptions = document.getElementById('svg-options-container');
            
            formatSelect.addEventListener('change', (e) => {
                svgOptions.style.display = e.target.value === 'svg' ? 'block' : 'none';
            });

            // Sync Slider with Live Preview
            const slider = document.getElementById('exp-weight-scale');
            const valDisplay = document.getElementById('weight-val');
            const previewStrokes = document.querySelectorAll('.preview-stroke');

            slider.addEventListener('input', (e) => {
                const scale = parseFloat(e.target.value);
                valDisplay.innerText = Math.round(scale * 100) + '%';
                previewStrokes.forEach(path => {
                    const baseW = parseFloat(path.getAttribute('data-base-width'));
                    path.setAttribute('stroke-width', baseW * scale);
                });
            });
        },
        preConfirm: () => {
            return {
                format: document.getElementById('export-format').value,
                grid: document.getElementById('exp-grid').checked,
                ports: document.getElementById('exp-pins').checked,
                pinnames: document.getElementById('exp-pinnames').checked,
                compnames: document.getElementById('exp-compnames').checked,
                freetext: document.getElementById('exp-freetext').checked,
                bw: document.getElementById('exp-mono').checked,
                lw: parseFloat(document.getElementById('exp-weight-scale').value) || 1.0,
                sel: AppState.selectedElements.length > 0 || AppState.selectedLinks.length > 0
            };
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            const vals = result.value;
            
            if (vals.format === 'svg') {
                await exportToSVG(vals);
            } 
            else if (vals.format === 'tikz' || vals.format === 'standalone') {
                clearSelection();
                let texCode = window.rawLatexCode || document.getElementById('latex-output').innerText;
                texCode = texCode.replace(/ % id:[a-zA-Z0-9-]+/g, ''); 
                
                if (vals.format === 'tikz') {
                    await saveFileAs("circuit.tex", texCode, "text/plain", "TikZ Code", ".tex");
                } else {
                    const standalone = `\\documentclass[border=3mm]{standalone}\n\\usepackage{tikz}\n\\usepackage{tikz_electronic_parts}\n\n\\begin{document}\n\n${texCode}\n\n\\end{document}`;
                    await saveFileAs("circuit_standalone.tex", standalone, "text/plain", "Standalone LaTeX", ".tex");
                }
            } 
            else if (vals.format === 'spice') {
                clearSelection();
                const simCommands = "\n.op\n.end"; 
                const netlistData = generateSpiceNetlistStr(simCommands);
                if (netlistData.errors && netlistData.errors.length > 0) {
                    Swal.fire('Warning', 'Netlist contains floating pins or missing parameters, but exporting anyway.', 'warning');
                }
                await saveFileAs("circuit.cir", netlistData.code, "text/plain", "SPICE Netlist", ".cir");
            }
        }
    });
}


async function exportToSVG(opts) {
    const paperSvg = document.querySelector('#my-paper > svg');
    if (!paperSvg) return;
    
    // 1. Create a safe clone to modify
    const clone = paperSvg.cloneNode(true);
    const viewport = clone.querySelector('.joint-viewport') || clone.querySelector('.viewport');
    if (viewport) viewport.removeAttribute('transform');

    const getSafeRef = () => (viewport && viewport.parentNode === clone) ? viewport : clone.firstChild;

    // 2. Calculate precise bounding box manually (Bypasses JointJS bugs and NaN crashes)
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    const targetCells = (opts.sel && (AppState.selectedElements.length > 0 || AppState.selectedLinks.length > 0)) 
        ? [...AppState.selectedElements, ...AppState.selectedLinks] 
        : [...AppState.graph.getElements(), ...AppState.graph.getLinks()];

    targetCells.forEach(cell => {
        // Query the 'View' instead of the 'Model'. The View knows the exact rendered pixels on the screen!
        let view = AppState.paper.findViewByModel(cell);
        if (view) {
            let b = view.getBBox({ useModelGeometry: true });
            // Strict validation to prevent NaN from corrupting the viewBox
            if (b && !isNaN(b.x) && !isNaN(b.width) && b.width >= 0) {
                if (b.x < minX) minX = b.x; 
                if (b.y < minY) minY = b.y;
                if (b.x + b.width > maxX) maxX = b.x + b.width;
                if (b.y + b.height > maxY) maxY = b.y + b.height;
            }
        }
    });

    // Failsafe if the canvas is absolutely empty
    if (minX === Infinity || isNaN(minX)) {
        minX = 0; minY = 0; maxX = 800; maxY = 600;
    }

    let bbox = { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    
    if (opts.sel && (AppState.selectedElements.length > 0 || AppState.selectedLinks.length > 0)) {
        const selectedIds = new Set(targetCells.map(c => c.id));
        clone.querySelectorAll('.joint-cell').forEach(cellNode => {
            const modelId = cellNode.getAttribute('model-id');
            if (modelId && !selectedIds.has(modelId)) cellNode.remove();
        });
    }

    // Add a mandatory 60px safe buffer to guarantee floating text/labels are never cropped out
    const safeTextBuffer = 60; 
    const expPadding = (opts.pad !== undefined ? opts.pad : 0) + safeTextBuffer;
    
    const x = bbox.x - expPadding;
    const y = bbox.y - expPadding;
    const width = bbox.width + expPadding * 2;
    const height = bbox.height + expPadding * 2;

    clone.setAttribute('viewBox', `${x} ${y} ${width} ${height}`);
    clone.setAttribute('width', width);
    clone.setAttribute('height', height);

    // 3. Remove unwanted UI layers
    clone.querySelectorAll('.joint-highlighted, .joint-selection-rect, [class*="highlight"]').forEach(el => el.remove());
    clone.querySelectorAll('.joint-selection-layer, .joint-tools-layer').forEach(el => el.remove());

    // --- THE UNIFIED FIX: GLUE EVERYTHING TOGETHER ---
    const scaleFactor = opts.lw || 1.0;
    const baseThickness = 1.8;
    const PPU = AppState.PPU_MULT || 4; 

    clone.querySelectorAll('path, line, polyline, polygon, rect, circle, ellipse').forEach(n => {
        // Skip text elements safely
        if (n.tagName.toLowerCase() === 'text' || n.closest('text') || n.closest('foreignObject')) return;

        // Eradicate non-scaling-stroke so native scale takes over
        n.removeAttribute('vector-effect');
        n.style.setProperty('vector-effect', 'none', 'important');

        // Parse the existing stroke-width (defaults to 1.8 if missing)
        let currentWidthAttr = n.getAttribute('stroke-width');
        let parsedWidth = currentWidthAttr && currentWidthAttr !== 'none' && currentWidthAttr !== '0' 
            ? parseFloat(currentWidthAttr) 
            : baseThickness; 

        // THE FIX: Wires do not have a scale() transform on their parent like components do.
        // Therefore, we must manually multiply wire thickness by the PPU.
        let isWire = n.getAttribute('joint-selector') === 'line' || n.classList.contains('connection') || n.closest('.joint-link');
        let targetWidth = isWire ? (parsedWidth * PPU) : parsedWidth;
            
        n.setAttribute('stroke-width', targetWidth * scaleFactor);
        
        if (opts.bw && n.getAttribute('stroke') && n.getAttribute('stroke') !== 'none') {
            n.setAttribute('stroke', '#000000');
        }

        // Apply caps conditionally
        if (n.getAttribute('stroke') && n.getAttribute('stroke') !== 'none') {
            
            // Apply 'square' ONLY if the line isn't intentionally defined as 'round' by the component
            let isRound = n.getAttribute('stroke-linecap') === 'round' || n.style.strokeLinecap === 'round';
            if (!isRound) {
                n.setAttribute('stroke-linecap', 'square');
                n.style.setProperty('stroke-linecap', 'square', 'important');
            }
            
            let isJoinRound = n.getAttribute('stroke-linejoin') === 'round' || n.style.strokeLinejoin === 'round';
            if (!isJoinRound) {
                n.setAttribute('stroke-linejoin', 'miter');
                n.style.setProperty('stroke-linejoin', 'miter', 'important');
            }
        }
    });
	
    // --- APPLY VISUAL FILTERS ---
    
    // 1. Free Text
    if (!opts.freetext) {
        AppState.graph.getElements().filter(e => e.get('latexMacro') === 'freetext').forEach(e => {
            let node = clone.querySelector(`[model-id="${e.id}"]`);
            if (node) node.remove();
        });
    }

    // 2. Component Names (Label and KaTeX foreignObject)
    if (!opts.compnames) {
        AppState.graph.getElements().filter(e => e.get('latexMacro') !== 'freetext' && e.get('latexMacro') !== 'connectordot').forEach(e => {
            let node = clone.querySelector(`[model-id="${e.id}"]`);
            if (node) {
                let label = node.querySelector('text[joint-selector="label"]');
                if (label) label.remove();
                let fo = node.querySelector('foreignObject');
                if (fo) fo.remove();
            }
        });
    }

    // 3. Pins
    if (!opts.ports) {
        clone.querySelectorAll('[joint-selector="portBody"]').forEach(n => n.remove());
    }

    // 4. Pin Names
    if (!opts.pinnames) {
        clone.querySelectorAll('[joint-selector="portLabel"]').forEach(n => n.remove());
    }

    // 5. Monochrome (Black & White)
    if (opts.bw) {
        clone.querySelectorAll('*').forEach(n => {
            let stroke = n.getAttribute('stroke');
            let fill = n.getAttribute('fill');
            
            if (stroke && stroke !== 'none' && stroke !== 'transparent') n.setAttribute('stroke', '#000000');
            
            if (fill && fill !== 'none' && fill !== 'transparent' && fill.toLowerCase() !== '#ffffff' && n.getAttribute('fill-opacity') !== '0.01') {
                n.setAttribute('fill', '#000000');
            }
            if (n.tagName === 'div' || n.tagName === 'span') n.style.color = '#000000'; 
        });
    }

    // Grid 
    if (opts.grid) {
        let defs = clone.querySelector('defs');
        if (!defs) {
            defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
            clone.prepend(defs); 
        }
        
        let pattern = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
        pattern.setAttribute("id", "exportGrid");
        pattern.setAttribute("width", "40");
        pattern.setAttribute("height", "40");
        pattern.setAttribute("patternUnits", "userSpaceOnUse");
        
        let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", "0");
        circle.setAttribute("cy", "0");
        circle.setAttribute("r", "1.5");
        circle.setAttribute("fill", opts.bw ? "#cccccc" : "#bdc3c7"); 
        
        pattern.appendChild(circle);
        defs.appendChild(pattern);
        
        let gridRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        gridRect.setAttribute("x", x);
        gridRect.setAttribute("y", y);
        gridRect.setAttribute("width", width);
        gridRect.setAttribute("height", height);
        gridRect.setAttribute("fill", "url(#exportGrid)");
        
        clone.insertBefore(gridRect, getSafeRef()); 
    } else {
        clone.querySelectorAll('.joint-grid, .joint-paper-background').forEach(el => el.remove());
    }

    // Background Color
    if (opts.bg && THEME_COLORS && THEME_COLORS[AppState.theme]) {
        const bgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        bgRect.setAttribute("x", x); bgRect.setAttribute("y", y);
        bgRect.setAttribute("width", "100%"); bgRect.setAttribute("height", "100%");
        bgRect.setAttribute("fill", THEME_COLORS[AppState.theme].background);
        clone.insertBefore(bgRect, getSafeRef());
    } else {
        clone.style.backgroundColor = 'transparent';
    }

    // Math/KaTeX Support
    let styleTag = document.createElementNS("http://www.w3.org/2000/svg", "style");
    styleTag.textContent = "@import url('https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css');";
    clone.insertBefore(styleTag, clone.firstChild); 

    clone.querySelectorAll('foreignObject').forEach(fo => {
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

    // 8. Serialize and clean up
    let svgString = new XMLSerializer().serializeToString(clone);
    if (!svgString.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
        svgString = svgString.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }

    svgString = svgString.replace(/fill="transparent"/gi, 'fill="none"'); 
    svgString = '<?xml version="1.0" standalone="no"?>\r\n' + svgString;

    await saveFileAs("circuit_schematic.svg", svgString, "image/svg+xml", "SVG Vector Image", ".svg");
    clearSelection();
}