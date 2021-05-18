import type { AnyMessage, IPostmessageAdapter } from '../../src/types'

export class PostmessageAdapterMock implements IPostmessageAdapter {

    public readonly targetWindow: Window = window
    public readonly targetOrigin: string = '*'

    public spies: Array<(data: any) => void> = []

    public postMessage<T extends AnyMessage>(data: T): void {

        for (const spy of this.spies) {
            spy(data)
        }
    }
}
