import { assert, expect } from 'chai';
import RxPostMessenger from '../../src';
import { Messenger } from '../../src/Messenger';
// noinspection TypeScriptPreferShortImport
import { Observable } from '../../src/vendor/rxjs';
import { createIFrame } from '../helpers/iframe.spec-helper';

describe('[UNIT] Entrypoint', () => {

    describe('#getObservable()', () => {
        it('Should return the default observable implementation if not overridden', () => {
            expect(RxPostMessenger.getObservable()).to.equal(Observable);
        });
    });

    describe('#useObservable()', () => {

        afterEach(() => {
            RxPostMessenger.useObservable(Observable);
        });

        const tests = [
            'test-string',
            0,
            {},
            [],
            () => void (0),
        ];

        it('Should accept any type of argument', () => {
            // Todo: how to test
            expect(RxPostMessenger.useObservable).to.not.throw();
        });

        it('Should set -- then expose -- any argument as Observable implementation', () => {
            for (const testValue of tests) {
                RxPostMessenger.useObservable(testValue as typeof Observable);
                expect(RxPostMessenger.getObservable()).to.equal(testValue);
            }
        });
    });

    describe('#connect()', () => {

        const remoteWindow = createIFrame().contentWindow as Window;
        const remoteOrigin = 'https://test-remote.test';

        let messenger: Messenger;

        beforeEach(() => messenger = RxPostMessenger.connect(remoteWindow, remoteOrigin) as Messenger);

        it('Should construct a messenger from given arguments when valid', () => {
            expect(messenger).to.be.instanceOf(Messenger);
            expect(messenger.remoteWindow).to.equal(remoteWindow);
            expect(messenger.remoteOrigin).to.equal(remoteOrigin);
        });

        it('Should throw an error if given remote window equals the local window', () => {
            const fn = RxPostMessenger.connect.bind(RxPostMessenger, window, remoteOrigin);
            expect(fn).to.throw(Error);
        });
    });
});
