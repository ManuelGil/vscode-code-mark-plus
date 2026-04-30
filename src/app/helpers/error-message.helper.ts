import { l10n, window } from 'vscode';

/**
 * Converts unknown error values into safe, user-facing text.
 *
 * @param error - Unknown thrown value.
 * @returns Readable error message.
 * @category Helpers
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
};

/**
 * Shows the standardized "no workspace folders" user-facing error.
 *
 * @param extensionDisplayName - Display name of the extension.
 * @category Helpers
 */
export const showNoWorkspaceFolderError = (
  extensionDisplayName: string,
): void => {
  window.showErrorMessage(
    l10n.t(
      '{0}: No workspace folders are open. Please open a workspace folder to use this extension',
      extensionDisplayName,
    ),
  );
};
