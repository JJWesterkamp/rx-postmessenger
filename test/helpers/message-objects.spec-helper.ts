import { INotificationObject, IRequestObject, IResponseObject } from '../../src/interface/message-objects';

export const DEFAULT_TEST_PAYLOAD: any = 'DEFAULT-TEST-PAYLOAD';

export function makeValidRequest<T = any>(id = '1', payload: T = DEFAULT_TEST_PAYLOAD): IRequestObject<T> {
    return {
        channel: 'some-request-channel',
        id,
        payload,
        type: 'request',
    };
}

export function makeValidResponse<T = any>(requestId = '1', id = '2', payload: T = DEFAULT_TEST_PAYLOAD): IResponseObject<T> {
    return {
        channel: 'some-request-channel',
        id,
        payload,
        requestId,
        type: 'response',
    };
}

export function makeValidNotification<T = any>(id = '1', payload: T = DEFAULT_TEST_PAYLOAD): INotificationObject<T> {
    return {
        channel: 'some-request-channel',
        id,
        payload,
        type: 'notification',
    };
}
