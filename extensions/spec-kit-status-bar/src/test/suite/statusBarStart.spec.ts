import * as assert from 'assert';
import * as vscode from 'vscode';
import { SpecKitDetector } from '../../services/specifyDetector';
import { StatusBarService } from '../../services/statusBarService';
import {
    createWorkspaceFixture,
    WorkspaceStub,
} from '../helpers/workspaceFactory';

describe('StatusBarService (startup)', () => {
    it('shows the indicator when detector reports Spec-Kit present', async () => {
        const fixture = await createWorkspaceFixture(['with-specify']);

        try {
            await vscode.workspace.fs.createDirectory(
                vscode.Uri.joinPath(fixture.roots[0], '.specify')
            );
            const workspaceStub = new WorkspaceStub(fixture.roots);
            const detector = new SpecKitDetector(workspaceStub.asWorkspace());
            await detector.initialize();

            const item = new TestStatusBarItem();
            const windowStub = {
                createStatusBarItem: () => item,
            } as unknown as typeof vscode.window;
            const service = new StatusBarService(detector, windowStub);

            service.activate();

            assert.equal(item.visible, true);
            assert.equal(item.text, '🌱');
            assert.equal(item.tooltip, 'Spec-Kit detected in this workspace');
        } finally {
            await fixture.dispose();
        }
    });

    it('hides the indicator when detector reports no Spec-Kit', async () => {
        const fixture = await createWorkspaceFixture(['without-specify']);

        try {
            const workspaceStub = new WorkspaceStub(fixture.roots);
            const detector = new SpecKitDetector(workspaceStub.asWorkspace());
            await detector.initialize();

            const item = new TestStatusBarItem();
            const windowStub = {
                createStatusBarItem: () => item,
            } as unknown as typeof vscode.window;
            const service = new StatusBarService(detector, windowStub);

            service.activate();

            assert.equal(item.visible, false);
        } finally {
            await fixture.dispose();
        }
    });

    it('updates visibility when .specify is created or removed at runtime', async () => {
        const fixture = await createWorkspaceFixture(['toggle']);

        try {
            const workspaceStub = new WorkspaceStub(fixture.roots);
            const detector = new SpecKitDetector(workspaceStub.asWorkspace());
            await detector.initialize();

            const item = new TestStatusBarItem();
            const windowStub = {
                createStatusBarItem: () => item,
            } as unknown as typeof vscode.window;
            const service = new StatusBarService(detector, windowStub);

            service.activate();
            assert.equal(item.visible, false);

            const specifyUri = vscode.Uri.joinPath(
                fixture.roots[0],
                '.specify'
            );

            await vscode.workspace.fs.createDirectory(specifyUri);
            const created = waitForStatusChange(detector);
            workspaceStub.fireWatcherCreate(fixture.roots[0]);
            await created;
            assert.equal(item.visible, true);

            await vscode.workspace.fs.delete(specifyUri, {
                recursive: true,
                useTrash: false,
            });
            const deleted = waitForStatusChange(detector);
            workspaceStub.fireWatcherDelete(fixture.roots[0]);
            await deleted;
            assert.equal(item.visible, false);
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
    readonly id = 'spec-kit-status-bar.test-item';
    show(): void {
        this.visible = true;
    }
    hide(): void {
        this.visible = false;
    }
    dispose(): void {
        this.disposed = true;
    }

    visible = false;
    disposed = false;
}

function waitForStatusChange(detector: SpecKitDetector): Promise<void> {
    return new Promise((resolve) => {
        const subscription = detector.onDidChangeStatus(() => {
            subscription.dispose();
            resolve();
        });
    });
}
