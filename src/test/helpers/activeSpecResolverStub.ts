import * as vscode from 'vscode';
import type {
    ActiveSpecResolver,
    ActiveSpecState,
} from '../../services/activeSpecResolver';

export class ActiveSpecResolverStub
    implements
        Pick<ActiveSpecResolver, 'onDidChangeState' | 'currentState'>,
        vscode.Disposable
{
    private readonly emitter = new vscode.EventEmitter<ActiveSpecState>();
    private state: ActiveSpecState;

    constructor(initialState?: Partial<ActiveSpecState>) {
        const timestamp = initialState?.timestamp ?? Date.now();
        this.state = {
            source: 'unknown',
            specExists: false,
            ...initialState,
            timestamp,
        };
    }

    get onDidChangeState(): vscode.Event<ActiveSpecState> {
        return this.emitter.event;
    }

    get currentState(): ActiveSpecState {
        return this.state;
    }

    setState(next: Partial<ActiveSpecState> & { timestamp?: number }): void {
        const timestamp = next.timestamp ?? Date.now();
        this.state = {
            ...this.state,
            ...next,
            timestamp,
        };
        this.emitter.fire(this.state);
    }

    dispose(): void {
        this.emitter.dispose();
    }
}
