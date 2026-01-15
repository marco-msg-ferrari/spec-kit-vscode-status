import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';

export interface WorkspaceFixture {
    readonly roots: vscode.Uri[];
    dispose(): Promise<void>;
}

export async function createWorkspaceFixture(
    folderNames: string[]
): Promise<WorkspaceFixture> {
    const baseDir = await fs.mkdtemp(
        path.join(os.tmpdir(), 'spec-kit-status-')
    );
    const roots: vscode.Uri[] = [];

    for (const name of folderNames) {
        const dir = path.join(baseDir, name);
        await fs.mkdir(dir, { recursive: true });
        roots.push(vscode.Uri.file(dir));
    }

    return {
        roots,
        async dispose(): Promise<void> {
            await fs.rm(baseDir, { recursive: true, force: true });
        },
    };
}

export class TestFileSystemWatcher implements vscode.FileSystemWatcher {
    readonly ignoreCreateEvents = false;
    readonly ignoreChangeEvents = false;
    readonly ignoreDeleteEvents = false;

    private readonly createEmitter = new vscode.EventEmitter<vscode.Uri>();
    private readonly changeEmitter = new vscode.EventEmitter<vscode.Uri>();
    private readonly deleteEmitter = new vscode.EventEmitter<vscode.Uri>();
    private disposed = false;

    constructor(readonly pattern: vscode.GlobPattern) {}

    get onDidCreate(): vscode.Event<vscode.Uri> {
        return this.createEmitter.event;
    }

    get onDidChange(): vscode.Event<vscode.Uri> {
        return this.changeEmitter.event;
    }

    get onDidDelete(): vscode.Event<vscode.Uri> {
        return this.deleteEmitter.event;
    }

    fireCreate(uri: vscode.Uri): void {
        if (!this.disposed) {
            this.createEmitter.fire(uri);
        }
    }

    fireChange(uri: vscode.Uri): void {
        if (!this.disposed) {
            this.changeEmitter.fire(uri);
        }
    }

    fireDelete(uri: vscode.Uri): void {
        if (!this.disposed) {
            this.deleteEmitter.fire(uri);
        }
    }

    dispose(): void {
        if (this.disposed) {
            return;
        }

        this.disposed = true;
        this.createEmitter.dispose();
        this.changeEmitter.dispose();
        this.deleteEmitter.dispose();
    }
}

export class WorkspaceStub {
    workspaceFolders: vscode.WorkspaceFolder[];
    readonly fs = vscode.workspace.fs;
    readonly onDidChangeWorkspaceFolders: vscode.Event<vscode.WorkspaceFoldersChangeEvent>;

    private readonly folderEmitter =
        new vscode.EventEmitter<vscode.WorkspaceFoldersChangeEvent>();
    private readonly watchers = new Map<string, TestFileSystemWatcher>();

    constructor(roots: vscode.Uri[]) {
        this.workspaceFolders = this.toFolders(roots);
        this.onDidChangeWorkspaceFolders = this.folderEmitter.event;
    }

    createFileSystemWatcher(
        pattern: vscode.GlobPattern
    ): vscode.FileSystemWatcher {
        const watcher = new TestFileSystemWatcher(pattern);
        const key = this.extractWatcherKey(pattern);
        if (key) {
            this.watchers.set(key, watcher);
        }
        return watcher;
    }

    asWorkspace(): typeof vscode.workspace {
        return this as unknown as typeof vscode.workspace;
    }

    setRoots(roots: vscode.Uri[]): void {
        const previous = this.workspaceFolders;
        const next = this.toFolders(roots);

        const previousKeys = new Map(
            previous.map((folder) => [folder.uri.toString(), folder] as const)
        );
        const nextKeys = new Map(
            next.map((folder) => [folder.uri.toString(), folder] as const)
        );

        const added: vscode.WorkspaceFolder[] = [];
        const removed: vscode.WorkspaceFolder[] = [];

        for (const [key, folder] of nextKeys) {
            if (!previousKeys.has(key)) {
                added.push(folder);
            }
        }

        for (const [key, folder] of previousKeys) {
            if (!nextKeys.has(key)) {
                removed.push(folder);
                this.watchers.delete(key);
            }
        }

        this.workspaceFolders = next;
        this.folderEmitter.fire({ added, removed });
    }

    fireWatcherCreate(root: vscode.Uri): void {
        const watcher = this.resolveWatcher(root);
        if (watcher) {
            watcher.fireCreate(vscode.Uri.joinPath(root, '.specify'));
        }
    }

    fireWatcherDelete(root: vscode.Uri): void {
        const watcher = this.resolveWatcher(root);
        if (watcher) {
            watcher.fireDelete(vscode.Uri.joinPath(root, '.specify'));
        }
    }

    private resolveWatcher(
        root: vscode.Uri
    ): TestFileSystemWatcher | undefined {
        return this.watchers.get(root.toString());
    }

    private toFolders(roots: vscode.Uri[]): vscode.WorkspaceFolder[] {
        return roots.map((uri, index) => ({
            uri,
            index,
            name: path.basename(uri.fsPath),
        }));
    }

    private extractWatcherKey(pattern: vscode.GlobPattern): string | undefined {
        if (pattern instanceof vscode.RelativePattern) {
            if (pattern.baseUri) {
                return pattern.baseUri.toString();
            }
            return vscode.Uri.file(pattern.base).toString();
        }

        if (typeof pattern === 'string') {
            return pattern;
        }

        return undefined;
    }
}
