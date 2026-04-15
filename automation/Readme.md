# ⚙️ Automation & Compilation Suite
These scripts manage the "bridge" between the visual SVG world and the technical LaTeX world.

## 🐍 Requirements
- Python 3.x
- No external libraries required (uses standard `re`, `math`, and `os` modules).

## 📄 The Scripts

### 1. `compile_sty.py` (The SVG-to-TikZ Compiler)
This is the heavy lifter. It reads the SVG metadata in your `.sty` comments and compiles them into real TikZ `\draw` commands.
- **Usage**: `python compile_sty.py`
- **Outputs**: 
    - `compiled_X_clean.sty`: A pristine, production-ready library.
    - `compiled_X_debug.sty`: Includes tracking comments to see what was changed.

### 2. `build_db.py` (Database Generator)
Synchronizes your `.sty` file with the web-app.
- **Usage**: `python build_db.py`
- **Output**: `components_db.js` (Updates the palette in the main editor).

## 🛠️ Maintenance Workflow
Whenever you add a new component:
1. Update `tikz_electronic_parts.sty` with your new metadata.
2. Run `python build_db.py` to see the icon in the web editor.
3. Run `python compile_sty.py` to generate the final LaTeX code for your document.