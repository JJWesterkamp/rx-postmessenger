import { Observable } from 'rxjs';

declare const RxPostmessenger: RxPostmessenger.Static;
export default RxPostmessenger;
export as namespace RxPostmessenger;

// tslint:disable:interface-name

declare namespace RxPostmessenger {

    interface Static {
        /**
         * Create a new messenger for given window object. The remoteOrigin URL is used both to give to window.postMessage
         * calls on remoteWindow, and to filter inbound-message-events on the local window object.
         */
        connect(remoteWindow: Window, remoteOrigin: string): RxPostmessenger.Messenger;
    }

    interface Messenger {

        /**
         * Returns an Observable that emits all incoming notifications for given notification-channel.
         */
        notifications<T = any>(channel: string): Observable<T>;

        /**
         * Send a notification over given channel with given payload.
         */
        notify<T>(channel: string, payload: T | null): void;

        /**
         * Send a request over given channel with given payload. Returns an observable that will emit the response
         * and then complete.
         */
        request<T = any, U = any>(channel: string, payload?: T): Observable<U>;

        /**
         * Returns an Observable that emits all incoming requests for given request-channel.
         */
        requests<T = any, U = any>(channel: string): Observable<Request<T, U>>;
    }

    /**
     *
     */
    interface Request<T, U> {

        /**
         * The name of the channel the request was sent through. The
         * channel literal is immutable. Attempts to override the
         * channel property
         */
        readonly channel: string;

        /**
         * The payload data for the request. The payload is immutable.
         * Attempts to set / override payload values will silently fail.
         * Attempts to mutate members of object-type payloads will
         * silently fail as well.
         */
        readonly payload: T;

        /**
         * Boolean indicating whether respond() has been called on the request
         * previously.
         */
        readonly isHandled: boolean;

        /**
         * Respond to the request with given data.
         */
        respond(data: U): void;
    }
}
