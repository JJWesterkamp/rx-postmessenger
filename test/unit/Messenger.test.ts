import { Observable } from 'rxjs'
import { first, take } from 'rxjs/operators'
import { MessageFactory } from '../../src/MessageFactory'
import { MessageValidator } from '../../src/MessageValidator'
import { Messenger } from '../../src/Messenger'
import { PostmessageAdapter } from '../../src/PostmessageAdapter'
import { createIFrame } from '../helpers/iframe.spec-helper'
import { MessageIDGeneratorMock } from '../mocks/MessageIDGenerator.mock'
import { PostmessageAdapterMock } from '../mocks/PostmessageAdapter.mock'
import {
    DEFAULT_TEST_PAYLOAD,
    makeValidNotification,
    makeValidRequest,
    makeValidResponse,
} from '../helpers/message-objects.spec-helper'

const delay = () => new Promise((resolve) => setTimeout(resolve, 100))

describe('[UNIT] Messenger', () => {
    describe('#constructor()', () => {
        let iframe: HTMLIFrameElement
        let messenger: Messenger

        beforeEach(() => {
            iframe = createIFrame()
            messenger = new Messenger(
                new MessageFactory(new MessageIDGeneratorMock()),
                new MessageValidator(window, window.location.origin),
                new PostmessageAdapterMock(),
            )
        })

        afterEach(() => document.body.removeChild(iframe))

        it('Should initialize property inboundMessages$ of type Observable', () => {
            expect(messenger.inboundMessages$).toBeInstanceOf(Observable)
        })

        it('Should initialize property notifications$ of type Observable', () => {
            expect(messenger.notifications$).toBeInstanceOf(Observable)
        })

        it('Should initialize property requests$ of type Observable', () => {
            expect(messenger.requests$).toBeInstanceOf(Observable)
        })

        it('Should initialize property responses$ of type Observable', () => {
            expect(messenger.responses$).toBeInstanceOf(Observable)
        })
    })

    describe('Outgoing messages', () => {
        let iframe: HTMLIFrameElement
        let remoteWindow: Window
        let messenger: Messenger

        beforeEach(() => {
            iframe = createIFrame()
            remoteWindow = iframe.contentWindow as Window

            messenger = new Messenger(
                new MessageFactory(new MessageIDGeneratorMock()),
                new MessageValidator(window, '*'),
                new PostmessageAdapter(remoteWindow, '*'), // Todo: replace with mock
            )
        })

        afterEach(() => document.body.removeChild(iframe))

        // ------------------------------------------------------------------------------
        //      notify()
        // ------------------------------------------------------------------------------

        describe('#notify()', () => {

            const channel = 'test-notification-channel'

            it('Should send notifications to the remote window', (done) => {
                remoteWindow.addEventListener('message', (message) => {
                    expect(message.data.type).toEqual('notification')
                    expect(message.data.id).toEqual('1')
                    expect(message.data.channel).toEqual(channel)
                    expect(message.data.payload).toEqual(DEFAULT_TEST_PAYLOAD)
                    done()
                })

                messenger.notify(channel, DEFAULT_TEST_PAYLOAD)
            })
        })

        // ------------------------------------------------------------------------------
        //      request()
        // ------------------------------------------------------------------------------

        describe('#request()', () => {
            const channel = 'test-request-channel'

            it('Should send requests to the remote window', (done) => {
                remoteWindow.addEventListener('message', (message) => {
                    expect(message.data.type).toEqual('request')
                    expect(message.data.id).toEqual('1')
                    expect(message.data.channel).toEqual(channel)
                    expect(message.data.payload).toEqual(DEFAULT_TEST_PAYLOAD)
                    done()
                })

                messenger.request(channel, DEFAULT_TEST_PAYLOAD)
            })

            it('Should return an Observable', () => {
                expect(messenger.request('test-request-channel', DEFAULT_TEST_PAYLOAD)).toBeInstanceOf(Observable)
            })
        })
    })

    // ------------------------------------------------------------------------------
    //      Inbound messages
    // ------------------------------------------------------------------------------

    // Todo: these assertions do not actually run to completion! This is an issue
    //       with the async nature of postMessage and how it is implemented by JSDOM.
    describe('Incoming messages', () => {
        let messenger: Messenger

        beforeEach(() => {
            messenger = new Messenger(
                new MessageFactory(new MessageIDGeneratorMock()),
                new MessageValidator(window, window.location.origin),
                new PostmessageAdapterMock(),
            )
        })

        // ------------------------------------------------------------------------------
        //      requests()
        // ------------------------------------------------------------------------------

        describe('#requests()', () => {
            it('Should return an Observable', () => {
                expect(messenger.requests('test-request-channel')).toBeInstanceOf(Observable)
            })

            describe('=> Observable', () => {
                it('Should emit request payloads', async () => {
                    const requestObject = makeValidRequest('1')

                    messenger.requests(requestObject.channel).pipe(take(1)).subscribe((request) => {
                        expect(request.channel).toEqual(requestObject.channel)
                        expect(request.payload).toEqual(requestObject.payload)
                    })

                    window.postMessage(requestObject, '*')

                    return await delay()
                })

                it('Should not emit messages of type notification', async () => {
                    const request = makeValidRequest('1')
                    const notification = makeValidNotification('2')
                    const listener = jest.fn()

                    const request$ = messenger.requests(request.channel).pipe(first())

                    request$.subscribe({
                        next: listener,
                        complete() {
                            expect(listener.mock.calls[0][0].id).toEqual('1')
                            console.log('Ive been called!')
                        }
                    })

                    window.postMessage(notification, '*')
                    window.postMessage(request, '*')

                    return await delay()
                })

                it('Should not emit messages of type response', async () => {
                    const request = makeValidRequest('1')
                    const response = makeValidResponse('2', '3')
                    const listener = jest.fn()
                    const request$ = messenger.requests(request.channel).pipe(take(1))

                    request$.subscribe({
                        next: listener, complete: () => {
                            expect(listener.mock.calls[0][0].id).toEqual('1')
                        }
                    })

                    window.postMessage(response, '*')
                    window.postMessage(request, '*')

                    return await delay()
                })
            })
        })

        // ------------------------------------------------------------------------------
        //      notifications()
        // ------------------------------------------------------------------------------

        describe('#notifications()', () => {
            it('Should return an Observable', () => {
                expect(messenger.notifications('test-request-channel')).toBeInstanceOf(Observable)
            })

            describe('=> Observable', () => {
                it('Should emit notification payloads', async () => {
                    const notificationObject = makeValidNotification()

                    messenger.notifications(notificationObject.channel).pipe(take(1)).subscribe((payload) => {
                        expect(payload).toEqual(notificationObject.payload)
                    })

                    window.postMessage(notificationObject, '*')

                    return await delay()
                })

                it('Should not emit messages of type response', async () => {
                    const expectedPayload = 'THE EXPECTED PAYLOAD'
                    const nonExpectedPayload = 'THE NON-EXPECTED PAYLOAD'
                    const notification = makeValidNotification('1', expectedPayload)
                    const response = makeValidResponse('2', '3', nonExpectedPayload)
                    const listener = jest.fn()
                    const notification$ = messenger.notifications(notification.channel).pipe(take(1))

                    notification$.subscribe({
                        next: listener, complete: () => {
                            expect(listener.mock.calls.length).toEqual(1)
                            expect(listener.mock.calls[0][0]).toEqual(expectedPayload)
                        }
                    })

                    window.postMessage(response, '*')
                    window.postMessage(notification, '*')

                    return await delay()
                })

                it('Should not emit messages of type request', async () => {
                    const expectedPayload = 'THE EXPECTED PAYLOAD'
                    const nonExpectedPayload = 'THE NON-EXPECTED PAYLOAD'
                    const notification = makeValidNotification('1', expectedPayload)
                    const request = makeValidRequest('2', nonExpectedPayload)
                    const listener = jest.fn()
                    const notification$ = messenger.notifications(notification.channel).pipe(take(1))

                    notification$.subscribe({
                        next: listener, complete: () => {
                            expect(listener.mock.calls[0][0]).toEqual(expectedPayload)
                        }
                    })

                    window.postMessage(request, '*')
                    window.postMessage(notification, '*')

                    return await delay()
                })
            })
        })
    })
})
