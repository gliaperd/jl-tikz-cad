// js/ui/toolbar.js
import { AppState, THEME_COLORS } from '../state.js';
import { openSimulationSettings } from './dialogs.js';
import { copySelected, pasteCopied, deleteSelected, rotateSelected, flipHorizontal, flipVertical, zoomFit, undo, redo, clearCanvas } from './actions.js';
import { runDigitalSimulation } from '../engines/digital.js';
import { syncFromLatex, runLinterUI, copyLatexToClipboard } from '../parsers/latex.js';
import { importProject, openExportDialog, saveProjectToFile } from '../parsers/io.js';
import { runSimulation, clearSimAnnotations, openSpiceNetlistEditor, promptTheveninNode, promptTransferFunction } from '../engines/spice.js';
import { refreshComponentViews, updateGhostDotsVisibility, applyTheme } from './canvas.js'; 

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
  
    document.getElementById('toggle-ghost-dots').addEventListener('change', (e) => {
        AppState.viewOptions.showGhostDots = e.target.checked;
        updateGhostDotsVisibility();
    });
    // Failsafe: Expose to window just in case your HTML still has inline onclick handlers
    window.updateGhostDotsVisibility = updateGhostDotsVisibility;
	window.importProject = importProject;
	window.openExportDialog = openExportDialog;
	window.saveProject = saveProjectToFile;
	
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
	document.getElementById('btn-sim-xferfnc').addEventListener('click', promptTransferFunction);

    // --- FILE MANAGEMENT ---
    document.getElementById('btn-save').addEventListener('click', saveProjectToFile);
    
    // Connect the visible Open button to the hidden file input
    const fileInput = document.getElementById('importFile');
    document.getElementById('btn-open').addEventListener('click', () => fileInput.click());
    
    // Listen for when the user actually selects a file
    fileInput.addEventListener('change', (e) => {
        // Just pass the raw event! io.js will extract the file and reset the input automatically.
        importProject(e); 
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

	// --- TOGGLE LATEX OUTPUT (FROM TOOLBAR) ---
	const btnToggleOutput = document.getElementById('btn-toggle-output');
	const outputPanel = document.getElementById('output-panel');

	btnToggleOutput.addEventListener('click', () => {
		outputPanel.classList.toggle('collapsed');
		
		// Make the toolbar button turn blue when the panel is open
		if (outputPanel.classList.contains('collapsed')) {
			btnToggleOutput.classList.remove('active');
		} else {
			btnToggleOutput.classList.add('active');
		}
	});

	// --- TOGGLE COMPONENTS PALETTE (VERTICAL BAR) ---
	const sidebarToggleBtn = document.getElementById('sidebar-toggle');
	const sidebarContent = document.getElementById('sidebar-content');

	sidebarToggleBtn.addEventListener('click', () => {
		sidebarContent.classList.toggle('collapsed');
	});
	
	document.getElementById('btn-sync-latex').addEventListener('click', syncFromLatex);
    document.getElementById('btn-check-syntax').addEventListener('click', () => runLinterUI());
    document.getElementById('btn-copy-latex').addEventListener('click', copyLatexToClipboard);
}