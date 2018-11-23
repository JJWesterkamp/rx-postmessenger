import { MessageIDGenerator } from "./MessageIDGenerator";
import { Messenger } from "./Messenger";
import { Observable } from "./vendor/rxjs";

// -------------------------------------------------------------------------------------
// Public interface imports
// -------------------------------------------------------------------------------------

import PublicInterface from "../rx-postmessenger.d";

import IEventMap  = PublicInterface.EventMap;
import IMessenger = PublicInterface.Messenger;
import IStatic    = PublicInterface.Static;

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
export function useObservable<T extends typeof Observable>(newImplementation: T): void {
    _Observable = newImplementation;
}

/**
 * @param {Window} otherWindow
 * @param {string} origin
 * @return {IMessenger}
 */
export function connect<MAP extends IEventMap = any>(otherWindow: Window, origin: string): IMessenger<MAP> {
    return new Messenger(otherWindow, origin, new MessageIDGenerator());
}

// ---------------------------------------------------------------------------------------
// API Exports
// ---------------------------------------------------------------------------------------

const defaultNamespace: IStatic = { connect, useObservable, getObservable };
export default defaultNamespace;
