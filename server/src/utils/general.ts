import { v4 as uuidv4 } from 'uuid';
import { debugLog } from './debugLogger.js';

export function getUniqueKey(): string {
  return uuidv4();
}

/**
 * Creates an interval that reruns a function in a random given inteval
 * @param fn Function to run
 * @param minDelaySec Minimum amount of time until next run
 * @param maxDelaySec Maximum amount of time until next run
 * @param logAvgInterval Print the log average interval in each run
 */
export function startRandomInterval(fn: () => void, minDelaySec: number, maxDelaySec: number, logAvgInterval: boolean=false) {
    let lastExecution = Date.now();
    let intervals: number[] = [];

    function scheduleNext() {
        const delayMs =
        Math.floor(Math.random() * (maxDelaySec - minDelaySec + 1) + minDelaySec) * 1000;

        setTimeout(() => {
            const now = Date.now();
            const elapsed = (now - lastExecution) / 1000; // in seconds
            intervals.push(elapsed);
            lastExecution = now;

            // Call your function
            fn();
            
            // Log average interval
            if (logAvgInterval) {                
                const average =
                intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
                debugLog(`Average interval: ${average.toFixed(2)}s`);
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
export function getNRandom(arr: any[], n: number): any[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());

  var retArr: any[] = [];
  for (var i: number = 0; i < n ; i++) {
    retArr.push(shuffled[i]);
  }
  
  return retArr;
}