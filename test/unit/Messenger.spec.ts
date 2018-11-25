import { assert, expect } from 'chai';
import { Observable } from 'rxjs';
import { MessageFactory } from '../../src/MessageFactory';
import { MessageValidator } from '../../src/MessageValidator';
import { Messenger } from '../../src/Messenger';
import { createIFrame } from '../helpers/iframe.spec-helper';
import { DEFAULT_TEST_PAYLOAD } from '../helpers/message-objects.spec-helper';
import { MessageIDGeneratorMock } from '../mocks/MessageIDGenerator.mock';

describe('[UNIT] Messenger', () => {

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

    describe('Observable properties', () => {
        it('Should have prop inboundMessages$ of type Observable', () => {
            expect(messenger.inboundMessages$).to.be.an.instanceOf(Observable);
        });

        it('Should have prop notifications$ of type Observable', () => {
            expect(messenger.notifications$).to.be.an.instanceOf(Observable);
        });

        it('Should have prop requests$ of type Observable', () => {
            expect(messenger.requests$).to.be.an.instanceOf(Observable);
        });

        it('Should have prop responses$ of type Observable', () => {
            expect(messenger.responses$).to.be.an.instanceOf(Observable);
        });
    });

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
    });

    // ------------------------------------------------------------------------------
    //      requests()
    // ------------------------------------------------------------------------------

    describe('#requests()', () => {

        it('Should emit request payloads', () => {
            // ...
        });

        it('Should not emit notifications', () => {
            // ...
        });
    });

    // ------------------------------------------------------------------------------
    //      notifications()
    // ------------------------------------------------------------------------------

    describe('#notifications()', () => {
        it('Should ', () => {
            // ...
        });
    });
});
