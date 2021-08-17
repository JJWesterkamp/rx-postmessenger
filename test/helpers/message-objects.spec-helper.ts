import type { INotificationObject, IRequestObject, IResponseObject } from '../../src/types'

export const DEFAULT_TEST_PAYLOAD: any = 'DEFAULT-TEST-PAYLOAD'
export const TEST_REQUEST_RESPONSE_CHANNEL = 'test-request-channel'
export const TEST_NOTIFICATION_CHANNEL = 'test-notification-channel'

export function makeValidRequest<T = any>(id = '1', payload: T = DEFAULT_TEST_PAYLOAD): IRequestObject<T> {
    return {
        channel: TEST_REQUEST_RESPONSE_CHANNEL,
        id,
        payload,
        type: 'request',
    }
}

export function makeValidResponse<T = any>(requestId = '1', id = '2', payload: T = DEFAULT_TEST_PAYLOAD): IResponseObject<T> {
    return {
        channel: TEST_REQUEST_RESPONSE_CHANNEL,
        id,
        payload,
        requestId,
        type: 'response',
    }
}

export function makeValidNotification<T = any>(id = '1', payload: T = DEFAULT_TEST_PAYLOAD): INotificationObject<T> {
    return {
        channel: TEST_NOTIFICATION_CHANNEL,
        id,
        payload,
        type: 'notification',
    }
}
