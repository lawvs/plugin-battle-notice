import React from 'react'
import PropTypes from 'prop-types'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { withNamespaces } from 'react-i18next'
import { Switch } from '@blueprintjs/core'

import { Wrapper } from 'views/components/settings/components/section'

import { pluginConfigSelector, updatePluginConfig } from '../redux'
import { PLUGIN_NAME } from '../constant'

const Settings = props => {
  const { t } = props
  return (
    <>
      <Wrapper>
        <Switch
          checked={props.noticeOnlyBackground}
          onChange={() =>
            props.updatePluginConfig(
              'noticeOnlyBackground',
              !props.noticeOnlyBackground,
            )
          }
        >
          {t('Notice only background')}
        </Switch>
        <Switch
          checked={props.noticeOnlyMuted}
          onChange={() =>
            props.updatePluginConfig('noticeOnlyMuted', !props.noticeOnlyMuted)
          }
        >
          {t('Notice only muted')}
        </Switch>
      </Wrapper>
    </>
  )
}

Settings.propTypes = {
  t: PropTypes.func.isRequired,
  noticeOnlyBackground: PropTypes.bool.isRequired,
  noticeOnlyMuted: PropTypes.bool.isRequired,
}

const mapStateToProps = (state, ownProps) => pluginConfigSelector(state)

const mapDispatchToProps = (dispatch, ownProps) => ({
  updatePluginConfig: (key, value) => dispatch(updatePluginConfig(key, value)),
})

export default compose(
  withNamespaces(PLUGIN_NAME),
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(Settings)
