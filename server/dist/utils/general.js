"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startRandomInterval = startRandomInterval;
exports.getUniqueKey = getUniqueKey;
const uuid_1 = require("uuid");
function startRandomInterval(fn, minDelaySec, maxDelaySec, logAvgInterval = false) {
    let lastExecution = Date.now();
    let intervals = [];
    function scheduleNext() {
        const delayMs = Math.floor(Math.random() * (maxDelaySec - minDelaySec + 1) + minDelaySec) * 1000;
        setTimeout(() => {
            const now = Date.now();
            const elapsed = (now - lastExecution) / 1000; // in seconds
            intervals.push(elapsed);
            lastExecution = now;
            // Call your function
            fn();
            // Log average interval
            if (logAvgInterval) {
                const average = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
                console.log(`Average interval: ${average.toFixed(2)}s`);
            }
            // Schedule next call
            scheduleNext();
        }, delayMs);
    }
    // Start the first call
    scheduleNext();
}
function getUniqueKey() {
    return (0, uuid_1.v4)();
}
//# sourceMappingURL=general.js.map