import { assert } from "chai";
import { MessageIDGenerator } from "../../src/MessageIDGenerator";

describe("[Unit] MessageIDGenerator", () => {

    let generator: MessageIDGenerator;

    describe("#generateID()", () => {

        beforeEach(() => {
            generator = new MessageIDGenerator();
        });

        it("Should generate unique values each time", () => {
            const values = [];
            for (let i = 0; i < 100; i++) {
                const newValue = generator.generateID();
                assert.notInclude(values, newValue);
                values.push(newValue);
            }
        });
    });
});
