import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'
import { PostmessageAdapter } from '../src/PostmessageAdapter.js'
import { makeValidNotification } from './helpers/message-objects.spec-helper.js'

const createWindowMock = (listener: Mock) =>
  ({
    postMessage(data: any, origin: string) {
      listener(data, origin)
    },
  }) as Window

describe('PostmessageAdapter', () => {
  const targetOrigin = 'about:blank'
  let adapter: PostmessageAdapter
  let listener: Mock
  let targetWindow: Window

  describe('#postMessage()', () => {
    beforeEach(() => {
      listener = vi.fn()
      targetWindow = createWindowMock(listener)

      adapter = new PostmessageAdapter(targetWindow, targetOrigin)
    })

    it('Should call postMessage() on the target window', () => {
      const data = makeValidNotification()
      adapter.postMessage(data)
      expect(listener).toHaveBeenCalledTimes(1)
    })

    it('Should correctly apply the given payload and origin-restriction', () => {
      const data = makeValidNotification()
      adapter.postMessage(data)
      expect(listener).toHaveBeenCalledTimes(1)
      expect(listener).toHaveBeenCalledWith(data, targetOrigin)
    })
  })
})
