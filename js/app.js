// js/app.js
import './parsers/tikz-builder.js';
import { AppState } from './state.js';
import { initializeToolbar } from './ui/toolbar.js';
import { initializeCanvas, setupDropzone } from './ui/canvas.js';
import { initializeSidebar } from './ui/sidebar.js';
import { initializeEvents } from './ui/events.js'; 
import { initializeProperties } from './ui/properties.js'; 
import { saveState, clearSelection, zoomFit } from './ui/actions.js'; 
import { exportLatex } from './parsers/latex.js'; 
import { applyTheme } from './ui/canvas.js'; 
import { THEME_COLORS } from './state.js'; 

// --- GLOBAL SWEETALERT FIX ---
const originalSwalFire = Swal.fire;
Swal.fire = function(...args) {
    if (args.length > 0 && typeof args[0] === 'object') {
        if (!args[0].toast) {
            args[0].heightAuto = false;
        }
    } else if (args.length > 0) {
        args = [{
            title: args[0],
            html: args[1],
            icon: args[2],
            heightAuto: false
        }];
    }
    return originalSwalFire.apply(this, args);
};
// -----------------------------

function checkUnsavedWork() {
    const autosave = localStorage.getItem('jlcad_autosave');
    
    // Check if it exists AND isn't just an empty graph
    if (autosave && autosave.length > 20) { 
        Swal.fire({
            title: 'Unsaved Work Detected',
            text: 'It looks like you closed the app before saving. Restore your session?',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Yes, restore it',
            cancelButtonText: 'No, start fresh',
            confirmButtonColor: '#3498db',
            cancelButtonColor: '#95a5a6',
            allowOutsideClick: false // Force them to choose
        }).then((result) => {
            if (result.isConfirmed) {
                // Restore the state
                AppState.graph.fromJSON(JSON.parse(autosave));
                
                // Clean up the UI
                clearSelection();
                exportLatex();
                
                // Give JointJS a fraction of a second to render before calculating bounding boxes for zoom
                setTimeout(() => zoomFit(), 150);
            } else {
                // User rejected it, wipe the slate clean
                localStorage.removeItem('jlcad_autosave');
                setTimeout(saveState, 500); // Capture the fresh empty canvas
            }
        });
    } else {
        // No unsaved work found, just do the initial save of the empty canvas
        setTimeout(saveState, 500); 
    }
}

document.addEventListener('DOMContentLoaded', () => {
    
    if (typeof JL_DATABASE !== 'undefined') {
        Object.keys(JL_DATABASE).forEach(k => {
            if (JL_DATABASE[k].pins && !JL_DATABASE[k].scaled) {
                JL_DATABASE[k].pins.forEach(p => { 
                    p.x *= AppState.PPU_MULT; 
                    p.y *= AppState.PPU_MULT; 
                });
                JL_DATABASE[k].scaled = true; 
            }
        });
    }
    
    initializeToolbar();
    initializeCanvas();
    initializeSidebar();
    initializeEvents(); 
    initializeProperties(); 
	   
    // --- LOAD SAVED THEME ---
    const savedTheme = localStorage.getItem('jlcad_theme_preference');
    if (savedTheme && THEME_COLORS[savedTheme]) {
        // Update the dropdown UI to match
        const themeSelector = document.getElementById('theme-selector');
        if (themeSelector) themeSelector.value = savedTheme;
        // Fire the engine
        applyTheme(savedTheme);
    }
    
    // Fire the autosave check instead of a blind saveState
    setTimeout(checkUnsavedWork, 100); 

    console.log("JL CAD Engine successfully booted.");
});
   