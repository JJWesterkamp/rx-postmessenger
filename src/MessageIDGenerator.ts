import type { IMessageIDGenerator } from './types'
import { GUIDGenerator } from './functions/GUIDGenerator'

export class MessageIDGenerator implements IMessageIDGenerator {

    protected readonly usedIDValues: string[] = []

    constructor(protected readonly gen: Iterator<string> = GUIDGenerator()) {
    }

    public generateID(): string {
        let newID: string

        do {
            newID = this.gen.next().value
        } while (this.usedIDValues.indexOf(newID) >= 0)

        this.invalidateID(newID)
        return newID
    }

    public invalidateID(id: string): void {
        this.usedIDValues.push(id)
    }
}
