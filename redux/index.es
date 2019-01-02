/* global config */
import { get } from 'lodash'
import { createSelector } from 'reselect'

// https://github.com/poooi/poi/blob/master/views/utils/selectors.es
import { configSelector, extensionSelectorFactory } from 'views/utils/selectors'

import { PLUGIN_NAME } from '../constant'

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

const initState = {
  inBattle: false,
}

// Reducer
export function reducer(state = initState, action, store) {
  const { type } = action
  switch (type) {
    case '@@Response/kcsapi/api_req_practice/battle':
    case '@@Response/kcsapi/api_req_sortie/battle':
      return {
        ...state,
        inBattle: true,
      }
    case '@@Response/kcsapi/api_req_practice/battle_result':
    case '@@Response/kcsapi/api_req_sortie/battleresult':
      return {
        ...state,
        inBattle: false,
      }
    default: {
      return state
    }
  }
}

// Action Creators
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

export const initPlugin = () => ({ type: PLUGIN_INIT })
export const removePlugin = () => ({ type: PLUGIN_REMOVE })
