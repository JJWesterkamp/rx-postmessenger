import { assert, expect } from 'chai';
import { Observable } from 'rxjs';
import { MessageFactory } from '../../src/MessageFactory';
import { MessageValidator } from '../../src/MessageValidator';
import { Messenger } from '../../src/Messenger';
import { createIFrame } from '../helpers/iframe.spec-helper';
import { DEFAULT_TEST_PAYLOAD, makeValidNotification, makeValidRequest } from '../helpers/message-objects.spec-helper';
import { MessageIDGeneratorMock } from '../mocks/MessageIDGenerator.mock';

describe('[UNIT] Messenger', () => {

    describe('#constructor()', () => {

        let iframe: HTMLIFrameElement;
        let remoteWindow: Window;
        let messenger: Messenger;

        beforeEach(() => {

            iframe = createIFrame();
            remoteWindow = iframe.contentWindow as Window;

            messenger = new Messenger(
                remoteWindow,
                '*',
                new MessageFactory(new MessageIDGeneratorMock()),
                new MessageValidator(window, '*'),
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
                remoteWindow,
                '*',
                new MessageFactory(new MessageIDGeneratorMock()),
                new MessageValidator(window, '*'),
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

            it('Should return an observable awaiting the response', () => {
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
                window,
                window.location.origin,
                new MessageFactory(new MessageIDGeneratorMock()),
                new MessageValidator(window, window.location.origin),
            );
        });


        // ------------------------------------------------------------------------------
        //      requests()
        // ------------------------------------------------------------------------------

        describe('#requests()', () => {

            it('Should emit request payloads', (done) => {
                const requestObject = makeValidRequest();

                messenger.requests(requestObject.channel).subscribe((request) => {
                    expect(request.channel).to.equal(requestObject.channel, 'Request channel mismatch');
                    expect(request.payload).to.equal(requestObject.payload, 'Request payload mismatch');
                    done();
                });

                window.postMessage(requestObject, '*');
            });
        });

        // ------------------------------------------------------------------------------
        //      notifications()
        // ------------------------------------------------------------------------------

        describe('#notifications()', () => {

            it('Should emit notification payloads', (done) => {
                const notificationObject = makeValidNotification();

                messenger.notifications(notificationObject.channel).subscribe((payload) => {
                    expect(payload).to.equal(notificationObject.payload, 'Notification payload mismatch');
                    done();
                });

                window.postMessage(notificationObject, '*');
            });
        });
    });
});
