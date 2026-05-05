// js/ui/dialogs.js
import { AppState } from '../state.js';
import { saveState } from './actions.js'; 

export function openSimulationSettings() {
    const templateHtml = document.getElementById('tpl-sim-settings').innerHTML;
    const c = AppState.spiceSimConfig || {}; // Fallback to empty object to prevent crashes

    Swal.fire({
        title: 'Simulation Settings',
        width: '600px',
        html: templateHtml,
        confirmButtonText: 'Save Settings',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        didOpen: () => {
            lucide.createIcons();
            // 1. Populate the UI with current state values
            document.getElementById('sim-tran-step').value = c.tranStep || '';
            document.getElementById('sim-tran-stop').value = c.tranStop || '';
            document.getElementById('sim-tran-start').value = c.tranStart || '';
            document.getElementById('sim-ac-type').value = c.acType || 'dec';
            document.getElementById('sim-ac-pts').value = c.acPoints || '';
            document.getElementById('sim-ac-start').value = c.acStart || '';
            document.getElementById('sim-ac-stop').value = c.acStop || '';
            document.getElementById('sim-models').value = c.modelsContent || '';
            document.getElementById('sim-custom').value = c.customCmds || '';

            // --- NEW: Populate Mixed-Signal logic fields (with safety checks) ---
            let elHigh = document.getElementById('sim-logic-high');
            if (elHigh) elHigh.value = c.logicHighVoltage || '5.0';
            
            let elThresh = document.getElementById('sim-logic-thresh');
            if (elThresh) elThresh.value = c.logicThresholdVoltage || '2.5';
            // --------------------------------------------------------------------

            // 2. Safely wire up the File Upload button
            const uploadBtn = document.getElementById('btn-upload-model');
            const fileInput = document.getElementById('model-upload');
            
            uploadBtn.addEventListener('click', () => fileInput.click());
            
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                const reader = new FileReader();
                reader.onload = function(ev) {
                    const ta = document.getElementById('sim-models');
                    if (ta) {
                        // Append the new file content to whatever is already in the text box
                        ta.value += (ta.value.trim() ? "\n\n" : "") + ev.target.result;
                        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Models Loaded!', showConfirmButton: false, timer: 1500 });
                    }
                };
                reader.readAsText(file);
            });
        },
        preConfirm: () => {
            // 3. Extract the updated values when the user clicks 'Save'
            let elHigh = document.getElementById('sim-logic-high');
            let elThresh = document.getElementById('sim-logic-thresh');

            return {
                tranStep: document.getElementById('sim-tran-step').value.trim(),
                tranStop: document.getElementById('sim-tran-stop').value.trim(),
                tranStart: document.getElementById('sim-tran-start').value.trim(),
                acType: document.getElementById('sim-ac-type').value,
                acPoints: document.getElementById('sim-ac-pts').value.trim(),
                acStart: document.getElementById('sim-ac-start').value.trim(),
                acStop: document.getElementById('sim-ac-stop').value.trim(),
                modelsContent: document.getElementById('sim-models').value.trim(),
                customCmds: document.getElementById('sim-custom').value.trim(),
                
                // --- NEW: Extract Mixed-Signal logic fields ---
                logicHighVoltage: elHigh ? elHigh.value.trim() : '5.0',
                logicThresholdVoltage: elThresh ? elThresh.value.trim() : '2.5'
            };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // 4. Update the global state
            AppState.spiceSimConfig = { ...AppState.spiceSimConfig, ...result.value };
            
            // Push it to the graph memory so it saves to the .json project file automatically
            AppState.graph.set('spiceSimConfig', AppState.spiceSimConfig);
            
            // --- NEW: Trigger Auto-Save instantly! ---
            if (typeof saveState === 'function') {
                saveState();
            }
            
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Settings Saved', showConfirmButton: false, timer: 1500 });
        }
    });
}