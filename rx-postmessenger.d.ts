import { Observable } from "rxjs/Observable";

declare const RxPostmessenger: RxPostmessenger.Static;
export = RxPostmessenger;
export as namespace RxPostmessenger;

/**
 *
 */
declare namespace RxPostmessenger {

    interface Static {

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

        >(channel: CH): Observable<Request<CH, REQ_PL, RES_PL>>

        /**
         *
         */
        notifications<

            CH extends TypeLens.In.Notification.Channel<MAP>,
            PL extends TypeLens.In.Notification.Payload<MAP, CH>

        >(channel: CH, payload: PL): Observable<PL>;
    }

    /**
     *
     */
    interface Request<Channel extends string = string, RequestPayload = any, RequiredResponse = any> {

        /**
         * The name of the channel the request was sent through. The
         * channel literal is immutable. Attempts to override the
         * channel property
         */
        readonly channel: Channel;

        /**
         * The payload data for the request. The payload is immutable.
         * Attempts to set / override payload values will silently fail.
         * Attempts to mutate members of object-type payloads will
         * silently fail as well.
         */
        readonly payload: RequestPayload;

        /**
         * Respond to the request with given data.
         */
        respond(data: RequiredResponse): void;
    }

    // -----------------------------------------------------------------------
    // Mapping of event channel names to corresponding payload types
    // -----------------------------------------------------------------------

    /**
     *
     */
    interface EventMap {
        IN: DirectionalEventMap;
        OUT: DirectionalEventMap;
    }

    /**
     *
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
     * and the Messenger interface.
     */
    namespace TypeLens {

        namespace In {

            namespace Request {

                type All<MAP extends EventMap> = MAP['IN']['requests'];
                type Channel<MAP extends EventMap> = keyof All<MAP>;
                type Contract<MAP extends EventMap, CH extends Channel<MAP>> = All<MAP>[CH];
                type RequestPayload<MAP extends EventMap, CH extends Channel<MAP>> = Contract<MAP, CH>['requestPayloadType'];
                type ResponsePayload<MAP extends EventMap, CH extends Channel<MAP>> = Contract<MAP, CH>['responsePayloadType'];
            }

            namespace Notification {

                type All<MAP extends EventMap> = MAP['IN']['notifications'];
                type Channel<MAP extends EventMap> = keyof All<MAP>;
                type Payload<MAP extends EventMap, CH extends Channel<MAP>> = All<MAP>[CH];
            }
        }

        namespace Out {

            namespace Request {

                type All<MAP extends EventMap> = MAP['OUT']['requests'];
                type Channel<MAP extends EventMap> = keyof All<MAP>;
                type Contract<MAP extends EventMap, CH extends Channel<MAP>> = All<MAP>[CH];
                type RequestPayload<MAP extends EventMap, CH extends Channel<MAP>> = Contract<MAP, CH>['requestPayloadType'];
                type ResponsePayload<MAP extends EventMap, CH extends Channel<MAP>> = Contract<MAP, CH>['responsePayloadType'];
            }

            namespace Notification {

                type All<MAP extends EventMap> = MAP['OUT']['notifications'];
                type Channel<MAP extends EventMap> = keyof All<MAP>;
                type Payload<MAP extends EventMap, CH extends Channel<MAP>> = All<MAP>[CH];
            }
        }
    }
}