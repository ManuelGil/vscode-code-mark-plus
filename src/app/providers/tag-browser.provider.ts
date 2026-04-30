import {
  type Disposable,
  Event,
  EventEmitter,
  Position,
  ProviderResult,
  Range,
  ThemeIcon,
  TreeDataProvider,
  TreeItem,
  Uri,
} from 'vscode';

import { getBaseName } from '../helpers';
import { NodeModel } from '../models';
import { TagEntry, TagIndexService } from '../services';

/**
 * The TagBrowserProvider class
 *
 * @class
 * @classdesc TreeDataProvider that builds a Tag Browser tree (tag type -> file -> tag).
 * @export
 * @public
 * @implements {TreeDataProvider<NodeModel>}
 * @example
 * const provider = new TagBrowserProvider(tagIndexService);
 * @see https://code.visualstudio.com/api/references/vscode-api#TreeDataProvider
 */
export class TagBrowserProvider implements TreeDataProvider<NodeModel> {
  // -----------------------------------------------------------------
  // Properties
  // -----------------------------------------------------------------

  // Private properties
  /**
   * The onDidChangeTreeData event emitter.
   * @type {EventEmitter<NodeModel | undefined | null | void>}
   * @private
   * @memberof TagBrowserProvider
   * @example
   * this._onDidChangeTreeData = new EventEmitter<Node | undefined | null | void>();
   * this.onDidChangeTreeData = this._onDidChangeTreeData.event;
   *
   * @see https://code.visualstudio.com/api/references/vscode-api#EventEmitter
   */
  private _onDidChangeTreeData: EventEmitter<
    NodeModel | undefined | null | void
  >;

  /**
   * Indicates whether the provider has been disposed.
   * @type {boolean}
   * @private
   * @memberof TagBrowserProvider
   * @example
   * this._isDisposed = false;
   */
  private _isDisposed = false;

  /**
   * The cached nodes.
   * @type {NodeModel[] | undefined}
   * @private
   * @memberof TagBrowserProvider
   * @example
   * this._cachedNodes = undefined;
   */
  private _cachedNodes: NodeModel[] | undefined = undefined;

  /**
   * The cache promise.
   * @type {Promise<NodeModel[] | undefined> | undefined}
   * @private
   * @memberof TagBrowserProvider
   * @example
   * this._cachePromise = undefined;
   */
  private _cachePromise: Promise<NodeModel[] | undefined> | undefined =
    undefined;

  /**
   * Version token to invalidate in-flight cache loads on refresh.
   */
  private _version = 0;

  /**
   * Cache TTL for root nodes in milliseconds. When expired, we will
   * trigger a background refresh while serving the last cached result.
   */
  private readonly _cacheTTLms = 5000;
  private _cacheTimestamp = 0;

  private readonly _disposables: Disposable[] = [];

  // Public properties
  /**
   * The onDidChangeTreeData event.
   * @type {Event<NodeModel | undefined | null | void>}
   * @public
   * @memberof TagBrowserProvider
   * @example
   * readonly onDidChangeTreeData: Event<Node | undefined | null | void>;
   * this.onDidChangeTreeData = this._onDidChangeTreeData.event;
   *
   * @see https://code.visualstudio.com/api/references/vscode-api#Event
   */
  readonly onDidChangeTreeData: Event<NodeModel | undefined | null | void>;

  // -----------------------------------------------------------------
  // Constructor
  // -----------------------------------------------------------------

  /**
   * Constructor for the TagBrowserProvider class
   *
   * @constructor
   * @public
   * @memberof TagBrowserProvider
   */
  constructor(private readonly tagIndexService: TagIndexService) {
    this._onDidChangeTreeData = new EventEmitter<
      NodeModel | undefined | null | void
    >();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    this._disposables.push(
      this.tagIndexService.onDidUpdateIndex(() => this.refresh()),
    );
  }

  // -----------------------------------------------------------------
  // Methods
  // -----------------------------------------------------------------

  // Public methods
  /**
   * Returns the tree item for the supplied element.
   *
   * @function getTreeItem
   * @param {NodeModel} element - The element
   * @public
   * @memberof TagBrowserProvider
   * @example
   * const treeItem = provider.getTreeItem(element);
   *
   * @returns {TreeItem | Thenable<TreeItem>} - The tree item
   *
   * @see https://code.visualstudio.com/api/references/vscode-api#TreeDataProvider
   */
  getTreeItem(element: NodeModel): TreeItem | Thenable<TreeItem> {
    // The command is dynamically generated for leaf nodes to ensure correct navigation.
    if (element.resourceUri && element.range && !element.children) {
      element.command = {
        command: 'vscode.open',
        title: 'Open File',
        arguments: [element.resourceUri, { selection: element.range }],
      };
    }
    return element;
  }

  /**
   * Returns the children for the supplied element.
   *
   * @function getChildren
   * @param {NodeModel} [element] - The element
   * @public
   * @memberof TagBrowserProvider
   * @example
   * const children = provider.getChildren(element);
   *
   * @returns {ProviderResult<NodeModel[]>} - The children
   *
   * @see https://code.visualstudio.com/api/references/vscode-api#TreeDataProvider
   */
  getChildren(element?: NodeModel): ProviderResult<NodeModel[]> {
    if (this._isDisposed) {
      return [];
    }

    if (element) {
      return element.children;
    }

    if (this._cachedNodes) {
      // If TTL expired, trigger background refresh but serve stale nodes
      if (Date.now() - this._cacheTimestamp > this._cacheTTLms) {
        if (!this._cachePromise) {
          setTimeout(() => this.refresh(), 0);
        }
      }
      return this._cachedNodes;
    }

    if (this._cachePromise) {
      return this._cachePromise;
    }

    const versionAtStart = this._version;
    this._cachePromise = this.getTagTree().then((nodes: NodeModel[]) => {
      // Ignore if disposed or a newer refresh occurred meanwhile
      if (this._isDisposed || versionAtStart !== this._version) {
        return this._cachedNodes ?? [];
      }
      this._cachedNodes = nodes;
      this._cacheTimestamp = Date.now();
      this._cachePromise = undefined;
      return nodes;
    });

    return this._cachePromise;
  }

  /**
   * Refreshes the tree data by firing the event.
   *
   * @function refresh
   * @public
   * @memberof TagBrowserProvider
   * @example
   * provider.refresh();
   *
   * @returns {void} - No return value
   */
  refresh(): void {
    if (this._isDisposed) {
      return;
    }

    this._version++;
    this._cachedNodes = undefined;
    this._cachePromise = undefined;
    this._cacheTimestamp = 0;
    this._onDidChangeTreeData.fire();
  }

  /**
   * Disposes the provider.
   *
   * @function dispose
   * @public
   * @memberof TagBrowserProvider
   * @example
   * provider.dispose();
   *
   * @returns {void} - No return value
   */
  dispose(): void {
    if (this._isDisposed) {
      return;
    }

    this._isDisposed = true;
    for (const disposable of this._disposables) {
      disposable.dispose();
    }
    this._disposables.length = 0;
    this._cachedNodes = undefined;
    this._cachePromise = undefined;
    this._cacheTimestamp = 0;
  }

  // Private methods
  /**
   * Builds the tag browser tree: tag type -> file -> tag entries.
   *
   * @function getTagTree
   * @private
   * @memberof TagBrowserProvider
   *
   * @returns {Promise<NodeModel[]>} - The built tree nodes
   */
  private async getTagTree(): Promise<NodeModel[]> {
    const index = this.tagIndexService.getIndex();
    if (index.size === 0) {
      return [new NodeModel('No tags found in workspace.')];
    }

    // Use configured priorities to sort tags deterministically.
    const priorityMap = this.tagIndexService.getTagPriorityMap();
    const tagKeys: string[] = Array.from(index.keys());
    tagKeys.sort((a: string, b: string) => {
      const aHas: boolean = priorityMap.has(a);
      const bHas: boolean = priorityMap.has(b);
      if (aHas && bHas) {
        const aPr: number = priorityMap.get(a)!;
        const bPr: number = priorityMap.get(b)!;
        if (aPr !== bPr) {
          return aPr - bPr; // lower number = higher priority
        }
      } else if (aHas && !bHas) {
        return -1;
      } else if (!aHas && bHas) {
        return 1;
      }
      return a.localeCompare(b);
    });

    const rootNodes: NodeModel[] = [];

    for (const tagKey of tagKeys) {
      const filesMap = index.get(tagKey)!; // Map<string(filePath), TagEntry[]>
      const filePaths: string[] = Array.from(filesMap.keys()).sort((l, r) =>
        l.localeCompare(r),
      );

      const fileNodes: NodeModel[] = [];
      for (const filePath of filePaths) {
        const uri: Uri = Uri.file(filePath);
        const entries: TagEntry[] = [...(filesMap.get(filePath) ?? [])].sort(
          (l: TagEntry, r: TagEntry) => l.lineNumber - r.lineNumber,
        );

        const occurrenceNodes: NodeModel[] = entries.map(
          (occurrence: TagEntry) => {
            const pos: Position = new Position(occurrence.lineNumber, 0);
            const range: Range = new Range(pos, pos);
            const node = new NodeModel(
              occurrence.preview,
              new ThemeIcon('tag'),
            );
            node.resourceUri = uri;
            node.range = range;
            node.contextValue = 'occurrenceNode';
            return node;
          },
        );

        const fileNode = new NodeModel(
          getBaseName(uri.fsPath),
          new ThemeIcon('file'),
          undefined,
          uri,
          'file',
          occurrenceNodes,
        );
        fileNodes.push(fileNode);
      }

      const tagNode = new NodeModel(
        tagKey,
        undefined,
        undefined,
        undefined,
        'tagNode',
        fileNodes,
      );
      rootNodes.push(tagNode);
    }

    return rootNodes;
  }
}
