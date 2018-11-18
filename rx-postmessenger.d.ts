import { Observable } from "rxjs/Observable";

declare const RxPostmessenger: RxPostmessenger.Static;
export default RxPostmessenger;
export as namespace RxPostmessenger;

// tslint:disable:interface-name
// tslint:disable:no-shadowed-variable

/**
 * Common type parameter names:
 *
 * - MAP        An event-map interface. Associates request/response and notification channels with payload types.
 * - CH         A channel name for a certain request or notification.
 * - REQ_PL     A request payload type. (These types are auto-lookups in most cases)
 * - RES_PL     A response payload type. (These types are auto-lookups in most cases)
 */
declare namespace RxPostmessenger {

    interface Static {

        /**
         * PROBABLY ONLY RELEVANT FOR UMD BUNDLE CONSUMERS
         *
         * Performs a runtime re-assignment of the reference to the Observable implementation. When consuming the
         * UMD bundle, a minimal Rx.Observable subset is embedded within the bundle. To override that reference
         * with your own implementation (with your own selection of operators) you can pass that implementation here.
         *
         * NOTE: This should be done before you call RxPostmessenger.connect() for the first time.
         */
        useObservable<T extends typeof Observable>(implementation: T): void;
        getObservable(): typeof Observable;

        /**
         * Create a new messenger for given window object. The origin URL is used both to give to window.postMessage
         * calls on otherWindow, and to filter message events on the own window.
         */
        connect<MAP extends EventMap = any>(otherWindow: Window, origin: string): RxPostmessenger.Messenger<MAP>;
    }

    interface Messenger<MAP extends EventMap = any> {

        /**
         * Send a request over given channel with given payload. Returns an observable that will emit the response.
         */
        request<

            CH extends TypeLens.Out.Request.Channel<MAP>,
            REQ_PL extends TypeLens.Out.Request.RequestPayload<MAP, CH>,
            RES_PL extends TypeLens.Out.Request.ResponsePayload<MAP, CH>

        >(channel: CH, payload?: REQ_PL | null): Observable<RES_PL>;

        /**
         * Send a notification over given channel with given payload.
         */
        notify<

            CH extends TypeLens.Out.Notification.Channel<MAP>,
            PL extends TypeLens.Out.Notification.Payload<MAP, CH>

        >(channel: CH, payload: PL | null): void;

        /**
         * Returns an Observable that emits all incoming requests for given request-channel.
         */
        requests<CH extends TypeLens.In.Request.Channel<MAP>>(channel: CH): Observable<RxPostmessenger.Request<MAP, CH>>;

        /**
         * Returns an Observable that emits all incoming notifications for given notification-channel.
         */
        notifications<CH extends TypeLens.In.Notification.Channel<MAP>>(channel: CH): Observable<TypeLens.In.Notification.Payload<MAP, CH>>;
    }

    /**
     *
     */
    interface Request<

        MAP extends EventMap,
        CH extends TypeLens.In.Request.Channel<MAP>

    > {

        /**
         * The name of the channel the request was sent through. The
         * channel literal is immutable. Attempts to override the
         * channel property
         */
        readonly channel: CH;

        /**
         * The payload data for the request. The payload is immutable.
         * Attempts to set / override payload values will silently fail.
         * Attempts to mutate members of object-type payloads will
         * silently fail as well.
         */
        readonly payload: TypeLens.In.Request.RequestPayload<MAP, CH>;

        /**
         * Boolean indicating whether respond() has been called on the request
         * previously.
         */
        readonly isHandled: boolean;

        /**
         * Respond to the request with given data.
         */
        respond(data: TypeLens.In.Request.ResponsePayload<MAP, CH>): void;
    }

    // -----------------------------------------------------------------------
    // Mapping of event channel names to corresponding payload types
    // -----------------------------------------------------------------------
    // In typescript environments, an EventMap interface may be given as type
    // argument to calls to Static.create. This

    interface EventMap {
        in: {
            requests:      { [key: string]: RequestContract };
            notifications: { [key: string]: NotificationContract };
        };
        out: {
            requests:      { [key: string]: RequestContract };
            notifications: { [key: string]: NotificationContract };
        };
    }

    interface NotificationContract<Payload = any> {
        payload: Payload;
    }

    interface RequestContract<RequestPayload = any, ResponsePayload = any> {
        requestPayload: RequestPayload;
        responsePayload: ResponsePayload;
    }

    // -----------------------------------------------------------------------
    // Type mapping shortcuts
    // -----------------------------------------------------------------------

    /**
     * The TypeLens namespace serves as an adapter between the EventMap interface
     * and the Messenger interface. Interfaces are also a lot better readable /
     * undertandable this way.
     */
    export namespace TypeLens {

        type AnyChannel<MAP extends EventMap> =

              In.Request.Channel<MAP>
            | In.Notification.Channel<MAP>
            | Out.Request.Channel<MAP>
            | Out.Notification.Channel<MAP>;

        namespace In {

            namespace Request {

                type All<MAP extends EventMap> = MAP["in"]["requests"];
                type Channel<MAP extends EventMap> = keyof All<MAP>;
                type Contract<MAP extends EventMap, CH extends Channel<MAP>> = All<MAP>[CH];
                type RequestPayload<MAP extends EventMap, CH extends Channel<MAP>> = Contract<MAP, CH>["requestPayload"];
                type ResponsePayload<MAP extends EventMap, CH extends Channel<MAP>> = Contract<MAP, CH>["responsePayload"];
            }

            namespace Notification {

                type All<MAP extends EventMap> = MAP["in"]["notifications"];
                type Channel<MAP extends EventMap> = keyof All<MAP>;
                type Payload<MAP extends EventMap, CH extends Channel<MAP>> = All<MAP>[CH]["payload"];
            }
        }

        namespace Out {

            namespace Request {

                type All<MAP extends EventMap> = MAP["out"]["requests"];
                type Channel<MAP extends EventMap> = keyof All<MAP>;
                type Contract<MAP extends EventMap, CH extends Channel<MAP>> = All<MAP>[CH];
                type RequestPayload<MAP extends EventMap, CH extends Channel<MAP>> = Contract<MAP, CH>["requestPayload"];
                type ResponsePayload<MAP extends EventMap, CH extends Channel<MAP>> = Contract<MAP, CH>["responsePayload"];
            }

            namespace Notification {

                type All<MAP extends EventMap> = MAP["out"]["notifications"];
                type Channel<MAP extends EventMap> = keyof All<MAP>;
                type Payload<MAP extends EventMap, CH extends Channel<MAP>> = All<MAP>[CH]["payload"];
            }
        }
    }
}
