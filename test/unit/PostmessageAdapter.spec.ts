import { assert, expect } from 'chai';
import sinon = require('sinon');
import { SinonSpy } from 'sinon';
import { PostmessageAdapter } from '../../src/PostmessageAdapter';
import { makeValidNotification } from '../helpers/message-objects.spec-helper';

const createWindowMock = (listener: SinonSpy) => ({
    postMessage(data: any, origin: string) {
        listener(data, origin);
    },
} as Window);

describe('[UNIT] PostmessageAdapter', () => {

    const targetOrigin = 'about:blank';

    let adapter: PostmessageAdapter;
    let listener: SinonSpy;
    let targetWindow: Window;

    describe('#postMessage()', () => {

        beforeEach(() => {

            listener = sinon.fake();
            targetWindow = createWindowMock(listener);

            adapter = new PostmessageAdapter(
                targetWindow,
                targetOrigin,
            );
        });

        it('Should call postMessage() on the target window', () => {
            const data = makeValidNotification();
            adapter.postMessage(data);
            assert(listener.calledOnce, `Not called once as expected, but called ${listener.callCount} times instead`);
        });

        it('Should correctly apply the given payload and origin-restriction', (done) => {
            const data = makeValidNotification();
            adapter.postMessage(data);
            assert.isTrue(listener.calledOnceWith(data, targetOrigin));
            done();
        });
    });
});
