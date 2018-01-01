import { generateGUID, pushUsedGUID } from "./guid-pool";
import { getObservable } from "./index";
import { RxPostmessengerRequest } from "./request";
import { includes, isObject, isString } from "./vendor/lodash-es";
import { Observable } from "./vendor/rxjs";

import {
    AnyMessage,
    IMessageObject,
    INotificationObject,
    IRequestObject,
    IResponseObject,
    MappedMessage,
    MessageType,
} from "./private";

import PublicInterface from "../rx-postmessenger";
import IEventMap = PublicInterface.EventMap;
import IRequestWrapper = PublicInterface.Request;
import AnyChannel = PublicInterface.TypeLens.AnyChannel;
import IMessenger = PublicInterface.Messenger;
import TypeLens = PublicInterface.TypeLens;

/**
 * @class RxPostmessenger
 */
export class RxPostmessenger<MAP extends IEventMap = any> implements IMessenger {

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
    public readonly notifications$: Observable<INotificationObject>;

    /**
     * Filtered subset of inboundMessages$, emitting all messages of type 'request'.
     *
     * @member {Observable<object>} requests$
     * @public
     */
    public readonly requests$: Observable<IRequestObject>;

    /**
     * Filtered subset of inboundMessages$, emitting all messages of type 'response'.
     *
     * @member {Observable<object>} responses$
     * @public
     */
    public readonly responses$: Observable<IResponseObject>;

    /**
     * @param {Window} otherWindow - The window object to exchange messages with.
     * @param {string} origin - The remote url to accept incoming messages from.
     */
    public constructor(public readonly otherWindow: Window, public readonly origin: string) {

        // Initialize read-only properties
        this.inboundMessages$ = getObservable()
            .fromEvent<MessageEvent>(window, "message")
            .filter((message) => this.isValidMessage(message))
            // Todo: add original event, but first identify as RxPostmessenger message
            // .map((message) => mergeDeepRight(message.data, { originalEvent: message }))
            .pluck("data");

        this.requests$      = this.messagesOfType("request");
        this.responses$     = this.messagesOfType("response");
        this.notifications$ = this.messagesOfType("notification");

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

        this.postMessage<IRequestObject<CH, REQ_PL>>({
            channel,
            id,
            payload,
            type: "request",
        });

        return responseObservable;
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

        this.postMessage<INotificationObject<CH, PL>>({
            channel,
            id: generateGUID(),
            payload,
            type: "notification",
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
    public requests<CH extends TypeLens.In.Request.Channel<MAP>>(channel: CH): Observable<IRequestWrapper<MAP, CH>> {

        // Type REQ_PL is 'trusted' to be constant for RequestObject<CH> types.
        // This is where the TS realm ends, and we must simply trust message
        // senders to pass the required payload.
        type REQ_PL = TypeLens.In.Request.RequestPayload<MAP, CH>;
        type REQ = IRequestObject<CH, REQ_PL>;
        type RES_PL = TypeLens.In.Request.ResponsePayload<MAP, CH>;

        return this.requests$
            .filter<IRequestObject, REQ>((request): request is REQ => request.channel === channel)
            .map((request): IRequestWrapper<MAP, CH> => new RxPostmessengerRequest<MAP, CH>(
                request.id,
                request.channel,
                request.payload,
                (payload: RES_PL) => this.respond<CH, RES_PL>(request.id, channel, payload),
            ));
    }

    /**
     * Returns an Observable that emits the subset of inbound notification messages where their channel equals given
     * channel name.
     *
     * @param {string} channel
     * @return {Observable<*>}
     * @public
     */
    public notifications<CH extends TypeLens.In.Notification.Channel<MAP>>(channel: CH): Observable<TypeLens.In.Notification.Payload<MAP, CH>> {

        type Match = INotificationObject<CH, TypeLens.In.Notification.Payload<MAP, CH>>;

        return this.notifications$
            .filter<INotificationObject, Match>((notification): notification is Match => notification.channel === channel)
            .pluck("payload");
    }

    // ------------------------------------------------------------------------------------------------
    // Private runtime
    // ------------------------------------------------------------------------------------------------

    /**
     * Sends a response through given channel to the remote window, carrying given payload.
     *
     * @param {string} requestId
     * @param {*} payload
     * @return {RxPostmessenger}
     * @private
     */
    private respond<

        CH extends TypeLens.In.Request.Channel<MAP>,
        RES_PL extends TypeLens.In.Request.ResponsePayload<MAP, CH>

    >(requestId: string, channel: CH, payload: RES_PL): this {

        this.postMessage<IResponseObject<CH, RES_PL>>({
            channel,
            id: generateGUID(),
            payload,
            requestId,
            type: "response",
        });

        return this;
    }

    /**
     * Creates an Observable that completes after a single emission of the MessageEvent response for request of given
     * requestId. If no matching response is ever received, the Observable never completes.
     *
     * @param {string} requestId
     * @return {Observable<object>}
     * @private
     */
    private createResponseObservable<CH extends TypeLens.Out.Request.Channel<MAP>>(requestId: string): Observable<TypeLens.Out.Request.ResponsePayload<MAP, CH>> {

        type T = TypeLens.Out.Request.ResponsePayload<MAP, CH>;

        return this.responses$
            .filter<IResponseObject, T>((response): response is T => response.requestId === requestId)
            .pluck("payload")
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
     * @param {AnyMessage} message
     * @return {boolean}
     */
    private isWellFormedMessage(message: AnyMessage): boolean {

        return isString(message.id)
            && includes(["request", "response", "notification"], message.type)
            && isString(message.channel)
            && (message.type !== "response" || isString(message.requestId));
    }

    /**
     * Performs a postMessage call with given data to this.otherWindow, provided that its
     * location origin matches this.origin.
     *
     * @param {IMessageObject} data
     * @private
     */
    private postMessage<T extends AnyMessage>(data: T): void {
        this.otherWindow.postMessage(data, this.origin);
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
        this.inboundMessages$.subscribe(({ id }) => pushUsedGUID(id));
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
    private messagesOfType<T extends MessageType>(type: T): Observable<MappedMessage<T>> {
        return this.inboundMessages$
            .filter((message): message is MappedMessage<T> => message.type === type);
    }
}
