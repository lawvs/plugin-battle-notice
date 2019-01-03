/* global dispatch */
import { initPlugin, removePlugin } from './redux'

export const pluginDidLoad = () => dispatch(initPlugin())
export const pluginWillUnload = () => dispatch(removePlugin())
export { reducer } from './redux'
export { default as settingsClass } from './settings'
