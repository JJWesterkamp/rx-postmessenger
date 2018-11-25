import { expect } from "chai";
import { Observable } from "rxjs";
import { MessageFactory } from "../../src/MessageFactory";
import { MessageValidator } from "../../src/MessageValidator";
import { Messenger } from "../../src/Messenger";
import { MessageIDGeneratorMock } from "../mocks/MessageIDGenerator.mock";

describe("[UNIT] Messenger", () => {

    const ownURL = "http://local.test";
    const otherURL = "http://other.test";

    let messenger: Messenger;
    let otherWindow: Window;

    beforeEach(() => {
        messenger = new Messenger(
            window,
            otherURL,
            // Todo: mock factory?
            new MessageFactory(new MessageIDGeneratorMock()),
            new MessageValidator(window, otherURL),
        );
    });

    describe("Observable properties", () => {
        it("Should have prop inboundMessages$ of type Observable", () => {
            expect(messenger.inboundMessages$).to.be.an.instanceOf(Observable);
        });

        it("Should have prop notifications$ of type Observable", () => {
            expect(messenger.notifications$).to.be.an.instanceOf(Observable);
        });

        it("Should have prop requests$ of type Observable", () => {
            expect(messenger.requests$).to.be.an.instanceOf(Observable);
        });

        it("Should have prop responses$ of type Observable", () => {
            expect(messenger.responses$).to.be.an.instanceOf(Observable);
        });
    });
});
