/**
 * The IMessageObject interface defines the format for data property values of MessageEvent objects.
 * This interface describes the actual format of data sent with postMessage that is required for
 * another RxPostmessenger on the other end of the line to be able to correctly interpret the
 * message.
 */
export interface IMessageObject<T = any> {

    // The id of the message. This is a UUID-like string that is unique for the single JS lifecycle
    // wherein the message is created.
    readonly id: string;

    // The type of the message. This property allows for distinguishing between various types of
    // messages, such as requests, responses to requests, or one-way notifications.
    readonly type: MessageType;

    // The channel of the message. In addition ot the type property, this property makes it possible
    // to further distinguish between and identify messages. Channel names are determined by the
    // package consumer.
    readonly channel: string;

    // The message payload. This can be any type, and is determined by the package consumer. The
    // type of a given value for a certain message action will be inferred, and remembered throughout
    // the entire code path within this package that the data treads.
    readonly payload: T;
}

export interface IRequestObject<T = any> extends IMessageObject<T> {
    readonly type: 'request';
}

export interface IResponseObject<T = any> extends IMessageObject<T> {
    readonly requestId: string;
    readonly type: 'response';
}

export interface INotificationObject<T = any> extends IMessageObject<T> {
    readonly type: 'notification';
}

export type AnyMessage = IRequestObject | IResponseObject | INotificationObject;

export interface IMessageTypeMap<T = any> {
    request: IRequestObject;
    response: IResponseObject;
    notification: INotificationObject;
}

export type MessageType = keyof IMessageTypeMap;
export type MappedMessage<T extends MessageType> = IMessageTypeMap[T];
