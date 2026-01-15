import * as assert from 'assert';
import * as vscode from 'vscode';
import {
    ActiveSpecResolver,
    ActiveSpecState,
} from '../../services/activeSpecResolver';
import {
    createWorkspaceFixture,
    WorkspaceStub,
} from '../helpers/workspaceFactory';

describe('ActiveSpecResolver', () => {
    it('prefers SPECIFY_FEATURE environment variable when available', async () => {
        const fixture = await createWorkspaceFixture(['project']);
        const specsRoot = vscode.Uri.joinPath(fixture.roots[0], 'specs');
        await createSpecFile(specsRoot, '002-active-spec-status-bar', '# Spec');

        const env = new EnvironmentStub('002-active-spec-status-bar');
        const workspaceStub = new WorkspaceStub(fixture.roots);
        const resolver = new ActiveSpecResolver({
            envResolver: () => env.value,
            gitApiFactory: async () => undefined,
            pollIntervalMs: 0,
            workspace: workspaceStub.asWorkspace(),
        });

        try {
            await resolver.initialize();
            const state = resolver.currentState;

            assert.strictEqual(state.specName, '002-active-spec-status-bar');
            assert.strictEqual(state.source, 'env');
            assert.equal(state.specExists, true);
        } finally {
            resolver.dispose();
            await fixture.dispose();
        }
    });

    it('falls back to git branch when SPECIFY_FEATURE is not set', async () => {
        const fixture = await createWorkspaceFixture(['project']);
        const specsRoot = vscode.Uri.joinPath(fixture.roots[0], 'specs');
        await createSpecFile(specsRoot, '002-active-spec-status-bar', '# Spec');

        const workspaceStub = new WorkspaceStub(fixture.roots);
        const git = new GitApiStub();
        const repo = git.addRepository(fixture.roots[0]);
        repo.setHead('002-active-spec-status-bar');

        const resolver = new ActiveSpecResolver({
            envResolver: () => undefined,
            gitApiFactory: async () => git,
            pollIntervalMs: 0,
            workspace: workspaceStub.asWorkspace(),
        });

        try {
            await resolver.initialize();
            const state = resolver.currentState;

            assert.strictEqual(state.specName, '002-active-spec-status-bar');
            assert.strictEqual(state.source, 'git');
            assert.equal(state.specExists, true);
        } finally {
            resolver.dispose();
            await fixture.dispose();
        }
    });

    it('falls back to highest-numbered spec when env and git are unavailable', async () => {
        const fixture = await createWorkspaceFixture(['project']);
        const specsRoot = vscode.Uri.joinPath(fixture.roots[0], 'specs');
        await createSpecFile(specsRoot, '001-alpha', '# Spec');
        await createSpecFile(specsRoot, '010-beta-feature', '# Spec');

        const workspaceStub = new WorkspaceStub(fixture.roots);
        const resolver = new ActiveSpecResolver({
            envResolver: () => undefined,
            gitApiFactory: async () => undefined,
            pollIntervalMs: 0,
            workspace: workspaceStub.asWorkspace(),
        });

        try {
            await resolver.initialize();
            const state = resolver.currentState;

            assert.strictEqual(state.specName, '010-beta-feature');
            assert.strictEqual(state.source, 'fallback');
            assert.equal(state.specExists, true);
        } finally {
            resolver.dispose();
            await fixture.dispose();
        }
    });

    it('emits updates when git HEAD changes', async () => {
        const fixture = await createWorkspaceFixture(['project']);
        const specsRoot = vscode.Uri.joinPath(fixture.roots[0], 'specs');
        await createSpecFile(specsRoot, '002-active-spec-status-bar', '# Spec');
        await createSpecFile(specsRoot, '003-new-spec', '# Spec');

        const workspaceStub = new WorkspaceStub(fixture.roots);
        const git = new GitApiStub();
        const repo = git.addRepository(fixture.roots[0]);
        repo.setHead('002-active-spec-status-bar');

        const resolver = new ActiveSpecResolver({
            envResolver: () => undefined,
            gitApiFactory: async () => git,
            pollIntervalMs: 0,
            workspace: workspaceStub.asWorkspace(),
        });

        try {
            await resolver.initialize();
            const initial = resolver.currentState;
            assert.strictEqual(initial.specName, '002-active-spec-status-bar');

            const nextStatePromise = waitForStateChange(resolver);
            repo.setHead('003-new-spec');
            const updated = await nextStatePromise;

            assert.strictEqual(updated.specName, '003-new-spec');
            assert.strictEqual(updated.source, 'git');
            assert.equal(updated.specExists, true);
        } finally {
            resolver.dispose();
            await fixture.dispose();
        }
    });
});

async function createSpecFile(
    specsRoot: vscode.Uri,
    specName: string,
    contents: string
): Promise<void> {
    const target = vscode.Uri.joinPath(specsRoot, specName, 'spec.md');
    await vscode.workspace.fs.createDirectory(
        vscode.Uri.joinPath(specsRoot, specName)
    );
    await vscode.workspace.fs.writeFile(target, Buffer.from(contents, 'utf8'));
}

function waitForStateChange(
    resolver: ActiveSpecResolver
): Promise<ActiveSpecState> {
    return new Promise((resolve) => {
        const subscription = resolver.onDidChangeState((state) => {
            subscription.dispose();
            resolve(state);
        });
    });
}

class EnvironmentStub {
    constructor(public value: string | undefined) {}
}

class GitApiStub {
    readonly repositories: GitRepositoryStub[] = [];
    private readonly openEmitter = new vscode.EventEmitter<GitRepositoryStub>();
    private readonly closeEmitter =
        new vscode.EventEmitter<GitRepositoryStub>();
    private readonly changeEmitter = new vscode.EventEmitter<void>();

    readonly onDidOpenRepository = this.openEmitter.event;
    readonly onDidCloseRepository = this.closeEmitter.event;
    readonly onDidChangeState = this.changeEmitter.event;

    addRepository(rootUri: vscode.Uri): GitRepositoryStub {
        const repository = new GitRepositoryStub(rootUri);
        this.repositories.push(repository);
        this.openEmitter.fire(repository);
        return repository;
    }
}

class GitRepositoryStub {
    readonly state = new RepositoryStateStub();

    constructor(readonly rootUri: vscode.Uri) {}

    setHead(name: string | undefined): void {
        this.state.setHead(name);
    }
}

class RepositoryStateStub {
    private readonly changeEmitter = new vscode.EventEmitter<void>();
    private head: { name?: string } | undefined;

    get HEAD(): { name?: string } | undefined {
        return this.head;
    }

    get onDidChange(): vscode.Event<void> {
        return this.changeEmitter.event;
    }

    setHead(name: string | undefined): void {
        this.head = name ? { name } : undefined;
        this.changeEmitter.fire();
    }
}
