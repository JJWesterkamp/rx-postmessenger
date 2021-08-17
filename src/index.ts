import { Messenger as IMessenger, Static } from '../rx-postmessenger'
import { MessageFactory } from './MessageFactory'
import { MessageIDGenerator } from './MessageIDGenerator'
import { MessageValidator } from './MessageValidator'
import { Messenger } from './Messenger'
import { PostmessageAdapter } from './PostmessageAdapter'

const defaultNamespace: Static = {
    connect(remoteWindow: Window, remoteOrigin: string): IMessenger {
        if (window === remoteWindow) {
            throw new Error('Remote window can not be the same as the local window environment')
        }

        return new Messenger(
            new MessageFactory(
                new MessageIDGenerator(),
            ),
            new MessageValidator(remoteWindow, remoteOrigin),
            new PostmessageAdapter(remoteWindow, remoteOrigin),
        )
    }
}

export default defaultNamespace
