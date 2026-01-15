import * as vscode from 'vscode';
import { SpecKitDetector, SpecKitStatus } from './specifyDetector';
import { ActiveSpecResolver, ActiveSpecState } from './activeSpecResolver';

type ActiveSpecResolverContract = Pick<
    ActiveSpecResolver,
    'onDidChangeState' | 'currentState'
>;

export class StatusBarService implements vscode.Disposable {
    private readonly statusItem: vscode.StatusBarItem;
    private detectorSubscription: vscode.Disposable | undefined;
    private resolverSubscription: vscode.Disposable | undefined;
    private lastDetectorStatus: SpecKitStatus | undefined;
    private lastActiveSpec: ActiveSpecState | undefined;

    constructor(
        private readonly detector: SpecKitDetector,
        private readonly resolver: ActiveSpecResolverContract,
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
        if (this.detectorSubscription || this.resolverSubscription) {
            return;
        }

        this.detectorSubscription = this.detector.onDidChangeStatus(
            (status) => {
                this.lastDetectorStatus = status;
                this.update();
            }
        );

        this.resolverSubscription = this.resolver.onDidChangeState((state) => {
            this.lastActiveSpec = state;
            this.update();
        });

        this.lastDetectorStatus = this.detector.currentStatus;
        this.lastActiveSpec = this.resolver.currentState;
        this.update();
    }

    private update(): void {
        const detectorStatus =
            this.lastDetectorStatus ?? this.detector.currentStatus;
        const activeState = this.lastActiveSpec ?? this.resolver.currentState;

        if (!detectorStatus.anyRootHasSpecify) {
            this.statusItem.hide();
            return;
        }

        if (activeState.specExists && activeState.specName) {
            this.statusItem.text = `🌱 ${activeState.specName}`;
            this.statusItem.tooltip = `Spec-Kit detected: ${activeState.specName}`;
        } else {
            this.statusItem.text = '🌱';
            this.statusItem.tooltip = 'Spec-Kit detected in this workspace';
        }

        this.statusItem.show();
    }

    dispose(): void {
        this.detectorSubscription?.dispose();
        this.resolverSubscription?.dispose();
        this.statusItem.dispose();
    }
}
