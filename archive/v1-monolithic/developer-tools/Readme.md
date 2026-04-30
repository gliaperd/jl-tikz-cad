# 🛠️ Component Symbol Builder

The Symbol Builder is a visual IDE that allows you to draw new component symbols for the CAD library without manually calculating TikZ paths and coordinates.

## 🖱️ Key Features
- **Layers & Conditional Overlays:** Define a "Base Icon" and multiple logical overlays. Use the rule builder to say: *"Show this line ONLY if Argument 4 equals 'variable'"*.
- **Native Scale Handling:** Operates on a 10px = 1 TikZ unit scale, ensuring perfect 1:1 translation to the Circuit Editor's 40px grid.
- **Hybrid Code Generation:** Generates both the `\begin{scope}` TikZ body for your LaTeX document AND the `% meta-tags` required by the Python database parser.

## 📌 The Pin & Label System (Crucial Concept)
The tool allows you to place `\coordinate` points. How you name them defines how the Circuit Editor treats them:
1. **Physical Pins (Ports):** Give the pin a standard ID (e.g., `pin1`, `IN+`). The Editor will render a connection port (orange box) where wires can snap.
2. **Dynamic Math Labels:** If you want a dynamic text label (e.g., a voltage value from a LaTeX argument) WITHOUT a physical wire connection, name the Pin ID with the argument variable (e.g., `$4` or `-$4`) and leave the Label field empty. The Editor will render this purely as KaTeX math text!

## 📝 Workflow for Creating New Components
1. Open `component_symbol_builder.html`.
2. Draw your component's base shape using the Line, Rect, and Circle tools.
3. Switch to **Add Overlay**, define a logical condition (e.g., `4!=`), and draw the conditional parts.
4. Use the **Pins (📌)** tool to mark terminal points and dynamic label anchors.
5. Set the **Meta Properties** (Category, Anchor behavior, allowed Scales).
6. Click **Generate Full LaTeX**. 
7. Copy the entire output block and paste it into your `tikz_electronic_parts.sty` file.


