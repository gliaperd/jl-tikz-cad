// js/engines/ngspice_worker.js

let isWasmReady = false;
let messageQueue = [];
let isSpiceInitialized = false;

// 1. Setup Module BEFORE importing the script
self.Module = {
    locateFile: function(path) {
        if (path.endsWith('.wasm')) {
            // Ensure this points to the correct location of your WASM file!
            return '../../simulation/' + path; 
        }
        return path;
    },
    // 2. The Golden Key: Wait for WASM to finish compiling!
    onRuntimeInitialized: function() {
        console.log("[SPICE Worker] WebAssembly Engine Ready.");
        isWasmReady = true;
        
        // Process any messages that came in while we were loading
        while (messageQueue.length > 0) {
            let queuedEvent = messageQueue.shift();
            processSimulation(queuedEvent);
        }
    }
};

// 3. Import the wrapper (Adjust path if necessary)
importScripts('../../simulation/ngspice_v4.js'); 

// 4. Catch messages from the main thread
self.onmessage = function(e) {
    if (!isWasmReady) {
        // WASM is still downloading/compiling, save the request for later!
        messageQueue.push(e);
    } else {
        // WASM is ready, run it immediately!
        processSimulation(e);
    }
};

// 5. The actual simulation logic
function processSimulation(e) {
    const { type, netlist, mode } = e.data;

    if (type === 'RUN_SIMULATION') {
        try {
            // Setup Virtual File System & Mock OS Memory
            try { Module.FS.mkdir('/tmp'); } catch(err) {}
            let safeRam = "MemTotal:       524288 kB\nMemFree:        524288 kB\nMemAvailable:   524288 kB\n";
            try { Module.FS.writeFile('/tmp/meminfo', safeRam); } catch(err) {}

            if (!isSpiceInitialized) {
                // Safeguard: Sometimes Emscripten attaches addFunction to the global scope instead of Module
                let binder = Module.addFunction ? Module.addFunction.bind(Module) : addFunction;
                
                let sendCharCallback = binder(function(textPtr) {
                    let msg = Module.UTF8ToString(textPtr).trim();
                    if (!msg) return 0;
                    
                    let isErr = msg.startsWith('stderr Error') || (msg.startsWith('stderr') && msg.toLowerCase().includes('error'));
                    self.postMessage({ type: 'LOG', msg: msg.replace('stderr', '').trim(), isErr: isErr });
                    return 0; 
                }, 'iiii'); 
                
                Module.ccall('ngSpice_Init', 'number', ['number','number','number','number','number','number','number'], [sendCharCallback, 0, 0, 0, 0, 0, 0]);
                isSpiceInitialized = true;
            }

            // Execute the Netlist
            Module.FS.writeFile('/circuit.cir', netlist);
            Module.ccall('ngSpice_Command', 'number', ['string'], ['destroy all']);
            Module.ccall('ngSpice_Command', 'number', ['string'], ['remcirc']);
            Module.ccall('ngSpice_Command', 'number', ['string'], ['source /circuit.cir']);

            if (mode === 'op') Module.ccall('ngSpice_Command', 'number', ['string'], ['op']);
            else Module.ccall('ngSpice_Command', 'number', ['string'], ['run']);

            Module.ccall('ngSpice_Command', 'number', ['string'], ['set filetype=ascii']);
            try { Module.FS.unlink('/output.raw'); } catch(err) {}
            Module.ccall('ngSpice_Command', 'number', ['string'], ['write /output.raw']);

            // Extract Results and Send to Main Thread
            let rawOutput = Module.FS.readFile('/output.raw', { encoding: 'utf8' });
            self.postMessage({ type: 'SUCCESS', rawOutput: rawOutput });

        } catch (error) {
            self.postMessage({ type: 'FATAL', msg: error.message });
        }
    }
}