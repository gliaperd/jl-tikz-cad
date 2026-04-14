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
        
        if 'disabled' in body.lower(): continue
        
        comp_data = {
            "name": name,
            "argsCount": arg_count,
            "enabled": "true"
        }

        body_lines = body.strip().split('\n')
        
        # 1. Extract Metadata: Icons, Variants, Scales and Categories
        for line in body_lines:
            line = line.strip()
            
            # --- Extract the category (e.g., % category: Passives) ---
            if line.startswith('% category:'):
                comp_data['category'] = line.replace('% category:', '').strip()
            
            # --- Foolproof Variant Arg Parser ---
            elif '% variant_arg:' in line.lower() or '%variant_arg:' in line.lower():
                try:
                    val = line.split(':')[1].strip()
                    comp_data['variantArg'] = int(val)
                except ValueError:
                    pass
            
            # If we find an alternative variant icon (e.g., % icon_n: ...)
            elif line.startswith('% icon_'):
                m = re.match(r'% icon_([^:]+):(.*)', line)
                if m:
                    variant_name = m.group(1).strip()
                    variant_path = m.group(2).strip()
                    if 'icons' not in comp_data:
                        comp_data['icons'] = {}
                    comp_data['icons'][variant_name] = variant_path
                    # If a default icon is not set, use the first one found
                    if 'icon' not in comp_data:
                        comp_data['icon'] = variant_path
            
            # If we find the classic single icon
            elif line.startswith('% icon:'):
                comp_data['icon'] = line.replace('% icon:', '').strip()

            # If we find allowed scales (e.g., % scales: 1, 2, 4)
            elif line.startswith('% scales:'):
                scales_str = line.replace('% scales:', '').strip()
                try:
                    # Converts the string "0.5, 1, 2" into a list of numbers [0.5, 1, 2]
                    comp_data['scales'] = [float(s.strip()) if '.' in s.strip() else int(s.strip()) for s in scales_str.split(',')]
                except ValueError:
                    pass # If there is a typo, just ignore it
            
            # --- Flag for Solid Components (FOOLPROOF BOOLEAN) ---
            elif '% filled:' in line.lower() or '%filled:' in line.lower():
                val = line.split(':')[1].strip().lower()
                comp_data['filled'] = (val == 'true')
            # --- NEW: Exact OR Auto Coordinate Anchor ---
            elif '% label_anchor:' in line.lower() or '%label_anchor:' in line.lower():
                try:
                    parts = line.split(':')[1].strip().split()
                    if len(parts) == 1:
                        # Auto Mode: Just the direction (T, B, L, R)
                        comp_data['labelAnchor'] = { "auto": True, "dir": parts[0].upper() }
                    elif len(parts) >= 3:
                        # Manual Mode: Exact SVG Units + direction
                        comp_data['labelAnchor'] = {
                            "x": float(parts[0]),
                            "y": float(parts[1]),
                            "dir": parts[2].upper()
                        }
                except (IndexError, ValueError):
                    pass

        # 2. Extract Argument names from the first comment
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

        # 3. Extract pins and Labels
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

        # Save to database (if it has pins or is connectordot or freetext)
        if pins or name in ['connectordot', 'freetext']:
            database[name] = comp_data

    with open("components_db.js", "w", encoding="utf-8") as f:
        f.write(f"const JL_DATABASE = {json.dumps(database, indent=4)};")
    print(f"Success! {len(database)} components exported.")

generate_db('tikz_electronic_parts.sty')