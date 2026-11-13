import { v4 as uuidv4 } from 'uuid';

export function getUniqueKey(): string {
  return uuidv4();
}

/**
 * Gets a random given number of items from an array
 * @param arr Array to get number of objects from
 * @param n Number of objects to get from the Array
 * @returns n random objects from array, as an another array
 */
export function getNRandom(arr: any[], n: number): any[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());

  const retArr: any[] = [];
  for (let i: number = 0; i < n; i++) {
    retArr.push(shuffled[i]);
  }

  return retArr;
}
