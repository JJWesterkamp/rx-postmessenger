import { assert, expect } from "chai";
import RxPostMessenger from "../../src";
// noinspection TypeScriptPreferShortImport
import { Observable } from "../../src/vendor/rxjs";

describe("[UNIT] Entrypoint", () => {

    describe("#getObservable()", () => {
        it("Should return the default observable implementation if not overridden", () => {
            expect(RxPostMessenger.getObservable()).to.equal(Observable);
        });
    });

    describe("#useObservable()", () => {

        afterEach(() => {
            RxPostMessenger.useObservable(Observable);
        });

        const tests = [
            "test-string",
            0,
            {},
            [],
            () => void(0),
        ];

        it("Should accept any type of argument", () => {
            // Todo: how to test
            expect(RxPostMessenger.useObservable).to.not.throw();
        });

        it("Should set -- then expose -- any argument as Observable implementation", () => {
            for (const testValue of tests) {
                RxPostMessenger.useObservable(testValue as typeof Observable);
                expect(RxPostMessenger.getObservable()).to.equal(testValue);
            }
        });
    });

    describe("#connect()", () => {

        // it('Should ')
    });
});
