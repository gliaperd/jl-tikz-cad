import re, json

def generate_db(sty_file):
    database = {}
    try:
        with open(sty_file, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error: {e}")
        return

    commands = re.finditer(r'\\newcommand\{\\([a-zA-Z0-9]+)\}\s*\[(\d+)\](?:\[.*?\])?\s*\{(.*?)(?=\\newcommand|\Z)', content, re.DOTALL)

    for match in commands:
        name = match.group(1)
        arg_count = int(match.group(2))
        body = match.group(3)
        
        # --- THE FIX: Strip out // comments from every line before processing! ---
        body_lines = [line.split('//')[0].strip() for line in body.strip().split('\n')]
        
        if any(line.lower() == '% disabled' for line in body_lines):
            continue
        
        comp_data = {
            "name": name,
            "argsCount": arg_count,
            "enabled": "true"
        }
        
        for line in body_lines:
            line = line.strip()
            
            if line.startswith('% category:'):
                comp_data['category'] = line.replace('% category:', '').strip()
            
            elif '% variant_arg:' in line.lower() or '%variant_arg:' in line.lower():
                try:
                    val = line.split(':')[1].strip()
                    comp_data['variantArg'] = int(val)
                except ValueError:
                    pass
            
            # --- The Preview Override ---
            elif line.startswith('% preview_args:'):
                pairs = line.replace('% preview_args:', '').split(',')
                preview_args = {}
                for p in pairs:
                    if '=' in p:
                        k, v = p.split('=')
                        preview_args[k.strip()] = v.strip()
                comp_data['previewArgs'] = preview_args

            # --- ΒΕΛΤΙΩΜΕΝΟ ICON_BASE PARSING ---
            elif re.match(r'%\s*icon_base\s*:', line, re.IGNORECASE):
                # Παίρνουμε ό,τι υπάρχει μετά το :
                path_data = re.sub(r'%\s*icon_base\s*:', '', line, flags=re.IGNORECASE).strip()
                style_str = ""
                
                # Εξαγωγή του [style] αν υπάρχει
                if path_data.startswith('['):
                    end_idx = path_data.find(']')
                    if end_idx != -1:
                        style_str = path_data[1:end_idx].strip()
                        path_data = path_data[end_idx+1:].strip()
                
                comp_data['iconBase'] = path_data
                if style_str:
                    comp_data['iconBaseStyle'] = style_str
                comp_data['filled'] = 'fill=solid' in style_str
                
                # Ψάχνουμε για προαιρετικές αγκύλες στιλ π.χ. [stroke-width=2.5]
                if path_data.startswith('['):
                    end_idx = path_data.find(']')
                    if end_idx != -1:
                        style_str = path_data[1:end_idx].strip()
                        path_data = path_data[end_idx+1:].strip()
                
                comp_data['iconBase'] = path_data
                if style_str:
                    comp_data['iconBaseStyle'] = style_str

            elif line.startswith('% add_icon:'):
                parts = line.replace('% add_icon:', '').split(':', 1)
                if len(parts) == 2:
                    condition = parts[0].strip()
                    path_data = parts[1].strip()
                    
                    # Look for optional styling brackets [stroke=red, stroke-width=2]
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
                    variant_path = m.group(2).strip()
                    if 'icons' not in comp_data:
                        comp_data['icons'] = {}
                    comp_data['icons'][variant_name] = variant_path
                    if 'icon' not in comp_data:
                        comp_data['icon'] = variant_path
            
            elif line.startswith('% icon:'):
                comp_data['icon'] = line.replace('% icon:', '').strip()

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
                # Επιστροφή στον αυστηρό κανόνα: 1 TikZ unit = 10 Pixels
                val_x = float(coord_match.group(2)) * 10
                val_y = float(coord_match.group(3)) * 10

                # Αλεξίσφαιρη ανάγνωση του σχολίου (αγνοεί τις παρενθέσεις αν υπάρχουν)
                label_str = ""
                if '%' in line:
                    comment_part = line.split('%', 1)[1].strip()
                    label_str = re.sub(r'^\((.*)\)$', r'\1', comment_part).strip()

                pins.append({
                    "id": coord_match.group(1).strip(),
                    "x": val_x,
                    "y": -val_y, 
                    "label": label_str
                })
        comp_data['pins'] = pins

        if pins or name in ['connectordot', 'freetext']:
            database[name] = comp_data

    with open("components_db.js", "w", encoding="utf-8") as f:
        f.write(f"const JL_DATABASE = {json.dumps(database, indent=4)};")
    print(f"Success! {len(database)} components exported.")

generate_db('tikz_electronic_parts.sty')