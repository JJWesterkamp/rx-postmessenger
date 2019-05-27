// -----------------------------------------------------------------------------
// Concrete imports
// -----------------------------------------------------------------------------

import { fromEvent, Observable } from 'rxjs';
import { filter, map, pluck, take } from 'rxjs/operators';
import { RxPostmessengerRequest } from './RxPostmessengerRequest';

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

    /**
     * Filtered subset of inboundMessages$, emitting all messages of type 'notification'
     */
    public readonly notifications$: Observable<INotificationObject>;

    /**
     * Filtered subset of inboundMessages$, emitting all messages of type 'request'
     */
    public readonly requests$: Observable<IRequestObject>;

    /**
     * Filtered subset of inboundMessages$, emitting all messages of type 'response'
     */
    public readonly responses$: Observable<IResponseObject>;

    /**
     * @param {IMessageFactory}     messageFactory   - Factory instance for scalar message objects.
     * @param {IMessageValidator}   messageValidator - Validator instance for incoming messages.
     * @param {IPostmessageAdapter} adapter          - Adapter for interacting with the postMessage API
     */
    public constructor(
        protected readonly messageFactory: IMessageFactory,
        protected readonly messageValidator: IMessageValidator,
        protected readonly adapter: IPostmessageAdapter,
    ) {
        this.inboundMessages$ = fromEvent<MessageEvent>(window, 'message').pipe(
            filter((message) => this.messageValidator.validate(message)),
            pluck('data'),
        );

        this.requests$      = this.messagesOfType('request');
        this.responses$     = this.messagesOfType('response');
        this.notifications$ = this.messagesOfType('notification');

        this.inboundMessages$.subscribe(({ id }) => this.messageFactory.invalidateID(id));
    }

    /**
     *
     * Send a request over given channel with given payload. Returns an observable that will
     * emit the response and then complete.
     *
     * @param {string} channel   The channel name of the request.
     * @param {*}      [payload] The payload to send along with the request.
     */
    public request<T = any, U = any>(channel: string, payload?: T): Observable<U> {

        const request: IRequestObject<T | undefined> = this.messageFactory.makeRequest(channel, payload);

        const responseObservable: Observable<U> = this.createResponseObservable(request.id);

        this.adapter.postMessage(request);
        return responseObservable;
    }

    /**
     * Send a notification over given channel with given payload.
     *
     * @param {string} channel   - The channel name of the notification.
     * @param {*}      [payload] - The payload to send along with the notification.
     */
    public notify<T>(channel: string, payload?: T): void {

        this.adapter.postMessage(
            this.messageFactory.makeNotification(channel, payload),
        );
    }

    /**
     * Returns an Observable that emits the subset of inbound notification messages where their
     * channel equals given channel name.
     *
     * @param {string} channel - The request channel name to listen to.
     * @return {Observable<object>}
     * @public
     */
    public requests<T = any, U = any>(channel: string): Observable<IRequest<T, U>> {

        return this.requests$.pipe(
            filter((request): request is IRequestObject<T> => request.channel === channel),
            map((request): IRequest<T, U> => new RxPostmessengerRequest<T, U>(
                request.id,
                request.channel,
                request.payload,
                (payload: U) => this.respond(request.id, channel, payload),
            )),
        );
    }

    /**
     * Returns an Observable that emits the subset of inbound notification messages where their
     * channel equals given channel name.
     *
     * @param {string} channel - The notification channel name to listen to.
     * @return {Observable<*>}
     * @public
     */
    public notifications<T = any>(channel: string): Observable<T> {

        return this.notifications$.pipe(
            filter((notification): notification is INotificationObject<T> => notification.channel === channel),
            pluck('payload'),
        );
    }

    /**
     * Sends a response through given channel to the remote window, carrying given payload.
     *
     * @param {string} requestId - The request ID of the original request
     * @param {string} channel   - The request-channel name to send the response over
     * @param {*}      payload   - The response payload
     * @return {Messenger}
     * @protected
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
     * @protected
     */
    protected createResponseObservable<T>(requestId: string): Observable<T> {
        return this.responses$.pipe(
            filter((response): response is IResponseObject<T> => response.requestId === requestId),
            pluck<IResponseObject<T>, T>('payload'),
            take(1),
        );
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
     * @protected
     */
    protected messagesOfType<T extends MessageType>(type: T): Observable<MappedMessage<T>> {
        return this.inboundMessages$.pipe(
            filter((message): message is MappedMessage<T> => message.type === type),
        );
    }
}
