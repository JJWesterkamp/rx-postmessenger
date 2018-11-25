import { expect } from "chai";
import { MessageValidator } from "../../src/MessageValidator";
import { makeValidNotification, makeValidRequest, makeValidResponse } from "../helpers/message-objects";

describe("[UNIT] MessageValidator", () => {

    const remoteURL = "https://remote-window.test";
    const remoteSource = window;

    let validator: MessageValidator;

    describe("#validate()", () => {

        beforeEach(() => validator = new MessageValidator(window, remoteURL));

        it("Should validate good requests", () => {
            const ev = new MessageEvent("message", {
                data: makeValidRequest(),
                origin: remoteURL,
                source: remoteSource,
            });
            expect(validator.validate(ev as MessageEvent)).to.equal(true);
        });

        it("Should validate good responses", () => {
            const ev = new MessageEvent("message", {
                data: makeValidResponse(),
                origin: remoteURL,
                source: remoteSource,
            });
            expect(validator.validate(ev as MessageEvent)).to.equal(true);
        });

        it("Should validate good notifications", () => {
            const ev = new MessageEvent("message", {
                data: makeValidNotification(),
                origin: remoteURL,
                source: remoteSource,
            });
            expect(validator.validate(ev as MessageEvent)).to.equal(true);
        });

        it("Should invalidate if given value is not a MessageEvent instance", () => {
            const ev = {
                data: makeValidRequest(),
                origin: remoteURL,
                source: remoteSource,
            };

            expect(validator.validate(ev as MessageEvent)).to.equal(false);
        });

        it("Should invalidate if message.data does not have a valid type value", () => {

            const ev = new MessageEvent("message", {
                data: Object.assign(makeValidRequest(), {type: "NOT 'request' | 'response' | 'notification'"}),
                origin: remoteURL,
                source: remoteSource,
            });

            expect(validator.validate(ev as MessageEvent)).to.equal(false);
        });

        it("Should invalidate if message.data does not have a valid channel value", () => {

            const ev = new MessageEvent("message", {
                data: Object.assign(makeValidRequest(), {channel: undefined}),
                origin: remoteURL,
                source: remoteSource,
            });

            expect(validator.validate(ev as MessageEvent)).to.equal(false);
        });

        it("Should invalidate responses without a valid requestId value", () => {

            const ev = new MessageEvent("message", {
                data: Object.assign(makeValidResponse(), {requestId: undefined}),
                origin: remoteURL,
                source: remoteSource,
            });

            expect(validator.validate(ev as MessageEvent)).to.equal(false);
        });
    });
});
