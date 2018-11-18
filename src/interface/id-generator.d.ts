export interface IMessageIDGenerator {

    /**
     * Get a new unique ID value for message objects.
     */
    generateID(): string;

    /**
     * Invalidates an ID value - marks it a used. This is a required
     * feature for syncing the used ID values
     */
    invalidateID(id: string): void;
}