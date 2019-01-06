import { IMessenger, IStatic } from './interface/public-interface';
import { MessageFactory } from './MessageFactory';
import { MessageIDGenerator } from './MessageIDGenerator';
import { MessageValidator } from './MessageValidator';
import { Messenger } from './Messenger';
import { PostmessageAdapter } from './PostmessageAdapter';
import { Observable } from './vendor/rxjs';

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

export function connect(remoteWindow: Window, remoteOrigin: string): IMessenger {

    if (window === remoteWindow) {
        throw new Error('Remote window can not be the same as the local window environment');
    }

    return new Messenger(
        new MessageFactory(
            new MessageIDGenerator(),
        ),
        new MessageValidator(remoteWindow, remoteOrigin),
        new PostmessageAdapter(remoteWindow, remoteOrigin),
    );
}

// ---------------------------------------------------------------------------------------
// API Exports
// ---------------------------------------------------------------------------------------

// noinspection JSUnusedGlobalSymbols
const defaultNamespace: IStatic = { connect, useObservable, getObservable };
export default defaultNamespace;
