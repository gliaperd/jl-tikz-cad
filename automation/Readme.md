# ⚙️ Automation & Compilation Suite

This suite manages the "bridge" between the visual SVG world (JavaScript) and the technical LaTeX world. It ensures that whatever you draw in the Symbol Builder becomes a usable part in the Circuit Editor.

## 🐍 Requirements
- Python 3.x
- No external libraries required (uses standard `re`, `math`, `json`, and `os` modules).

## 📄 The Core Scripts

### 1. `build_db.py` (The Database Generator)
This script parses your custom `tikz_electronic_parts.sty` file and extracts all the metadata to build the palette for the Web App.
- **Robust Regex Parsing:** Automatically strips inline `//` comments, reads optional styling tags `[stroke-width=2]`, and safely extracts macro arguments.
- **Smart Scale Normalization:** It reads the `\coordinate` points and detects the scale format. If a coordinate is written in TikZ units (e.g., `6.0`), it scales it `x10` for the Web DB. If it's already in Web DB format (e.g., `60`), it leaves it intact. This solves historical scaling mismatches!
- **Dynamic Pin Extraction:** Accurately extracts pin IDs and inline comments (e.g., `% ($4)`) to map dynamic math labels to the JointJS engine.
- **Usage:** Run `python build_db.py`.
- **Output:** Generates `components_db.js`, which is immediately read by `index.html`.

### 2. `compile_sty.py` (The SVG-to-TikZ Compiler)
Reads the SVG metadata embedded in your `.sty` comments and compiles them into pure, mathematical TikZ `\draw` commands for the final LaTeX document.
- **Usage**: `python compile_sty.py`
- **Outputs**: 
    - `compiled_X_clean.sty`: A pristine, production-ready TikZ library.
    - `compiled_X_debug.sty`: Includes tracking comments to see exactly what the Python script modified.

## 🛠️ The Standard Maintenance Workflow
Whenever you design a new component in the Symbol Builder:
1. Paste the generated code into `tikz_electronic_parts.sty`.
2. Run `python build_db.py` -> The component instantly appears in the web editor palette.
3. Run `python compile_sty.py` -> Generates the final, compilable LaTeX definitions for your academic document.