import * as assert from 'assert';
import * as vscode from 'vscode';
import { SpecKitDetector } from '../../services/specifyDetector';
import { StatusBarService } from '../../services/statusBarService';
import {
    createWorkspaceFixture,
    WorkspaceStub,
} from '../helpers/workspaceFactory';
import { ActiveSpecResolverStub } from '../helpers/activeSpecResolverStub';

describe('StatusBarService (active spec dynamic)', () => {
    it('updates the status bar when the active spec changes', async () => {
        const fixture = await createWorkspaceFixture(['with-specify']);

        try {
            const specifyDir = vscode.Uri.joinPath(
                fixture.roots[0],
                '.specify'
            );
            await vscode.workspace.fs.createDirectory(specifyDir);

            const workspaceStub = new WorkspaceStub(fixture.roots);
            const detector = new SpecKitDetector(workspaceStub.asWorkspace());
            await detector.initialize();

            const statusItem = new TestStatusBarItem();
            const windowStub = {
                createStatusBarItem: () => statusItem,
            } as unknown as typeof vscode.window;

            const resolver = new ActiveSpecResolverStub({
                specName: '002-active-spec-status-bar',
                specExists: true,
                source: 'git',
            });

            const service = new StatusBarService(
                detector,
                resolver,
                windowStub
            );

            service.activate();

            assert.equal(statusItem.text, '🌱 002-active-spec-status-bar');

            resolver.setState({
                specName: '003-new-spec',
                specExists: true,
                source: 'git',
            });

            await waitForMicrotask();

            assert.equal(statusItem.text, '🌱 003-new-spec');

            service.dispose();
            resolver.dispose();
        } finally {
            await fixture.dispose();
        }
    });
});

function waitForMicrotask(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 0));
}

class TestStatusBarItem implements vscode.StatusBarItem {
    readonly alignment: vscode.StatusBarAlignment =
        vscode.StatusBarAlignment.Left;
    readonly priority: number | undefined;
    text = '';
    tooltip: string | vscode.MarkdownString | undefined;
    command: string | vscode.Command | undefined;
    backgroundColor: vscode.ThemeColor | undefined;
    color: string | vscode.ThemeColor | undefined;
    accessibilityInformation: vscode.AccessibilityInformation | undefined;
    name: string | undefined;
    readonly id = 'spec-kit-status-bar.active-spec-dynamic-test';

    visible = false;
    disposed = false;

    show(): void {
        this.visible = true;
    }

    hide(): void {
        this.visible = false;
    }

    dispose(): void {
        this.disposed = true;
    }
}
