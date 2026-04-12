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
        
        # 1. Εξαγωγή του Icon
        icon_match = re.search(r'%\s*icon\s*[:=]\s*(.*?)$', body, re.MULTILINE | re.IGNORECASE)
        icon_path = icon_match.group(1).strip() if icon_match else ""
        
        # 2. Εξαγωγή των ονομάτων των Arguments από το πρώτο σχόλιο (Πιάνει και {} και [])!
        arg_names = []
        body_lines = body.strip().split('\n')
        if body_lines and body_lines[0].strip().startswith('%'):
            comment_line = body_lines[0].strip()
            # Ψάχνουμε για κείμενο είτε μέσα σε [] είτε μέσα σε {}
            matches = re.findall(r'([\[\{])([^\]\}]+)[\]\}]', comment_line)
            for bracket, desc in matches:
                arg_names.append({
                    "name": desc.strip(),
                    "optional": True if bracket == '[' else False
                })

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

        if pins or name == 'connectordot':
            database[name] = { 
                "name": name, 
                "icon": icon_path, 
                "pins": pins, 
                "enabled": "true", 
                "argsCount": arg_count,
                "argNames": arg_names # Σώζουμε τα ονόματα στο JSON!
            }

    with open("components_db.js", "w", encoding="utf-8") as f:
        f.write(f"const JL_DATABASE = {json.dumps(database, indent=4)};")
    print(f"Success! {len(database)} components exported.")

generate_db('tikz_electronic_parts.sty')