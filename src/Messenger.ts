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
import { IMessageFactory } from "./interface/message-factory";
import AnyChannel = PublicInterface.TypeLens.AnyChannel;
import IEventMap  = PublicInterface.EventMap;
import IMessenger = PublicInterface.Messenger;
import IRequest   = PublicInterface.Request;
import TypeLens   = PublicInterface.TypeLens;
import { IMessageValidator } from "./interface/message-validator";

/**
 * @class RxPostmessenger
 */
export class Messenger<MAP extends IEventMap = any> implements IMessenger {

    /**
     * Observable stream of all incoming messages that originate from remoteWindow with a
     * remoteOrigin url matching this.remoteOrigin.
     */
    public readonly inboundMessages$: Observable<AnyMessage>;

    /** Filtered subset of inboundMessages$, emitting all messages of type 'notification' */
    public readonly notifications$: Observable<INotificationObject>;

    /** Filtered subset of inboundMessages$, emitting all messages of type 'request' */
    public readonly requests$: Observable<IRequestObject>;

    /** Filtered subset of inboundMessages$, emitting all messages of type 'response' */
    public readonly responses$: Observable<IResponseObject>;

    public constructor(
        public readonly remoteWindow: Window,
        public readonly remoteOrigin: string,
        protected readonly messageFactory: IMessageFactory,
        protected readonly messageValidator: IMessageValidator,
    ) {
        this.inboundMessages$ = getObservable()
            .fromEvent<MessageEvent>(window, "message")
            .filter((message) => this.messageValidator.validate(message))
            .pluck("data");

        this.requests$      = this.messagesOfType("request");
        this.responses$     = this.messagesOfType("response");
        this.notifications$ = this.messagesOfType("notification");

        this.inboundMessages$.subscribe(({ id }) => this.messageFactory.invalidateID(id));
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
        const request: IRequestObject<REQ_PL> = this.messageFactory.makeRequest(channel, payload);
        const responseObservable: Observable<RES_PL> = this.createResponseObservable(request.id);
        this.postMessage<IRequestObject<REQ_PL>>(request);
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

        this.postMessage<INotificationObject<PL>>(
            this.messageFactory.makeNotification(channel, payload),
        );

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
    public requests<CH extends TypeLens.In.Request.Channel<MAP>>(channel: CH): Observable<IRequest<MAP, CH>> {

        // Type REQ_PL is 'trusted' to be constant for RequestObject<CH> types.
        // This is where the TS realm ends, and we must simply trust message
        // senders to pass the required payload.
        type REQ_PL = TypeLens.In.Request.RequestPayload<MAP, CH>;
        type REQ = IRequestObject<REQ_PL>;
        type RES_PL = TypeLens.In.Request.ResponsePayload<MAP, CH>;

        return this.requests$
            .filter<IRequestObject, REQ>((request): request is REQ => request.channel === channel)
            .map((request): IRequest<MAP, CH> => new RxPostmessengerRequest<MAP, CH>(
                request.id,
                request.channel as CH,
                request.payload,
                (payload: RES_PL) => this.respond<RES_PL>(request.id, channel, payload),
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

        type Match = INotificationObject<TypeLens.In.Notification.Payload<MAP, CH>>;

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
     * @param channel
     * @param {*} payload
     * @return {Messenger}
     * @private
     */
    protected respond<T>(requestId: string, channel: string, payload: T): this {

        this.postMessage<IResponseObject<T>>(
            this.messageFactory.makeResponse(requestId, channel, payload),
        );

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
    protected createResponseObservable<T>(requestId: string): Observable<T> {
        return this.responses$
            .filter((response): response is IResponseObject<T> => response.requestId === requestId)
            .pluck<IResponseObject<T>, T>("payload")
            .take(1);
    }

    /**
     * Performs a postMessage call with given data to this.remoteWindow, provided that its
     * location remoteOrigin matches this.remoteOrigin.
     *
     * @param {IMessageObject} data
     * @private
     */
    protected postMessage<T extends AnyMessage>(data: T): void {
        this.remoteWindow.postMessage(data, this.remoteOrigin);
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
