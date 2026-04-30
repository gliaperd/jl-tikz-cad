import re
import math
import os

def angle(u, v):
    dot = u[0]*v[0] + u[1]*v[1]
    length = math.sqrt(u[0]*u[0]+u[1]*u[1]) * math.sqrt(v[0]*v[0]+v[1]*v[1])
    if length == 0:
        val = 1.0
    else:
        val = max(-1.0, min(1.0, dot/length))
    ang = math.acos(val)
    return -ang if (u[0]*v[1] - u[1]*v[0] < 0) else ang

def svg_to_tikz(path_str, style_tag=""):
    sw = "1.5"
    dashed = ""
    fill_str = ""
    rounded_str = ""
    
    if style_tag:
        if "stroke-width=" in style_tag:
            sw_match = re.search(r'stroke-width=([\d\.]+)', style_tag)
            if sw_match: 
                sw = str(round(float(sw_match.group(1)) * 0.8, 2))
        if "stroke-dasharray" in style_tag:
            dashed = ", dashed"
        if "fill=solid" in style_tag:
            fill_str = ", fill=black"
        if "rounded=true" in style_tag:
            rounded_str = ", line cap=round, line join=round" 

    tikz = ""
    tokens = re.findall(r'[a-zA-Z]|[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?', path_str)
    if not tokens: 
        return ""

    x, y = 0.0, 0.0
    i = 0
    cmd = ''

    while i < len(tokens):
        token = tokens[i]
        if re.match(r'[a-zA-Z]', token):
            cmd = token
            i += 1

        if cmd in ['M', 'L']:
            x, y = float(tokens[i]), float(tokens[i+1])
            tikz += ("" if cmd == 'M' else "-- ") + f"({x/10:.2f}, {-y/10:.2f}) "
            if cmd == 'M': cmd = 'L'
            i += 2
        elif cmd in ['m', 'l']:
            x += float(tokens[i]); y += float(tokens[i+1])
            tikz += ("" if cmd == 'm' else "-- ") + f"({x/10:.2f}, {-y/10:.2f}) "
            if cmd == 'm': cmd = 'l'
            i += 2
        # --- NEW: Quadratic Bezier Curve Support ---
        elif cmd in ['Q', 'q']:
            cx, cy = float(tokens[i]), float(tokens[i+1])
            ex, ey = float(tokens[i+2]), float(tokens[i+3])
            if cmd == 'q':
                cx += x; cy += y; ex += x; ey += y
            tikz += f".. controls ({cx/10:.2f}, {-cy/10:.2f}) .. ({ex/10:.2f}, {-ey/10:.2f}) "
            x, y = ex, ey
            i += 4
        # --- NEW: Cubic Bezier Curve Support ---
        elif cmd in ['C', 'c']:
            cx1, cy1 = float(tokens[i]), float(tokens[i+1])
            cx2, cy2 = float(tokens[i+2]), float(tokens[i+3])
            ex, ey = float(tokens[i+4]), float(tokens[i+5])
            if cmd == 'c':
                cx1 += x; cy1 += y; cx2 += x; cy2 += y; ex += x; ey += y
            tikz += f".. controls ({cx1/10:.2f}, {-cy1/10:.2f}) and ({cx2/10:.2f}, {-cy2/10:.2f}) .. ({ex/10:.2f}, {-ey/10:.2f}) "
            x, y = ex, ey
            i += 6
        elif cmd in ['A', 'a']:
            rx, ry = float(tokens[i])/10.0, float(tokens[i+1])/10.0
            xrot, fA, fS = float(tokens[i+2]), float(tokens[i+3]), float(tokens[i+4])
            ex = (x if cmd == 'a' else 0.0) + float(tokens[i+5])
            ey = (y if cmd == 'a' else 0.0) + float(tokens[i+6])

            x1, y1 = x/10.0, -y/10.0
            x2, y2 = ex/10.0, -ey/10.0
            phi = -xrot * math.pi / 180.0
            fS_tikz = 1.0 - fS

            dx, dy = (x1 - x2)/2.0, (y1 - y2)/2.0
            x1p = math.cos(phi)*dx + math.sin(phi)*dy
            y1p = -math.sin(phi)*dx + math.cos(phi)*dy
            rxSq, rySq = rx*rx, ry*ry
            x1pSq, y1pSq = x1p*x1p, y1p*y1p

            radCheck = x1pSq/rxSq + y1pSq/rySq
            if radCheck > 1:
                rx *= math.sqrt(radCheck); ry *= math.sqrt(radCheck)
                rxSq, rySq = rx*rx, ry*ry

            sign = -1.0 if fA == fS_tikz else 1.0
            denominator = (rxSq*y1pSq) + (rySq*x1pSq)
            sq = max(0.0, ((rxSq*rySq) - (rxSq*y1pSq) - (rySq*x1pSq)) / denominator) if denominator > 0 else 0
            coef = sign * math.sqrt(sq)
            
            cxp = coef * ((rx * y1p) / ry) if ry != 0 else 0
            cyp = coef * (-(ry * x1p) / rx) if rx != 0 else 0

            vx1 = (x1p - cxp)/rx if rx != 0 else 0; vy1 = (y1p - cyp)/ry if ry != 0 else 0
            vx2 = (-x1p - cxp)/rx if rx != 0 else 0; vy2 = (-y1p - cyp)/ry if ry != 0 else 0

            startAng = angle([1,0], [vx1, vy1]) * 180.0/math.pi
            deltaAng = angle([vx1, vy1], [vx2, vy2]) * 180.0/math.pi

            if fS_tikz == 0 and deltaAng > 0: deltaAng -= 360.0
            if fS_tikz == 1 and deltaAng < 0: deltaAng += 360.0
            endAng = startAng + deltaAng

            tikz += f"arc ({startAng:.1f}:{endAng:.1f}:{rx:.3f} and {ry:.3f}) "
            x, y = ex, ey
            i += 7
        elif cmd in ['Z', 'z']:
            tikz += "-- cycle "
            cmd = ''
        else:
            i += 1

    return f"\\draw [line width=\\linewidthscalefactor * \\zoomfactor * {sw}pt{dashed}{fill_str}{rounded_str}] {tikz.strip()};"

def extract_text_nodes(path_str):
    nodes_tikz = ""
    matches = re.finditer(r'M\s+([-+]?[\d\.]+)\s+([-+]?[\d\.]+).*?/\*TEXT:([^,]+),([^,]+),(.*?)\*/', path_str)
    for m in matches:
        x = float(m.group(1)) / 10.0
        y = -float(m.group(2)) / 10.0
        style = m.group(4)
        text_str = m.group(5)
        
        fmt_start = "\\textbf{" if style == 'bold' else ("\\textit{" if style == 'italic' else "")
        fmt_end = "}" if fmt_start else ""
        
        nodes_tikz += f"\\node[draw=none, align=center] at ({x:.2f}, {y:.2f}) {{{fmt_start}{text_str}{fmt_end}}};\n        "
    return nodes_tikz.rstrip()

def compile_macro(macro_text):
    # THE FIX: Separate the [style] tag from the raw SVG path so it doesn't crash the math parser!
    base_match = re.search(r'%\s*(?:icon_base|icon):\s*(\[.*?\])?(.*)', macro_text)
    if not base_match:
        return macro_text, macro_text
    
    base_style = base_match.group(1).strip() if base_match.group(1) else ""
    base_path = base_match.group(2).split('//')[0].strip()
    adds = re.findall(r'%\s*add_icon:\s*([^:]+):\s*(\[.*?\])?(.*)', macro_text)

    comp_debug = "\n        % --- AUTO-COMPILED FROM SVG METADATA ---\n"
    comp_debug += f"        {svg_to_tikz(base_path, base_style)}\n"
    if extract_text_nodes(base_path): comp_debug += f"        {extract_text_nodes(base_path)}\n"
    
    comp_clean = f"\n        {svg_to_tikz(base_path, base_style)}\n"
    if extract_text_nodes(base_path): comp_clean += f"        {extract_text_nodes(base_path)}\n"
    
    for cond, style, path in adds:
        cond = cond.strip()
        style = style.strip() if style else ""
        path = path.split('//')[0].strip()
        
        comp_debug += f"        % overlay: {cond}\n"
        
        if cond == '1~=' or cond == '':
            block = f"        {svg_to_tikz(path, style)}\n"
            comp_debug += block
            comp_clean += block
            continue
            
        # =====================================================================
        # 2. ΧΕΙΡΙΣΜΟΣ ΠΟΛΥΠΛΟΚΗΣ ΛΟΓΙΚΗΣ (OR, Παρενθέσεις)
        # =====================================================================
        if '||' in cond or '(' in cond or ')' in cond:
            print(f"⚠️  WARNING: Complex logic detected in overlay '{cond}'.")
            print(f"   -> Generating STATIC TikZ code (Preview mode).")
            
            # Δημιουργία του Static Block
            # Το σχήμα σχεδιάζεται κανονικά, αλλά προσθέτουμε σχόλια προειδοποίησης
            static_tikz = svg_to_tikz(path, style)
            warning_block = f"        % ⚠️ COMPLEX LOGIC DETECTED: {cond}\n"
            warning_block += f"        % This overlay is rendered STATICALLY. Add your LaTeX logic manually below:\n"
            warning_block += f"        {static_tikz}\n"
            
            comp_debug += warning_block
            comp_clean += warning_block
            continue
        # =====================================================================
        
        # 3. Κανονική επεξεργασία για απλά AND        
        conds = [c.strip() for c in cond.split('&&') if c.strip()]
        
        result_block_debug = f"        {svg_to_tikz(path, style)}\n"
        if extract_text_nodes(path): result_block_debug += f"        {extract_text_nodes(path)}\n"
        
        result_block_clean = f"        {svg_to_tikz(path, style)}\n"
        if extract_text_nodes(path): result_block_clean += f"        {extract_text_nodes(path)}\n"
        
        # Build nested IFs backwards!
        for c in reversed(conds):
            if '==' in c:
                arg, val = c.split('==')
                result_block_debug = f"        \\ifstrequal{{#{arg.strip()}}}{{{val.strip()}}}{{\n    {result_block_debug}        }}{{}}\n"
                result_block_clean = f"        \\ifstrequal{{#{arg.strip()}}}{{{val.strip()}}}{{\n    {result_block_clean}        }}{{}}\n"
            elif '!=' in c:
                # --- ΝΕΟ: Η λογική του NOT EQUAL στο LaTeX ---
                # Αν το όρισμα ΙΣΟΥΤΑΙ με την τιμή, ΜΗΝ κάνεις τίποτα {}. ΑΛΛΙΩΣ, ζωγράφισε το layer!
                arg, val = c.split('!=')
                result_block_debug = f"        \\ifstrequal{{#{arg.strip()}}}{{{val.strip()}}}{{}}{{\n    {result_block_debug}        }}\n"
                result_block_clean = f"        \\ifstrequal{{#{arg.strip()}}}{{{val.strip()}}}{{}}{{\n    {result_block_clean}        }}\n"
            elif '~=' in c:
                arg, val = c.split('~=')
                result_block_debug = f"        \\ifstrequal{{#{arg.strip()}}}{{{val.strip()}}}{{}}{{\n    {result_block_debug}        }}\n"
                result_block_clean = f"        \\ifstrequal{{#{arg.strip()}}}{{{val.strip()}}}{{}}{{\n    {result_block_clean}        }}\n"
                
        comp_debug += result_block_debug
        comp_clean += result_block_clean
            
    comp_debug += "        % --- END COMPILED ---"

    # --- FIX: Split at the insertion point, then purge legacy code from the ENTIRE tail ---
    insert_match = re.search(r'(\\begin\{scope\}[^\n]*\n(?:[ \t]*\\getzoomfactor\s*)?)', macro_text, flags=re.DOTALL)
    if insert_match:
        head = macro_text[:insert_match.end()]
        tail = macro_text[insert_match.end():]

        legacy_regex = r'\\(?:draw|filldraw|path|fill)[^;]+;'

        def clean_debug(m):
            if 'grid' in m.group(0): return m.group(0)
            return '% [legacy visual drawing removed]\n'

        def clean_final(m):
            if 'grid' in m.group(0): return m.group(0)
            return '' 

        debug_tail = re.sub(legacy_regex, clean_debug, tail)
        clean_tail = re.sub(legacy_regex, clean_final, tail)
        
        clean_tail = re.sub(r'^[ \t]*%(?!%)[ \t]*[a-zA-Z0-9_ \-]+\n', '', clean_tail, flags=re.MULTILINE)
        clean_tail = re.sub(r'\n\s*\n', '\n', clean_tail)

        debug_macro = head + comp_debug + debug_tail
        clean_macro = head + comp_clean + clean_tail
        
        return debug_macro, clean_macro
    else:
        # --- THE FIX: BRAND NEW COMPONENT FALLBACK ---
        # If the user deleted the \begin{scope} block, generate a fresh one!
        last_brace_idx = macro_text.rfind('}')
        if last_brace_idx != -1:
            head = macro_text[:last_brace_idx]
            
            # THE FIX: Capture the \n and %% Next Title that live after the final brace!
            tail_remainder = macro_text[last_brace_idx+1:] 
            
            # Generate the default LaTeX wrapper logic
            scope_header = "\n    \\IfSubStr{#5}{h}{\\edef\\xscalevalue{-1}}{\\edef\\xscalevalue{1}}\n"
            scope_header += "    \\IfSubStr{#5}{v}{\\edef\\yscalevalue{-1}}{\\edef\\yscalevalue{1}}\n"
            scope_header += "    \\begin{scope}[shift={#1}, scale=\\jlcscale, rotate=#5, xscale=\\xscalevalue, yscale=\\yscalevalue]\n"
            scope_header += "        \\getzoomfactor\n"
            
            # Append the tail_remainder back onto the end!
            debug_macro = head + scope_header + comp_debug + "\n    \\end{scope}\n}" + tail_remainder
            clean_macro = head + scope_header + comp_clean + "\n    \\end{scope}\n}" + tail_remainder
            
            return debug_macro, clean_macro

    return macro_text, macro_text


def process_library(input_file):
    print(f"Reading {input_file}...")
    
    base_name = os.path.splitext(os.path.basename(input_file))[0]
    debug_file = f"compiled_{base_name}_debug.sty"
    clean_file = f"compiled_{base_name}_clean.sty"
    
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()

    parts = re.split(r'(^\\newcommand\{\\[a-zA-Z0-9]+\})', content, flags=re.MULTILINE)
    
    debug_content = parts[0]
    clean_content = parts[0]
    compiled_count = 0

    for i in range(1, len(parts), 2):
        macro_decl = parts[i]
        macro_body = parts[i+1]
        full_macro = macro_decl + macro_body

        if '% icon_base:' in full_macro or '% icon:' in full_macro:
            debug_mac, clean_mac = compile_macro(full_macro)
            debug_content += debug_mac
            clean_content += clean_mac
            compiled_count += 1
        else:
            debug_content += full_macro
            clean_content += full_macro

    with open(debug_file, 'w', encoding='utf-8') as f:
        f.write(debug_content)
        
    with open(clean_file, 'w', encoding='utf-8') as f:
        f.write(clean_content)
        
    print(f"Success! Compiled {compiled_count} components.")
    print(f"-> Wrote '{debug_file}' (with tracking comments)")
    print(f"-> Wrote '{clean_file}' (fully stripped and minimized)")

if __name__ == "__main__":
    import sys
    # Accept the filename from the command line, or fallback to the default
    if len(sys.argv) > 1:
        input_file = sys.argv[1]
    else:
        input_file = 'tikz_electronic_parts.sty'
        
    process_library(input_file)