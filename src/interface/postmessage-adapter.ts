import { AnyMessage } from './message-objects';

export interface IPostmessageAdapter {

    readonly targetWindow: Window;
    readonly targetOrigin: string;

    postMessage<T extends AnyMessage>(data: T): void;
}
