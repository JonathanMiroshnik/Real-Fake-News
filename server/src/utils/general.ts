import { v4 as uuidv4 } from 'uuid';

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
                console.log(`Average interval: ${average.toFixed(2)}s`);
            }            

            // Schedule next call
            scheduleNext();
        }, delayMs);
    }

    // Start the first call
    scheduleNext();
}

export function getUniqueKey(): string {
  return uuidv4();
}