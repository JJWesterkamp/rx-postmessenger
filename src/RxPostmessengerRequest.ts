// -----------------------------------------------------------------------
// Public interface imports
// -----------------------------------------------------------------------

import PublicInterface from "../rx-postmessenger.d";

import IRequest        = PublicInterface.Request;
import IEventMap       = PublicInterface.EventMap;
import RequestContract = PublicInterface.RequestContract;
import RequestTypes    = PublicInterface.TypeLens.In.Request;

// -----------------------------------------------------------------------
// Type mapping shortcuts
// -----------------------------------------------------------------------

import RequestChannel  = RequestTypes.Channel;
import RequestPayload  = RequestTypes.RequestPayload;
import ResponsePayload = RequestTypes.ResponsePayload;

export class RxPostmessengerRequest<MAP extends IEventMap, CH extends RequestChannel<MAP>> implements IRequest<MAP, CH> {
    public readonly channel: CH;
    public readonly payload: RequestPayload<MAP, CH>;
    public readonly isComplete: boolean = false;
    private readonly id: string;
    private readonly _injectResponse: <T extends ResponsePayload<MAP, CH>>(data: T) => void;

    constructor(
        id: string,
        channel: CH,
        payload: RequestPayload<MAP, CH>,
        responseInjector: (data: ResponsePayload<MAP, CH>) => void,
    ) {
        Object.defineProperties(this, {
            _injectResponse: { value: responseInjector },
            channel: { value: channel },
            id: { value: id },
            payload: { value: payload },
        });
    }

    public respond(data: ResponsePayload<MAP, CH>): void {
        if (this.isComplete) { return; }
        this._injectResponse(data);
        Object.defineProperty(this, "isComlete", { value: true });
    }
}
