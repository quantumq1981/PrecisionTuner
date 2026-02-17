export function quickSelect(values: number[], k: number): number {
  let left = 0;
  let right = values.length - 1;

  while (left < right) {
    const pivotIndex = partition(values, left, right);
    if (k === pivotIndex) return values[k];
    if (k < pivotIndex) right = pivotIndex - 1;
    else left = pivotIndex + 1;
  }
  return values[k];
}

function partition(arr: number[], left: number, right: number): number {
  const pivot = arr[right];
  let i = left;
  for (let j = left; j < right; j += 1) {
    if (arr[j] <= pivot) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      i += 1;
    }
  }
  [arr[i], arr[right]] = [arr[right], arr[i]];
  return i;
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const copy = [...values];
  const mid = Math.floor(copy.length / 2);
  const upper = quickSelect(copy, mid);
  if (copy.length % 2 === 1) return upper;
  const lower = quickSelect(copy, mid - 1);
  return (lower + upper) / 2;
}
