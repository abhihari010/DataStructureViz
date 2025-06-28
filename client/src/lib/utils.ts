import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Converts a LeetCode-style array to a binary tree object
export function arrayToTree(arr: (number|null)[]): any {
  if (!arr.length) return null;
  const nodes: any[] = arr.map(val => (val == null ? null : { val, left: null, right: null }));
  let i = 0, j = 1;
  while (j < arr.length) {
    if (nodes[i] !== null) {
      if (j < arr.length) nodes[i].left = nodes[j++] !== null ? nodes[j - 1] : null;
      if (j < arr.length) nodes[i].right = nodes[j++] !== null ? nodes[j - 1] : null;
    } else {
      j += 2;
    }
    i++;
  }
  return nodes[0];
}
