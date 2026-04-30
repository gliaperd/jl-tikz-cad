// js/ui/toolbar.js
import { AppState, THEME_COLORS } from '../state.js';
import { openSimulationSettings } from './dialogs.js';
import { copySelected, pasteCopied, deleteSelected, rotateSelected, flipHorizontal, flipVertical, zoomFit, undo, redo, clearCanvas } from './actions.js';
import { runDigitalSimulation } from '../engines/digital.js';
import { syncFromLatex, runLinterUI, copyLatexToClipboard } from '../parsers/latex.js';
import { saveProjectToFile, loadProjectFromFile } from '../parsers/io.js';
import { openExportDialog } from '../parsers/io.js';
import { runSimulation, clearSimAnnotations, openSpiceNetlistEditor, promptTheveninNode } from '../engines/spice.js';
import { refreshComponentViews, updateGhostDotsVisibility, toggleNetLabels, applyTheme } from './canvas.js'; 

export function initializeToolbar() {
    // Editing Tools
    document.getElementById('btn-copy').addEventListener('click', copySelected);
    document.getElementById('btn-paste').addEventListener('click', pasteCopied);
    document.getElementById('btn-delete').addEventListener('click', deleteSelected);
    document.getElementById('btn-rotate').addEventListener('click', rotateSelected);
    document.getElementById('btn-flip-h').addEventListener('click', flipHorizontal);
    document.getElementById('btn-flip-v').addEventListener('click', flipVertical);

    // GUI buttons
    document.getElementById('btn-fit').addEventListener('click', zoomFit);
    document.getElementById('btn-undo').addEventListener('click', undo);
    document.getElementById('btn-redo').addEventListener('click', redo);
    document.getElementById('btn-clear').addEventListener('click', clearCanvas);
	
	// View dropdown
    document.getElementById('toggle-pins').addEventListener('change', (e) => {
        AppState.viewOptions.showPins = e.target.checked;
        refreshComponentViews();
    });    
    document.getElementById('toggle-pin-names').addEventListener('change', (e) => {
        AppState.viewOptions.showPinNames = e.target.checked;
        refreshComponentViews();
    });   
    document.getElementById('chkShowNets').addEventListener('change', (e) => {
        AppState.viewOptions.showNetNames = e.target.checked;
        toggleNetLabels();
    });    
    document.getElementById('toggle-ghost-dots').addEventListener('change', (e) => {
        AppState.viewOptions.showGhostDots = e.target.checked;
        updateGhostDotsVisibility();
    });
    // Failsafe: Expose to window just in case your HTML still has inline onclick handlers
    window.toggleNetLabels = toggleNetLabels;
    window.updateGhostDotsVisibility = updateGhostDotsVisibility;
	
	// --- DISPLAY MODE (THEME SWITCHER) ---
    document.getElementById('theme-selector').addEventListener('change', (e) => {
        const selectedTheme = e.target.value;
        applyTheme(selectedTheme);
        
        // Save the user's preference to their browser
        localStorage.setItem('jlcad_theme_preference', selectedTheme);
    });
	

    // Simulation Menu (Dummy bindings for now until we migrate the Sim Engine)
    document.getElementById('btn-sim-op').addEventListener('click', () => runSimulation('op'));
    document.getElementById('btn-sim-tran').addEventListener('click', () => runSimulation('tran'));
    document.getElementById('btn-sim-ac').addEventListener('click', () => runSimulation('ac'));
    document.getElementById('btn-sim-netlist').addEventListener('click', openSpiceNetlistEditor);
    document.getElementById('btn-sim-logic').addEventListener('click', runDigitalSimulation);
    document.getElementById('btn-sim-settings').addEventListener('click', openSimulationSettings);
    document.getElementById('btn-sim-clear').addEventListener('click', clearSimAnnotations);
    document.getElementById('btn-sim-thevenin').addEventListener('click', promptTheveninNode);

    // --- FILE MANAGEMENT ---
    document.getElementById('btn-save').addEventListener('click', saveProjectToFile);
    
    // Connect the visible Open button to the hidden file input
    const fileInput = document.getElementById('importFile');
    document.getElementById('btn-open').addEventListener('click', () => fileInput.click());
    
    // Listen for when the user actually selects a file
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            loadProjectFromFile(e.target.files[0]);
            e.target.value = ''; // Reset input so you can load the same file twice if needed
        }
    });

    document.getElementById('btn-export-dialog').addEventListener('click', openExportDialog);

    // --- Sidebar & Output Toggles ---
    const toggleSidebar = () => {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('collapsed');
        document.getElementById('tab-sidebar').style.display = sidebar.classList.contains('collapsed') ? 'flex' : 'none';
    };

    const toggleOutput = () => {
        const output = document.getElementById('output-panel');
        output.classList.toggle('collapsed');
        document.getElementById('tab-output').style.display = output.classList.contains('collapsed') ? 'flex' : 'none';
    };

    // Bind the "Minimize" buttons inside the panels
    document.getElementById('btn-toggle-sidebar').addEventListener('click', toggleSidebar);
    document.getElementById('btn-toggle-output').addEventListener('click', toggleOutput);

    // Bind the "Restore" floating tabs in the corner
    document.getElementById('tab-sidebar').addEventListener('click', toggleSidebar);
    document.getElementById('tab-output').addEventListener('click', toggleOutput);
	
	document.getElementById('btn-sync-latex').addEventListener('click', syncFromLatex);
    document.getElementById('btn-check-syntax').addEventListener('click', () => runLinterUI());
    document.getElementById('btn-copy-latex').addEventListener('click', copyLatexToClipboard);
}