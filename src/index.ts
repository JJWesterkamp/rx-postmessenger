import { RxPostmessenger } from "./rx-postmessenger";
import { RequestObject } from './private';
import { Observable } from "./vendor/rxjs/index";

// Public interface
import {
    EventMap as EventMapInterface,
    Messenger,
    NotificationContract,
    RequestContract,
    Static,
} from '../rx-postmessenger';

/**
 * @param {Window} otherWindow
 * @param {string} origin
 * @return {Messenger}
 */
export function connect<MAP extends EventMapInterface = any>(otherWindow: Window, origin: string): Messenger<MAP> {
    return new RxPostmessenger(otherWindow, origin);
}

/**
 * The observable implementation to use for creating the event streams of new messengers.
 */
let _Observable: typeof Observable = Observable;

/**
 * returns the active Rx.Observable implementation.
 */
export function getObservable(): typeof Observable {
    return _Observable;
}

/**
 * Sets given Rx.Observable implementation as the active implementation for new messengers.
 * Any messenger created hereafter will use this implementation.
 *
 * @param newImplementation
 */
export function useObservable<T extends typeof Observable>(newImplementation: T): void {
    _Observable = newImplementation;
}

// ---------------------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------------------

const defaultNamespace: Static = { connect, getObservable, useObservable };
export { defaultNamespace as RxPostmessenger };
export default defaultNamespace;

// Type test drive further down































// Test drive!

export interface SomeEventMap extends EventMapInterface {

    IN: {

        requests: {
            'configuration-hash': RequestContract<{ someData: string }, string>;
        };

        notifications: {
            'price-changed': NotificationContract<{ previous: number, current: number }>;
        };
    };

    // OUT: {
    //     requests: {

    //     };

    //     notifications: {
    //         'done': NotificationContract<string>
    //     };
    // };
}

// ReceivableRequest<'price-changed', null, { previous: number, current: number }>,
// ReceivableRequest<'configuration-hash', null, string>

const messenger: Messenger<SomeEventMap> = connect(window, '*');
const myStream = messenger.notifications('price-changed').subscribe((report) => report.previous);
const myStream2 = messenger.requests('configuration-hash').subscribe((test) => test.payload);
messenger.notify('done', 1);