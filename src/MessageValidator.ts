import { AnyMessage } from './interface/message-objects';
import { IMessageValidator, IOwnMessageEvent } from './interface/message-validator';

export class MessageValidator implements IMessageValidator {

    constructor(protected acceptedSource: Window, protected acceptedOrigin: string) { }

    /**
     * Validates the identity of the message's sender and the format of the message's data.
     *
     * Checks whether the remoteOrigin location matches any allowed origins.
     * Separate assertion of the remoteOrigin allows for cross-domain navigation
     * within this.frame, and still treating inbound messages from the
     * frame as being equal.
     *
     * Checks whether the source Window object equals the remoteWindow object.
     * This check allows for implementation of multiple i-frames that share the
     * same remoteOrigin, and still being able to distinguish between messages from
     * such frames.
     */
    public validate(message: MessageEvent): message is IOwnMessageEvent<AnyMessage> {
        return message instanceof MessageEvent
            && message.origin === this.acceptedOrigin
            && message.source === this.acceptedSource
            && this.isWellFormedMessage(message.data);
    }

    /**
     * Tests whether the data sent through postMessage is a well-formed message
     * object. This serves as runtime data format validation. If messages do not
     * comply to the AnyMessage compound interface, the entire event is ignored.
     *
     * @param {*} message
     * @return {boolean}
     */
    public isWellFormedMessage(message: any): message is AnyMessage {
        return (typeof message.id === 'string')
            && (['request', 'response', 'notification'].indexOf(message.type) >= 0)
            && (typeof message.channel === 'string')
            && (message.type !== 'response' || (typeof message.requestId === 'string'));
    }
}
