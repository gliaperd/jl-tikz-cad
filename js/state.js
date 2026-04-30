// js/state.js

export const THEME_COLORS = {
    standard: {
        background: '#ffffff', grid: '#bdc3c7', wire: '#333333',
        componentBody: 'none', componentIcon: '#2c3e50', componentLabel: '#34495e',
        freeText: '#2c3e50', 
        portBody: '#2980b9',     // <-- Changed from orange to mid-tone blue
        portLabel: '#7f8c8d',    // <-- Changed from red to a clean, muted grey
        dot: '#000000', selection: '#3498db', highlight: '#2980b9',
        gridBase: 1.5, gridZoom: 2.5  
    },
    cadence: {
        background: '#000000', grid: '#ffffff', wire: '#00BFFF', 
        componentBody: 'none', componentIcon: '#007c3c', componentLabel: '#FF0000', 
        freeText: '#FFFFFF', portBody: '#FF0000', portLabel: '#FF00FF', 
        dot: '#00BFFF', selection: '#FFFFFF', highlight: '#FFFFFF',
        gridBase: 0.5, gridZoom: 0.8  
    }
};

export const AppState = {
    // UI State
    theme: 'standard',
    zoom: 1.0,
    PPU_MULT: 4,
    EXPORT_DIV: 40,
	
	// Centralized View Toggles
    viewOptions: {
        showPins: true,
        showPinNames: true,
        showNetNames: false,
        showGhostDots: true
    },
    
    // Canvas State (Populated later by canvas.js)
    graph: null,
    paper: null,
    
    // Memory
    selectedElements: [],
    selectedLinks: [],
    clipboard: [],
    
    // Undo/Redo Engine
    historyStack: [],
    historyIndex: -1,
    isHistoryOperating: false,
    
    // Simulation Config Memory
    spiceSimConfig: {
        activeTab: 'tran',
        tranStep: '1u', tranStop: '1m', tranStart: '0',
        acType: 'dec', acPoints: '10', acStart: '1', acStop: '10k',
        customCmds: '', logicStep: 'Auto', logicStop: '10u', maxSteps: 200000
    }
};

