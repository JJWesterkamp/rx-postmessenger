import { INotificationObject, IRequestObject, IResponseObject } from './message-objects';

export interface IMessageFactory {
    invalidateID(id: string): void;
    makeRequest<T>(channel: string, payload: T): IRequestObject<T>;
    makeResponse<T>(requestId: string, channel: string, payload: T): IResponseObject<T>;
    makeNotification<T>(channel: string, payload: T): INotificationObject<T>;
}
