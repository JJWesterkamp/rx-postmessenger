import { assert, expect } from 'chai';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import sinon = require('sinon');
import { MessageFactory } from '../../src/MessageFactory';
import { MessageValidator } from '../../src/MessageValidator';
import { Messenger } from '../../src/Messenger';
import { PostmessageAdapter } from '../../src/PostmessageAdapter';
import { createIFrame } from '../helpers/iframe.spec-helper';
import { DEFAULT_TEST_PAYLOAD, makeValidNotification, makeValidRequest, makeValidResponse } from '../helpers/message-objects.spec-helper';
import { MessageIDGeneratorMock } from '../mocks/MessageIDGenerator.mock';
import { PostmessageAdapterMock } from '../mocks/PostmessageAdapter.mock';

describe('[UNIT] Messenger', () => {

    describe('#constructor()', () => {

        let iframe: HTMLIFrameElement;
        let remoteWindow: Window;
        let messenger: Messenger;

        beforeEach(() => {

            iframe = createIFrame();
            remoteWindow = iframe.contentWindow as Window;

            messenger = new Messenger(
                new MessageFactory(new MessageIDGeneratorMock()),
                new MessageValidator(window, window.location.origin),
                new PostmessageAdapterMock(),
            );
        });

        afterEach(() => document.body.removeChild(iframe));

        it('Should initialize property inboundMessages$ of type Observable', () => {
            expect(messenger.inboundMessages$).to.be.an.instanceOf(Observable);
        });

        it('Should initialize property notifications$ of type Observable', () => {
            expect(messenger.notifications$).to.be.an.instanceOf(Observable);
        });

        it('Should initialize property requests$ of type Observable', () => {
            expect(messenger.requests$).to.be.an.instanceOf(Observable);
        });

        it('Should initialize property responses$ of type Observable', () => {
            expect(messenger.responses$).to.be.an.instanceOf(Observable);
        });
    });

    describe('Outgoing messages', () => {

        let iframe: HTMLIFrameElement;
        let remoteWindow: Window;
        let messenger: Messenger;

        beforeEach(() => {

            iframe = createIFrame();
            remoteWindow = iframe.contentWindow as Window;

            messenger = new Messenger(
                new MessageFactory(new MessageIDGeneratorMock()),
                new MessageValidator(window, '*'),
                new PostmessageAdapter(remoteWindow, '*'), // Todo: replace with mock
            );
        });

        afterEach(() => document.body.removeChild(iframe));

        // ------------------------------------------------------------------------------
        //      notify()
        // ------------------------------------------------------------------------------

        describe('#notify()', () => {

            const channel = 'test-notification-channel';

            it('Should send notifications to the remote window', (done) => {
                remoteWindow.addEventListener('message', (message) => {
                    expect(message.data.type).to.equal('notification');
                    expect(message.data.id).to.equal('1');
                    expect(message.data.channel).to.equal(channel);
                    expect(message.data.payload).to.equal(DEFAULT_TEST_PAYLOAD);
                    done();
                });

                messenger.notify(channel, DEFAULT_TEST_PAYLOAD);
            });
        });

        // ------------------------------------------------------------------------------
        //      request()
        // ------------------------------------------------------------------------------

        describe('#request()', () => {

            const channel = 'test-request-channel';

            // Todo: move to a window integration test
            it('Should send requests to the remote window', (done) => {
                remoteWindow.addEventListener('message', (message) => {
                    expect(message.data.type).to.equal('request');
                    expect(message.data.id).to.equal('1');
                    expect(message.data.channel).to.equal(channel);
                    expect(message.data.payload).to.equal(DEFAULT_TEST_PAYLOAD);
                    done();
                });

                messenger.request(channel, DEFAULT_TEST_PAYLOAD);
            });

            it('Should return an Observable', () => {
                expect(messenger.request('test-request-channel', DEFAULT_TEST_PAYLOAD)).to.be.instanceOf(Observable);
            });

            describe('=> Observable', () => {
                // ...
            });
        });
    });

    // ------------------------------------------------------------------------------
    //      Inbound messages
    // ------------------------------------------------------------------------------

    describe('Incoming messages', () => {

        let messenger: Messenger;

        beforeEach(() => {
            messenger = new Messenger(
                new MessageFactory(new MessageIDGeneratorMock()),
                new MessageValidator(window, window.location.origin),
                new PostmessageAdapterMock(),
            );
        });

        // ------------------------------------------------------------------------------
        //      requests()
        // ------------------------------------------------------------------------------

        describe('#requests()', () => {

            it('Should return an Observable', () => {
                expect(messenger.requests('test-request-channel')).to.be.instanceOf(Observable);
            });

            describe('=> Observable', () => {

                it('Should emit request payloads', (done) => {
                    const requestObject = makeValidRequest('1');

                    messenger.requests(requestObject.channel).pipe(take(1)).subscribe((request) => {
                        expect(request.channel).to.equal(requestObject.channel, 'Request channel mismatch');
                        expect(request.payload).to.equal(requestObject.payload, 'Request payload mismatch');
                        done();
                    });

                    window.postMessage(requestObject, '*');
                });

                it('Should not emit messages of type notification', (done) => {
                    const request = makeValidRequest('1');
                    const notification = makeValidNotification('2');

                    const listener = sinon.fake();
                    const request$ = messenger.requests(request.channel).pipe(take(1));

                    request$.subscribe({ next: listener, complete: () => {
                        expect(listener.firstCall.args[0].id).to.equal('1');
                        done();
                    }});

                    window.postMessage(notification, '*');
                    window.postMessage(request, '*');
                });

                it('Should not emit messages of type response', (done) => {
                    const request = makeValidRequest('1');
                    const response = makeValidResponse('2', '3');

                    const listener = sinon.fake();
                    const request$ = messenger.requests(request.channel).pipe(take(1));

                    request$.subscribe({ next: listener, complete: () => {
                            expect(listener.firstCall.args[0].id).to.equal('1');
                            done();
                        }});

                    window.postMessage(response, '*');
                    window.postMessage(request, '*');
                });
            });
        });

        // ------------------------------------------------------------------------------
        //      notifications()
        // ------------------------------------------------------------------------------

        describe('#notifications()', () => {

            it('Should return an Observable', () => {
                expect(messenger.notifications('test-request-channel')).to.be.instanceOf(Observable);
            });

            describe('=> Observable', () => {

                it('Should emit notification payloads', (done) => {
                    const notificationObject = makeValidNotification();

                    messenger.notifications(notificationObject.channel).pipe(take(1)).subscribe((payload) => {
                        expect(payload).to.equal(notificationObject.payload, 'Notification payload mismatch');
                        done();
                    });

                    window.postMessage(notificationObject, '*');
                });

                it('Should not emit messages of type response', (done) => {

                    const expectedPayload = 'THE EXPECTED PAYLOAD';
                    const nonExpectedPayload = 'THE NON-EXPECTED PAYLOAD';

                    const notification = makeValidNotification('1', expectedPayload);
                    const response = makeValidResponse('2', '3', nonExpectedPayload);

                    const listener = sinon.fake();
                    const notification$ = messenger.notifications(notification.channel).pipe(take(1));

                    notification$.subscribe({ next: listener, complete: () => {
                        expect(listener.callCount).to.equal(1);
                        expect(listener.firstCall.args[0]).to.equal(expectedPayload);
                        done();
                    }});

                    window.postMessage(response, '*');
                    window.postMessage(notification, '*');
                });

                it('Should not emit messages of type request', (done) => {

                    const expectedPayload = 'THE EXPECTED PAYLOAD';
                    const nonExpectedPayload = 'THE NON-EXPECTED PAYLOAD';

                    const notification = makeValidNotification('1', expectedPayload);
                    const request = makeValidRequest('2', nonExpectedPayload);

                    const listener = sinon.fake();
                    const notification$ = messenger.notifications(notification.channel).pipe(take(1));

                    notification$.subscribe({ next: listener, complete: () => {
                            expect(listener.firstCall.args[0]).to.equal(expectedPayload);
                            done();
                        }});

                    window.postMessage(request, '*');
                    window.postMessage(notification, '*');
                });
            });
        });
    });
});
