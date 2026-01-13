import * as assert from 'assert';
import * as vscode from 'vscode';
import { SpecKitDetector, SpecKitStatus } from '../../services/specifyDetector';
import {
    createWorkspaceFixture,
    WorkspaceStub,
} from '../helpers/workspaceFactory';

describe('SpecKitDetector', () => {
    it('detects when any workspace root contains a .specify directory', async () => {
        const fixture = await createWorkspaceFixture([
            'with-specify',
            'without',
        ]);

        try {
            const targetRoot = fixture.roots[0];
            await vscode.workspace.fs.createDirectory(
                vscode.Uri.joinPath(targetRoot, '.specify')
            );

            const workspaceStub = new WorkspaceStub(fixture.roots);
            const detector = new SpecKitDetector(workspaceStub.asWorkspace());

            await detector.initialize();

            const status = detector.currentStatus;
            assert.equal(status.anyRootHasSpecify, true);
            assert.equal(status.roots.length, 2);

            const match = status.roots.find(
                (root) => root.uri.fsPath === targetRoot.fsPath
            );
            assert.ok(match);
            assert.equal(match?.hasSpecify, true);
        } finally {
            await fixture.dispose();
        }
    });

    it('updates when workspace folders change', async () => {
        const fixture = await createWorkspaceFixture(['first', 'second']);

        try {
            const workspaceStub = new WorkspaceStub([fixture.roots[0]]);
            const detector = new SpecKitDetector(workspaceStub.asWorkspace());

            await detector.initialize();

            const initial = detector.currentStatus;
            assert.equal(initial.anyRootHasSpecify, false);

            await vscode.workspace.fs.createDirectory(
                vscode.Uri.joinPath(fixture.roots[1], '.specify')
            );

            const statusPromise = waitForStatus(detector);
            workspaceStub.setRoots(fixture.roots);

            const updated = await statusPromise;
            assert.equal(updated.anyRootHasSpecify, true);
        } finally {
            await fixture.dispose();
        }
    });
});

function waitForStatus(detector: SpecKitDetector): Promise<SpecKitStatus> {
    return new Promise((resolve) => {
        const subscription = detector.onDidChangeStatus((status) => {
            subscription.dispose();
            resolve(status);
        });
    });
}
