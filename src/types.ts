export interface IMessageIDGenerator {

    /**
     * Get a new unique ID value for message objects.
     */
    generateID(): string;

    /**
     * Invalidates an ID value - marks it a used. This is a required
     * feature for syncing the used ID values
     */
    invalidateID(id: string): void;
}

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

export interface IMessageFactory {
    invalidateID(id: string): void;
    makeRequest<T>(channel: string, payload: T): IRequestObject<T>;
    makeResponse<T>(requestId: string, channel: string, payload: T): IResponseObject<T>;
    makeNotification<T>(channel: string, payload: T): INotificationObject<T>;
}

export interface IOwnMessageEvent<T> extends MessageEvent {
    readonly data: T;
}

export interface IMessageValidator {
    validate(message: MessageEvent): message is IOwnMessageEvent<AnyMessage>;
}

export interface IPostmessageAdapter {
    readonly targetWindow: Window;
    readonly targetOrigin: string;
    postMessage<T extends AnyMessage>(data: T): void;
}
