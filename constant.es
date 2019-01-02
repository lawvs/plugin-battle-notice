/* global dbg */
import { name as pluginName } from './package'

export default {
  PLUGIN_NAME: pluginName,
  // https://github.com/poooi/poi/blob/master/lib/debug.es
  DBG: dbg.extra(pluginName),
  TARGET_AUDIO: 'kcs2/resources/se/217.mp3',
}
