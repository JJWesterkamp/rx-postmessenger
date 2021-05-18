import { RxPostmessengerRequest } from '../../src/RxPostmessengerRequest'
import { DEFAULT_TEST_PAYLOAD } from '../helpers/message-objects.spec-helper'

describe('[UNIT] RxPostmessengerRequest', () => {

    const id = '1'
    const channel = 'test-channel'

    let request: RxPostmessengerRequest<any, any>
    let responseInjector: jest.Mock

    beforeEach(() => {
        responseInjector = jest.fn()
        request = new RxPostmessengerRequest(id, channel, DEFAULT_TEST_PAYLOAD, responseInjector)
    })

    describe('#constructor()', () => {
        it('Should set given constructor arguments', () => {
            expect(request).toHaveProperty('id', id)
            expect(request).toHaveProperty('payload', DEFAULT_TEST_PAYLOAD)
            expect(request).toHaveProperty('channel', channel)
            expect(request).toHaveProperty('_injectResponse', responseInjector)
        })

        it('Should be marked unhandled', () => {
            expect(request.isHandled).toEqual(false)
        })
    })

    describe('#respond()', () => {
        it('Should respond with given payload', () => {
            const payload = {someData: 'test-payload'}
            request.respond(payload)
            expect(responseInjector).toBeCalledWith(payload)
        })

        it('Should mark the request as handled', () => {
            const payload = {someData: 'test-payload'}
            request.respond(payload)
            expect(request.isHandled).toEqual(true)
        })

        it('Should abort if request is already handled', () => {
            const payload = {someData: 'test-payload'}
            request.respond(payload)
            expect(request.isHandled).toEqual(true)
            request.respond(payload)
            request.respond(payload)
            expect(responseInjector).toBeCalledTimes(1)
            expect(responseInjector).toBeCalledWith(payload)
        })
    })
})
