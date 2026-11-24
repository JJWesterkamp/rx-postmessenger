import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { MockInstance } from 'vitest'
import type { INotificationObject, IRequestObject, IResponseObject } from '../src/types.js'
import { firstValueFrom, Observable } from 'rxjs'
import { MessageFactory } from '../src/MessageFactory.js'
import { MessageValidator } from '../src/MessageValidator.js'
import { Messenger } from '../src/Messenger.js'
import { MessageIDGeneratorMock } from './mocks/MessageIDGenerator.mock.js'
import { PostmessageAdapterMock } from './mocks/PostmessageAdapter.mock.js'
import {
  DEFAULT_TEST_PAYLOAD,
  makeValidNotification,
  makeValidRequest,
  TEST_NOTIFICATION_CHANNEL,
  TEST_REQUEST_RESPONSE_CHANNEL,
} from './helpers/message-objects.spec-helper.js'
import { createIFrame } from './helpers/iframe.spec-helper.js'

describe('Messenger', () => {
  let addEventListenerSpy: MockInstance<typeof window.addEventListener>
  let messenger: Messenger
  let remoteWindow: Window
  let remoteOrigin: string
  let adapter: PostmessageAdapterMock
  let listenerCallback: (message: MessageEvent) => void

  beforeEach(() => {
    vi.restoreAllMocks()
    addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    remoteOrigin = 'https://test.com'
    remoteWindow = createIFrame(remoteOrigin).contentWindow!

    adapter = new PostmessageAdapterMock(remoteOrigin)
    messenger = new Messenger(
      new MessageFactory(new MessageIDGeneratorMock()),
      new MessageValidator(remoteWindow, remoteOrigin),
      adapter,
    )

    listenerCallback = addEventListenerSpy.mock.calls[0][1] as (message: MessageEvent) => void
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

        const [[message]] = adapter.postMessage.mock.calls

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

        const [[message]] = adapter.postMessage.mock.calls

        expect(message.type).toEqual('request')
        expect(message.id).toEqual('1')
        expect(message.channel).toEqual(channel)
        expect(message.payload).toEqual(DEFAULT_TEST_PAYLOAD)
      })

      it('Returned Observable subscribes to the matching response', async () => {
        const response$ = messenger.request(channel, DEFAULT_TEST_PAYLOAD)
        const [[message]] = adapter.postMessage.mock.calls
        expect(response$).toBeInstanceOf(Observable)

        const responsePromise = firstValueFrom(response$)

        listenerCallback(
          new MessageEvent<IResponseObject>('message', {
            data: {
              type: 'response',
              id: '2',
              channel,
              requestId: message.id,
              payload: 'the response',
            },
            source: remoteWindow,
            origin: remoteOrigin,
          }),
        )

        expect(await responsePromise).toEqual('the response')
      })
    })
  })

  describe('Incoming requests', () => {
    describe('requests$ observable', () => {
      it('Should emit request objects only', async () => {
        const request = makeValidRequest('1')

        const requestPromise = firstValueFrom(messenger.requests$)

        // We expect this to NOT be emitted by requests$...
        listenerCallback(
          new MessageEvent<IResponseObject>('message', {
            data: {
              type: 'response',
              id: '2',
              channel: TEST_REQUEST_RESPONSE_CHANNEL, // even though it has the matching channel
              requestId: '1',
              payload: 'some response',
            },
            source: remoteWindow,
            origin: remoteOrigin,
          }),
        )

        // We expect this to NOT be emitted by requests$...
        listenerCallback(
          new MessageEvent<INotificationObject>('message', {
            data: {
              type: 'notification',
              id: '3',
              channel: TEST_REQUEST_RESPONSE_CHANNEL, // even though it has the matching channel
              payload: 'some notification',
            },
            source: remoteWindow,
            origin: remoteOrigin,
          }),
        )

        // We expect this to be emitted by requests$...
        listenerCallback(
          new MessageEvent<IRequestObject>('message', {
            data: request,
            source: remoteWindow,
            origin: remoteOrigin,
          }),
        )

        const emittedRequest = await requestPromise
        expect(emittedRequest.id).toEqual(request.id)
        expect(emittedRequest.channel).toEqual(request.channel)
        expect(emittedRequest.payload).toEqual(request.payload)
      })
    })

    describe('requests() method', () => {
      it('filters incoming requests by channel name', async () => {
        const filteredRequests$ = messenger.requests('the-right-channel')

        const requestPromise = firstValueFrom(filteredRequests$)

        listenerCallback(
          new MessageEvent<IRequestObject>('message', {
            data: {
              type: 'request',
              id: '1',
              channel: 'not-the-right-channel',
              payload: 'not the right payload',
            },
            source: remoteWindow,
            origin: remoteOrigin,
          }),
        )

        listenerCallback(
          new MessageEvent<IRequestObject>('message', {
            data: {
              type: 'request',
              id: '1',
              channel: 'the-right-channel',
              payload: 'the right payload',
            },
            source: remoteWindow,
            origin: remoteOrigin,
          }),
        )

        const request = await requestPromise
        expect(request.channel).toEqual('the-right-channel')
        expect(request.payload).toEqual('the right payload')
      })

      it('Exposes request objects that facilitate responding back to the remote window', async () => {
        const requests$ = messenger.requests('the-request-channel')

        const requestPromise = firstValueFrom(requests$)

        listenerCallback(
          new MessageEvent<IRequestObject>('message', {
            data: {
              type: 'request',
              id: '1',
              channel: 'the-request-channel',
              payload: 'the request payload',
            },
            source: remoteWindow,
            origin: remoteOrigin,
          }),
        )

        const request = await requestPromise
        request.respond('the request response payload')
        const [[response]] = adapter.postMessage.mock.calls
        expect(response.requestId).toEqual('1')
        expect(response.payload).toEqual('the request response payload')
        expect(response.channel).toEqual('the-request-channel')
      })
    })
  })

  describe('Incoming notifications', () => {
    let addEventListenerSpy: MockInstance<typeof window.addEventListener>
    let messenger: Messenger
    let remoteWindow: Window
    let remoteOrigin: string
    let listenerCallback: (message: MessageEvent) => void

    beforeEach(() => {
      vi.restoreAllMocks()
      addEventListenerSpy = vi.spyOn(window, 'addEventListener')
      remoteOrigin = 'https://test.com'
      remoteWindow = createIFrame(remoteOrigin).contentWindow!

      messenger = new Messenger(
        new MessageFactory(new MessageIDGeneratorMock()),
        new MessageValidator(remoteWindow, remoteOrigin),
        new PostmessageAdapterMock(remoteOrigin),
      )

      listenerCallback = addEventListenerSpy.mock.calls[0][1] as (message: MessageEvent) => void
    })

    describe('notifications$ observable', () => {
      it('Should emit notification objects only', async () => {
        const notification = makeValidNotification('3', 'some notification')

        const notificationPromise = firstValueFrom(messenger.notifications$)

        // We expect this to NOT be emitted by notifications$...
        listenerCallback(
          new MessageEvent<IResponseObject>('message', {
            data: {
              type: 'response',
              id: '2',
              channel: TEST_NOTIFICATION_CHANNEL, // even though it has the matching channel
              requestId: '4',
              payload: 'some response',
            },
            source: remoteWindow,
            origin: remoteOrigin,
          }),
        )

        // We expect this to NOT be emitted by notifications$...
        listenerCallback(
          new MessageEvent<IRequestObject>('message', {
            data: {
              type: 'request',
              id: '1',
              channel: TEST_NOTIFICATION_CHANNEL, // even though it has the matching channel
              payload: null,
            },
            source: remoteWindow,
            origin: remoteOrigin,
          }),
        )

        // We expect this to  be emitted by notifications$...
        listenerCallback(
          new MessageEvent<INotificationObject>('message', {
            data: {
              type: 'notification',
              id: '3',
              channel: TEST_NOTIFICATION_CHANNEL,
              payload: 'some notification',
            },
            source: remoteWindow,
            origin: remoteOrigin,
          }),
        )

        const emittedNotification = await notificationPromise
        expect(emittedNotification.id).toEqual(notification.id)
        expect(emittedNotification.channel).toEqual(notification.channel)
        expect(emittedNotification.payload).toEqual(notification.payload)
      })
    })

    describe('notifications() method', () => {
      it('filters incoming notifications by channel name', async () => {
        const filteredNotifications$ = messenger.notifications('the-right-channel')

        const notificationPromise = firstValueFrom(filteredNotifications$)

        listenerCallback(
          new MessageEvent<INotificationObject>('message', {
            data: {
              type: 'notification',
              id: '1',
              channel: 'not-the-right-channel',
              payload: 'not the right payload',
            },
            source: remoteWindow,
            origin: remoteOrigin,
          }),
        )

        listenerCallback(
          new MessageEvent<INotificationObject>('message', {
            data: {
              type: 'notification',
              id: '1',
              channel: 'the-right-channel',
              payload: 'the right payload',
            },
            source: remoteWindow,
            origin: remoteOrigin,
          }),
        )

        expect(await notificationPromise).toEqual('the right payload')
      })
    })
  })
})
