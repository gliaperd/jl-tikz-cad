# JL TikZ CAD ⚡

[English version follows Greek]

A lightweight, web-based CAD editor designed for electronic circuit sketching and automatic **LaTeX (TikZ)** code generation.

## ✨ Features
- **Visual Grid Editor**: Drag-and-drop interface with automatic grid snapping (40px base).
- **Smart LaTeX Export**: High-precision TikZ code generation (rotation & flip aware).
- **Bi-directional Sync**: Modify the LaTeX code and sync the changes directly back to the canvas.
- **Advanced SVG/PDF Export**: Export monochrome or full-color vector graphics with custom line weights.
- **Dynamic Themes**: Switch instantly between Standard and Cadence Virtuoso display modes.
- **Component Database**: Dynamic library that syncs automatically with your `.sty` file using Python.
- **Syntax Linter**: Built-in error checking for braces and LaTeX macro parameters (safely ignores math blocks).

## 🖱️ Usage Instructions (Controls & Shortcuts)
The editor is optimized for a fast workflow:
* **Navigation (Pan):** Press and hold the **Middle Mouse Button** (scroll wheel) or `Alt` + **Left Click** and drag the canvas.
* **Zooming:** Hold `Ctrl` and use the **Mouse Wheel** to scroll. Alternatively, use the **Fit** button for automatic centering.
* **Group Selection:** Click and drag in an empty area to create a selection box. You can move selected components and wires as a group.
* **Copy / Paste:** Select components and use `Ctrl+C` / `Ctrl+V`.
* **Delete:** Select items and press `Delete` or `Backspace`.
* **Minimize Panels**: Click the `🗕` icon on the palette or code editor to reclaim routing space.

## 🛠 Component Development Guide (`.sty` Syntax)
The component database is automatically generated from your `tikz_electronic_parts.sty` file via `generate_db.py`. To add or modify a component, use the following comment-based metadata format directly below your `\newcommand`.

### 1. Basic Component Definition
```latex
\newcommand{\mycomponent}[5]{%{position}{name}{value}{rotation}{grid}
% category: Passives
% scales: 1, 2, 4
% filled: false
% icon: M 0 0 L 10 0 ...
% label_anchor: B
```
* **Argument Definitions (`%{...}`)**: The first comment defines the Properties UI. Use `/` in a description (e.g., `value (0/1)`) to automatically create a dropdown menu in the UI, unless overridden by the variant mechanism.
* **`% category: <Name>`**: Groups the component under a specific header in the UI sidebar.
* **`% scales: 1, 2, 4`**: Defines the allowed scaling factors.
* **`% filled: true/false`**: Determines if the component's SVG path should be filled with the theme color or left transparent (hollow/broken box).

### 2. Label Anchoring (`% label_anchor:`)
Defines where the component's text label automatically snaps. It guarantees a perfect 1-grid-step gap at all scales.
* **Auto-Edge Math (`% label_anchor: B`)**: Automatically finds the absolute visual boundary of the drawing and pushes the text 1 grid step away. (Use `T` for Top, `B` for Bottom, `L` for Left, `R` for Right).
* **Exact SVG Coordinate (`% label_anchor: 28 -11 T`)**: Anchors exactly to the raw SVG coordinate `X=28, Y=-11` (from your drawing path) and pushes the text 1 grid step Up.

### 3. The Icon Swapping Mechanism (Variants)
You can build components that visually change based on a specific property argument (e.g., changing a switch from N-Type to P-Type).
```latex
\newcommand{\controlledswitch}[7]{%{pos}{name}{control}{n/p}{rot}{grid}{show}
% category: Switches
% variant_arg: 4
% icon_n: M 0 0 L 10 0 ...
% icon_p: M 0 0 L 10 0 ...
```
* **`% variant_arg: <Number>`**: Tells the engine which argument (1-indexed) controls the symbol variant. In the example above, Arg 4 is `{n/p}`.
* **`% icon_<value>:`**: Maps an SVG path to a specific dropdown value. `icon_n` maps to the `n` selection, `icon_p` maps to the `p` selection. The UI will automatically swap the SVG on the canvas when the user changes this property!

## 🚀 Script Workflow
1. Update your `tikz_electronic_parts.sty` file.
2. Run `python generate_db.py` to compile `components_db.js`.
3. Refresh `index.html` to see your updates live.

---

# JL TikZ CAD (Ελληνική Έκδοση) ⚡

Ένας ελαφρύς, web-based CAD editor για τη σχεδίαση ηλεκτρονικών κυκλωμάτων και την αυτόματη παραγωγή κώδικα **LaTeX (TikZ)**.

## ✨ Χαρακτηριστικά
- **Visual Grid Editor**: Σχεδίαση με drag-and-drop και αυτόματο snapping στο grid (βάση 40px).
- **Smart LaTeX Export**: Παραγωγή κώδικα TikZ με απόλυτη ακρίβεια (υποστηρίζει rotation & flip).
- **Bi-directional Sync**: Επεξεργαστείτε τον κώδικα LaTeX και συγχρονίστε τις αλλαγές πίσω στον καμβά.
- **Advanced SVG/PDF Export**: Εξαγωγή σε ασπρόμαυρο ή έγχρωμο διανυσματικό γραφικό.
- **Dynamic Themes**: Άμεση εναλλαγή μεταξύ Standard και Cadence Virtuoso display modes.
- **Component Database**: Δυναμική βιβλιοθήκη που ενημερώνεται αυτόματα από το `.sty` μέσω Python.
- **Syntax Linter**: Έλεγχος λαθών για αγκύλες και παραμέτρους (αγνοεί με ασφάλεια τα μαθηματικά).

## 🖱️ Οδηγίες Χρήσης (Controls & Συντομεύσεις)
* **Πλοήγηση (Pan):** Πατήστε τη **Μεσαία Ροδέλα** ή `Alt` + **Αριστερό Κλικ** και σύρετε τον καμβά.
* **Ζουμ (Zoom):** Κρατήστε το `Ctrl` και χρησιμοποιήστε τη **Ροδέλα**. Το κουμπί **Fit** κάνει αυτόματο κεντράρισμα.
* **Μαζική Επιλογή:** Σύρετε το ποντίκι σε κενό χώρο. Μπορείτε να μετακινήσετε μαζικά εξαρτήματα και καλώδια.
* **Copy / Paste:** `Ctrl+C` / `Ctrl+V`.
* **Διαγραφή:** Πατήστε `Delete` ή `Backspace`.
* **Απόκρυψη Πάνελ:** Κάντε κλικ στο εικονίδιο `🗕` στην παλέτα ή στον editor για να κερδίσετε χώρο.

## 🛠 Οδηγός Ανάπτυξης Εξαρτημάτων (Σύνταξη `.sty`)
Η βάση δεδομένων παράγεται αυτόματα από το αρχείο `tikz_electronic_parts.sty` τρέχοντας το `generate_db.py`. Για να προσθέσετε ή να τροποποιήσετε ένα εξάρτημα, χρησιμοποιήστε τα παρακάτω σχόλια μεταδεδομένων (metadata) ακριβώς κάτω από το `\newcommand`.

### 1. Βασικός Ορισμός Εξαρτήματος
```latex
\newcommand{\mycomponent}[5]{%{position}{name}{value}{rotation}{grid}
% category: Passives
% scales: 1, 2, 4
% filled: false
% icon: M 0 0 L 10 0 ...
% label_anchor: B
```
* **Ορισμός Ορισμάτων (`%{...}`)**: Το πρώτο σχόλιο φτιάχνει το UI των ιδιοτήτων. Χρησιμοποιήστε `/` στην περιγραφή (π.χ. `value (0/1)`) για αυτόματο Dropdown.
* **`% category: <Name>`**: Ομαδοποιεί το εξάρτημα στο πλευρικό μενού.
* **`% scales: 1, 2, 4`**: Ορίζει τις επιτρεπτές κλίμακες μεγέθους.
* **`% filled: true/false`**: Καθορίζει αν το SVG του εξαρτήματος θα γεμίζει με το χρώμα του theme ή θα παραμένει διάφανο.

### 2. Αγκίστρωση Ετικετών (`% label_anchor:`)
Καθορίζει πού θα κουμπώνει αυτόματα η ετικέτα του εξαρτήματος (διατηρεί πάντα απόσταση 1 grid block, ανεξαρτήτως κλίμακας).
* **Αυτόματος Υπολογισμός (`% label_anchor: B`)**: Βρίσκει αυτόματα το απόλυτο οπτικό όριο και σπρώχνει το κείμενο προς τα κάτω. (Χρησιμοποιήστε `T` για Πάνω, `B` για Κάτω, `L` για Αριστερά, `R` για Δεξιά).
* **Ακριβής Συντεταγμένη (`% label_anchor: 28 -11 T`)**: Αγκιστρώνει την ετικέτα ακριβώς στο SVG σημείο `X=28, Y=-11` και την σπρώχνει προς τα πάνω.

### 3. Μηχανισμός Εναλλαγής Εικονιδίων (Variants)
Μπορείτε να φτιάξετε εξαρτήματα που αλλάζουν μορφή ανάλογα με μία ιδιότητα (π.χ. διακόπτης N-Type ή P-Type).
```latex
\newcommand{\controlledswitch}[7]{%{pos}{name}{control}{n/p}{rot}{grid}{show}
% category: Switches
% variant_arg: 4
% icon_n: M 0 0 L 10 0 ...
% icon_p: M 0 0 L 10 0 ...
```
* **`% variant_arg: <Number>`**: Υποδεικνύει ποιο όρισμα (από 1 έως N) ελέγχει τη μορφή. Στο παράδειγμα, το Όρισμα 4 είναι το `{n/p}`.
* **`% icon_<value>:`**: Αντιστοιχεί ένα SVG path σε μια συγκεκριμένη επιλογή. Το `icon_n` διαβάζει την επιλογή `n`, το `icon_p` διαβάζει το `p`. Το UI θα αλλάξει αυτόματα το SVG στον καμβά όταν αλλάξετε αυτή την ιδιότητα!

## 🚀 Script Workflow
1. Ενημερώστε το `tikz_electronic_parts.sty`.
2. Τρέξτε `python generate_db.py` για να παράγετε το `components_db.js`.
3. Κάντε ανανέωση (Refresh) στο `index.html` για να δείτε τις αλλαγές live.