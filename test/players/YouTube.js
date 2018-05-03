import React from 'react'
import test from 'ava'
import sinon from 'sinon'
import { configure, shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import testPlayerMethods from '../helpers/testPlayerMethods'
import * as utils from '../../src/utils'
import { YouTube } from '../../src/players/YouTube'

global.window = {
  location: { origin: 'mock-origin' },
  YT: {
    PlayerState: {
      PLAYING: 'PLAYING',
      PAUSED: 'PAUSED',
      BUFFERING: 'BUFFERING',
      ENDED: 'ENDED',
      CUED: 'CUED'
    }
  }
}
global.document = { body: { contains: () => true } }

configure({ adapter: new Adapter() })

const TEST_URL = 'https://www.youtube.com/watch?v=oUFJJNQGwhk'
const TEST_CONFIG = {
  youtube: {
    playerVars: {}
  }
}

testPlayerMethods(YouTube, {
  play: 'playVideo',
  pause: 'pauseVideo',
  stop: 'stopVideo',
  seekTo: 'seekTo',
  setVolume: 'setVolume',
  mute: 'mute',
  unmute: 'unMute',
  getDuration: 'getDuration',
  getCurrentTime: 'getCurrentTime',
  getSecondsLoaded: 'getVideoLoadedFraction',
  setPlaybackRate: 'setPlaybackRate'
})

test('load()', t => {
  class Player {
    constructor (container, options) {
      t.true(container === 'mock-container')
      setTimeout(options.events.onReady, 100)
    }
  }
  const getSDK = sinon.stub(utils, 'getSDK').resolves({ Player })
  return new Promise(resolve => {
    const onReady = () => {
      t.pass()
      resolve()
    }
    const instance = shallow(
      <YouTube url={TEST_URL} config={TEST_CONFIG} onReady={onReady} />
    ).instance()
    instance.container = 'mock-container'
    instance.load(TEST_URL)
    t.true(getSDK.calledOnce)
    getSDK.restore()
  })
})

test('load() when ready', t => {
  const getSDK = sinon.stub(utils, 'getSDK').resolves()
  const instance = shallow(
    <YouTube url={TEST_URL} config={TEST_CONFIG} />
  ).instance()
  instance.player = { cueVideoById: sinon.fake() }
  instance.load(TEST_URL, true)
  t.true(instance.player.cueVideoById.calledOnceWith({
    videoId: 'oUFJJNQGwhk',
    startSeconds: 0
  }))
  t.true(getSDK.notCalled)
  getSDK.restore()
})

test('onStateChange() - play', async t => {
  const onPlay = () => t.pass()
  const instance = shallow(<YouTube url={TEST_URL} onPlay={onPlay} />).instance()
  instance.onStateChange({ data: 'PLAYING' })
})

test('onStateChange() - pause', async t => {
  const onPause = () => t.pass()
  const instance = shallow(<YouTube url={TEST_URL} onPause={onPause} />).instance()
  instance.onStateChange({ data: 'PAUSED' })
})

test('onStateChange() - buffer', async t => {
  const onBuffer = () => t.pass()
  const instance = shallow(<YouTube url={TEST_URL} onBuffer={onBuffer} />).instance()
  instance.onStateChange({ data: 'BUFFERING' })
})

test('onStateChange() - ended', async t => {
  const onEnded = () => t.pass()
  const instance = shallow(<YouTube url={TEST_URL} onEnded={onEnded} />).instance()
  instance.onStateChange({ data: 'ENDED' })
})

test('onStateChange() - ended loop', async t => {
  const onEnded = () => t.pass()
  const instance = shallow(<YouTube url={TEST_URL} onEnded={onEnded} loop />).instance()
  instance.callPlayer = sinon.fake()
  instance.onStateChange({ data: 'ENDED' })
  t.true(instance.callPlayer.calledOnceWith('playVideo'))
})

test('onStateChange() - ready', async t => {
  const onReady = () => t.pass()
  const instance = shallow(<YouTube url={TEST_URL} onReady={onReady} />).instance()
  instance.onStateChange({ data: 'CUED' })
})

test('render()', t => {
  const wrapper = shallow(<YouTube url={TEST_URL} />)
  const style = { width: '100%', height: '100%' }
  t.true(wrapper.contains(
    <div style={style}>
      <div />
    </div>
  ))
})