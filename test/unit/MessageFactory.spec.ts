import type { INotificationObject, IRequestObject, IResponseObject } from '../../src/types'
import { MessageFactory } from '../../src/MessageFactory'
import { DEFAULT_TEST_PAYLOAD } from '../helpers/message-objects.spec-helper'
import { MessageIDGeneratorMock } from '../mocks/MessageIDGenerator.mock'

describe('[UNIT] MessageFactory', () => {

    const channel = 'test-channel'
    const payload = DEFAULT_TEST_PAYLOAD

    let factory: MessageFactory

    beforeEach(() => factory = new MessageFactory(new MessageIDGeneratorMock()))

    describe('#invalidateID()', () => {
        it('Should invalidate given value', () => {
            factory.invalidateID('1')
            expect(factory.makeRequest(channel, payload).id).toEqual('2')
        })
    })

    describe('#makeRequest()', () => {
        let request: IRequestObject

        beforeEach(() => request = factory.makeRequest(channel, payload))

        it('Should implement all required properties', () => {
            expect(request).toHaveProperty('id')
            expect(request).toHaveProperty('type')
            expect(request).toHaveProperty('channel')
            expect(request).toHaveProperty('payload')
        })

        it('Should implement given arguments on the object', () => {
            expect(request.channel).toEqual(channel)
            expect(request.payload).toEqual(payload)
        })

        it('should mark the returned object as request', () => {
            expect(request.type).toEqual('request')
        })
    })

    describe('#makeResponse()', () => {

        const requestId = '1'

        let response: IResponseObject

        beforeEach(() => response = factory.makeResponse(requestId, channel, payload))

        it('Should implement all required properties', () => {
            expect(response).toHaveProperty('id')
            expect(response).toHaveProperty('requestId')
            expect(response).toHaveProperty('type')
            expect(response).toHaveProperty('channel')
            expect(response).toHaveProperty('payload')
        })

        it('Should implement given arguments on the object', () => {
            expect(response.requestId).toEqual(requestId)
            expect(response.channel).toEqual(channel)
            expect(response.payload).toEqual(payload)
        })

        it('should mark the returned object as response', () => {
            expect(response.type).toEqual('response')
        })
    })

    describe('#makeNotification()', () => {
        let notification: INotificationObject

        beforeEach(() => notification = factory.makeNotification(channel, payload))

        it('Should implement all required properties on the returned object', () => {
            expect(notification).toHaveProperty('id')
            expect(notification).toHaveProperty('type')
            expect(notification).toHaveProperty('channel')
            expect(notification).toHaveProperty('payload')
        })

        it('Should implement given arguments on the returned object', () => {
            expect(notification.channel).toEqual(channel)
            expect(notification.payload).toEqual(payload)
        })

        it('should mark the returned object as notification', () => {
            expect(notification.type).toEqual('notification')
        })
    })
})
