import * as vscode from 'vscode';
import { SpecKitDetector } from './services/specifyDetector';
import { StatusBarService } from './services/statusBarService';

let detector: SpecKitDetector | undefined;
let statusBar: StatusBarService | undefined;

export async function activate(
    context: vscode.ExtensionContext
): Promise<void> {
    detector = new SpecKitDetector();
    statusBar = new StatusBarService(detector);
    try {
        await detector.initialize();
        statusBar.activate();
    } catch (error) {
        console.error('Failed to initialize Spec-Kit status detector', error);
    }

    context.subscriptions.push(detector, statusBar);
}

export async function deactivate(): Promise<void> {
    statusBar?.dispose();
    detector?.dispose();
    statusBar = undefined;
    detector = undefined;
}
