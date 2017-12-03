import { RxPostmessenger } from "./rx-postmessenger";
export { RxPostmessenger };
export default RxPostmessenger;

/**
 * Valid string literals for the type property of a ScalarMessage object.
 */
export type MessageType = 'request' | 'response' | 'notification';

/**
 * The ScalarMessage interface defines the format for data property values of MessageEvent objects.
 */
export interface ScalarMessage<T extends MessageType> {
    id: string;
    type: T;
    channel: string;
    payload: any;
}

export interface ScalarRequest extends ScalarMessage<'request'> {
}

export interface ScalarResponse extends ScalarMessage<'response'> {
}

export interface ScalarNotification extends ScalarMessage<'notification'> {
}


export interface RequestWrapper<T extends ScalarRequest> {
    readonly data: T;
    validate(validator: (payload: T['payload']) => payload is T): boolean;
}
