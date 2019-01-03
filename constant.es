/* global dbg, i18n */
import { name as pluginName, bugs } from './package'

export default {
  PLUGIN_NAME: pluginName,
  __: i18n[pluginName].fixedT,
  // https://github.com/poooi/poi/blob/master/lib/debug.es
  DBG: dbg.extra(pluginName),
  BATTLE_END_AUDIO: 'kcs2/resources/se/217.mp3',
  FEEDBACK_URL: bugs.url,
}
