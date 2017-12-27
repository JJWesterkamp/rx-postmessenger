// -----------------------------------------------------------------------
// Public interface imports
// -----------------------------------------------------------------------

import {
    EventMap as EventMapInterface,
    Request as RequestWrapperInterface,
    RequestContract,
    TypeLens,
} from "../rx-postmessenger";

// -----------------------------------------------------------------------
// Type mapping shortcuts
// -----------------------------------------------------------------------

import RequestChannel = TypeLens.In.Request.Channel;
import RequestPayload = TypeLens.In.Request.RequestPayload;
import ResponsePayload = TypeLens.In.Request.ResponsePayload;

/**
 *
 */
export class RxPostmessengerRequest<

    MAP extends EventMapInterface,
    CH extends RequestChannel<MAP>

> implements RequestWrapperInterface<MAP, CH> {

    /**
     * The name of the channel the request was sent through
     */
    public readonly channel: CH;

    /**
     * The payload data of the request
     */
    public readonly payload: RequestPayload<MAP, CH>;

    /**
     * Boolean indicating if the request has already been responded to
     */
    public readonly isComplete: boolean;

    /**
     * The id of the request that should be sent
     */
    private readonly id: string;

    /**
     *
     */
    private readonly _injectResponse: <T extends ResponsePayload<MAP, CH>>(data: T) => void;

    /**
     * @param {string} id
     * @param {string} channel
     * @param {*} payload
     * @param {function(data: *): void} responseInjector
     */
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

    /**
     *
     * @param {*} data
     */
    public respond(data: ResponsePayload<MAP, CH>): void {
        if (this.isComplete) { return; }
        this._injectResponse(data);
        Object.defineProperty(this, "isComlete", { value: true });
    }
}
