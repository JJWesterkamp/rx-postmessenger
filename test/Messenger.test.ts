import type { AnyMessage, INotificationObject, IRequestObject, IResponseObject } from '../src/types'
import { Observable } from 'rxjs'
import { first } from 'rxjs/operators'
import { MessageFactory } from '../src/MessageFactory'
import { MessageValidator } from '../src/MessageValidator'
import { Messenger } from '../src/Messenger'
import { MessageIDGeneratorMock } from './mocks/MessageIDGenerator.mock'
import { PostmessageAdapterMock } from './mocks/PostmessageAdapter.mock'
import {
    DEFAULT_TEST_PAYLOAD,
    makeValidNotification,
    makeValidRequest,
    TEST_NOTIFICATION_CHANNEL,
    TEST_REQUEST_RESPONSE_CHANNEL,
} from './helpers/message-objects.spec-helper'
import { createIFrame } from './helpers/iframe.spec-helper'

describe('Messenger', () => {

    let addEventListenerSpy: jest.SpyInstance
    let messenger: Messenger
    let remoteWindow: Window
    let remoteOrigin: string
    let adapter: PostmessageAdapterMock
    let listenerCallback: (message: MessageEvent) => void


    beforeEach(() => {
        jest.restoreAllMocks()
        addEventListenerSpy = jest.spyOn(window, 'addEventListener')
        remoteOrigin = 'https://test.com'
        remoteWindow = createIFrame(remoteOrigin).contentWindow!

        adapter = new PostmessageAdapterMock(remoteOrigin)
        messenger = new Messenger(
            new MessageFactory(new MessageIDGeneratorMock()),
            new MessageValidator(remoteWindow, remoteOrigin),
            adapter,
        )

        listenerCallback = addEventListenerSpy.mock.calls[0][1]
    })

    describe('constructor()', () => {

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

        // ------------------------------------------------------------------------------
        //      notify()
        // ------------------------------------------------------------------------------

        describe('notify()', () => {

            const channel = 'test-notification-channel'

            it('Should send notifications to the remote window', () => {
                messenger.notify(channel, DEFAULT_TEST_PAYLOAD)

                const message: AnyMessage = adapter.postMessage.mock.calls[0][0]

                expect(message.type).toEqual('notification')
                expect(message.id).toEqual('1')
                expect(message.channel).toEqual(channel)
                expect(message.payload).toEqual(DEFAULT_TEST_PAYLOAD)
            })
        })

        // ------------------------------------------------------------------------------
        //      request()
        // ------------------------------------------------------------------------------

        describe('request()', () => {
            const channel = 'test-request-channel'

            it('Should send requests to the remote window', () => {
                messenger.request(channel, DEFAULT_TEST_PAYLOAD)

                const message: IRequestObject = adapter.postMessage.mock.calls[0][0]

                expect(message.type).toEqual('request')
                expect(message.id).toEqual('1')
                expect(message.channel).toEqual(channel)
                expect(message.payload).toEqual(DEFAULT_TEST_PAYLOAD)
            })

            it('Returned Observable subscribes to the matching response', (done) => {
                const response$ = messenger.request(channel, DEFAULT_TEST_PAYLOAD)
                const message: IRequestObject = adapter.postMessage.mock.calls[0][0]
                expect(response$).toBeInstanceOf(Observable)

                response$.subscribe({
                    next: (response) => expect(response).toEqual('the response'),
                    complete: done,
                })

                listenerCallback(new MessageEvent<IResponseObject>('message', {
                    data: {
                        type: 'response',
                        id: '2',
                        channel,
                        requestId: message.id,
                        payload: 'the response',
                    },
                    source: remoteWindow,
                    origin: remoteOrigin,
                }))
            })
        })
    })

    describe('Incoming requests', () => {
        describe('requests$ observable', () => {
            it('Should emit request objects only', (done) => {
                const request = makeValidRequest('1')

                messenger.requests$.pipe(first()).subscribe({
                    next: (emittedRequest) => {
                        expect(emittedRequest.id).toEqual(request.id)
                        expect(emittedRequest.channel).toEqual(request.channel)
                        expect(emittedRequest.payload).toEqual(request.payload)
                    },
                    complete: done
                })

                // We expect this to NOT be emitted by requests$...
                listenerCallback(new MessageEvent<IResponseObject>('message', {
                    data: {
                        type: 'response',
                        id: '2',
                        channel: TEST_REQUEST_RESPONSE_CHANNEL, // even though it has the matching channel
                        requestId: '1',
                        payload: 'some response',
                    },
                    source: remoteWindow,
                    origin: remoteOrigin,
                }))

                // We expect this to NOT be emitted by requests$...
                listenerCallback(new MessageEvent<INotificationObject>('message', {
                    data: {
                        type: 'notification',
                        id: '3',
                        channel: TEST_REQUEST_RESPONSE_CHANNEL, // even though it has the matching channel
                        payload: 'some notification',
                    },
                    source: remoteWindow,
                    origin: remoteOrigin,
                }))

                // We expect this to be emitted by requests$...
                listenerCallback(new MessageEvent<IRequestObject>('message', {
                    data: request,
                    source: remoteWindow,
                    origin: remoteOrigin,
                }))
            })
        })

        describe('requests() method', () => {
            it('filters incoming requests by channel name', (done) => {
                const filteredRequests$ = messenger.requests('the-right-channel')

                filteredRequests$.pipe(first()).subscribe({
                    next: (request) => {
                        expect(request.channel).toEqual('the-right-channel')
                        expect(request.payload).toEqual('the right payload')
                    },
                    complete: done
                })

                listenerCallback(new MessageEvent<IRequestObject>('message', {
                    data: {
                        type: 'request',
                        id: '1',
                        channel: 'not-the-right-channel',
                        payload: 'not the right payload',
                    },
                    source: remoteWindow,
                    origin: remoteOrigin,
                }))

                listenerCallback(new MessageEvent<IRequestObject>('message', {
                    data: {
                        type: 'request',
                        id: '1',
                        channel: 'the-right-channel',
                        payload: 'the right payload',
                    },
                    source: remoteWindow,
                    origin: remoteOrigin,
                }))
            })

            it('Exposes request objects that facilitate responding back to the remote window', (done) => {
                const requests$ = messenger.requests('the-request-channel')

                requests$.pipe(first()).subscribe({
                    next: (request) => request.respond('the request response payload'),
                    complete: () => {
                        let response: IResponseObject = adapter.postMessage.mock.calls[0][0]
                        expect(response.requestId).toEqual('1')
                        expect(response.payload).toEqual('the request response payload')
                        expect(response.channel).toEqual('the-request-channel')
                        done()
                    }
                })

                listenerCallback(new MessageEvent<IRequestObject>('message', {
                    data: {
                        type: 'request',
                        id: '1',
                        channel: 'the-request-channel',
                        payload: 'the request payload',
                    },
                    source: remoteWindow,
                    origin: remoteOrigin,
                }))
            })
        })
    })

    describe('Incoming notifications', () => {
        let addEventListenerSpy: jest.SpyInstance
        let messenger: Messenger
        let remoteWindow: Window
        let remoteOrigin: string
        let listenerCallback: (message: MessageEvent) => void


        beforeEach(() => {
            jest.restoreAllMocks()
            addEventListenerSpy = jest.spyOn(window, 'addEventListener')
            remoteOrigin = 'https://test.com'
            remoteWindow = createIFrame(remoteOrigin).contentWindow!

            messenger = new Messenger(
                new MessageFactory(new MessageIDGeneratorMock()),
                new MessageValidator(remoteWindow, remoteOrigin),
                new PostmessageAdapterMock(remoteOrigin),
            )

            listenerCallback = addEventListenerSpy.mock.calls[0][1]
        })

        describe('notifications$ observable', () => {
            it('Should emit notification objects only', (done) => {
                const notification = makeValidNotification('1')

                messenger.notifications$.pipe(first()).subscribe({
                    next: (emittedNotification) => {
                        expect(emittedNotification.id).toEqual(notification.id)
                        expect(emittedNotification.channel).toEqual(notification.channel)
                        expect(emittedNotification.payload).toEqual(notification.payload)
                    },
                    complete: done
                })

                // We expect this to NOT be emitted by notifications$...
                listenerCallback(new MessageEvent<IResponseObject>('message', {
                    data: {
                        type: 'response',
                        id: '2',
                        channel: TEST_NOTIFICATION_CHANNEL, // even though it has the matching channel
                        requestId: '4',
                        payload: 'some response',
                    },
                    source: remoteWindow,
                    origin: remoteOrigin,
                }))

                // We expect this to NOT be emitted by notifications$...
                listenerCallback(new MessageEvent<IRequestObject>('message', {
                    data: {
                        type: 'request',
                        id: '1',
                        channel: TEST_NOTIFICATION_CHANNEL, // even though it has the matching channel
                        payload: null,
                    },
                    source: remoteWindow,
                    origin: remoteOrigin,
                }))

                // We expect this to  be emitted by notifications$...
                listenerCallback(new MessageEvent<INotificationObject>('message', {
                    data: {
                        type: 'notification',
                        id: '3',
                        channel: TEST_NOTIFICATION_CHANNEL,
                        payload: 'some notification',
                    },
                    source: remoteWindow,
                    origin: remoteOrigin,
                }))
            })
        })

        describe('notifications() method', () => {
            it('filters incoming notifications by channel name', (done) => {
                const filteredNotifications$ = messenger.notifications('the-right-channel')

                filteredNotifications$.pipe(first()).subscribe({
                    next: (notification) => {
                        expect(notification.channel).toEqual('the-right-channel')
                        expect(notification.payload).toEqual('the right payload')
                    },
                    complete: done
                })

                listenerCallback(new MessageEvent<INotificationObject>('message', {
                    data: {
                        type: 'notification',
                        id: '1',
                        channel: 'not-the-right-channel',
                        payload: 'not the right payload',
                    },
                    source: remoteWindow,
                    origin: remoteOrigin,
                }))

                listenerCallback(new MessageEvent<INotificationObject>('message', {
                    data: {
                        type: 'notification',
                        id: '1',
                        channel: 'the-right-channel',
                        payload: 'the right payload',
                    },
                    source: remoteWindow,
                    origin: remoteOrigin,
                }))
            })
        })
    })
})
