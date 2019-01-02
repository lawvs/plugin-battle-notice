/* global config, getStore, notify, i18n */
import { remote } from 'electron'

import { store } from 'views/create-store'

import { DBG, PLUGIN_NAME, TARGET_AUDIO } from './constant'
import {
  pluginConfigSelector,
  pluginStateSelector,
  initPlugin,
  removePlugin,
} from './redux'

const { session, BrowserWindow } = remote
const __ = i18n[PLUGIN_NAME].fixedT

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
    DBG.log('no need notice because noticeOnlyMuted')
    return false
  }
  if (!inBattle) {
    DBG.log('no need notice because not battling')
    return false
  }
  if (noticeOnlyBackground && isPoiFocused()) {
    DBG.log('no need notice because noticeOnlyBackground')
    return false
  }
  return true
}

/**
 * @param {{id: number, url: string, method: string, webContentsId: number, resourceType: string, timestamp: number, uploadData: object}} event
 */
const handleResponseDetails = event => {
  // https://github.com/kcwikizh/poi-plugin-subtitle/commit/b6e1db23527c4b1c7d5188afa758c86d59e0501b
  // https://github.com/kcwikizh/poi-plugin-subtitle/commit/ad4ea716315ce026cc5d300bac0ec74a76c3885f
  if (
    getStore('layout.webview.ref') &&
    getStore('layout.webview.ref').isReady() &&
    event.webContentsId !== getStore('layout.webview.ref').getWebContents().id
  ) {
    return
  }
  const match = event.url.includes(TARGET_AUDIO)
  if (!match) {
    return
  }
  if (!needNotification()) {
    return
  }
  notify(__('Battle end'))
}

export const pluginDidLoad = () => {
  // https://electronjs.org/docs/api/web-request
  session.defaultSession.webRequest.onCompleted(details => {
    try {
      handleResponseDetails(details)
    } catch (err) {
      console.error(`${PLUGIN_NAME} handleResponseDetails error!`, err)
    }
  })
  store.dispatch(initPlugin())
}

export const pluginWillUnload = () => {
  session.defaultSession.webRequest.onCompleted(null)
  store.dispatch(removePlugin())
}

export { reducer } from './redux'
export { default as settingsClass } from './settings'
