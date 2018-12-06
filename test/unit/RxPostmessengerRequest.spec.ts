import { assert, expect } from 'chai';
import sinon = require('sinon');
import { SinonSpy } from 'sinon';
import { RxPostmessengerRequest } from '../../src/RxPostmessengerRequest';
import { DEFAULT_TEST_PAYLOAD } from '../helpers/message-objects.spec-helper';

describe('[UNIT] RxPostmessengerRequest', () => {

    const id = '1';
    const channel = 'test-channel';

    let request: RxPostmessengerRequest<any, any>;
    let responseInjector: SinonSpy;

    beforeEach(() => {
        responseInjector = sinon.fake();
        request = new RxPostmessengerRequest(id, channel, DEFAULT_TEST_PAYLOAD, responseInjector);
    });

    describe('#constructor()', () => {

        it('Should set given constructor arguments', () => {
            expect(request).to.have.property('id', id);
            expect(request).to.have.property('payload', DEFAULT_TEST_PAYLOAD);
            expect(request).to.have.property('channel', channel);
            expect(request).to.have.property('_injectResponse', responseInjector);
        });

        it('Should be marked unhandled', () => {
            expect(request.isHandled).to.equal(false);
        });
    });

    describe('#respond()', () => {

        it('Should respond with given payload', () => {
            const payload = { someData: 'test-payload' };
            request.respond(payload);
            assert(responseInjector.calledWith(payload));
        });

        it('Should mark the request as handled', () => {
            const payload = { someData: 'test-payload' };
            request.respond(payload);
            expect(request.isHandled).to.equal(true);
        });

        it('Should abort if request is already handled', () => {
            const payload = { someData: 'test-payload' };
            request.respond(payload);
            expect(request.isHandled).to.equal(true);
            request.respond(payload);
            request.respond(payload);
            assert(responseInjector.calledOnceWith(payload));
        });
    });
});
