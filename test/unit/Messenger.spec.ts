import { Messenger } from "../../src/Messenger";
import { MessageIDGeneratorMock } from "../mocks/MessageIDGenerator.mock";
import { Observable } from "rxjs";
import { expect } from "chai";

// noinspection TsLint
const WindowMock: typeof Window = require("window-mock").default;

describe("[UNIT] Messenger", () => {

    const ownURL = "http://local.test";
    const otherURL = "http://other.test";

    let messenger: Messenger;
    let otherWindow: Window;

    beforeEach(() => {
        messenger = new Messenger(window, otherURL, new MessageIDGeneratorMock());
        otherWindow = new WindowMock();
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
