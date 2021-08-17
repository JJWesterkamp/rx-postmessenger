import { Request } from '../rx-postmessenger'

export class RxPostmessengerRequest<T, U> implements Request<T, U> {
    private _isHandled: boolean = false

    constructor(
        public readonly id: string,
        public readonly channel: string,
        public readonly payload: T,
        private readonly _injectResponse: (data: U) => void,
    ) {
    }

    public get isHandled() {
        return this._isHandled
    }

    public respond(data: U): void {
        if (this._isHandled) {
            return
        }

        this._injectResponse(data)
        this._isHandled = true
    }
}
