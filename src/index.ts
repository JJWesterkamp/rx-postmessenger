import { RxPostmessenger } from "./rx-postmessenger";
import { Observable } from "./vendor/rxjs";

import {
    EventMap as IEventMap,
    Messenger,
    NotificationContract,
    RequestContract,
    Static,
} from "../rx-postmessenger";

// -------------------------------------------------------------------------------------
// Private data / exports for internal wiring
// -------------------------------------------------------------------------------------

/**
 * The observable implementation to use for creating the event streams of new messengers.
 */
let _Observable: typeof Observable = Observable;

/**
 * returns the active Rx.Observable implementation. Used by the messenger class to
 * obtain an Observable constructor reference at runtime.
 *
 * @return {Class<Observable>}
 */
export function getObservable(): typeof Observable {
    return _Observable;
}

// -------------------------------------------------------------------------------------
// API implementation
// -------------------------------------------------------------------------------------

/**
 * Sets given Rx.Observable implementation as the active implementation for new messengers.
 * Any messenger created hereafter will use this implementation.
 *
 * @param {Class<Observable>} newImplementation
 */
function useObservable<T extends typeof Observable>(newImplementation: T): void {
    _Observable = newImplementation;
}

/**
 * @param {Window} otherWindow
 * @param {string} origin
 * @return {Messenger}
 */
function connect<MAP extends IEventMap = any>(otherWindow: Window, origin: string): Messenger<MAP> {
    return new RxPostmessenger(otherWindow, origin);
}

// ---------------------------------------------------------------------------------------
// API Exports
// ---------------------------------------------------------------------------------------

const defaultNamespace: Static = { connect, useObservable };
export { defaultNamespace as RxPostmessenger };
export default defaultNamespace;
