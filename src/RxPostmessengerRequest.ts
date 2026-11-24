import type { Request } from './public-api.js'

export class RxPostmessengerRequest<T, U> implements Request<T, U> {
  private handled: boolean = false

  constructor(
    public readonly id: string,
    public readonly channel: string,
    public readonly payload: T,
    private readonly injectResponse: (data: U) => void,
  ) {}

  public get isHandled() {
    return this.handled
  }

  public respond(data: U): void {
    if (this.handled) {
      return
    }

    this.injectResponse(data)
    this.handled = true
  }
}
