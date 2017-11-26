// This file imports and re-exports a subset of the ReactiveX library
// to allow for a smaller bundle (saves about 1000 kb)

// Class objects (Preserve import order due to cyclic dependencies)
import { Observable } from 'rxjs/Observable';

// Observable static methods (These patch the observable function object)
import 'rxjs/add/observable/fromEvent';

// Observable instance operators (these patch the observable prototype)
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/pluck';
import 'rxjs/add/operator/take';

import generateUUID from './uuid-generator';

export type OtherWindowRelation = 'parent' | 'child';
export type MessageType = 'request' | 'response' | 'notification';

export interface Message<T extends MessageType> {
    id: string;
    type: T;
    channel: string;
    payload: any;
}

export type Notification = Message<'notification'>;
export type Request = Message<'request'>;
export type Response = Message<'response'>;

export default class RxPostmessenger {

    /**
     * @param {Window} otherWindow
     * @param {string} origin
     *
     * @return {RxPostmessenger}
     */
    static connectWithParent(otherWindow: Window, origin: string): RxPostmessenger {
        return new this(otherWindow, origin, 'parent');
    }

    /**
     * @param {Window} otherWindow
     * @param {string} origin
     *
     * @return {RxPostmessenger}
     */
    static connectWithChild(otherWindow: Window, origin: string): RxPostmessenger {
        return new this(otherWindow, origin, 'child');
    }

    /**
     * @var {Observable<object>} inboundMessages$
     */
    public inboundMessages$: Observable<Message<MessageType>>;

    /**
     * @var {Observable<object>} notifications$
     */
    public notifications$: Observable<Notification>;

    /**
     * @var {Observable<object>} requests$
     */
    public requests$: Observable<Request>;

    /**
     * @var {Observable<object>} responses$
     */
    public responses$: Observable<Response>;

    /**
     * @param {HTMLIFrameElement} frame - The frame object of the iframe to communicate with.
     * @param {string[]} allowedOrigins - List of allowed origins (URL) for given frame.
     */
    constructor(protected otherWindow: Window, protected origin: string, public readonly otherWindowRelation: OtherWindowRelation) {

        this.inboundMessages$ = Observable
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
     */
    public request<T extends Response>(channel: string, payload: any = null): Observable<T> {
        const requestData = this.createMessageObject('request', channel, payload)
        this.otherWindow.postMessage(requestData, this.origin);
        return this.createResponseObservable(requestData.id);
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
    private createResponseObservable<T extends Response>(requestId: string): Observable<T> {
        return this.responses$
            .filter<Response, T>((response: Response): response is T => response.id === requestId)
            .take(1);
    }

    /**
     *
     */
    public respond(requestId: string, channel: string, payload: any): void {
        const responseData = this.createMessageObject('response', channel, payload);
        this.otherWindow.postMessage(responseData, this.origin);
    }

    /**
     *
     * @param channel
     * @param payload
     */
    public notify(channel: string, payload: any): void {
        const notificationData = this.createMessageObject('notification', channel, payload);
        this.otherWindow.postMessage(notificationData, this.origin);
    }

    /**
     * @param {string} type
     * @param {string} channel
     * @param {*} payload
     */
    private createMessageObject<T extends MessageType>(type: T, channel: string, payload: any): Message<T> {
        return { id: generateUUID(), type, channel, payload };
    }


    /**
     *
     * @param {string} channel
     * @returns {Observable<object>}
     * @public
     */
    public notificationStream<T extends Notification>(channel: string): Observable<T> {
        return this
            .notifications$
            .filter<Notification, T>((notification: Notification): notification is T => notification.channel === channel);
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
    protected messagesOfType<S extends MessageType, T extends Message<S>>(type: S): Observable<T> {
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
}

