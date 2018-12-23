// @ts-ignore
import { remote } from 'electron'

// @ts-ignore
const { getStore, notify } = window
const { session, BrowserWindow } = remote

/** @type {boolean} */
let inBattle = false

// const filter = {
//   urls: ['*kcs/resources/se/*']
// }

const handleGameResponse = event => {
  const { path, body } = event.detail
  switch (path) {
    case '/kcsapi/api_req_practice/battle':
    case '/kcsapi/api_req_sortie/battle':
      inBattle = true
      break
    case '/kcsapi/api_req_practice/battle_result':
    case '/kcsapi/api_req_sortie/battleresult':
      inBattle = false
      break
    case '/kcsapi/api_req_map/next':
      break
    default:
      break
  }
}

/** @return {boolean} */
const isPoiFocused = () => {
  return BrowserWindow.getAllWindows().some(
    w => w.getTitle() === 'poi' && w.isFocused()
  )
}

const needNotification = () => {
  if (!inBattle) {
    return false
  }
  if (isPoiFocused()) {
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
  const match = /kcs2\/resources\/se\/217\.mp3/.exec(event.url)
  if (!match) {
    return
  }
  if (!needNotification()) {
    return
  }
  notify('Battle End')
}

export const pluginDidLoad = () => {
  // https://electronjs.org/docs/api/web-request
  session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    try {
      handleResponseDetails(details)
    } catch (err) {
      console.error('plugin-battle-notice error!', err)
    }
    callback({ cancel: false })
  })
  window.addEventListener('game.response', handleGameResponse)
}

export const pluginWillUnload = () => {
  session.defaultSession.webRequest.onBeforeRequest(null)
  window.removeEventListener('game.response', handleGameResponse)
}
