import * as vscode from 'vscode';

export interface WorkspaceRootStatus {
    readonly uri: vscode.Uri;
    readonly hasSpecify: boolean;
}

export interface SpecKitStatus {
    readonly anyRootHasSpecify: boolean;
    readonly roots: WorkspaceRootStatus[];
}

type AsyncDisposable = vscode.Disposable | { dispose(): Promise<void> };

export class SpecKitDetector implements vscode.Disposable {
    private readonly emitter = new vscode.EventEmitter<SpecKitStatus>();
    private disposables: AsyncDisposable[] = [];
    private status: SpecKitStatus = { anyRootHasSpecify: false, roots: [] };
    private readonly watchers = new Map<string, vscode.FileSystemWatcher>();

    constructor(
        private readonly workspace: typeof vscode.workspace = vscode.workspace
    ) {}

    get onDidChangeStatus(): vscode.Event<SpecKitStatus> {
        return this.emitter.event;
    }

    get currentStatus(): SpecKitStatus {
        return this.status;
    }

    async initialize(): Promise<void> {
        this.register(
            this.workspace.onDidChangeWorkspaceFolders(() => {
                const folders = this.workspace.workspaceFolders ?? [];
                this.syncWatchers(folders);
                this.scheduleRefresh();
            })
        );

        await this.refresh();
    }

    async refresh(): Promise<void> {
        const folders = this.workspace.workspaceFolders ?? [];
        this.syncWatchers(folders);
        const rootStatuses: WorkspaceRootStatus[] = [];

        for (const folder of folders) {
            const hasSpecify = await this.checkForSpecifyDirectory(folder.uri);
            rootStatuses.push({ uri: folder.uri, hasSpecify });
        }

        const nextStatus: SpecKitStatus = {
            anyRootHasSpecify: rootStatuses.some((root) => root.hasSpecify),
            roots: rootStatuses,
        };

        this.updateStatus(nextStatus);
    }

    dispose(): void {
        while (this.disposables.length) {
            const disposable = this.disposables.pop();
            if (!disposable) {
                continue;
            }

            try {
                const result = disposable.dispose();
                if (result instanceof Promise) {
                    result.catch(() => undefined);
                }
            } catch {
                // Best-effort disposal.
            }
        }
        this.watchers.clear();
        this.emitter.dispose();
    }

    protected register<T extends AsyncDisposable>(disposable: T): T {
        this.disposables.push(disposable);
        return disposable;
    }

    private syncWatchers(folders: readonly vscode.WorkspaceFolder[]): void {
        const expected = new Set(
            folders.map((folder) => folder.uri.toString())
        );

        for (const folder of folders) {
            const key = folder.uri.toString();
            if (this.watchers.has(key)) {
                continue;
            }

            try {
                const watcher = this.workspace.createFileSystemWatcher(
                    new vscode.RelativePattern(folder, '.specify')
                );
                this.register(watcher);
                this.register(
                    watcher.onDidCreate(() => this.scheduleRefresh())
                );
                this.register(
                    watcher.onDidChange(() => this.scheduleRefresh())
                );
                this.register(
                    watcher.onDidDelete(() => this.scheduleRefresh())
                );
                this.watchers.set(key, watcher);
            } catch {
                // Ignore watcher creation failures (e.g., unsupported schemes).
            }
        }

        for (const [key, watcher] of this.watchers.entries()) {
            if (!expected.has(key)) {
                watcher.dispose();
                this.watchers.delete(key);
            }
        }
    }

    private async checkForSpecifyDirectory(root: vscode.Uri): Promise<boolean> {
        const specifyUri = vscode.Uri.joinPath(root, '.specify');

        try {
            const stat = await this.workspace.fs.stat(specifyUri);
            return (
                (stat.type & vscode.FileType.Directory) ===
                vscode.FileType.Directory
            );
        } catch {
            return false;
        }
    }

    private updateStatus(nextStatus: SpecKitStatus): void {
        const changed =
            nextStatus.anyRootHasSpecify !== this.status.anyRootHasSpecify ||
            nextStatus.roots.length !== this.status.roots.length ||
            nextStatus.roots.some((root, index) => {
                const previous = this.status.roots[index];
                return (
                    !previous ||
                    root.uri.toString() !== previous.uri.toString() ||
                    root.hasSpecify !== previous.hasSpecify
                );
            });

        if (!changed) {
            return;
        }

        this.status = nextStatus;
        this.emitter.fire(this.status);
    }

    private scheduleRefresh(): void {
        void this.refresh().catch(() => undefined);
    }
}
