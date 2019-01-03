/* global config, getStore, notify */
import { remote } from 'electron'
import { get } from 'lodash'
import { createSelector } from 'reselect'

// https://github.com/poooi/poi/blob/master/views/utils/selectors.es
import { configSelector, extensionSelectorFactory } from 'views/utils/selectors'
import { store } from 'views/create-store'

import { __, DBG, PLUGIN_NAME, BATTLE_END_AUDIO } from '../constant'
import { needNotification } from '../util'

const defaultConfig = {
  noticeOnlyBackground: true, // default notice when poi window is not focused
  noticeOnlyMuted: false,
  // compassNotice: false,
}

// Selector
// store.config.plugin[PLUGIN_NAME]
export const pluginConfigSelector = createSelector(
  configSelector,
  state => ({
    ...defaultConfig,
    ...get(state, `plugin.${PLUGIN_NAME}`),
  }),
)

// store.ext[PLUGIN_NAME]
export const pluginStateSelector = createSelector(
  extensionSelectorFactory(PLUGIN_NAME),
  state => state,
)

// Actions
const PLUGIN_INIT = `@@${PLUGIN_NAME}@init`
const PLUGIN_REMOVE = `@@${PLUGIN_NAME}@remove`
const CONFIG_CHANGE = `@@${PLUGIN_NAME}@configChange`
const RESPONSE = `@@${PLUGIN_NAME}@gameResponse`

const initState = {
  inBattle: false,
}

// Reducer
export function reducer(state = initState, action, store) {
  const { type } = action
  switch (type) {
    // https://github.com/poooi/lib-battle/blob/master/simulator.es#L972-L1007
    // Day Battle
    case '@@Response/kcsapi/api_req_practice/battle':
    case '@@Response/kcsapi/api_req_sortie/battle':
    case '@@Response/kcsapi/api_req_sortie/airbattle':
    case '@@Response/kcsapi/api_req_sortie/ld_airbattle':
    case '@@Response/kcsapi/api_req_sortie/ld_shooting':
    case '@@Response/kcsapi/api_req_combined_battle/battle':
    case '@@Response/kcsapi/api_req_combined_battle/battle_water':
    case '@@Response/kcsapi/api_req_combined_battle/airbattle':
    case '@@Response/kcsapi/api_req_combined_battle/ld_airbattle':
    case '@@Response/kcsapi/api_req_combined_battle/ld_shooting':
    case '@@Response/kcsapi/api_req_combined_battle/ec_battle':
    case '@@Response/kcsapi/api_req_combined_battle/each_battle':
    case '@@Response/kcsapi/api_req_combined_battle/each_battle_water':
    // Night Battle
    case '@@Response/kcsapi/api_req_practice/midnight_battle':
    case '@@Response/kcsapi/api_req_battle_midnight/battle':
    case '@@Response/kcsapi/api_req_battle_midnight/sp_midnight':
    case '@@Response/kcsapi/api_req_combined_battle/midnight_battle':
    case '@@Response/kcsapi/api_req_combined_battle/sp_midnight':
    case '@@Response/kcsapi/api_req_combined_battle/ec_midnight_battle':
    case '@@Response!COMPAT/midnight_battle':
      return {
        ...state,
        inBattle: true,
      }
    // Battle Result
    case '@@Response/kcsapi/api_req_practice/battle_result':
    case '@@Response/kcsapi/api_req_sortie/battleresult':
    case '@@Response/kcsapi/api_req_combined_battle/battleresult':
      return {
        ...state,
        inBattle: false,
      }
    // Night to Day
    // case '@@Response/kcsapi/api_req_combined_battle/ec_night_to_day':
    default: {
      return state
    }
  }
}

// Action Creators
export const initPlugin = () => {
  const { session } = remote
  // https://electronjs.org/docs/api/web-request
  session.defaultSession.webRequest.onCompleted(details =>
    store.dispatch(handleResponse(details)),
  )
  return { type: PLUGIN_INIT }
}

export const removePlugin = () => {
  const { session } = remote
  session.defaultSession.webRequest.onCompleted(null)
  return { type: PLUGIN_REMOVE }
}

export const updatePluginConfig = (key, value) => {
  // https://github.com/poooi/poi/blob/master/lib/config.es
  config.set(`plugin.${PLUGIN_NAME}.${key}`, value)
  // onConfigChange
  return {
    type: CONFIG_CHANGE,
    path: key,
    value,
  }
}

/**
 * @param {{id: number, url: string, method: string, webContentsId: number, resourceType: string, timestamp: number, uploadData: object}} event
 */
export const handleResponse = details => {
  const action = {
    type: RESPONSE,
    details,
    notice: false,
  }
  // https://github.com/kcwikizh/poi-plugin-subtitle/commit/b6e1db23527c4b1c7d5188afa758c86d59e0501b
  // https://github.com/kcwikizh/poi-plugin-subtitle/commit/ad4ea716315ce026cc5d300bac0ec74a76c3885f
  if (
    getStore('layout.webview.ref') &&
    getStore('layout.webview.ref').isReady() &&
    details.webContentsId !== getStore('layout.webview.ref').getWebContents().id
  ) {
    return action
  }
  const match = details.url.includes(BATTLE_END_AUDIO)
  if (!match) {
    return action
  }
  if (!needNotification()) {
    return action
  }
  DBG.log('notice at battle end')
  notify(__('Battle end'))
  return {
    ...action,
    notice: true,
    noticeType: 'Battle end',
  }
}
