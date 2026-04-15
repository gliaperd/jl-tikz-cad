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
        
        body_lines = body.strip().split('\n')
        
        if any(line.strip().lower() == '% disabled' for line in body_lines):
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

            elif line.startswith('% icon_base:'):
                comp_data['iconBase'] = line.replace('% icon_base:', '').strip()

            elif line.startswith('% add_icon:'):
                parts = line.replace('% add_icon:', '').split(':', 1)
                if len(parts) == 2:
                    if 'iconLayers' not in comp_data:
                        comp_data['iconLayers'] = []
                    comp_data['iconLayers'].append({
                        "condition": parts[0].strip(),
                        "path": parts[1].strip()
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
            
            elif '% filled:' in line.lower() or '%filled:' in line.lower():
                val = line.split(':')[1].strip().lower()
                comp_data['filled'] = (val == 'true')
                
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
            coord_match = re.search(r'\\coordinate\s*\(([a-zA-Z0-9]+)\)\s*at\s*\(([-+]?[\d\.]+)[^,]*,\s*([-+]?[\d\.]+)[^)]*\)', line)
            if coord_match:
                label_match = re.search(r'%.*\(([^)]+)\)', line)
                pins.append({
                    "id": coord_match.group(1),
                    "x": float(coord_match.group(2)) * 10,
                    "y": -float(coord_match.group(3)) * 10,
                    "label": label_match.group(1).strip() if label_match else ""
                })
        comp_data['pins'] = pins

        if pins or name in ['connectordot', 'freetext']:
            database[name] = comp_data

    with open("components_db.js", "w", encoding="utf-8") as f:
        f.write(f"const JL_DATABASE = {json.dumps(database, indent=4)};")
    print(f"Success! {len(database)} components exported.")

generate_db('tikz_electronic_parts.sty')