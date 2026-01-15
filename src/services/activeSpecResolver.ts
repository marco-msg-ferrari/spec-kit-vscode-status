import * as vscode from 'vscode';

export type ActiveSpecSource = 'env' | 'git' | 'fallback' | 'unknown';

export interface ActiveSpecState {
    readonly specName?: string;
    readonly source: ActiveSpecSource;
    readonly specExists: boolean;
    readonly timestamp: number;
}

interface GitRepositoryStateLike {
    readonly HEAD?: { readonly name?: string };
    readonly onDidChange: vscode.Event<void>;
}

interface GitRepositoryLike {
    readonly rootUri: vscode.Uri;
    readonly state: GitRepositoryStateLike;
}

interface GitApiLike {
    readonly repositories: readonly GitRepositoryLike[];
    readonly onDidOpenRepository: vscode.Event<GitRepositoryLike>;
    readonly onDidCloseRepository: vscode.Event<GitRepositoryLike>;
    readonly onDidChangeState: vscode.Event<void>;
}

interface ActiveSpecResolverOptions {
    readonly envResolver?: () => string | undefined;
    readonly gitApiFactory?: () => Promise<GitApiLike | undefined>;
    readonly pollIntervalMs?: number;
    readonly setIntervalFn?: (
        handler: () => void,
        timeout: number
    ) => NodeJS.Timeout;
    readonly clearIntervalFn?: (handle: NodeJS.Timeout) => void;
    readonly workspace?: typeof vscode.workspace;
    readonly fileSystem?: typeof vscode.workspace.fs;
}

interface ActiveSpecCandidate {
    readonly specName?: string;
    readonly source: ActiveSpecSource;
    readonly specExists: boolean;
}

export class ActiveSpecResolver implements vscode.Disposable {
    private readonly emitter = new vscode.EventEmitter<ActiveSpecState>();
    private readonly getEnvValue: () => string | undefined;
    private readonly gitApiFactory: () => Promise<GitApiLike | undefined>;
    private readonly pollInterval: number;
    private readonly setIntervalFn: Required<ActiveSpecResolverOptions>['setIntervalFn'];
    private readonly clearIntervalFn: Required<ActiveSpecResolverOptions>['clearIntervalFn'];
    private readonly workspace: typeof vscode.workspace;
    private readonly fs: typeof vscode.workspace.fs;
    private readonly disposables: vscode.Disposable[] = [];
    private readonly repositorySubscriptions = new Map<
        string,
        vscode.Disposable
    >();
    private state: ActiveSpecState = {
        source: 'unknown',
        specExists: false,
        timestamp: Date.now(),
    };
    private gitApi: GitApiLike | undefined;
    private timer: NodeJS.Timeout | undefined;
    private envSnapshot: string | undefined;
    private initializingGit = false;

    constructor(options: ActiveSpecResolverOptions = {}) {
        this.getEnvValue =
            options.envResolver ?? (() => process.env.SPECIFY_FEATURE);
        this.gitApiFactory =
            options.gitApiFactory ?? this.defaultGitApiFactory.bind(this);
        this.pollInterval = options.pollIntervalMs ?? 2000;
        this.setIntervalFn = options.setIntervalFn ?? setInterval;
        this.clearIntervalFn = options.clearIntervalFn ?? clearInterval;
        this.workspace = options.workspace ?? vscode.workspace;
        this.fs = options.fileSystem ?? vscode.workspace.fs;
    }

    get onDidChangeState(): vscode.Event<ActiveSpecState> {
        return this.emitter.event;
    }

    get currentState(): ActiveSpecState {
        return this.state;
    }

    async initialize(): Promise<void> {
        this.envSnapshot = this.normalizeSpecName(this.getEnvValue());
        await this.ensureGitIntegration();
        await this.refresh();
        this.startEnvironmentWatcher();
    }

    async refresh(): Promise<void> {
        const timestamp = Date.now();
        const specsRoot = await this.resolveSpecsRoot();
        const candidate = await this.resolveCandidate(specsRoot);
        this.updateState({ ...candidate, timestamp });
    }

    dispose(): void {
        if (this.timer) {
            this.clearIntervalFn(this.timer);
            this.timer = undefined;
        }

        for (const disposable of this.repositorySubscriptions.values()) {
            try {
                disposable.dispose();
            } catch {
                // Ignore disposal issues; best-effort cleanup.
            }
        }
        this.repositorySubscriptions.clear();

        while (this.disposables.length) {
            const disposable = this.disposables.pop();
            try {
                disposable?.dispose();
            } catch {
                // Ignore disposal issues.
            }
        }

        this.emitter.dispose();
    }

    private async resolveCandidate(
        specsRoot: vscode.Uri | undefined
    ): Promise<ActiveSpecCandidate> {
        const envSpec = this.normalizeSpecName(this.getEnvValue());
        this.envSnapshot = envSpec;
        if (envSpec) {
            const exists = await this.specExists(envSpec, specsRoot);
            return { specName: envSpec, source: 'env', specExists: exists };
        }

        const gitSpec = await this.resolveFromGit(specsRoot);
        if (gitSpec) {
            return gitSpec;
        }

        const fallbackSpec = await this.resolveFromFallback(specsRoot);
        if (fallbackSpec) {
            return fallbackSpec;
        }

        return { source: 'unknown', specExists: false };
    }

    private updateState(next: ActiveSpecState): void {
        const changed =
            next.specName !== this.state.specName ||
            next.source !== this.state.source ||
            next.specExists !== this.state.specExists;

        this.state = next;

        if (changed) {
            this.emitter.fire(this.state);
        }
    }

    private startEnvironmentWatcher(): void {
        if (this.pollInterval <= 0 || this.timer) {
            return;
        }

        this.timer = this.setIntervalFn(() => {
            const current = this.normalizeSpecName(this.getEnvValue());
            if (current !== this.envSnapshot) {
                this.envSnapshot = current;
                void this.refresh();
            }
        }, this.pollInterval);
    }

    private async ensureGitIntegration(): Promise<void> {
        if (this.gitApi || this.initializingGit) {
            return;
        }

        this.initializingGit = true;
        try {
            const api = await this.gitApiFactory();
            if (!api) {
                return;
            }

            this.gitApi = api;

            this.disposables.push(
                api.onDidOpenRepository((repo) => {
                    this.watchRepository(repo);
                    void this.refresh();
                }),
                api.onDidCloseRepository((repo) =>
                    this.unwatchRepository(repo)
                ),
                api.onDidChangeState(() => {
                    void this.refresh();
                })
            );

            for (const repo of api.repositories) {
                this.watchRepository(repo);
            }
        } finally {
            this.initializingGit = false;
        }
    }

    private watchRepository(repo: GitRepositoryLike): void {
        const key = repo.rootUri.toString();
        if (this.repositorySubscriptions.has(key)) {
            return;
        }

        const disposable = repo.state.onDidChange(() => {
            void this.refresh();
        });
        this.repositorySubscriptions.set(key, disposable);
    }

    private unwatchRepository(repo: GitRepositoryLike): void {
        const key = repo.rootUri.toString();
        const existing = this.repositorySubscriptions.get(key);
        if (existing) {
            try {
                existing.dispose();
            } catch {
                // Ignore disposal issues.
            }
            this.repositorySubscriptions.delete(key);
        }
    }

    private async resolveFromGit(
        specsRoot: vscode.Uri | undefined
    ): Promise<ActiveSpecCandidate | undefined> {
        if (!this.gitApi) {
            await this.ensureGitIntegration();
        }

        const api = this.gitApi;
        if (!api) {
            return undefined;
        }

        for (const repo of api.repositories) {
            const branchName = repo.state.HEAD?.name;
            const normalized = this.normalizeSpecName(branchName);
            if (!normalized) {
                continue;
            }

            const exists = await this.specExists(normalized, specsRoot);
            return {
                specName: normalized,
                source: 'git',
                specExists: exists,
            };
        }

        return undefined;
    }

    private async resolveFromFallback(
        specsRoot: vscode.Uri | undefined
    ): Promise<ActiveSpecCandidate | undefined> {
        const root = specsRoot ?? (await this.resolveSpecsRoot());
        if (!root) {
            return undefined;
        }

        let best: { name: string; value: number } | undefined;
        try {
            const entries = await this.fs.readDirectory(root);
            for (const [name, entryType] of entries) {
                if (entryType !== vscode.FileType.Directory) {
                    continue;
                }

                const normalized = this.normalizeSpecName(name);
                if (!normalized) {
                    continue;
                }

                const match = /^([0-9]+)/.exec(normalized);
                const value = match ? parseInt(match[1], 10) : -1;

                if (!best || value > best.value) {
                    best = { name: normalized, value };
                }
            }
        } catch {
            return undefined;
        }

        if (!best) {
            return undefined;
        }

        const exists = await this.specExists(best.name, root);
        if (!exists) {
            return undefined;
        }

        return { specName: best.name, source: 'fallback', specExists: true };
    }

    private async specExists(
        specName: string,
        specsRoot?: vscode.Uri
    ): Promise<boolean> {
        const root = specsRoot ?? (await this.resolveSpecsRoot());
        if (!root) {
            return false;
        }

        const specUri = vscode.Uri.joinPath(root, specName, 'spec.md');
        try {
            const stat = await this.fs.stat(specUri);
            return (stat.type & vscode.FileType.File) === vscode.FileType.File;
        } catch {
            return false;
        }
    }

    private async resolveSpecsRoot(): Promise<vscode.Uri | undefined> {
        const folders = this.workspace.workspaceFolders ?? [];
        for (const folder of folders) {
            const candidate = vscode.Uri.joinPath(folder.uri, 'specs');
            try {
                const stat = await this.fs.stat(candidate);
                if (stat.type & vscode.FileType.Directory) {
                    return candidate;
                }
            } catch {
                // Ignore missing directories and permission errors.
            }
        }
        return undefined;
    }

    private normalizeSpecName(value?: string | null): string | undefined {
        if (!value) {
            return undefined;
        }

        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : undefined;
    }

    private async defaultGitApiFactory(): Promise<GitApiLike | undefined> {
        const extension = vscode.extensions.getExtension('vscode.git');
        if (!extension) {
            return undefined;
        }

        if (!extension.isActive) {
            try {
                await extension.activate();
            } catch {
                return undefined;
            }
        }

        const exports = extension.exports as
            | { getAPI(version: number): unknown }
            | undefined;
        if (!exports || typeof exports.getAPI !== 'function') {
            return undefined;
        }

        const api = exports.getAPI(1) as GitApiLike | undefined;
        return api;
    }
}
