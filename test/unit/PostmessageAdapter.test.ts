import { PostmessageAdapter } from '../../src/PostmessageAdapter'
import { makeValidNotification } from '../helpers/message-objects.spec-helper'

const createWindowMock = (listener: jest.Mock) => ({
    postMessage(data: any, origin: string) {
        listener(data, origin)
    },
} as Window)

describe('[UNIT] PostmessageAdapter', () => {
    const targetOrigin = 'about:blank'
    let adapter: PostmessageAdapter
    let listener: jest.Mock
    let targetWindow: Window

    describe('#postMessage()', () => {
        beforeEach(() => {
            listener = jest.fn()
            targetWindow = createWindowMock(listener)

            adapter = new PostmessageAdapter(
                targetWindow,
                targetOrigin,
            )
        })

        it('Should call postMessage() on the target window', () => {
            const data = makeValidNotification()
            adapter.postMessage(data)
            expect(listener).toBeCalledTimes(1)
        })

        it('Should correctly apply the given payload and origin-restriction', () => {
            const data = makeValidNotification()
            adapter.postMessage(data)
            expect(listener).toBeCalledTimes(1)
            expect(listener).toBeCalledWith(data, targetOrigin)
        })
    })
})
