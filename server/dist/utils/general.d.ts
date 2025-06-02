export declare function getUniqueKey(): string;
/**
 * Creates an interval that reruns a function in a random given inteval
 * @param fn Function to run
 * @param minDelaySec Minimum amount of time until next run
 * @param maxDelaySec Maximum amount of time until next run
 * @param logAvgInterval Print the log average interval in each run
 */
export declare function startRandomInterval(fn: () => void, minDelaySec: number, maxDelaySec: number, logAvgInterval?: boolean): void;
/**
 * Gets a random given number of items from an array
 * @param arr Array to get number of objects from
 * @param n Number of objects to get from the Array
 * @returns n random objects from array, as an another array
 */
export declare function getNRandom(arr: any[], n: number): any[];
