import { beforeEach, describe, expect, it } from 'vitest'
import RxPostMessenger from '../src/index.js'
import { Messenger } from '../src/Messenger.js'
import { createIFrame } from './helpers/iframe.spec-helper.js'

describe('Entrypoint', () => {
  describe('#connect()', () => {
    const remoteWindow = createIFrame().contentWindow as Window
    const remoteOrigin = 'https://test-remote.test'

    let messenger: Messenger

    beforeEach(() => (messenger = RxPostMessenger.connect(remoteWindow, remoteOrigin) as Messenger))

    it('Should construct a messenger from given arguments when valid', () => {
      expect(messenger).toBeInstanceOf(Messenger)
      // @ts-ignore
      expect(messenger.adapter.targetWindow).toEqual(remoteWindow)
      // @ts-ignore
      expect(messenger.adapter.targetOrigin).toEqual(remoteOrigin)
    })

    it('Should throw an error if given remote window equals the local window', () => {
      const fn = RxPostMessenger.connect.bind(RxPostMessenger, window, remoteOrigin)
      expect(fn).toThrow(Error)
    })
  })
})
