"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUniqueKey = getUniqueKey;
exports.startRandomInterval = startRandomInterval;
exports.getNRandom = getNRandom;
const uuid_1 = require("uuid");
function getUniqueKey() {
    return (0, uuid_1.v4)();
}
/**
 * Creates an interval that reruns a function in a random given inteval
 * @param fn Function to run
 * @param minDelaySec Minimum amount of time until next run
 * @param maxDelaySec Maximum amount of time until next run
 * @param logAvgInterval Print the log average interval in each run
 */
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
/**
 * Gets a random given number of items from an array
 * @param arr Array to get number of objects from
 * @param n Number of objects to get from the Array
 * @returns n random objects from array, as an another array
 */
function getNRandom(arr, n) {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    var retArr = [];
    for (var i = 0; i < n; i++) {
        retArr.push(shuffled[i]);
    }
    return retArr;
}
//# sourceMappingURL=general.js.map