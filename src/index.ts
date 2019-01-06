import { IMessenger, IStatic } from './interface/public-interface';
import { MessageFactory } from './MessageFactory';
import { MessageIDGenerator } from './MessageIDGenerator';
import { MessageValidator } from './MessageValidator';
import { Messenger } from './Messenger';
import { PostmessageAdapter } from './PostmessageAdapter';

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

const defaultNamespace: IStatic = { connect };
export default defaultNamespace;
