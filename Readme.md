# JL TikZ CAD ⚡

[English version follows Greek]

A lightweight, web-based CAD editor designed for electronic circuit sketching and automatic **LaTeX (TikZ)** code generation.

## ✨ Features
- **Visual Grid Editor**: Drag-and-drop interface with automatic grid snapping.
- **Smart LaTeX Export**: High-precision TikZ code generation (rotation & flip aware).
- **Component Database**: Dynamic library that syncs automatically with your `.sty` file.
- **Syntax Linter**: Built-in error checking for braces and LaTeX macro parameters.
- **Dark Mode Code Editor**: Real-time code preview with syntax highlighting.

## 🖱️ Usage Instructions (Controls & Shortcuts)

The editor is optimized for a fast workflow:

* **Navigation (Pan):** Press and hold the **Middle Mouse Button** (scroll wheel) or `Alt` + **Left Click** and drag the canvas.
* **Zooming:** Hold `Ctrl` and use the **Mouse Wheel** to scroll. Alternatively, use the **Fit** button for automatic centering.
* **Group Selection:** Click and drag in an empty area to create a selection box. You can move selected components and wires as a group.
* **Copy / Paste:** Select components and use `Ctrl+C` / `Ctrl+V`. Pasted items appear with a slight offset.
* **Delete:** Select items and press `Delete` or `Backspace`.

### 📝 Live LaTeX Editor
The bottom panel is a **fully functional editor**:
1. You can manually edit names (e.g., `$NAME$`), parameters, or add custom TikZ commands.
2. **Overwrite Protection:** If you manually edit the code and then move a component on the canvas, the system will warn you before overwriting your changes.
3. **Syntax Linter:** Click **🔍 Check Syntax** before exporting to ensure all braces are closed and parameters are correct.

## 🛠 Workflow (Adding New Components)
1.  Add your new `\newcommand` in `tikz_electronic_parts.sty` with the required `% icon:` and argument comments.
2.  Run the database script: `python build_db.py`.
3.  Refresh `index.html`, and your new component will appear in the sidebar.

---

# JL TikZ CAD (Ελληνική Έκδοση) ⚡

Ένας ελαφρύς, web-based CAD editor για τη σχεδίαση ηλεκτρονικών κυκλωμάτων και την αυτόματη παραγωγή κώδικα **LaTeX (TikZ)**.

## ✨ Χαρακτηριστικά
- **Visual Grid Editor**: Σχεδίαση με drag-and-drop και αυτόματο snapping στο grid.
- **Smart LaTeX Export**: Παραγωγή κώδικα TikZ με απόλυτη ακρίβεια στις συντεταγμένες (rotation & flip aware).
- **Component Database**: Δυναμική βιβλιοθήκη εξαρτημάτων που ενημερώνεται αυτόματα από το `.sty` αρχείο σας.
- **Syntax Linter**: Ενσωματωμένος έλεγχος λαθών για τις αγκύλες και τις παραμέτρους του LaTeX.
- **Dark Mode Code Editor**: Επεξεργασία κώδικα με Syntax Highlighting.

## 🖱️ Οδηγίες Χρήσης (Controls & Συντομεύσεις)

* **Πλοήγηση (Pan):** Πατήστε τη **Μεσαία Ροδέλα** ή `Alt` + **Αριστερό Κλικ** και σύρετε τον καμβά.
* **Ζουμ (Zoom):** Κρατήστε το `Ctrl` και χρησιμοποιήστε τη **Ροδέλα**. Το κουμπί **Fit** κάνει αυτόματο κεντράρισμα.
* **Μαζική Επιλογή:** Σύρετε το ποντίκι σε κενό χώρο για να επιλέξετε πολλά στοιχεία μαζί.
* **Copy / Paste:** Χρησιμοποιήστε `Ctrl+C` / `Ctrl+V` για γρήγορη αντιγραφή στοιχείων.
* **Διαγραφή:** Πατήστε `Delete` ή `Backspace`.

### 📝 Live Επεξεργασία Κώδικα (LaTeX Editor)
1. Το κάτω panel επιτρέπει χειροκίνητες αλλαγές σε ονόματα, παραμέτρους ή προσθήκη εντολών.
2. **Προστασία Αλλαγών:** Το σύστημα προειδοποιεί αν οι κινήσεις στον καμβά πρόκειται να διαγράψουν τις χειροκίνητες αλλαγές σας.
3. **Syntax Linter:** Το κουμπί **🔍 Check Syntax** ελέγχει για λάθη στις αγκύλες πριν την εξαγωγή.

## 🚀 Technologies / Τεχνολογίες
- **JointJS** (Diagramming Engine)
- **jQuery & Backbone.js** (UI Management)
- **Python** (Stylefile Parser)
- **SweetAlert2** (Interactive Dialogs)