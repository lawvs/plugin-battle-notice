/* global config, getStore */
import { remote } from 'electron'

import { pluginConfigSelector, pluginStateSelector } from './redux'
import { DBG } from './constant'

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
