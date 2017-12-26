import { Observable } from "rxjs/Observable";

declare const RxPostmessenger: RxPostmessenger.Static;
export = RxPostmessenger;
export as namespace RxPostmessenger;

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

        /**
         *
         */
        getObservable(): typeof Observable;

        /**
         *
         */
        connect<MAP extends EventMap = any>(otherWindow: Window, origin: string): RxPostmessenger.Messenger<MAP>;
    }

    /**
     *
     */
    interface Messenger<MAP extends EventMap = any> {

        /**
         *
         */
        request<

            CH extends TypeLens.Out.Request.Channel<MAP>,
            REQ_PL extends TypeLens.Out.Request.RequestPayload<MAP, CH>,
            RES_PL extends TypeLens.Out.Request.ResponsePayload<MAP, CH>

        >(channel: CH, payload?: REQ_PL | null): Observable<RES_PL>;

        /**
         *
         */
        notify<

            CH extends TypeLens.Out.Notification.Channel<MAP>,
            PL extends TypeLens.Out.Notification.Payload<MAP, CH>

        >(channel: CH, payload: PL | null): void;

        /**
         *
         */
        requests<

            CH extends TypeLens.In.Request.Channel<MAP>,
            REQ_PL extends TypeLens.In.Request.RequestPayload<MAP, CH>,
            RES_PL extends TypeLens.In.Request.ResponsePayload<MAP, CH>

        >(channel: CH): Observable<Request<MAP, CH>>

        /**
         *
         */
        notifications<

            CH extends TypeLens.In.Notification.Channel<MAP>,
            PL extends TypeLens.In.Notification.Payload<MAP, CH>

        >(channel: CH): Observable<PL>;
    }

    /**
     *
     */
    interface Request<

        MAP extends EventMap = any,
        CH extends TypeLens.In.Request.Channel<MAP> = string,
        REQ extends TypeLens.In.Request.RequestPayload<MAP, CH> = any,
        RES extends TypeLens.In.Request.ResponsePayload<MAP, CH> = any

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
        readonly payload: REQ;

        /**
         * Respond to the request with given data.
         */
        respond(data: RES): void;
    }

    // -----------------------------------------------------------------------
    // Mapping of event channel names to corresponding payload types
    // -----------------------------------------------------------------------
    // In typescript environments, an EventMap interface may be given as type
    // parameter to calls to Static.create. Such a map serves a simple but
    // important requirement, the mapping of event aliases to the data they
    // carry with them.
    // -----------------------------------------------------------------------
    // NOTE: There is not any runtime validation based on the map. It only
    // serves for type mapping in TS. Validation of data at runtime should
    // be implemented outside the context of this package.

    /**
     * The outer object has 2 properties:
     *
     * - IN     A directional event map that defines incoming requests, and
     *          incoming notifications.
     *
     * - OUT    A directional event map that defines outgoing requests, and
     *          outgoing notifications.
     */
    interface EventMap {
        in: DirectionalEventMap;
        out: DirectionalEventMap;
    }

    /**
     * A directional event map defines request and notification mappings for
     * a single direction: IN | OUT
     */
    interface DirectionalEventMap {
        requests: StringMap<RequestContract>;
        notifications: StringMap<NotificationContract>;
    }

    type StringMap<T = any> = { [key: string]: T };

    /**
     * The format of a notification channel blueprint. Currently the format is
     * only the given payload type, and the wrapper type exists only for semantic
     * reasons, and for consistence with RequestContract.
     */
    type NotificationContract<Payload = any> = Payload;

    /**
     * Request mapping object.
     */
    interface RequestContract<RequestPayload = any, ResponsePayload = any> {
        requestPayloadType: RequestPayload;
        responsePayloadType: ResponsePayload;
    }

    // -----------------------------------------------------------------------
    // Type mapping shortcuts
    // -----------------------------------------------------------------------

    /**
     * The TypeLens namespace serves as an adapter between the EventMap interface
     * and the Messenger interface. Interfaces are also a lot better readable /
     * undertandable this way.
     *
     * The usage of an EventMap interface combined with structural mapping using
     * the lenses below are at the core of how the package functions.
     */
    namespace TypeLens {

        type AnyChannel<MAP extends EventMap> =

              In.Request.Channel<MAP>
            | In.Notification.Channel<MAP>
            | Out.Request.Channel<MAP>
            | Out.Notification.Channel<MAP>;


        namespace In {

            namespace Request {

                type All<MAP extends EventMap> = MAP['in']['requests'];
                type Channel<MAP extends EventMap> = keyof All<MAP>;
                type Contract<MAP extends EventMap, CH extends Channel<MAP>> = All<MAP>[CH];
                type RequestPayload<MAP extends EventMap, CH extends Channel<MAP>> = Contract<MAP, CH>['requestPayloadType'];
                type ResponsePayload<MAP extends EventMap, CH extends Channel<MAP>> = Contract<MAP, CH>['responsePayloadType'];
            }

            namespace Notification {

                type All<MAP extends EventMap> = MAP['in']['notifications'];
                type Channel<MAP extends EventMap> = keyof All<MAP>;
                type Payload<MAP extends EventMap, CH extends Channel<MAP>> = All<MAP>[CH];
            }
        }

        namespace Out {

            namespace Request {

                type All<MAP extends EventMap> = MAP['out']['requests'];
                type Channel<MAP extends EventMap> = keyof All<MAP>;
                type Contract<MAP extends EventMap, CH extends Channel<MAP>> = All<MAP>[CH];
                type RequestPayload<MAP extends EventMap, CH extends Channel<MAP>> = Contract<MAP, CH>['requestPayloadType'];
                type ResponsePayload<MAP extends EventMap, CH extends Channel<MAP>> = Contract<MAP, CH>['responsePayloadType'];
            }

            namespace Notification {

                type All<MAP extends EventMap> = MAP['out']['notifications'];
                type Channel<MAP extends EventMap> = keyof All<MAP>;
                type Payload<MAP extends EventMap, CH extends Channel<MAP>> = All<MAP>[CH];
            }
        }
    }
}