/* global config, getStore, notify */
import { remote } from 'electron'

import { pluginConfigSelector, pluginStateSelector } from './redux'
import { __, DBG, BATTLE_END_AUDIO } from './constant'

const { BrowserWindow } = remote

/** @return {boolean} */
export const isPoiFocused = () => {
  return BrowserWindow.getAllWindows().some(
    w => w.getTitle() === 'poi' && w.isFocused(),
  )
}

/** @return {boolean} */
export const isPoiMuted = () => config.get('poi.content.muted')

export const needNotification = () => {
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
export const handleResponse = details => {
  // https://github.com/kcwikizh/poi-plugin-subtitle/commit/b6e1db23527c4b1c7d5188afa758c86d59e0501b
  // https://github.com/kcwikizh/poi-plugin-subtitle/commit/ad4ea716315ce026cc5d300bac0ec74a76c3885f
  if (
    getStore('layout.webview.ref') &&
    getStore('layout.webview.ref').isReady() &&
    details.webContentsId !== getStore('layout.webview.ref').getWebContents().id
  ) {
    return
  }
  const match = details.url.includes(BATTLE_END_AUDIO)
  if (!match) {
    return
  }
  if (!needNotification()) {
    return
  }
  DBG.log('notice at battle end')
  notify(__('Battle end'))
}
