import { expect } from "chai";
import { INotificationObject, IRequestObject, IResponseObject } from "../../src/interface/message-objects";
import { MessageFactory } from "../../src/MessageFactory";
import { DEFAULT_TEST_PAYLOAD } from "../helpers/message-objects.spec-helper";
import { MessageIDGeneratorMock } from "../mocks/MessageIDGenerator.mock";

describe("[UNIT] MessageFactory", () => {

    const channel = "test-channel";
    const payload = DEFAULT_TEST_PAYLOAD;

    let factory: MessageFactory;

    beforeEach(() => factory = new MessageFactory(new MessageIDGeneratorMock()));

    describe("#invalidateID()", () => {
        it("Should invalidate given value", () => {
            factory.invalidateID("1");
            expect(factory.makeRequest(channel, payload).id).to.equal("2");
        });
    });

    describe("#makeRequest()", () => {
        let request: IRequestObject;

        beforeEach(() => request = factory.makeRequest(channel, payload));

        it("Should implement all required properties", () => {
            expect(request).to.have.property("id");
            expect(request).to.have.property("type");
            expect(request).to.have.property("channel");
            expect(request).to.have.property("payload");
        });

        it("Should implement given arguments on the object", () => {
            expect(request.channel).to.equal(channel, "Channel value mismatch");
            expect(request.payload).to.equal(payload, "Payload value mismatch");
        });
    });

    describe("#makeResponse()", () => {

        const requestId = "1";

        let response: IResponseObject;

        beforeEach(() => response = factory.makeResponse(requestId, channel, payload));

        it("Should implement all required properties", () => {
            expect(response).to.have.property("id");
            expect(response).to.have.property("requestId");
            expect(response).to.have.property("type");
            expect(response).to.have.property("channel");
            expect(response).to.have.property("payload");
        });

        it("Should implement given arguments on the object", () => {
            expect(response.requestId).to.equal(requestId, "Request ID value mismatch");
            expect(response.channel).to.equal(channel, "Channel value mismatch");
            expect(response.payload).to.equal(payload, "Payload value mismatch");
        });
    });

    describe("#makeNotification()", () => {
        let notification: INotificationObject;

        beforeEach(() => notification = factory.makeNotification(channel, payload));

        it("Should implement all required properties", () => {
            expect(notification).to.have.property("id");
            expect(notification).to.have.property("type");
            expect(notification).to.have.property("channel");
            expect(notification).to.have.property("payload");
        });

        it("Should implement given arguments on the object", () => {
            expect(notification.channel).to.equal(channel, "Channel value mismatch");
            expect(notification.payload).to.equal(payload, "Payload value mismatch");
        });
    });
});
