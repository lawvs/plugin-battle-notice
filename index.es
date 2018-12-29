/* global config, getStore, notify, i18n */
import { remote } from 'electron'

import { store } from 'views/create-store'

import { PLUGIN_NAME } from './constant'
import {
  pluginConfigSelector,
  pluginStateSelector,
  initPlugin,
  startBattle,
  endBattle,
} from './redux'

const { session, BrowserWindow } = remote
const __ = i18n[PLUGIN_NAME].fixedT

const isCompassNotice = () => {
  const state = getStore()
  const { compassNotice } = pluginConfigSelector(state)
  return compassNotice
}

const handleGameResponse = event => {
  // console.info('handleGameResponse', event) // debug
  const { path } = event.detail
  switch (path) {
    case '/kcsapi/api_req_practice/battle':
    case '/kcsapi/api_req_sortie/battle':
      store.dispatch(startBattle())
      break
    case '/kcsapi/api_req_practice/battle_result':
    case '/kcsapi/api_req_sortie/battleresult':
      store.dispatch(endBattle())
      break
    case '/kcsapi/api_req_map/start':
    case '/kcsapi/api_req_map/next':
      // TODO compassNotice
      if (isCompassNotice()) {
        // notify('Compass')
      }
      break
    default:
      break
  }
}

/** @return {boolean} */
const isPoiFocused = () => {
  return BrowserWindow.getAllWindows().some(
    w => w.getTitle() === 'poi' && w.isFocused(),
  )
}

/** @return {boolean} */
const isPoiMuted = () => config.get('poi.content.muted')

const needNotification = () => {
  const state = getStore()
  const { inBattle } = pluginStateSelector(state)
  const { noticeOnlyBackground, noticeOnlyMuted } = pluginConfigSelector(state)
  if (noticeOnlyMuted && !isPoiMuted()) {
    return false
  }
  if (!inBattle) {
    return false
  }
  if (noticeOnlyBackground && isPoiFocused()) {
    return false
  }
  return true
}

/**
 * @param {{id: number, url: string, method: string, webContentsId: number, resourceType: string, timestamp: number, uploadData: object}} event
 */
const handleResponseDetails = event => {
  // console.info('ゲットだぜ', event.url) // debug
  // https://github.com/kcwikizh/poi-plugin-subtitle/commit/b6e1db23527c4b1c7d5188afa758c86d59e0501b
  // https://github.com/kcwikizh/poi-plugin-subtitle/commit/ad4ea716315ce026cc5d300bac0ec74a76c3885f
  if (
    getStore('layout.webview.ref') &&
    getStore('layout.webview.ref').isReady() &&
    event.webContentsId !== getStore('layout.webview.ref').getWebContents().id
  ) {
    return
  }
  const match = /kcs2\/resources\/se\/217\.mp3/.exec(event.url)
  if (!match) {
    return
  }
  if (!needNotification()) {
    return
  }
  notify(__('Battle end'))
}

export const pluginDidLoad = () => {
  // dbg.extra('plugin-battle-notice')
  // https://electronjs.org/docs/api/web-request
  session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    try {
      handleResponseDetails(details)
    } catch (err) {
      console.error(`${PLUGIN_NAME} handleResponseDetails error!`, err)
    }
    callback({ cancel: false })
  })
  window.addEventListener('game.response', handleGameResponse)
  store.dispatch(initPlugin())
}

export const pluginWillUnload = () => {
  session.defaultSession.webRequest.onBeforeRequest(null)
  window.removeEventListener('game.response', handleGameResponse)
}

export { reducer } from './redux'
export { default as settingsClass } from './settings'
