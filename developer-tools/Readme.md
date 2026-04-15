# 🛠️ Component Symbol Builder
This visual IDE allows you to draw new component symbols without writing a single line of TikZ math.

## 🖱️ Features
- **Layers & Overlays**: Define a "Base Icon" and multiple conditional overlays (e.g., variable arrows).
- **Graphical Rule Builder**: Visually link overlays to macro arguments (e.g., "If Arg 4 is 'variable'").
- **Pin Dropper**: Click to place `\coordinate` pins (terminals) exactly where you need them.
- **Smart Eraser**: Click individual lines or shapes to remove them with `Ctrl+Z` support.

## 📝 Workflow for New Components
1. Open `component_symbol_builder.html`.
2. Draw your component using the Line, Rect, and Circle tools.
3. Use **Pins** (📌) to mark terminal points (e.g., pin1, pin2).
4. Set **Meta Properties** (Category, Anchor, Scales).
5. Copy the generated `.sty` metadata block and paste it into your `tikz_electronic_parts.sty` file.


