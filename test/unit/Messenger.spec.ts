import { Messenger } from "../../src/Messenger";
import { MessageIDGeneratorMock } from "../mocks/MessageIDGenerator.mock";

describe("[UNIT] Messenger", () => {

    const ownURL = "http://local.test";
    const otherURL = "http://other.test";

    let messenger: Messenger;

    beforeEach(() => {
        messenger = new Messenger(window, otherURL, new MessageIDGeneratorMock());
    });
});
