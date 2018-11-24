export interface IMessageValidator {
    validate(message: MessageEvent): boolean;
}
