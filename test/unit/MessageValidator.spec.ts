import { expect } from 'chai';
import { MessageValidator } from '../../src/MessageValidator';
import { makeValidNotification, makeValidRequest, makeValidResponse } from '../helpers/message-objects.spec-helper';

describe('[UNIT] MessageValidator', () => {

    const remoteURL = 'https://remote-window.test';
    const remoteSource = window;
    const makeMessageEvent = (data: any) => new MessageEvent('message', {
        data,
        origin: remoteURL,
        source: remoteSource,
    });

    let validator: MessageValidator;

    describe('#validate()', () => {

        beforeEach(() => validator = new MessageValidator(window, remoteURL));

        it('Should validate good requests', () => {
            const ev = makeMessageEvent(makeValidRequest());
            expect(validator.validate(ev)).to.equal(true);
        });

        it('Should validate good responses', () => {
            const ev = makeMessageEvent(makeValidResponse());
            expect(validator.validate(ev)).to.equal(true);
        });

        it('Should validate good notifications', () => {
            const ev = makeMessageEvent(makeValidNotification());
            expect(validator.validate(ev)).to.equal(true);
        });

        it('Should invalidate if given value is not a MessageEvent instance', () => {
            const ev = {
                data: makeValidRequest(),
                origin: remoteURL,
                source: remoteSource,
            } as MessageEvent;

            expect(validator.validate(ev)).to.equal(false);
        });

        it('Should invalidate if message.data does not have a valid type value', () => {
            const ev = makeMessageEvent(
                Object.assign(makeValidRequest(), {type: 'NOT \'request\' | \'response\' | \'notification\''}),
            );
            expect(validator.validate(ev)).to.equal(false);
        });

        it('Should invalidate if message.data does not have a valid channel value', () => {

            const ev = makeMessageEvent(
                Object.assign(makeValidRequest(), {channel: undefined}),
            );
            expect(validator.validate(ev)).to.equal(false);
        });

        it('Should invalidate responses without a valid requestId value', () => {
            const ev = makeMessageEvent(
                Object.assign(makeValidResponse(), {requestId: undefined}),
            );
            expect(validator.validate(ev)).to.equal(false);
        });
    });
});
