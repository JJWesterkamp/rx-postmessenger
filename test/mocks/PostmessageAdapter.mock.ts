import type { IPostmessageAdapter } from '../../src/types'

export class PostmessageAdapterMock implements IPostmessageAdapter {

    public readonly targetWindow: Window
    public readonly iframe: HTMLIFrameElement
    public readonly postMessage = jest.fn()

    constructor(
        public readonly targetOrigin: string = '*'
    ) {
        this.iframe = document.createElement('iframe')
        this.iframe.src = targetOrigin
        this.targetWindow = this.iframe.contentWindow!
    }
}
