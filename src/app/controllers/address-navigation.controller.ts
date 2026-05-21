import { basename } from 'path';
import { QuickPickItem, Uri, window, workspace } from 'vscode';

import { ExtensionConfig } from '../configs';
import {
  AddressDiscoveryWorkflow,
  parseAddress,
  resolveAddressToUriRange,
} from '../helpers';
import { TagBrowserController } from './tag-browser.controller';

/**
 * Lightweight operational address navigation controller.
 *
 * RESPONSIBILITY:
 * - Receive address references from commands/providers
 * - Resolve workspace file targets
 * - Handle minimal ambiguity selection
 * - Delegate editor navigation
 *
 * DOES NOT:
 * - Parse documents
 * - Extract references
 * - Register commands
 * - Manage providers
 * - Persist metadata
 * - Perform contextual inference
 *
 * Address references are treated as lightweight
 * filesystem-native operational pointers.
 *
 * Supported formats:
 *
 * - src/auth/auth.controller.ts
 * - src/auth/auth.controller.ts#10
 * - src/auth/auth.controller.ts#10:5
 * - src/auth/auth.controller.ts#10-20
 * - TODO(src/auth/auth.controller.ts)
 *
 * The controller intentionally favors simplicity,
 * deterministic behavior, and bounded operational flow.
 *
 * @export
 * @class AddressNavigationController
 */
export class AddressNavigationController {
  // -----------------------------------------------------------------
  // Constructor
  // -----------------------------------------------------------------

  /**
   * Creates a new AddressNavigationController instance.
   *
   * @constructor
   * @param {ExtensionConfig} config - Extension configuration
   * @param {TagBrowserController} tagBrowserController - File navigation controller
   * @param {AddressDiscoveryWorkflow} [discoveryWorkflow] - Optional discovery workflow
   */
  constructor(
    readonly config: ExtensionConfig,
    readonly tagBrowserController: TagBrowserController,
    readonly discoveryWorkflow?: AddressDiscoveryWorkflow,
  ) {
    console.log('[CodeMark+] AddressNavigationController initialized', {
      hasConfig: !!config,
      hasTagBrowserController: !!tagBrowserController,
      hasDiscoveryWorkflow: !!discoveryWorkflow,
    });
  }

  /**
   * Resolution flow:
   *
   * 1. Use provided address or request one from user
   * 2. Parse lightweight address format
   * 3. Resolve workspace target
   * 4. Navigate directly or disambiguate if needed
   *
   * @async
   * @function openAddress
   * @public
   * @memberof AddressNavigationController
   *
   * @param {string} [address] - Optional address reference
   *
   * @returns {Promise<void>}
   */
  async openAddress(...args: unknown[]): Promise<void> {
    // command args logged only in production errors

    const address = typeof args[0] === 'string' ? args[0] : undefined;

    const normalizedAddress = await this.resolveAddressInput(address);

    if (!normalizedAddress) {
      return;
    }

    const parsedAddress = parseAddress(normalizedAddress);

    if (!parsedAddress) {
      this.showInvalidAddressMessage();
      return;
    }

    if (parsedAddress.tag && this.discoveryWorkflow) {
      // tag is preserved on parsed address
    }

    const resolvedAddress = await resolveAddressToUriRange(
      parsedAddress,
      this.config,
    );

    switch (resolvedAddress.kind) {
      case 'unresolved':
        this.showUnresolvedAddressMessage();
        return;

      case 'resolved':
        // Attempt optional discovery: range-scoped or file-scoped
        if (this.discoveryWorkflow) {
          try {
            const doc = await workspace.openTextDocument(resolvedAddress.uri);
            const text = doc.getText();

            let discovered;

            if (parsedAddress.tag) {
              const isExplicit = parsedAddress.kind === 'range';
              discovered = await this.discoveryWorkflow.discoverByTag(
                text,
                parsedAddress.tag,
                resolvedAddress.range,
                isExplicit,
                doc.languageId,
              );
            } else if (parsedAddress.kind === 'range') {
              // Explicit range: strict filtering
              discovered = await this.discoveryWorkflow.discoverInRange(
                text,
                resolvedAddress.range!,
                true,
                doc.languageId,
              );
            } else if (parsedAddress.kind === 'anchor') {
              // Anchor: expand locality
              discovered = await this.discoveryWorkflow.discoverInRange(
                text,
                resolvedAddress.range!,
                false,
                doc.languageId,
              );
            } else {
              // Otherwise use file-scoped discovery
              discovered = await this.discoveryWorkflow.discoverInFile(
                text,
                doc.languageId,
              );
            }

            if (discovered === null) {
              // User cancelled selection: abort without side effects
              return;
            }

            if (discovered) {
              // Navigate to discovered annotation
              await this.navigateToResolvedAddress(
                resolvedAddress.uri,
                discovered.line - 1,
              );
              return;
            }

            // No annotations: fallback to resolved location
            await this.navigateToResolvedAddress(
              resolvedAddress.uri,
              resolvedAddress.range?.start.line,
            );
            return;
          } catch (error) {
            console.error('[CodeMark+] Discovery error', error);

            // Fallback to resolved location
            await this.navigateToResolvedAddress(
              resolvedAddress.uri,
              resolvedAddress.range?.start.line,
            );
            return;
          }
        } else {
          // No discovery workflow: direct navigation
          await this.navigateToResolvedAddress(
            resolvedAddress.uri,
            resolvedAddress.range?.start.line,
          );
          return;
        }

      case 'ambiguous':
        await this.handleAmbiguousResolution(
          resolvedAddress.candidates,
          resolvedAddress.range?.start.line,
        );
        return;
    }
  }

  // -----------------------------------------------------------------
  // Private methods
  // -----------------------------------------------------------------

  /**
   * Resolve operational address input.
   *
   * If address is not provided, request one from user.
   *
   * @async
   * @function resolveAddressInput
   * @private
   * @memberof AddressNavigationController
   *
   * @param {string} [address] - Optional address
   *
   * @returns {Promise<string | undefined>}
   */
  private async resolveAddressInput(
    address?: string,
  ): Promise<string | undefined> {
    if (address?.trim()) {
      return address.trim();
    }

    return window.showInputBox({
      prompt: 'Enter file address (path[#line[:hint]] or path#start-end)',
    });
  }

  /**
   * Handle ambiguous workspace resolution.
   *
   * Prompts user to select one candidate.
   *
   * @async
   * @function handleAmbiguousResolution
   * @private
   * @memberof AddressNavigationController
   *
   * @param {Uri[]} candidates - Candidate workspace files
   * @param {number} [lineNumber] - Optional target line
   *
   * @returns {Promise<void>}
   */
  private async handleAmbiguousResolution(
    candidates: Uri[],
    lineNumber?: number,
  ): Promise<void> {
    const items: Array<QuickPickItem & { uri: Uri }> = candidates.map(
      (candidate) => ({
        label: basename(candidate.fsPath),
        description: candidate.fsPath,
        uri: candidate,
      }),
    );

    const selected = await window.showQuickPick(items, {
      placeHolder: 'Multiple matches found - choose one',
    });

    if (!selected) {
      return;
    }

    await this.navigateToResolvedAddress(selected.uri, lineNumber);
  }

  /**
   * Navigate to resolved workspace target.
   *
   * Delegates editor opening to TagBrowserController.
   *
   * @async
   * @function navigateToResolvedAddress
   * @private
   * @memberof AddressNavigationController
   *
   * @param {Uri} uri - Target workspace file
   * @param {number} [lineNumber] - Optional target line
   *
   * @returns {Promise<void>}
   */
  private async navigateToResolvedAddress(
    uri: Uri,
    lineNumber?: number,
  ): Promise<void> {
    await this.tagBrowserController.openFile(uri, lineNumber);
  }

  /**
   * Show invalid address message.
   *
   * @function showInvalidAddressMessage
   * @private
   * @memberof AddressNavigationController
   */
  private showInvalidAddressMessage(): void {
    window.showErrorMessage('Invalid address format');
  }

  /**
   * Show unresolved address message.
   *
   * @function showUnresolvedAddressMessage
   * @private
   * @memberof AddressNavigationController
   */
  private showUnresolvedAddressMessage(): void {
    window.showErrorMessage('Unable to resolve address');
  }
}
