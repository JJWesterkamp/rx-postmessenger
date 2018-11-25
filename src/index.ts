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
import { MessageValidator } from "./MessageValidator";
import { MessageFactory } from "./MessageFactory";

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
 */
export function useObservable<T extends typeof Observable>(newImplementation: T): void {
    _Observable = newImplementation;
}

export function connect<MAP extends IEventMap = any>(remoteWindow: Window, remoteOrigin: string): IMessenger<MAP> {
    return new Messenger(
        remoteWindow,
        remoteOrigin,
        new MessageFactory(
            new MessageIDGenerator(),
        ),
        new MessageValidator(remoteWindow, remoteOrigin),
    );
}

// ---------------------------------------------------------------------------------------
// API Exports
// ---------------------------------------------------------------------------------------

const defaultNamespace: IStatic = { connect, useObservable, getObservable };
export default defaultNamespace;
