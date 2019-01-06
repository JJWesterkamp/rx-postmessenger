// -----------------------------------------------------------------------------
// Concrete imports
// -----------------------------------------------------------------------------

import { getObservable } from './index';
import { RxPostmessengerRequest } from './RxPostmessengerRequest';
import { Observable } from './vendor/rxjs';

// -----------------------------------------------------------------------------
// Interface imports
// -----------------------------------------------------------------------------

import { IMessageFactory } from './interface/message-factory';
import { IMessageValidator } from './interface/message-validator';
import { IPostmessageAdapter } from './interface/postmessage-adapter';
import { IMessenger, IRequest } from './interface/public-interface';

import {
    AnyMessage,
    INotificationObject,
    IRequestObject,
    IResponseObject,
    MappedMessage,
    MessageType,
} from './interface/message-objects';

export class Messenger implements IMessenger {

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
        protected readonly messageFactory: IMessageFactory,
        protected readonly messageValidator: IMessageValidator,
        protected readonly adapter: IPostmessageAdapter,
    ) {
        this.inboundMessages$ = getObservable()
            .fromEvent<MessageEvent>(window, 'message')
            .filter((message) => this.messageValidator.validate(message))
            .pluck('data');

        this.requests$      = this.messagesOfType('request');
        this.responses$     = this.messagesOfType('response');
        this.notifications$ = this.messagesOfType('notification');

        this.inboundMessages$.subscribe(({ id }) => this.messageFactory.invalidateID(id));
    }

    public request<T = any, U = any>(channel: string, payload?: T): Observable<U> {

        const request: IRequestObject<T | undefined> = this.messageFactory.makeRequest(channel, payload);

        const responseObservable: Observable<U> = this.createResponseObservable(request.id);

        this.adapter.postMessage(request);
        return responseObservable;
    }

    public notify<T>(channel: string, payload: T | null): this {

        this.adapter.postMessage(
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
    public requests<T = any, U = any>(channel: string): Observable<IRequest<T, U>> {

        return this.requests$
            .filter((request): request is IRequestObject<T> => request.channel === channel)
            .map((request): IRequest<T, U> => new RxPostmessengerRequest<T, U>(
                request.id,
                request.channel,
                request.payload,
                (payload: U) => this.respond(request.id, channel, payload),
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
    public notifications<T = any>(channel: string): Observable<T> {

        return this.notifications$
            .filter((notification): notification is INotificationObject<T> => notification.channel === channel)
            .pluck('payload');
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

        this.adapter.postMessage<IResponseObject<T>>(
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
            .pluck<IResponseObject<T>, T>('payload')
            .take(1);
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
