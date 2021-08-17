import type { AnyMessage, IPostmessageAdapter } from './types'

export class PostmessageAdapter implements IPostmessageAdapter {

    constructor(
        public readonly targetWindow: Window,
        public readonly targetOrigin: string,
    ) {
    }

    public postMessage<T extends AnyMessage>(data: T): void {
        this.targetWindow.postMessage(data, this.targetOrigin)
    }
}
