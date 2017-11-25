import { Observable } from 'rxjs';

export interface Message<T extends string> {
    id: string;
    type: T;
    channel: string;
    payload: any;
}

export type Notification = Message<'notification'>;
export type Request = Message<'request'>;
export type Response = Message<'response'>;

export default class RxPostMessenger {

    public inboundMessages$: Observable<Message<string>>;

    public notifications$: Observable<Notification>;

    public requests$: Observable<Request>;

    public responses$: Observable<Response>;

    /**
     * @param {HTMLIFrameElement} frame - The frame object of the iframe to communicate with.
     * @param {string[]} allowedOrigins - List of allowed origins (URL) for given frame.
     */
    constructor(protected otherWindow: Window, protected origin) {

        this.inboundMessages$ = Observable
            .fromEvent(window, 'message')
            .filter((message: MessageEvent) => this.isValidMessage(message))
            .pluck('data');

        this.notifications$ = this.messagesOfType('notification');
        this.responses$     = this.messagesOfType('response');
    }

    request<T>(channel: string, payload: T = null): Observable<Message<'response'>> {
        const requestData = this.createMessageObject('request', channel, payload)
        this.otherWindow.postMessage(requestData, this.origin);
        return this.createResponseObservable(requestData.id);
    }

    respond() {

    }

    notify() {

    }

    private createMessageObject<T extends string>(type: T, channel: string, payload: any): Message<T> {
        return { id: generateUUID(), type, channel, payload };
    }
    /**
     *
     * @param {string} channel
     * @returns {object}
     * @public
     */
    public notificationStream<Channel extends string, T extends Notification>(channel: Channel): Observable<T> {
        return this
            .notifications$
            .filter<Notification, T>((notification): notification is T => notification.channel === channel);
    }

    /**
     * Returns an Observable emitting all inbound messages of given type.
     *
     * Returns an Rx.Observable emitting a subset of MessageEvent objects emitted
     * by this.inboundMessages$, passing through all MessageEvent objects whose
     * data.type property matches given type.
     *
     * @param {string} type
     */
    protected messagesOfType<S extends string, T extends Message<S>>(type: S): Observable<T> {
        return this.inboundMessages$
            .filter<Message<string>, T>((message): message is T => message.type === type);
    }

    // -----------------------------------------------------------------------------------------------
    // Helpers for inspection of MessageEvent objects and their contents
    // -----------------------------------------------------------------------------------------------

    /**
     * Tests whether given MessageEvent its origin matches the host URL for a SKIK configurator window.
     *
     * @param {MessageEvent} message
     * @return {boolean}
     * @private
     */
    protected isValidMessage(message: MessageEvent): boolean {
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

    /**
     * Creates an observable that completes after a single emission of
     * the MessageEvent response for request of given requestId. If no
     * matching response is ever received, the observable never completes.
     *
     * @param {string} requestId
     * @returns {Observable<module:postMessage.ResponseData>}
     * @private
     */
    createResponseObservable<T extends Response>(requestId: string): Observable<T> {
        return this.responses$
            .filter<Response, T>((response): response is T => response.id === requestId)
            .take(1);
    }
}

