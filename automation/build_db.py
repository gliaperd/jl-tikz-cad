import re, json

def generate_db(sty_file):
    database = {}
    ignored_components = [] # Λίστα από tuples: (όνομα, αιτιολογία)
    total_found = 0
    imported_count = 0
    
    try:
        with open(sty_file, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error: {e}")
        return

    # NEW REGEX: Stops the body from "eating" the next component's title!
    commands = re.finditer(r'(?:%%\s*([^\n]+)\n)?\s*\\newcommand\{\\([a-zA-Z0-9_]+)\}\s*\[(\d+)\](?:\[.*?\])?\s*\{(.*?)(?=\s*%%[^\n]+\n\s*\\newcommand|\s*\\newcommand|\Z)', content, re.DOTALL)

    for match in commands:
        display_name_raw = match.group(1)
        name = match.group(2)
        arg_count = int(match.group(3))
        body = match.group(4)
        
        # Fallback to the short macro name if no %% Title exists
        display_name = display_name_raw.strip() if display_name_raw else name
        
        # Clean whitespace, but DO NOT split on '//' globally because it destroys JavaScript code!
        body_lines = [line.strip() for line in body.strip().split('\n')]
        
        # --- 1. ΑΘΟΡΥΒΟ DISABLE (% disabled!) ---
        if any(line.lower() == '% disabled!' for line in body_lines):
            continue 
            
        total_found += 1
        
        # --- 2. ΚΑΝΟΝΙΚΟ DISABLE (% disabled) ---
        if any(line.lower() == '% disabled' for line in body_lines):
            ignored_components.append((name, "disabled"))
            continue
        
        comp_data = {
            "name": name,
            "displayName": display_name, # <--- NEW: Save the full name!
            "argsCount": arg_count,
            "enabled": "true"
        }
        
        in_shape_generator = False
        shape_gen_lines = []
        
        for line in body_lines:
            line_stripped = line.strip()
            
            # --- NEW: Catch Multi-line JS Generator ---
            if line_stripped.startswith('% shape_generator:'):
                in_shape_generator = True
                shape_gen_lines.append(line_stripped.replace('% shape_generator:', '').strip())
                continue
                
            if in_shape_generator:
                if line_stripped.startswith('%'):
                    # Strip the leading '%' and space to reconstruct the JS
                    js_line = line_stripped[1:].strip() 
                    shape_gen_lines.append(js_line)
                    continue
                else:
                    # We hit the end of the comment block
                    in_shape_generator = False
                    comp_data['shapeGenerator'] = '\n'.join(shape_gen_lines)
            
            if line.startswith('% category:'):
                comp_data['category'] = line.replace('% category:', '').strip()
            
            elif '% variant_arg:' in line.lower() or '%variant_arg:' in line.lower():
                try:
                    val = line.split(':')[1].strip()
                    comp_data['variantArg'] = int(val)
                except ValueError:
                    pass
            
            elif line.startswith('% preview_args:'):
                pairs = line.replace('% preview_args:', '').split(',')
                preview_args = {}
                for p in pairs:
                    if '=' in p:
                        k, v = p.split('=')
                        preview_args[k.strip()] = v.strip()
                comp_data['previewArgs'] = preview_args

            # --- DYNAMIC PROPERTIES (arg_def) ---
            elif line.startswith('% arg_def:'):
                try:
                    parts = line.replace('% arg_def:', '').split('|')
                    if len(parts) >= 4:
                        if 'argDefs' not in comp_data:
                            comp_data['argDefs'] = []
                        
                        arg_def = {
                            "idx": int(parts[0].strip()),
                            "type": parts[1].strip(),
                            "label": parts[2].strip(),
                            "defVal": parts[3].strip()
                        }
                        if len(parts) >= 5:
                            arg_def["options"] = parts[4].strip()
                            
                        comp_data['argDefs'].append(arg_def)
                except Exception as e:
                    print(f"Error parsing arg_def in {name}: {e}")

            elif re.match(r'%\s*icon_base\s*:', line, re.IGNORECASE):
                path_data = re.sub(r'%\s*icon_base\s*:', '', line, flags=re.IGNORECASE).strip()
                
                # FIX: Strip inline comments (//) from the SVG path so the browser doesn't choke!
                path_data = path_data.split('//')[0].strip()
                
                style_str = ""
                if path_data.startswith('['):
                    end_idx = path_data.find(']')
                    if end_idx != -1:
                        style_str = path_data[1:end_idx].strip()
                        path_data = path_data[end_idx+1:].strip()
                
                comp_data['iconBase'] = path_data
                if style_str:
                    comp_data['iconBaseStyle'] = style_str
                comp_data['filled'] = 'fill=solid' in style_str

            elif line.startswith('% add_icon:'):
                parts = line.replace('% add_icon:', '').split(':', 1)
                if len(parts) == 2:
                    condition = parts[0].strip()
                    path_data = parts[1].strip()
                    
                    # FIX: Strip inline comments (//) from the SVG path
                    path_data = path_data.split('//')[0].strip()
                    
                    style_str = ""
                    if path_data.startswith('['):
                        end_idx = path_data.find(']')
                        if end_idx != -1:
                            style_str = path_data[1:end_idx].strip()
                            path_data = path_data[end_idx+1:].strip()
                    
                    if 'iconLayers' not in comp_data:
                        comp_data['iconLayers'] = []
                    comp_data['iconLayers'].append({
                        "condition": condition,
                        "style": style_str,
                        "path": path_data
                    })
            
            elif line.startswith('% icon_'):
                m = re.match(r'% icon_([^:]+):(.*)', line)
                if m:
                    variant_name = m.group(1).strip()
                    
                    # FIX: Strip inline comments
                    variant_path = m.group(2).split('//')[0].strip()
                    
                    if 'icons' not in comp_data:
                        comp_data['icons'] = {}
                    comp_data['icons'][variant_name] = variant_path
                    if 'icon' not in comp_data:
                        comp_data['icon'] = variant_path
            
            elif line.startswith('% icon:'):
                # FIX: Strip inline comments
                comp_data['icon'] = line.replace('% icon:', '').split('//')[0].strip()

            elif line.startswith('% scales:'):
                scales_str = line.replace('% scales:', '').strip()
                try:
                    comp_data['scales'] = [float(s.strip()) if '.' in s.strip() else int(s.strip()) for s in scales_str.split(',')]
                except ValueError:
                    pass
                
            elif '% label_anchor:' in line.lower() or '%label_anchor:' in line.lower():
                try:
                    parts = line.split(':')[1].strip().split()
                    if len(parts) == 1:
                        comp_data['labelAnchor'] = { "auto": True, "dir": parts[0].upper() }
                    elif len(parts) >= 3:
                        comp_data['labelAnchor'] = {
                            "x": float(parts[0]),
                            "y": float(parts[1]),
                            "dir": parts[2].upper()
                        }
                except (IndexError, ValueError):
                    pass
                    
            elif '% rotation:' in line.lower():
                comp_data['rotatable'] = 'disabled' not in line.lower()
            elif '% flip:' in line.lower():
                comp_data['flippable'] = 'disabled' not in line.lower()
            
            # --- NEW: Parse the hide_label property ---
            elif line.startswith('% hide_label:'):
                val = line.replace('% hide_label:', '').strip().lower()
                comp_data['hideLabel'] = (val == 'true')

        if in_shape_generator:
            comp_data['shapeGenerator'] = '\n'.join(shape_gen_lines)
        
        arg_names = []
        if body_lines and body_lines[0].strip().startswith('%'):
            comment_line = body_lines[0].strip()
            matches = re.findall(r'([\[\{])([^\]\}]+)[\]\}]', comment_line)
            for bracket, desc in matches:
                arg_names.append({
                    "name": desc.strip(),
                    "optional": True if bracket == '[' else False
                })
        comp_data['argNames'] = arg_names

        pins = []
        for line in body_lines:
            coord_match = re.search(r'\\coordinate\s*(?:\[.*?\])?\s*\(([^\)]+)\)\s*at\s*\(([-+]?[\d\.]+)[^,]*,\s*([-+]?[\d\.]+)[^)]*\)', line)
            if coord_match:
                val_x = float(coord_match.group(2)) * 10
                val_y = float(coord_match.group(3)) * 10

                label_str = ""
                dir_str = "R"
                cond_str = "" # ΝΕΟ
                
                if '%' in line:
                    comment_part = line.split('%', 1)[1].strip()
                    
                    # ΝΕΟ: Parse IF condition
                    if_match = re.search(r'IF:(.+)$', comment_part)
                    if if_match:
                        cond_str = if_match.group(1).strip()
                        comment_part = comment_part[:if_match.start()].strip()

                    dir_match = re.search(r'\[([TBLR])\]', comment_part)
                    if dir_match:
                        dir_str = dir_match.group(1).upper()
                    
                    paren_match = re.search(r'\(([^)]+)\)', comment_part)
                    if paren_match:
                        label_str = paren_match.group(1).strip()

                pin_obj = {
                    "id": coord_match.group(1).strip(),
                    "x": val_x,
                    "y": -val_y, 
                    "label": label_str,
                    "dir": dir_str
                }
                if cond_str: # Αποθήκευση μόνο αν υπάρχει συνθήκη
                    pin_obj["condition"] = cond_str
                
                pins.append(pin_obj)
                
        comp_data['pins'] = pins

        # --- 3. ΕΛΕΓΧΟΣ IMPORT & PINS ---
        # Allow components if they have static pins, are special system shapes, OR possess a JS Shape Generator
        if pins or name in ['connectordot', 'freetext'] or 'shapeGenerator' in comp_data:
            database[name] = comp_data
            imported_count += 1
        else:
            ignored_components.append((name, "no static pins or JS generator"))

    # Εγγραφή της βάσης στο αρχείο
    with open("components_db.js", "w", encoding="utf-8") as f:
        f.write(f"const JL_DATABASE = {json.dumps(database, indent=4)};")
        
    # --- ΤΕΛΙΚΟ REPORT ---
    print("\n" + "="*50)
    print(" 🛠️  JL CAD DATABASE BUILDER REPORT")
    print("="*50)
    print(f" Found    : {total_found} components")
    print(f" Imported : {imported_count} components")
    print(f" Ignored  : {len(ignored_components)} components")
    
    if ignored_components:
        print("-" * 50)
        print(" List of ignored components:")
        for comp_name, reason in ignored_components:
            print(f"   • {comp_name:<25} - {reason}")
    print("="*50 + "\n")

generate_db('tikz_electronic_parts.sty')