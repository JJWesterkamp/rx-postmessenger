import { Request } from '../rx-postmessenger'

export class RxPostmessengerRequest<T, U> implements Request<T, U> {

    public readonly channel: string;
    public readonly payload: T;
    public readonly isHandled: boolean = false;
    public readonly id: string;

    private readonly _injectResponse: (data: U) => void;

    constructor(
        id: string,
        channel: string,
        payload: T,
        responseInjector: (data: U) => void,
    ) {
        Object.defineProperties(this, {
            _injectResponse: { value: responseInjector },
            channel:         { value: channel },
            id:              { value: id },
            payload:         { value: payload },
        });
    }

    public respond(data: U): void {
        if (this.isHandled) {
            return;
        }

        this._injectResponse(data);
        Object.defineProperty(this, 'isHandled', { value: true });
    }
}
