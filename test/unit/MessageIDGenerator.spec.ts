import { assert } from "chai";
import { MessageIDGenerator } from "../../src/MessageIDGenerator";
import { GUIDGeneratorMock } from "../mocks/functions/GUIDGenerator.mock";

describe("[Unit] MessageIDGenerator", () => {

    describe("#generateID()", () => {

        it("Should generate unique values each time when running on default generator", () => {
            const generator = new MessageIDGenerator();
            const values = [];
            for (let i = 0; i < 100; i++) {
                const newValue = generator.generateID();
                assert.notInclude(values, newValue);
                values.push(newValue);
            }
        });

        it("Should not generate invalidated values", () => {
            const generator = new MessageIDGenerator(GUIDGeneratorMock());
            assert.equal(generator.generateID(), "1");
            assert.equal(generator.generateID(), "2");
            generator.invalidateID("3");
            assert.equal(generator.generateID(), "4");
            generator.invalidateID("6");
            assert.equal(generator.generateID(), "5");
            assert.equal(generator.generateID(), "7");
            generator.invalidateID("8");
            generator.invalidateID("9");
            assert.equal(generator.generateID(), "10");
        });
    });
});
