import { IMessageIDGenerator } from "../../src/interface/id-generator";

export class MessageIDGeneratorMock implements IMessageIDGenerator {

    private usedIDValues = [];
    private nextValue = 1;

    public generateID(): string {
        let next;
        do {
            next = this.nextValue++;
        } while (this.usedIDValues.indexOf(next) >= 0);

        return next;
    }

    public invalidateID(id: string): void {
        this.usedIDValues.push(id);
    }
}
