import type { Messenger as IMessenger, Static } from './public-api.js'
import { MessageFactory } from './MessageFactory.js'
import { MessageIDGenerator } from './MessageIDGenerator.js'
import { MessageValidator } from './MessageValidator.js'
import { Messenger } from './Messenger.js'
import { PostmessageAdapter } from './PostmessageAdapter.js'

const defaultNamespace: Static = {
  connect(remoteWindow: Window, remoteOrigin: string): IMessenger {
    if (window === remoteWindow) {
      throw new Error('Remote window can not be the same as the local window environment')
    }

    return new Messenger(
      new MessageFactory(new MessageIDGenerator()),
      new MessageValidator(remoteWindow, remoteOrigin),
      new PostmessageAdapter(remoteWindow, remoteOrigin),
    )
  },
}

export default defaultNamespace

export type { Messenger, Request, Static } from './public-api.js'
