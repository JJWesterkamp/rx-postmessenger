type False = 'False'
type True = 'True'
type Bool = False | True
type IfElse<Cond extends Bool, Then, Else> = ({ 'True': Then; 'False': Else; })[Cond];

// --------------------------------------------------------------------------------------------
// Post-message data format
// --------------------------------------------------------------------------------------------

/**
 * The ScalarMessage interface defines the format for data property values of MessageEvent objects.
 * This interface describes the actual format of data sent with postMessage that is required for
 * another RxPostmessenger on the other end of the line to be able to correctly interpret the
 * message. This interface should be private to the package implementation. Additional abstractions
 * are used to expose more expressive interfaces to the package consumer.
 */
export interface MessageObject {

    // The id of this message. This is a UUID-like string tha is unique for the single JS lifecycle
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
    readonly payload: any;
}

/**
 * The scalar request interface dictates the format for data sent as payload of any request message.
 */
export interface RequestObject<CH extends string = string, PL = any> extends MessageObject {
    readonly id: string;
    readonly type: 'request';
    readonly channel: CH;
    readonly payload: PL;
}

/**
 *
 */
export interface ResponseObject<CH extends string = string, PL = any> extends MessageObject {
    readonly requestId: string;
    readonly id: string;
    readonly type: 'response';
    readonly channel: CH;
    readonly payload: PL;
}

/**
 *
 */
export interface NotificationObject<CH extends string = string, PL = any> extends MessageObject {
    readonly id: string;
    readonly type: 'notification';
    readonly channel: CH;
    readonly payload: PL;
}

export type AnyMessage = RequestObject | ResponseObject | NotificationObject;

export interface MessageTypeMap {
    [key: string]: AnyMessage;
    'request': RequestObject;
    'response': ResponseObject;
    'notification': NotificationObject;
}

/**
 * Valid string literals for the type property of a ScalarMessage object.
 */
export type MessageType = keyof MessageTypeMap;

export type MappedMessage<T extends MessageType> = MessageTypeMap[T];
