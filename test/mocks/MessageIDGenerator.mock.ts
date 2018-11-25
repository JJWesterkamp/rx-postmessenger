import { IMessageIDGenerator } from '../../src/interface/id-generator';

export class MessageIDGeneratorMock implements IMessageIDGenerator {

    private usedIDValues: string[] = [];
    private nextValue = 1;

    public generateID(): string {

        let nextNumber;
        let nextString;

        do {
            nextNumber = this.nextValue++;
            nextString = nextNumber.toString();
        } while (this.usedIDValues.indexOf(nextString) >= 0);

        this.invalidateID(nextString);
        return nextString;
    }

    public invalidateID(id: string): void {
        this.usedIDValues.push(id);
    }
}
