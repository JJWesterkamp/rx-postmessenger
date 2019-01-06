import { assert, expect } from 'chai';
import RxPostMessenger from '../../src';
import { Messenger } from '../../src/Messenger';
import { createIFrame } from '../helpers/iframe.spec-helper';

describe('Index (Static) module', () => {

    describe('#connect()', () => {

        const remoteWindow = createIFrame().contentWindow as Window;
        const remoteOrigin = 'https://test-remote.test';

        let messenger: Messenger;

        beforeEach(() => messenger = RxPostMessenger.connect(remoteWindow, remoteOrigin) as Messenger);

        it('Should construct a messenger from given arguments when valid', () => {
            expect(messenger).to.be.instanceOf(Messenger);
            // @ts-ignore
            expect(messenger.adapter.targetWindow).to.equal(remoteWindow);
            // @ts-ignore
            expect(messenger.adapter.targetOrigin).to.equal(remoteOrigin);
        });

        it('Should throw an error if given remote window equals the local window', () => {
            const fn = RxPostMessenger.connect.bind(RxPostMessenger, window, remoteOrigin);
            expect(fn).to.throw(Error);
        });
    });
});
