/**
 * Wraps a promise-like value with a timeout. If the operation does not settle within the specified
 * number of milliseconds, the returned promise rejects with a timeout Error. If
 * {@link timeoutMs} is not finite or is less than or equal to zero, the original
 * promise is returned as-is.
 *
 * Accepts PromiseLike (e.g., VS Code Thenable) and normalizes via Promise.resolve.
 *
 * @template T
 * @param input - The input promise-like to wrap with a timeout.
 * @param timeoutMs - The timeout in milliseconds. Non-positive or non-finite values disable the timeout.
 * @param message - Optional custom error message for the timeout rejection.
 * @returns A promise that resolves/rejects with the original promise, or rejects on timeout.
 * @throws {Error} If the operation times out.
 */
export async function promiseWithTimeout<T>(
  input: PromiseLike<T>,
  timeoutMs: number,
  message?: string,
): Promise<T> {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    // Normalize to a native Promise in case the input is a Thenable
    return Promise.resolve(input);
  }

  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      const err = new Error(
        message ?? `Operation timed out after ${timeoutMs} ms`,
      );
      reject(err);
    }, timeoutMs);
  });

  try {
    // Normalize and race the original promise against the timeout
    const inputPromise: Promise<T> = Promise.resolve(input);
    return (await Promise.race([inputPromise, timeoutPromise])) as T;
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
  }
}
