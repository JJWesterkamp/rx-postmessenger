// -----------------------------------------------------------------------------
// Concrete imports
// -----------------------------------------------------------------------------
import { getObservable } from "./index";
import { RxPostmessengerRequest } from "./RxPostmessengerRequest";
import { Observable } from "./vendor/rxjs";

// -----------------------------------------------------------------------------
// Interface imports
// -----------------------------------------------------------------------------
import { IMessageIDGenerator } from "./interface/id-generator";
import { AnyMessage, IMessageObject, INotificationObject, IRequestObject, IResponseObject, MappedMessage, MessageType } from "./interface/message-objects";

import PublicInterface from "../rx-postmessenger";
import IEventMap       = PublicInterface.EventMap;
import IRequestWrapper = PublicInterface.Request;
import AnyChannel      = PublicInterface.TypeLens.AnyChannel;
import IMessenger      = PublicInterface.Messenger;
import TypeLens        = PublicInterface.TypeLens;

/**
 * @class RxPostmessenger
 */
export class Messenger<MAP extends IEventMap = any> implements IMessenger {

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
    public constructor(
        public readonly otherWindow: Window,
        public readonly origin: string,
        protected readonly IDGenerator: IMessageIDGenerator,
    ) {
        this.inboundMessages$ = getObservable()
            .fromEvent<MessageEvent>(window, "message")
            .filter((message) => this.isValidMessage(message))
            .pluck("data");

        this.requests$      = this.messagesOfType("request");
        this.responses$     = this.messagesOfType("response");
        this.notifications$ = this.messagesOfType("notification");

        this.inboundMessages$.subscribe(({ id }) => this.IDGenerator.invalidateID(id));
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
        const id = this.IDGenerator.generateID();
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
     * @return {Messenger}
     * @public
     */
    public notify<

        CH extends TypeLens.Out.Notification.Channel<MAP>,
        PL extends TypeLens.Out.Notification.Payload<MAP, CH>

    >(channel: CH, payload: PL): this {

        this.postMessage<INotificationObject<CH, PL>>({
            channel,
            id: this.IDGenerator.generateID(),
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
     * @return {Messenger}
     * @private
     */
    protected respond<

        CH extends TypeLens.In.Request.Channel<MAP>,
        RES_PL extends TypeLens.In.Request.ResponsePayload<MAP, CH>

    >(requestId: string, channel: CH, payload: RES_PL): this {

        this.postMessage<IResponseObject<CH, RES_PL>>({
            channel,
            id: this.IDGenerator.generateID(),
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
    protected createResponseObservable<CH extends TypeLens.Out.Request.Channel<MAP>>(requestId: string): Observable<TypeLens.Out.Request.ResponsePayload<MAP, CH>> {

        type T = TypeLens.Out.Request.ResponsePayload<MAP, CH>;

        return this.responses$
            .filter<IResponseObject, T>((response): response is T => response.requestId === requestId)
            .pluck("payload")
            .take(1);
    }

    /**
     * Validates the identity of the message's sender and the format of the message's data.
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
    protected isValidMessage(message: MessageEvent): boolean {
        return message instanceof MessageEvent
            && message.origin === this.origin
            && message.source === this.otherWindow
            && this.isWellFormedMessage(message.data);
    }

    /**
     * Tests whether the data sent through postMessage is a well-formed message
     * object. This serves as runtime data format validation. If messages do not
     * comply to the AnyMessage compound interface, the entire event is ignored.
     *
     * @param {AnyMessage} message
     * @return {boolean}
     */
    protected isWellFormedMessage(message: AnyMessage): boolean {

        return (typeof message.id === "string")
            && (["request", "response", "notification"].indexOf(message.type) >= 0)
            && (typeof message.channel === "string")
            && (message.type !== "response" || (typeof message.requestId === "string"));
    }

    /**
     * Performs a postMessage call with given data to this.otherWindow, provided that its
     * location origin matches this.origin.
     *
     * @param {IMessageObject} data
     * @private
     */
    protected postMessage<T extends AnyMessage>(data: T): void {
        this.otherWindow.postMessage(data, this.origin);
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
    protected messagesOfType<T extends MessageType>(type: T): Observable<MappedMessage<T>> {
        return this.inboundMessages$
            .filter((message): message is MappedMessage<T> => message.type === type);
    }
}
