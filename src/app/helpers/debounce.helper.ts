/**
 * Create a debounced version of a function that delays invoking it until after
 * the specified wait time has elapsed since the last time it was called.
 *
 * @param func - The target function to debounce.
 * @param wait - The number of milliseconds to delay.
 * @returns A debounced function with the same parameters.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
}
