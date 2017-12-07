import { Observable } from './rx';
import { generateGUID, pushUsedGUID } from './guid-pool';

import {
    ScalarMessage,
    MessageType,
    ScalarRequest,
    ScalarResponse,
    ScalarNotification
} from './index';

/**
 * @class RxPostmessenger
 */
export class RxPostmessenger {

    /**
     * The observable reference to use when creating new streams. By default a minimal implementation
     * with only the operator requirements for this module.
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
    public readonly inboundMessages$: Observable<ScalarMessage<MessageType>>;

    /**
     * Filtered subset of inboundMessages$, emitting all messages of type 'notification'.
     *
     * @member {Observable<object>} notifications$
     * @public
     */
    public readonly notifications$: Observable<ScalarNotification>;

    /**
     * Filtered subset of inboundMessages$, emitting all messages of type 'request'.
     *
     * @member {Observable<object>} requests$
     * @public
     */
    public readonly requests$: Observable<ScalarRequest>;

    /**
     * Filtered subset of inboundMessages$, emitting all messages of type 'response'.
     *
     * @member {Observable<object>} responses$
     * @public
     */
    public readonly responses$: Observable<ScalarResponse>;

    /**
     * @param {Window} otherWindow
     * @param {string} origin
     *
     * @return {RxPostmessenger}
     */
    public static connect(otherWindow: Window, origin: string): RxPostmessenger {
        if ('*' === origin) {
            console.warn(
                  `Usage of the "*" wildcard for allowed postMessage destination origin is insecure. `
                + `Consider using a fixed URL instead.`
            );
        }

        return new this(otherWindow, origin);
    }

    /**
     * @param {Window} otherWindow - The window object to exchange messages with.
     * @param {string} origin - The remote url to accept incoming messages from.
     */
    private constructor(public readonly otherWindow: Window, public readonly origin: string) {

        // Initialize read-only properties
        this.inboundMessages$ = RxPostmessenger.Observable
            .fromEvent<MessageEvent>(window, 'message')
            .filter((message) => this.isValidMessage(message))
            // Todo: add original event, but first identify as RxPostmessenger message
            // .map((message) => mergeDeepRight(message.data, { originalEvent: message }))
            .pluck('data');

        this.requests$      = this.messagesOfType('request');
        this.responses$     = this.messagesOfType('response');
        this.notifications$ = this.messagesOfType('notification');

        // Other initializers
        this.syncGUIIDs();
    }

    // ------------------------------------------------------------------------------------------------
    // API
    // ------------------------------------------------------------------------------------------------

    /**
     * @param {string} channel
     * @param {*} payload
     *
     * @return {Observable<object>}
     * @public
     */
    public request<T extends ScalarResponse>(channel: string, payload: any = null): Observable<T> {
        const requestData: ScalarRequest = this.createMessageObject('request', channel, payload)
        this.postMessage(requestData);
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
        const responseData: ScalarResponse = this.createMessageObject('response', null, payload, requestId);
        this.postMessage(responseData);

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
        const notificationData: ScalarNotification = this.createMessageObject('notification', channel, payload);
        this.postMessage(notificationData);

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
    public requestStream<T extends ScalarRequest>(channel: string): Observable<T> {
        return this.requests$
            .filter<ScalarRequest, T>((request): request is T => request.channel === channel);
    }

    /**
     * Returns an Observable that emits the subset of inbound notification messages where their channel equals given
     * channel name.
     *
     * @param {string} channel
     * @return {Observable<object>}
     * @public
     */
    public notificationStream<T extends ScalarNotification>(channel: string): Observable<T> {
        return this.notifications$
            .filter<ScalarNotification, T>((notification): notification is T => notification.channel === channel);
    }

    // ------------------------------------------------------------------------------------------------
    // Init helpers
    // ------------------------------------------------------------------------------------------------

    /**
     * Starts a GUID sync that intercepts incoming messages from other windows running this package,
     * and pushes their ID values into a used IDs array. This way, every message should have a unique ID.
     *
     * @return {RxPostmessenger}
     * @private
     */
    private syncGUIIDs(): this {

        this.inboundMessages$
            .filter(({ type }) => 'response' !== type)
            .subscribe(({ id }) => pushUsedGUID(id));

        return this;
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
    private messagesOfType<S extends MessageType>(type: S): Observable<ScalarMessage<S>> {
        return this.inboundMessages$
            .filter((message): message is ScalarMessage<S> => message.type === type);
    }

    // ------------------------------------------------------------------------------------------------
    // Private runtime
    // ------------------------------------------------------------------------------------------------

    /**
     * Creates an Observable that completes after a single emission of the MessageEvent response for request of given
     * requestId. If no matching response is ever received, the Observable never completes.
     *
     * @param {string} requestId
     * @return {Observable<object>}
     * @private
     */
    private createResponseObservable<T extends ScalarResponse>(requestId: string): Observable<T> {
        return this.responses$
            .filter<ScalarResponse, T>((response): response is T => response.id === requestId)
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
    ): ScalarMessage<T> {
        return { id: id || generateGUID(), type, channel, payload };
    }

    /**
     * Tests whether given MessageEvent its origin matches the host URL for a SKIK configurator window.
     *
     * Chechs whether the origin location matches any allowed origins.
     * Separate assertion of the origin allows for cross-domain navigation
     * within this.frame, and still treating inbound messages from the
     * frame as being equal.
     *
     * Checks whether the source Window object equals the remoteWindow object.
     * This check allows for implementation of multiple iframes that share the
     * same origin, and still being able to distinguish between messages from
     * such frames.
     *
     * @param {MessageEvent} message
     * @return {boolean}
     * @private
     */
    private isValidMessage(message: MessageEvent): boolean {
        return message instanceof MessageEvent
            && message.origin === this.origin
            && message.source === this.otherWindow;
    }

    /**
     * Performs a postMessage call with given data to this.otherWindow, provided that its
     * location origin matches this.origin.
     *
     * @param {ScalarMessage} data
     * @private
     */
    private postMessage<T extends ScalarMessage<MessageType>>(data: T): void {
        this.otherWindow.postMessage(data, this.origin);
    }
}
