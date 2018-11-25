import { AnyMessage } from './message-objects';

export interface IOwnMessageEvent<T> extends MessageEvent {
    readonly data: T;
}

export interface IMessageValidator {
    validate(message: MessageEvent): message is IOwnMessageEvent<AnyMessage>;
}
