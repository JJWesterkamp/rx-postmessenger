import { Observable } from './vendor/rxjs';
import { RxPostmessengerRequest } from './request';
import { allPass, contains, flip, not, pipe, prop } from './vendor/ramda';
import { generateGUID, pushUsedGUID } from './guid-pool';
import { isObject, isString } from './vendor/lodash-es';

// Private interface
import {
    MessageObject,
    MessageType,
    RequestObject,
    ResponseObject,
    NotificationObject,
    IfElse,
    AnyMessage,
    MessageTypeMap,
    MappedMessage,
} from './private';

// Public interface
import {
    EventMap as EventMapInterface,
    Messenger as MessengerInterface,
    NotificationContract as NotificationMapping,
    RequestContract as RequestMapping,
    TypeLens,
    Request as RequestInterface,
    EventMap,
    Request,
} from '../rx-postmessenger';

import AnyChannel = TypeLens.AnyChannel;

/**
 * @class RxPostmessenger
 */
export class RxPostmessenger<MAP extends EventMapInterface = any> implements MessengerInterface {

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
    public readonly inboundMessages$: Observable<AnyMessage>;

    /**
     * Filtered subset of inboundMessages$, emitting all messages of type 'notification'.
     *
     * @member {Observable<object>} notifications$
     * @public
     */
    public readonly notifications$: Observable<NotificationObject>;

    /**
     * Filtered subset of inboundMessages$, emitting all messages of type 'request'.
     *
     * @member {Observable<object>} requests$
     * @public
     */
    public readonly requests$: Observable<RequestObject>;

    /**
     * Filtered subset of inboundMessages$, emitting all messages of type 'response'.
     *
     * @member {Observable<object>} responses$
     * @public
     */
    public readonly responses$: Observable<ResponseObject>;

    /**
     * @param {Window} otherWindow - The window object to exchange messages with.
     * @param {string} origin - The remote url to accept incoming messages from.
     */
    public constructor(public readonly otherWindow: Window, public readonly origin: string) {

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
    public request<

        CH extends TypeLens.Out.Request.Channel<MAP>,
        REQ_PL extends TypeLens.Out.Request.RequestPayload<MAP, CH>,
        RES_PL extends TypeLens.Out.Request.ResponsePayload<MAP, CH>

    >(channel: CH, payload: REQ_PL): Observable<RES_PL> {

        const id = generateGUID();
        const responseObservable: Observable<RES_PL> = this.createResponseObservable<RES_PL>(id);

        this.postMessage<RequestObject<CH, REQ_PL>>({
            id,
            type: 'request',
            channel,
            payload,
        });

        return responseObservable;
    }

    /**
     * Sends a response through given channel to the remote window, carrying given payload.
     *
     * @param {string} requestId
     * @param {*} payload
     * @return {RxPostmessenger}
     * @public
     */
    private respond<

        CH extends TypeLens.In.Request.Channel<MAP>,
        RES_PL extends TypeLens.In.Request.ResponsePayload<MAP, CH>

    >(requestId: string, channel: CH, payload: RES_PL): this {

        this.postMessage<ResponseObject<CH, RES_PL>>({
            id: generateGUID(),
            requestId,
            channel,
            payload,
            type: 'response',
        });

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
    public notify<

        CH extends TypeLens.Out.Notification.Channel<MAP>,
        PL extends TypeLens.Out.Notification.Payload<MAP, CH>

    >(channel: CH, payload: PL): this {

        this.postMessage<NotificationObject<CH, PL>>({
            id: generateGUID(),
            type: 'notification',
            channel,
            payload,
        });

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
    public requests<

        CH extends TypeLens.In.Request.Channel<MAP>,
        REQ_PL extends TypeLens.In.Request.RequestPayload<MAP, CH>,
        RES_PL extends TypeLens.In.Request.ResponsePayload<MAP, CH>

    >(channel: CH): Observable<RequestInterface<MAP, CH>> {

        // Type REQ_PL is 'trusted' to be constant for RequestObject<CH> types.
        // This is where the TS realm ends, and we must simply trust other
        // windows to pass the required payload.
        type REQ = RequestObject<CH, REQ_PL>;

        return this.requests$
            .filter<RequestObject, REQ>((request): request is REQ => request.channel === channel)
            .map((req): RequestInterface<MAP, CH> => new RxPostmessengerRequest<MAP, CH>(req.id, req.channel, req.payload));
    }

    /**
     * Returns an Observable that emits the subset of inbound notification messages where their channel equals given
     * channel name.
     *
     * @param {string} channel
     * @return {Observable<*>}
     * @public
     */
    public notifications<

        CH extends TypeLens.In.Notification.Channel<MAP>,
        PL extends TypeLens.In.Notification.Payload<MAP, CH>

    >(channel: CH): Observable<PL> {

        type Match = NotificationObject<CH, PL>;

        return this.notifications$
            .filter<NotificationObject, Match>((notification): notification is Match => notification.channel === channel)
            .pluck('payload');
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
    private messagesOfType<T extends MessageType>(type: T): Observable<MappedMessage<T>> { // Todo: this is the place where the type should be decorated
        return this.inboundMessages$
            .filter((message): message is MappedMessage<T> => message.type === type);
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
    private createResponseObservable<T extends ResponseObject>(requestId: string): Observable<T> {
        return this.responses$
            .filter<ResponseObject, T>((response): response is T => response.id === requestId)
            .take(1);
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
            && message.source === this.otherWindow
            && this.isWellFormedMessage(message.data);
    }

    /**
     * Tests whether the data sent through postMessage is a well-formed message
     * object. This serves as an additional check for
     *
     * @param {MessageObject} message
     * @return {boolean}
     */
    private isWellFormedMessage(message: MessageObject): boolean {

        return allPass([

            pipe(prop('id'), isString),
            pipe(prop('type'), (type) => contains(type, ['request', 'response', 'notification'])),
            pipe(prop('channel'), isString),

        ])(message);
    }

    /**
     * Performs a postMessage call with given data to this.otherWindow, provided that its
     * location origin matches this.origin.
     *
     * @param {MessageObject} data
     * @private
     */
    private postMessage<T extends AnyMessage>(data: T): void {
        this.otherWindow.postMessage(data, this.origin);
    }
}