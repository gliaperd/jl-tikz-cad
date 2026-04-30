// js/app.js
import './parsers/tikz-builder.js';
import { AppState } from './state.js';
import { initializeToolbar } from './ui/toolbar.js';
import { initializeCanvas, setupDropzone, updateNetNamesVisibility } from './ui/canvas.js';
import { initializeSidebar } from './ui/sidebar.js';
import { initializeEvents } from './ui/events.js'; 
import { initializeProperties } from './ui/properties.js'; 
import { saveState, clearSelection, zoomFit } from './ui/actions.js'; 
import { exportLatex } from './parsers/latex.js'; 
import { applyTheme } from './ui/canvas.js'; 
import { THEME_COLORS } from './state.js'; 
import { clearSimAnnotations } from './engines/spice.js';

// --- GLOBAL SWEETALERT FIX ---
const originalSwalFire = Swal.fire;
Swal.fire = function(...args) {
    // 1. Grab all button colors from CSS
    const rootStyles = getComputedStyle(document.documentElement);
    const primaryColor = rootStyles.getPropertyValue('--primary').trim() || '#3498db';
    const cancelColor = rootStyles.getPropertyValue('--text-muted').trim() || '#95a5a6';
    const denyColor = rootStyles.getPropertyValue('--danger').trim() || '#e74c3c';

    if (args.length > 0 && typeof args[0] === 'object') {
        // Prevent flexbox breaking, unless it's a toast
        if (!args[0].toast) {
            args[0].heightAuto = false;
        }
        // 2. Inject default button colors if they weren't explicitly provided
        if (!args[0].confirmButtonColor) args[0].confirmButtonColor = primaryColor;
        if (!args[0].cancelButtonColor) args[0].cancelButtonColor = cancelColor;
        if (!args[0].denyButtonColor) args[0].denyButtonColor = denyColor;
        
    } else if (args.length > 0) {
        // Shorthand Swal.fire('Title', 'Text', 'info') fallback
        args = [{
            title: args[0],
            html: args[1],
            icon: args[2],
            heightAuto: false,
            confirmButtonColor: primaryColor,
            cancelButtonColor: cancelColor,
            denyButtonColor: denyColor
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
            allowOutsideClick: false // Force them to choose
        }).then((result) => {
            if (result.isConfirmed) {
                // Restore the state
                AppState.graph.fromJSON(JSON.parse(autosave));
                
                // Clean up the UI
                clearSelection();
				clearSimAnnotations();
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
    
    lucide.createIcons();
    
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

    // --- BIND NET NAME VISIBILITY EVENTS HERE ---
    
    //  Trigger when the user clicks the "Show Net Names" checkbox
    const chkShowNets = document.getElementById('chkShowNets');
    if (chkShowNets) {
        chkShowNets.addEventListener('change', () => {
            if (typeof updateNetNamesVisibility === 'function') updateNetNamesVisibility();
        });
    }

    console.log("JL CAD Engine successfully booted.");
});