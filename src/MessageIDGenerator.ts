import { GUIDGenerator } from "./functions/GUIDGenerator";
import { IMessageIDGenerator } from "./interface/id-generator";

export class MessageIDGenerator implements IMessageIDGenerator {

    private readonly usedIDValues: string[] = [];
    private readonly gen: Iterator<string> = GUIDGenerator();

    public generateID(): string {
        let newID: string;
        do {
            newID = this.gen.next().value;
        } while (this.usedIDValues.indexOf(newID) >= 0);
        this.invalidateID(newID);
        return newID;
    }

    public invalidateID(id: string): void {
        this.usedIDValues.push(id);
    }
}
