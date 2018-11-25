import { expect } from "chai";
import { Observable } from "rxjs";
import { MessageFactory } from "../../src/MessageFactory";
import { MessageValidator } from "../../src/MessageValidator";
import { Messenger } from "../../src/Messenger";
import { makeValidNotification } from "../helpers/message-objects.spec-helper";
import { MessageIDGeneratorMock } from "../mocks/MessageIDGenerator.mock";
import { createIFrame } from "../helpers/iframe.spec-helper";

describe("[UNIT] Messenger", () => {

    const remoteOrigin = "about:blank";

    let iframe: HTMLIFrameElement;
    let remoteWindow: Window;
    let messenger: Messenger;

    beforeEach(() => {

        iframe = createIFrame(remoteOrigin);
        remoteWindow = iframe.contentWindow as Window;

        messenger = new Messenger(
            remoteWindow,
            remoteOrigin,
            new MessageFactory(new MessageIDGeneratorMock()),
            new MessageValidator(remoteWindow, remoteOrigin),
        );
    });

    afterEach(() => document.body.removeChild(iframe));

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

    describe("#notify()", () => {

        it("Should dispatch the event", () => {
            const notification = makeValidNotification();
        });
        // console.log("MESSENGER WINDOW:", messenger.remoteWindow);
        // messenger.notify("test-notification-channel", notification);
    });

    describe("#request()", () => {
        const request = makeValidNotification();
        // messenger.request("test-request-channel", request);
    });

    describe("#requests()", () => {
        // const requests$ = messenger.requests("test-request-channel");
    });

    describe("#notifications()", () => {
        // const requests$ = messenger.notifications("test-notification-channel");
    });
});
