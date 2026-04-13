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
        
        # 1. ΝΕΑ ΛΟΓΙΚΗ: Εξαγωγή Icons και Variants
        for line in body_lines:
            line = line.strip()
            
            # Αν βρούμε μεταβλητή (π.χ. % variant_arg: 3)
            if line.startswith('% variant_arg:'):
                comp_data['variantArg'] = int(line.replace('% variant_arg:', '').strip())
                if 'icons' not in comp_data:
                    comp_data['icons'] = {}
            
            # Αν βρούμε εναλλακτικό εικονίδιο (π.χ. % icon_n: ...)
            elif line.startswith('% icon_'):
                m = re.match(r'% icon_([^:]+):(.*)', line)
                if m:
                    variant_name = m.group(1).strip()
                    variant_path = m.group(2).strip()
                    if 'icons' not in comp_data:
                        comp_data['icons'] = {}
                    comp_data['icons'][variant_name] = variant_path
                    # Αν δεν έχουμε ορίσει default icon, βάζουμε το πρώτο που θα βρει
                    if 'icon' not in comp_data:
                        comp_data['icon'] = variant_path
            
            # Αν βρούμε το κλασικό μονό εικονίδιο
            elif line.startswith('% icon:'):
                comp_data['icon'] = line.replace('% icon:', '').strip()

        # 2. Εξαγωγή των ονομάτων των Arguments από το πρώτο σχόλιο
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

        # 3. Εξαγωγή των pins και των Labels
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

        # Αποθήκευση στη βάση (αν έχει pins ή είναι το connectordot ή freetext)
        if pins or name in ['connectordot', 'freetext']:
            database[name] = comp_data

    with open("components_db.js", "w", encoding="utf-8") as f:
        f.write(f"const JL_DATABASE = {json.dumps(database, indent=4)};")
    print(f"Success! {len(database)} components exported.")

generate_db('tikz_electronic_parts.sty')