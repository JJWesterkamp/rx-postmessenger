import type {
    IMessageFactory,
    IMessageIDGenerator,
    INotificationObject,
    IRequestObject,
    IResponseObject,
} from './types'

export class MessageFactory implements IMessageFactory {

    constructor(protected readonly IDGenerator: IMessageIDGenerator) { }

    public makeNotification<T>(channel: string, payload: T): INotificationObject<T> {
        return {
            channel,
            id: this.IDGenerator.generateID(),
            payload,
            type: 'notification',
        };
    }

    public makeRequest<T>(channel: string, payload: T): IRequestObject<T> {
        return {
            channel,
            id: this.IDGenerator.generateID(),
            payload,
            type: 'request',
        };
    }

    public makeResponse<T>(requestId: string, channel: string, payload: T): IResponseObject<T> {
        return {
            channel,
            id: this.IDGenerator.generateID(),
            payload,
            requestId,
            type: 'response',
        };
    }

    public invalidateID(id: string): void {
        this.IDGenerator.invalidateID(id);
    }
}
