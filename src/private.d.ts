type False = 'False'
type True = 'True'
type Bool = False | True
type IfElse<Cond extends Bool, Then, Else> = ({ 'True': Then; 'False': Else; })[Cond];

// --------------------------------------------------------------------------------------------
// Post-message data format
// --------------------------------------------------------------------------------------------

/**
 * Valid string literals for the type property of a ScalarMessage object.
 */
export type MessageType = 'request' | 'response' | 'notification';

/**
 * The ScalarMessage interface defines the format for data property values of MessageEvent objects.
 * This interface describes the actual format of data sent with postMessage that is required for
 * another RxPostmessenger on the other end of the line to be able to correctly interpret the
 * message. This interface should be private to the package implementation. Additional abstractions
 * are used to expose more expressive interfaces to the package consumer.
 */
export interface ScalarMessage<T extends MessageType = MessageType, CH extends string = string, PL = any> {

    // The id of this message. This is a UUID-like string tha is unique for the single JS lifecycle
    // wherein the message is created.
    readonly id: string;

    // The type of the message. This property allows for distinguishing between various types of
    // messages, such as requests, responses to requests, or one-way notifications.
    readonly type: T;

    // The channel of the message. In addition ot the type property, this property makes it possible
    // to further distinguish between and identify messages. Channel names are determined by the
    // package consumer.
    readonly channel: CH;

    // The message payload. This can be any type, and is determined by the package consumer. The
    // type of a given value for a certain message action will be inferred, and remembered throughout
    // the entire code path within this package that the data treads.
    readonly payload: PL;
}

/**
 * The scalar request interface dictates the format for data sent as payload of any request message.
 */
export interface ScalarRequest<CH extends string = string, PL = any> extends ScalarMessage<'request', CH, PL> {
}

/**
 *
 */
export interface ScalarResponse<REQ_ID extends string, CH extends string = string, PL = any> extends ScalarMessage<'response', CH, PL> {
    requestId: REQ_ID;
}

/**
 *
 */
export interface ScalarNotification<CH extends string = string, PL = any> extends ScalarMessage<'notification', CH, PL> {
}