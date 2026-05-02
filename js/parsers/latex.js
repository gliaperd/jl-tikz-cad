// js/parsers/latex.js
import { AppState, THEME_COLORS } from '../state.js';
import { getVisualOrigin, applyRobustScale, updateElementLabel, assembleIcon } from '../ui/canvas.js';
import { saveState } from '../ui/actions.js';
import { saveFileAs } from './io.js';

let latexEdited = false;
let suppressWarning = false;
let isSwalOpen = false;

// Listen for manual edits in the output box
document.addEventListener('DOMContentLoaded', () => {
    const outputBox = document.getElementById('latex-output');
    if (outputBox) {
        outputBox.addEventListener('input', () => { latexEdited = true; });
    }
});

function escapeHTML(str) { return str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag])); }

function highlightLatex(text) {
    let html = text;
    html = html.replace(/(\\[a-zA-Z]+)/g, '<span class="tex-cmd">$1</span>');
    html = html.replace(/(\$NAME\$|\{\.\.\.\}|type "[^"]+" to [^}]+)/g, '<span class="tex-place">$1</span>');
    html = html.replace(/([{}\[\]])/g, '<span class="tex-brace">$1</span>');
    return html;
}

export function exportLatex() {
    if (!latexEdited || suppressWarning) {
        forceExportLatex();
        return;
    }
    if (isSwalOpen) return;

    isSwalOpen = true;
    Swal.fire({
        title: 'Warning: Manually-entered code!',
        html: `
            <p style="font-size: 14px; color: #34495e;">You have made manual edits to the LaTeX code.<br>If the code is updated from the canvas, your changes will be <b>deleted</b>.</p>
            <label style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 15px; font-size: 13px; cursor: pointer;">
                <input type="checkbox" id="swal-dont-ask" style="width: 16px; height: 16px;"> Don't ask me again (for this session)
            </label>
        `,
        icon: 'warning',
        showCancelButton: true, 
        confirmButtonText: 'Yes, Overwrite', cancelButtonText: 'Keep my changes',
        preConfirm: () => ({ isChecked: document.getElementById('swal-dont-ask').checked })
    }).then((result) => {
        isSwalOpen = false;
        if (result.isConfirmed) {
            if (result.value && result.value.isChecked) suppressWarning = true; 
            forceExportLatex(); 
        }
    });
}

export function forceExportLatex() {
    latexEdited = false;
    let outText = "\\begin{tikzpictureJL}\n";
    let outHTML = "\\begin{tikzpictureJL}\n";
    const isSelected = (id) => AppState.selectedElements.some(e=>e.id===id) || AppState.selectedLinks.some(l=>l.id===id);

    AppState.graph.getElements().forEach(el => {
        const p = el.position(), macro = el.get('latexMacro');
        let line = ""; let htmlBlock = ""; 

        if (macro === 'connectordot') {
            if (el.get('isGhost')) return; 
            let cleanDotLine = "  \\connectordot{(" + ((p.x + 20) / AppState.EXPORT_DIV).toFixed(2) + "," + (-(p.y + 20) / AppState.EXPORT_DIV).toFixed(2) + ")}";
            let idStr = ` % id:${el.id}`;
            
            // THE FIX: The Invisibility Cloak! We force display:none right here.
            let htmlIdSpan = `<span class="sync-id" contenteditable="false" style="display: none; user-select: none; pointer-events: none;">${idStr}</span>`;
            
            line = cleanDotLine + idStr + "\n";
            htmlBlock = highlightLatex(escapeHTML(cleanDotLine)) + htmlIdSpan + "\n";
        } else {
            const visOrg = getVisualOrigin(el);
            const tx = (Math.round(visOrg.x) / AppState.EXPORT_DIV).toFixed(2);
            const ty = (-(Math.round(visOrg.y)) / AppState.EXPORT_DIV).toFixed(2);
            
            const rot = (360 - (el.get('angle') || 0)) % 360;
            const flipH = el.get('flipH') || false; const flipV = el.get('flipV') || false;
            let flipStr = 'none';
            if (flipH && flipV) flipStr = 'hv'; else if (flipH) flipStr = 'h'; else if (flipV) flipStr = 'v';

            const data = JL_DATABASE[macro];
            
            // ========================================================
            // THE UNROLL ENGINE: Convert custom subcircuits to raw TikZ!
            // ========================================================
            if (data && data.isCustomSubcircuit) {
                let sx = flipH ? -1 : 1;
                let sy = flipV ? -1 : 1;
                let currentScale = el.get('customScale') || 1;
                let scaleStr = currentScale !== 1 ? `, scale=${currentScale}` : '';
                
                let unrolled = `  % --- Subcircuit: ${el.get('displayedText')} ---\n`;
                unrolled += `  \\begin{scope}[shift={(${tx},${ty})}, rotate=${rot}, xscale=${sx}, yscale=${sy}${scaleStr}]\n`;
                unrolled += `    \\getzoomfactor\n`;
                
                // 1. Draw the vector paths natively
                let tikzPath = data.iconBase.replace(/\/\*TEXT:[^\*]+\*\//g, '').trim();
                if (tikzPath) unrolled += `    ${svgToTikz(tikzPath, {sw: "1.5", stroke: "", dashed: false, solid: false})}\n`;
                
                // 2. Draw the pin labels
                let textRegex = /M\s+([-+]?[\d\.]+)\s+([-+]?[\d\.]+).*?\/\*TEXT:([^,]+),([^,]+),(.*)\*\//g;
                let tMatch;
                while ((tMatch = textRegex.exec(data.iconBase)) !== null) {
                    let px = (parseFloat(tMatch[1]) / 10).toFixed(2);
                    let py = (-parseFloat(tMatch[2]) / 10).toFixed(2);
                    let tStyle = tMatch[4];
                    let tStr = tMatch[5];
                    let formatStart = tStyle === 'bold' ? "\\textbf{" : (tStyle === 'italic' ? "\\textit{" : "");
                    let formatEnd = formatStart ? "}" : "";
                    unrolled += `    \\node[draw=none, align=center] at (${px}, ${py}) {${formatStart}${tStr}${formatEnd}};\n`;
                }
                
                // 3. Register the connection pins
                if (data.pins) {
                    unrolled += `    % coordinate pins\n`;
                    data.pins.forEach(p => {
                        let px = (p.x / 10).toFixed(2);
                        let py = (-p.y / 10).toFixed(2);
                        unrolled += `    \\coordinate (${p.id}) at (${px}, ${py});\n`;
                    });
                }
                
                // 4. Drop the main label at the bottom center
                let mainLabel = el.get('displayedText');
                if (mainLabel && !el.get('customHideLabel')) {
                    let bW = el.get('baseWidth') || 120;
                    let bH = el.get('baseHeight') || 80;
                    let lblX = (bW / 20).toFixed(2);
                    let lblY = (-(bH / 10) - 1.0).toFixed(2);
                    unrolled += `    \\node[draw=none, align=center] at (${lblX}, ${lblY}) {${mainLabel}};\n`;
                }
                
                unrolled += `  \\end{scope}\n`;
                
                let idStr = ` % id:${el.id}`;
                let htmlIdSpan = `<span class="sync-id" contenteditable="false" style="display: none; user-select: none; pointer-events: none;">${idStr}</span>`;
                
                line = unrolled + idStr + "\n";
                htmlBlock = highlightLatex(escapeHTML(unrolled)) + htmlIdSpan + "\n";

            } else {
                // ========================================================
                // STANDARD LATEX MACRO EXPORTER
                // ========================================================
                const argsCount = (data && data.argsCount) ? data.argsCount : 7;
                const argNames = (data && data.argNames) ? data.argNames : [];
                
                let args = [];
                for (let i = 0; i < argsCount; i++) {
                    let argDef = argNames[i] || { name: '', optional: false };
                    let desc = argDef.name.toLowerCase();
                    let customArgs = el.get('customArgs') || [];
                    let innerVal = "...";

                    if (desc.includes('position')) innerVal = `(${tx},${ty})`;
                    else if (desc.includes('rotation') && desc.includes('flip')) innerVal = `${rot},${flipStr}`;
                    else if (desc.includes('rotation') || desc.includes('angle')) innerVal = `${rot}`;            
                    else if (desc.includes('flip')) innerVal = `${flipStr}`;        
                    else {
                        if (customArgs[i] !== undefined) innerVal = customArgs[i];
                        else {
                            if (desc === 'name') innerVal = `$NAME$`;
                            else if (desc === 'text') innerVal = ``; 
                            else if (desc.includes('grid')) innerVal = `type "gridon" to show grid`;
                            else if (desc.includes('show')) innerVal = `type "show" to display (0,0)`;
                            else if (argDef.name.includes('/')) innerVal = argDef.name.split('/')[0].trim(); 
                            else innerVal = argDef.name ? argDef.name : "...";
                        }
                    }
                    
                    let exportVal = innerVal;
                    if (argDef.optional) args.push(`[${exportVal}]`);
                    else args.push(`{${exportVal}}`);
                }

                let currentScale = el.get('customScale') || 1;
                let cleanMacroLine = "  \\" + macro + args.join("");
                let idStr = ` % id:${el.id}`;
                let htmlIdSpan = `<span class="sync-id" contenteditable="false" style="display: none; user-select: none; pointer-events: none;">${idStr}</span>`;
                
                let finalRawLine = cleanMacroLine + idStr + "\n";
                let finalHtmlLine = highlightLatex(escapeHTML(cleanMacroLine)) + htmlIdSpan + "\n";

                if (currentScale !== 1) {
                    let scaleOn = `  \\setscale{${currentScale}}\n`;
                    let scaleOff = `  \\setscale{1}\n`;
                    line = scaleOn + finalRawLine + scaleOff;
                    htmlBlock = highlightLatex(escapeHTML(scaleOn)) + finalHtmlLine + highlightLatex(escapeHTML(scaleOff));
                } else {
                    line = finalRawLine; htmlBlock = finalHtmlLine;
                }
            } 
		}
        outText += line;
        if (isSelected(el.id)) outHTML += `<span class="highlight">${htmlBlock}</span>`;
        else outHTML += htmlBlock;
    });

    let segments = [];
    AppState.graph.getLinks().forEach(link => {
        let pts = [link.getSourcePoint(), ...(link.vertices() || []), link.getTargetPoint()];
        for (let i = 0; i < pts.length - 1; i++) {
            let x1 = ((Math.round(pts[i].x / 10) * 10) / AppState.EXPORT_DIV).toFixed(2);
            let y1 = ((Math.round(-pts[i].y / 10) * 10) / AppState.EXPORT_DIV).toFixed(2);
            let x2 = ((Math.round(pts[i+1].x / 10) * 10) / AppState.EXPORT_DIV).toFixed(2);
            let y2 = ((Math.round(-pts[i+1].y / 10) * 10) / AppState.EXPORT_DIV).toFixed(2);
            segments.push({ linkId: link.id, p1: `${x1},${y1}`, p2: `${x2},${y2}` });
        }
    });

    let paths = [];
    while (segments.length > 0) {
        let seg = segments.shift();
        let currentPath = [seg.p1, seg.p2], currentLinkIds = new Set([seg.linkId]), added = true;
        while (added) {
            added = false;
            for (let i = 0; i < segments.length; i++) {
                let s = segments[i];
                if (s.p1 === currentPath[currentPath.length - 1]) { currentPath.push(s.p2); currentLinkIds.add(s.linkId); segments.splice(i, 1); added = true; break; } 
                else if (s.p2 === currentPath[currentPath.length - 1]) { currentPath.push(s.p1); currentLinkIds.add(s.linkId); segments.splice(i, 1); added = true; break; } 
                else if (s.p2 === currentPath[0]) { currentPath.unshift(s.p1); currentLinkIds.add(s.linkId); segments.splice(i, 1); added = true; break; } 
                else if (s.p1 === currentPath[0]) { currentPath.unshift(s.p2); currentLinkIds.add(s.linkId); segments.splice(i, 1); added = true; break; }
            }
        }
        paths.push({ points: currentPath, linkIds: Array.from(currentLinkIds) });
    }

    paths.forEach(pathObj => {
        let line = "  \\draw[line cap=round, line join=round] (" + pathObj.points.join(") -- (") + ");\n";
        outText += line;
        let safeLine = highlightLatex(escapeHTML(line));
        if (pathObj.linkIds.some(id => isSelected(id))) outHTML += `<span class="highlight">${safeLine}</span>`;
        else outHTML += safeLine;
    });

    outText += "\\end{tikzpictureJL}";
    outHTML += "\\end{tikzpictureJL}";
    
    window.rawLatexCode = outText; 
    const outputEl = document.getElementById('latex-output');
    if (outputEl) {
        outputEl.innerHTML = outHTML;
        setTimeout(() => {
            const highlightedEl = document.querySelector('#latex-output .highlight');
            if (highlightedEl) highlightedEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 50); 
    }
}

// --- BI-DIRECTIONAL SYNC ---
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

export function syncFromLatex() {
    const outputEl = document.getElementById('latex-output');
    if (!outputEl) return;
    
    // THE FIX: Unhide the IDs for exactly 1 millisecond so innerText can read them
    const syncSpans = outputEl.querySelectorAll('.sync-id');
    syncSpans.forEach(span => span.style.display = 'inline');
    
    // Read the text while they are exposed
    const text = outputEl.innerText;
    
    // Immediately hide them again so the user never sees them
    syncSpans.forEach(span => span.style.display = 'none');

    const lines = text.split('\n');

    lines.forEach(line => {
        let match = line.match(/\\([a-zA-Z0-9]+)(.*)% id:([a-zA-Z0-9-]+)/);
        if (match) {
            let macro = match[1].trim(); let argsStr = match[2].trim(); let cellId = match[3].trim();
            let cell = AppState.graph.getCell(cellId); let data = JL_DATABASE[macro];
            if (!cell || !data) return;

            // --- 1. SPECIAL CASE: Solder Dots ---
            if (macro === 'connectordot') {
                let coordMatch = argsStr.match(/\(([-+]?[\d\.]+)\s*,\s*([-+]?[\d\.]+)\)/);
                if (coordMatch) {
                    let px = parseFloat(coordMatch[1]) * AppState.EXPORT_DIV;
                    let py = -parseFloat(coordMatch[2]) * AppState.EXPORT_DIV;
                    cell.position(px - 20, py - 20); // 20 is the dot's local offset
                }
                return; 
            }

            // --- 2. STANDARD COMPONENTS ---
            let extractedArgs = parseLatexArgs(argsStr);
            if (extractedArgs.length !== data.argsCount) return;

            let customArgs = cell.get('customArgs') || [];
            let applyGeom = false;
            let newAngle = cell.get('angle') || 0;
            let newFlipH = cell.get('flipH') || false;
            let newFlipV = cell.get('flipV') || false;
            let isVertical = false; 

            for(let i=0; i<data.argsCount; i++) {
                let desc = (data.argNames[i] || { name: '' }).name.toLowerCase();
                let val = extractedArgs[i];
                if (typeof val === 'string' && val.includes('vertical')) isVertical = true; 
                
                if (desc.includes('position')) {
                    let coordMatch = val.match(/\(([-+]?[\d\.]+)\s*,\s*([-+]?[\d\.]+)\)/);
                    if (coordMatch) {
                        let px = parseFloat(coordMatch[1]) * AppState.EXPORT_DIV;
                        let py = -parseFloat(coordMatch[2]) * AppState.EXPORT_DIV;
                        
                        let oldVis = getVisualOrigin(cell);
                        let p = cell.position();
                        cell.position(p.x + (px - oldVis.x), p.y + (py - oldVis.y));
                    }
                }
                else if (desc.includes('rotation') && desc.includes('flip')) {
                    let rotVal = extractedArgs[i].toLowerCase();
                    if (rotVal && !rotVal.includes('...')) {
                        let parts = rotVal.split(',');
                        newAngle = (360 - (parseFloat(parts[0]) || 0)) % 360;
                        newFlipH = false; newFlipV = false;
                        if (parts.length > 1) {
                            let fStr = parts[1].trim();
                            if (fStr === 'hv' || fStr === 'vh') { newFlipH = true; newFlipV = true; }
                            else if (fStr === 'h') newFlipH = true; else if (fStr === 'v') newFlipV = true;
                        }
                        applyGeom = true;
                    }
                } 
                else if (desc.includes('rotation') || desc.includes('angle')) {
                    let rotVal = extractedArgs[i].toLowerCase();
                    if (rotVal && !rotVal.includes('...')) { newAngle = (360 - (parseFloat(rotVal) || 0)) % 360; applyGeom = true; }
                }
                else if (desc.includes('flip')) {
                    let fStr = extractedArgs[i].toLowerCase().trim();
                    if (fStr && !fStr.includes('...')) {
                        if (fStr === 'hv' || fStr === 'vh') { newFlipH = true; newFlipV = true; }
                        else if (fStr === 'h') { newFlipH = true; newFlipV = false; }
                        else if (fStr === 'v') { newFlipH = false; newFlipV = true; }
                        else if (fStr === 'none') { newFlipH = false; newFlipV = false; }
                        applyGeom = true;
                    }
                }
                else if (desc.includes('horizontal') && desc.includes('vertical')) {
                    let orientVal = val.toLowerCase().trim();
                    if (orientVal === 'vertical') { newAngle = 270; applyGeom = true; } 
                    else if (orientVal === 'horizontal') { newAngle = 0; applyGeom = true; }
                    customArgs[i] = val;
                }
                else {
                    customArgs[i] = extractedArgs[i];
                    if (desc === 'name' || desc === 'text') {
                        let newName = extractedArgs[i] === '$NAME$' ? data.name : extractedArgs[i];
                        updateElementLabel(cell, newName);
                    }
                }
            }
            if (isVertical && newAngle === 0) { newAngle = 270; applyGeom = true; }

            cell.set('customArgs', customArgs);
            assembleIcon(cell, customArgs);

            if (applyGeom) {
                let oldPin = getVisualOrigin(cell);
                cell.rotate(newAngle, true);
                cell.set('flipH', newFlipH); cell.set('flipV', newFlipV);
                applyRobustScale(cell, cell.get('customScale') || 1);
                let newPin = getVisualOrigin(cell);
                let p = cell.position();
                cell.position(p.x + (oldPin.x - newPin.x), p.y + (oldPin.y - newPin.y));
            }
        }
    });

    latexEdited = false; 
    forceExportLatex(); 
    Swal.fire({ toast: true, position: 'bottom-end', icon: 'success', title: 'Synced!', text: 'Canvas updated.', showConfirmButton: false, timer: 2000, background: '#f8f9fa' });
}

// --- LINTER & UTILS ---
export function validateLatexSyntax(rawText) {
    let errors = [];
    let text = rawText.replace(/\$(.*?)\$/g, 'MATH_BLOCK');
    
    let openBraces = (text.match(/\{/g) || []).length;
    let closeBraces = (text.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) errors.push(`<b>Brace Imbalance:</b> Found ${openBraces} open <code>{</code> and ${closeBraces} closed <code>}</code>.`);
    
    const knownSystemMacros = ['begin', 'end', 'draw', 'tikzpictureJL', 'connectordot', 'setscale'];
    const macroRegex = /\\([a-zA-Z]+)/g;
    let match;
    
    while ((match = macroRegex.exec(text)) !== null) {
        const macroName = match[1];
        const macroIndex = match.index;
        
        if (!knownSystemMacros.includes(macroName) && (!JL_DATABASE || !JL_DATABASE[macroName])) {
            errors.push(`<b>Unknown command:</b> <code>\\${macroName}</code>.`);
            continue;
        }
        
        if (JL_DATABASE && JL_DATABASE[macroName]) {
            const expectedArgs = JL_DATABASE[macroName].argsCount || 7;
            let argCount = 0; let i = macroIndex + match[0].length;
            
            while (i < text.length) {
                let char = text[i];
                if (char === ' ' || char === '\n' || char === '\r' || char === '\t') { i++; continue; }
                if (char === '{' || char === '[') {
                    argCount++; let openChar = char; let closeChar = char === '{' ? '}' : ']'; let depth = 1; i++;
                    while (i < text.length && depth > 0) {
                        if (text[i] === openChar) depth++; else if (text[i] === closeChar) depth--;
                        i++;
                    }
                } else break;
            }
            if (argCount !== expectedArgs) errors.push(`<b>Argument Mismatch for <code>\\${macroName}</code>:</b><br>Found ${argCount} arguments, expected ${expectedArgs}.`);
        }
    }
    return errors;
}

export function runLinterUI(onSuccessCallback = null) {
    const outputEl = document.getElementById('latex-output');
    
    // THE FIX: Unhide the IDs to read them into innerText so we can strip them for export!
    const syncSpans = outputEl.querySelectorAll('.sync-id');
    syncSpans.forEach(span => span.style.display = 'inline');
    let rawText = outputEl.innerText;
    syncSpans.forEach(span => span.style.display = 'none');
    
    let cleanText = rawText.replace(/ % id:[a-zA-Z0-9-]+/g, '');
    const errors = validateLatexSyntax(cleanText);
    
    if (errors.length === 0) {
        if (onSuccessCallback) onSuccessCallback(cleanText); 
        else Swal.fire({ icon: 'success', title: 'LaTeX code OK!', timer: 1500, showConfirmButton: false });
    } else {
        const errorHtml = `<ul style="text-align: left; font-size: 14px; color: #c0392b; background: #fad390; padding: 15px; border-radius: 5px;">` + errors.map(e => `<li style="margin-bottom: 8px;">${e}</li>`).join('') + `</ul>`;
        Swal.fire({
            icon: 'error', title: 'Errors found', html: errorHtml,
            showCancelButton: onSuccessCallback ? true : false,
            confirmButtonText: onSuccessCallback ? "Ignore & Continue" : "OK, I'll fix them"
        }).then((result) => { if (result.isConfirmed && onSuccessCallback) onSuccessCallback(cleanText); });
    }
}

export function copyLatexToClipboard() {
    runLinterUI((textToCopy) => {
        navigator.clipboard.writeText(textToCopy).then(() => { Swal.fire({ icon: 'success', title: 'Copied!', timer: 1000, showConfirmButton: false }); });
    });
}

export function downloadLatex(isStandalone = false) {
    // Uses the existing runLinterUI function in latex.js
    runLinterUI((textToDownload) => {
        let finalOutput = textToDownload;
        let filename = 'circuit.tex';

        if (isStandalone) {
            filename = 'circuit_standalone.tex';
            
            // 1. Add scale to tikzpicture
            let scaledTikz = textToDownload.replace('\\begin{tikzpictureJL}', '\\begin{tikzpictureJL}[scale=0.245]');
            
            // 2. Indent for formatting
            let indentedTikz = scaledTikz.split('\n').map(line => '\t' + line).join('\n');

            // 3. Create the standalone document wrapper
            finalOutput = `\\documentclass{standalone}

\t% Required packages for the style file
\t\\usepackage{amsmath}
\t\\usepackage{tikz}
\t\\usepackage{xstring}
\t\\usepackage{xparse}
\t\\usepackage{etoolbox}
\t\\usepackage{calculator}
\t\\usepackage{accents}
\t\\usepackage{xcolor}

\t% Load your specific electronic parts style file
\t\\usepackage{tikz_electronic_parts}
\t\\standaloneenv{tikzpictureJL} 

\t\\begin{document}
\t\\settikzlinewidth{1.2}
\t\\tikzset{every picture/.style={line width=\\tikzlinewidth}}

${indentedTikz}

\t\\end{document}`;
        }

        // Trigger the smart Save Dialog
        saveFileAs(finalOutput, filename, 'text/plain', 'LaTeX Document');
    });
}

// --- Advanced SVG to TikZ Converter ---
export function svgToTikz(pathStr, styles) {
    let x=0, y=0;
    let tikz = "";
    let tokens = pathStr.match(/[a-zA-Z]|[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?/g);
    if(!tokens) return "";
    
    let i = 0, cmd = '';
    
    function angle(u, v) {
        let dot = u[0]*v[0] + u[1]*v[1];
        let len = Math.sqrt(u[0]*u[0]+u[1]*u[1]) * Math.sqrt(v[0]*v[0]+v[1]*v[1]);
        let ang = Math.acos(Math.max(-1, Math.min(1, dot/len)));
        return (u[0]*v[1] - u[1]*v[0] < 0) ? -ang : ang;
    }

    while(i < tokens.length) {
        let token = tokens[i];
        if(/[a-zA-Z]/.test(token)) { cmd = token; i++; }
        
        if(cmd === 'M' || cmd === 'L') { 
            x = parseFloat(tokens[i]); y = parseFloat(tokens[i+1]); 
            tikz += (cmd==='M'?'':`-- `) + `(${x/10}, ${-y/10}) `; i+=2; 
            if(cmd === 'M') cmd = 'L'; 
        }
        else if(cmd === 'm' || cmd === 'l') { 
            x += parseFloat(tokens[i]); y += parseFloat(tokens[i+1]); 
            tikz += (cmd==='m'?'':`-- `) + `(${x/10}, ${-y/10}) `; i+=2; 
            if(cmd === 'm') cmd = 'l';
        }
        else if(cmd === 'C' || cmd === 'c') {
            let cx1 = parseFloat(tokens[i]), cy1 = parseFloat(tokens[i+1]);
            let cx2 = parseFloat(tokens[i+2]), cy2 = parseFloat(tokens[i+3]);
            let ex = parseFloat(tokens[i+4]), ey = parseFloat(tokens[i+5]);
            if(cmd === 'c') { cx1+=x; cy1+=y; cx2+=x; cy2+=y; ex+=x; ey+=y; }
            tikz += `.. controls (${(cx1/10).toFixed(2)}, ${(-cy1/10).toFixed(2)}) and (${(cx2/10).toFixed(2)}, ${(-cy2/10).toFixed(2)}) .. (${(ex/10).toFixed(2)}, ${(-ey/10).toFixed(2)}) `;
            x = ex; y = ey; i+=6;
        }
        else if(cmd === 'Q' || cmd === 'q') {
            let cx = parseFloat(tokens[i]), cy = parseFloat(tokens[i+1]);
            let ex = parseFloat(tokens[i+2]), ey = parseFloat(tokens[i+3]);
            if(cmd === 'q') { cx+=x; cy+=y; ex+=x; ey+=y; }
            tikz += `.. controls (${(cx/10).toFixed(2)}, ${(-cy/10).toFixed(2)}) .. (${(ex/10).toFixed(2)}, ${(-ey/10).toFixed(2)}) `;
            x = ex; y = ey; i+=4;
        }
        else if(cmd === 'A' || cmd === 'a') {
            let rx = parseFloat(tokens[i])/10, ry = parseFloat(tokens[i+1])/10;
            let xrot = parseFloat(tokens[i+2]), fA = parseFloat(tokens[i+3]), fS = parseFloat(tokens[i+4]);
            let ex = (cmd === 'a' ? x : 0) + parseFloat(tokens[i+5]);
            let ey = (cmd === 'a' ? y : 0) + parseFloat(tokens[i+6]);
            
            let x1 = x/10, y1 = -y/10, x2 = ex/10, y2 = -ey/10;
            let phi = -xrot * Math.PI / 180, fS_tikz = 1 - fS; 
            
            let dx = (x1 - x2)/2, dy = (y1 - y2)/2;
            let x1p = Math.cos(phi)*dx + Math.sin(phi)*dy;
            let y1p = -Math.sin(phi)*dx + Math.cos(phi)*dy;
            let rxSq = rx*rx, rySq = ry*ry, x1pSq = x1p*x1p, y1pSq = y1p*y1p;
            
            let radCheck = x1pSq/rxSq + y1pSq/rySq;
            if (radCheck > 1) { rx *= Math.sqrt(radCheck); ry *= Math.sqrt(radCheck); rxSq=rx*rx; rySq=ry*ry; }
            
            let sign = (fA === fS_tikz) ? -1 : 1;
            let sq = Math.max(0, ((rxSq*rySq) - (rxSq*y1pSq) - (rySq*x1pSq)) / ((rxSq*y1pSq) + (rySq*x1pSq)));
            let coef = sign * Math.sqrt(sq);
            let cxp = coef * ((rx * y1p) / ry);
            let cyp = coef * (-(ry * x1p) / rx);
            
            let vx1 = (x1p - cxp)/rx, vy1 = (y1p - cyp)/ry;
            let vx2 = (-x1p - cxp)/rx, vy2 = (-y1p - cyp)/ry;
            
            let startAng = angle([1,0], [vx1, vy1]) * 180/Math.PI;
            let deltaAng = angle([vx1, vy1], [vx2, vy2]) * 180/Math.PI;
            
            if (fS_tikz === 0 && deltaAng > 0) deltaAng -= 360;
            if (fS_tikz === 1 && deltaAng < 0) deltaAng += 360;
            let endAng = startAng + deltaAng;
            
            tikz += `arc (${startAng.toFixed(1)}:${endAng.toFixed(1)}:${rx.toFixed(3)} and ${ry.toFixed(3)}) `;
            x = ex; y = ey; i+=7;
        }
        else if(cmd === 'Z' || cmd === 'z') { tikz += `-- cycle `; cmd=''; }
        else { i++; } 
    }
    let extra = "";
    if (styles) {
        if (styles.dashed) extra += ", dashed";
        if (styles.solid) extra += ", fill=black";
        if (styles.rounded) extra += ", line cap=round, line join=round";
        return `\\draw [line width=\\linewidthscalefactor * \\zoomfactor * ${styles.sw}pt${extra}] ${tikz.trim()};`;
    }
    return `\\draw [line width=\\linewidthscalefactor * \\zoomfactor * 1.5pt] ${tikz.trim()};`;
}