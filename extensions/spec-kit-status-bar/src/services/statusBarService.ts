import * as vscode from 'vscode';
import { SpecKitDetector, SpecKitStatus } from './specifyDetector';

export class StatusBarService implements vscode.Disposable {
    private readonly statusItem: vscode.StatusBarItem;
    private subscription: vscode.Disposable | undefined;

    constructor(
        private readonly detector: SpecKitDetector,
        windowApi: typeof vscode.window = vscode.window
    ) {
        this.statusItem = windowApi.createStatusBarItem(
            vscode.StatusBarAlignment.Left,
            10
        );
        this.statusItem.text = '$(question)';
        this.statusItem.tooltip = 'Spec-Kit status unknown';
    }

    activate(): void {
        if (this.subscription) {
            return;
        }

        this.subscription = this.detector.onDidChangeStatus(
            this.update.bind(this)
        );
        this.update(this.detector.currentStatus);
    }

    private update(status: SpecKitStatus): void {
        if (status.anyRootHasSpecify) {
            this.statusItem.text = '🌱';
            this.statusItem.tooltip = 'Spec-Kit detected in this workspace';
            this.statusItem.show();
        } else {
            this.statusItem.hide();
        }
    }

    dispose(): void {
        this.subscription?.dispose();
        this.statusItem.dispose();
    }
}
