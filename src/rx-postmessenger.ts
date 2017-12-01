import { Observable } from './rx';
import generateUUID from './uuid-generator';

/**
 *
 */
export type MessageType = 'request' | 'response' | 'notification';

/**
 *
 */
export interface Message<T extends MessageType> {
    id: string;
    type: T;
    channel: string;
    payload: any;
}

export type Notification = Message<'notification'>;
export type Request = Message<'request'>;
export type Response = Message<'response'>;

/**
 * @class RxPostmessenger
 */
export default class RxPostmessenger {

    /**
     * The observable reference to use when creating new streams. By default a minimal implementation
     * with only the operator requirements for this module.
     *
     */
    static Observable: typeof Observable = Observable;

    /**
     * Enables injection of a different Rx.Observable reference. This is useful when using
     * the UMD bundle of this package, in which a minimal Rx build is included. Once provided,
     * any RxPostmessenger instance that is created afterwards exposes Observable instances
     * with all the operators enabled that were added to the given reference.
     *
     * @param {Class<Observable>} reference
     * @return {Class<RxPostmessenger>}
     */
    static useObservable<T extends typeof Observable>(reference: T): typeof RxPostmessenger {
        this.Observable = reference;
        return this;
    }

    /**
     * Observable stream of all incoming messages that originate
     * from otherWindow with an origin url matching this.origin.
     *
     * @member {Observable<object>} inboundMessages$
     * @public
     */
    public readonly inboundMessages$: Observable<Message<MessageType>>;

    /**
     * Filtered subset of inboundMessages$, emitting all messages of type 'notification'.
     *
     * @member {Observable<object>} notifications$
     * @public
     */
    public readonly notifications$: Observable<Notification>;

    /**
     * Filtered subset of inboundMessages$, emitting all messages of type 'request'.
     *
     * @member {Observable<object>} requests$
     * @public
     */
    public readonly requests$: Observable<Request>;

    /**
     * Filtered subset of inboundMessages$, emitting all messages of type 'response'.
     *
     * @member {Observable<object>} responses$
     * @public
     */
    public readonly responses$: Observable<Response>;

    /**
     * @param {Window} otherWindow
     * @param {string} origin
     *
     * @return {RxPostmessenger}
     */
    public static connect(otherWindow: Window, origin: string): RxPostmessenger {
        return new this(otherWindow, origin);
    }

    /**
     * @param {Window} otherWindow - The window object to exchange messages with.
     * @param {string} origin - The remote url to accept incoming messages from.
     */
    private constructor(public readonly otherWindow: Window, public readonly origin: string) {
        this.inboundMessages$ = RxPostmessenger.Observable
            .fromEvent<MessageEvent>(window, 'message')
            .filter((message) => this.isValidMessage(message))
            .pluck('data');

        this.requests$      = this.messagesOfType('request');
        this.responses$     = this.messagesOfType('response');
        this.notifications$ = this.messagesOfType('notification');
    }

    /**
     * @param {string} channel
     * @param {*} payload
     *
     * @return {Observable<object>}
     * @public
     */
    public request<T extends Response>(channel: string, payload: any = null): Observable<T> {
        const requestData = this.createMessageObject('request', channel, payload)
        this.otherWindow.postMessage(requestData, this.origin);
        return this.createResponseObservable<T>(requestData.id);
    }

    /**
     * Sends a response through given channel to the remote window, carrying given payload.
     *
     * @param {string} requestId
     * @param {*} payload
     * @return {RxPostmessenger}
     * @public
     */
    public respond(requestId: string, payload: any): this {
        const responseData = this.createMessageObject('response', null, payload, requestId);
        this.otherWindow.postMessage(responseData, this.origin);

        return this;
    }

    /**
     * Sends a notification through given channel to the remote window, carrying given payload.
     *
     * @param {string} channel
     * @param {*} payload
     * @return {RxPostmessenger}
     * @public
     */
    public notify(channel: string, payload: any): this {
        const notificationData = this.createMessageObject('notification', channel, payload);
        this.otherWindow.postMessage(notificationData, this.origin);

        return this;
    }

    /**
     * Returns an Observable that emits the subset of inbound notification messages where their channel equals given
     * channel name.
     *
     * @param {string} channel
     * @return {Observable<object>}
     * @public
     */
    public requestStream<T extends Request>(channel: string): Observable<T> {
        return this.requests$
            .filter<Request, T>((request: Request): request is T => request.channel === channel);
    }

    /**
     * Returns an Observable that emits the subset of inbound notification messages where their channel equals given
     * channel name.
     *
     * @param {string} channel
     * @return {Observable<object>}
     * @public
     */
    public notificationStream<T extends Notification>(channel: string): Observable<T> {
        return this.notifications$
            .filter<Notification, T>((notification: Notification): notification is T => notification.channel === channel);
    }

    /**
     * Creates an Observable that completes after a single emission of the MessageEvent response for request of given
     * requestId. If no matching response is ever received, the Observable never completes.
     *
     * @param {string} requestId
     * @return {Observable<object>}
     * @private
     */
    private createResponseObservable<T extends Response>(requestId: string): Observable<T> {
        return this.responses$
            .filter<Response, T>((response: Response): response is T => response.id === requestId)
            .take(1);
    }

    /**
     * Creates a message object to be used as payload of an outgoing message towards the remote window object.
     *
     * @param {string} type
     * @param {string|null} channel
     * @param {*} payload
     * @param {string} [id] - Responses should provide the request id here
     * @return {{ id: string, type: string, channel: string, payload: * }}
     * @private
     */
    private createMessageObject<T extends MessageType>(
        type: T,
        channel: string = null,
        payload: any,
        id: string = null
    ): Message<T> {
        return { id: id || generateUUID(), type, channel, payload };
    }

    /**
     * Returns an Observable emitting all inbound messages` of given type.
     *
     * Returns an Observable emitting a subset of MessageEvent objects emitted
     * by this.inboundMessages$, passing through all MessageEvent objects whose
     * data.type property matches given type.
     *
     * @param {string} type
     * @return {Observable<object>}
     * @private
     */
    private messagesOfType<S extends MessageType, T extends Message<S>>(type: S): Observable<T> {
        return this.inboundMessages$
            .filter<Message<MessageType>, T>((message: Message<MessageType>): message is T => message.type === type);
    }

    /**
     * Tests whether given MessageEvent its origin matches the host URL for a SKIK configurator window.
     *
     * @param {MessageEvent} message
     * @return {boolean}
     * @private
     */
    private isValidMessage(message: MessageEvent): boolean {
        return message instanceof MessageEvent

            // Chechs whether the origin location matches any allowed origins.
            // Separate assertion of the origin allows for cross-domain navigation
            // within this.frame, and still treating inbound messages from the
            // frame as being equal.
            && message.origin === this.origin

            // Checks whether the source Window object equals the remoteWindow object.
            // This check allows for implementation of multiple iframes that share the
            // same origin, and still being able to distinguish between messages from
            // such frames.
            && message.source === this.otherWindow;
    }
}
