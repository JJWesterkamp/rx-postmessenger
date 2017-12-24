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
export interface ScalarMessage<T extends MessageType, CH extends string = string, PL = any> {
    id: string;
    type: T;
    channel: CH;
    payload: PL;
}

export interface ScalarRequest<CH extends string = string, PL = any> extends ScalarMessage<'request', CH, PL> {

}

export interface ScalarResponse<CH extends string = string, PL = any> extends ScalarMessage<'response', CH, PL> {
}

export interface ScalarNotification<CH extends string = string, PL = any> extends ScalarMessage<'notification', CH, PL> {
}


export interface RequestWrapper<T extends ScalarRequest> {
    readonly data: T;
    validate(validator: (payload: T['payload']) => payload is T): boolean;
}
