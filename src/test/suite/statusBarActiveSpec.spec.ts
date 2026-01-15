import * as assert from 'assert';
import * as vscode from 'vscode';
import { SpecKitDetector } from '../../services/specifyDetector';
import { StatusBarService } from '../../services/statusBarService';
import {
    createWorkspaceFixture,
    WorkspaceStub,
} from '../helpers/workspaceFactory';
import { ActiveSpecResolverStub } from '../helpers/activeSpecResolverStub';

describe('StatusBarService (active spec display)', () => {
    it('appends the active spec name when available', async () => {
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

            assert.equal(statusItem.visible, true);
            assert.equal(statusItem.text, '🌱 002-active-spec-status-bar');
            assert.equal(
                statusItem.tooltip,
                'Spec-Kit detected: 002-active-spec-status-bar'
            );

            service.dispose();
            resolver.dispose();
        } finally {
            await fixture.dispose();
        }
    });
});

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
    readonly id = 'spec-kit-status-bar.active-spec-test';

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
