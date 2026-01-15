import * as vscode from 'vscode';
import { SpecKitDetector } from './services/specifyDetector';
import { ActiveSpecResolver } from './services/activeSpecResolver';
import { StatusBarService } from './services/statusBarService';

let detector: SpecKitDetector | undefined;
let resolver: ActiveSpecResolver | undefined;
let statusBar: StatusBarService | undefined;

export async function activate(
    context: vscode.ExtensionContext
): Promise<void> {
    detector = new SpecKitDetector();
    resolver = new ActiveSpecResolver();
    statusBar = new StatusBarService(detector, resolver);
    try {
        await Promise.all([detector.initialize(), resolver.initialize()]);
        statusBar.activate();
    } catch (error) {
        console.error('Failed to initialize Spec-Kit status detector', error);
    }

    context.subscriptions.push(detector, resolver, statusBar);
}

export async function deactivate(): Promise<void> {
    statusBar?.dispose();
    detector?.dispose();
    resolver?.dispose();
    statusBar = undefined;
    detector = undefined;
    resolver = undefined;
}
