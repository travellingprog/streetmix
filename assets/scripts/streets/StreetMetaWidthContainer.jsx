import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { useIntl } from 'react-intl'
import StreetMetaWidthLabel from './StreetMetaWidthLabel'
import StreetMetaWidthMenu from './StreetMetaWidthMenu'

import {
  MIN_CUSTOM_STREET_WIDTH,
  MAX_CUSTOM_STREET_WIDTH,
  STREET_WIDTH_CUSTOM,
  STREET_WIDTH_SWITCH_TO_METRIC,
  STREET_WIDTH_SWITCH_TO_IMPERIAL
} from './constants'

import { SETTINGS_UNITS_IMPERIAL, SETTINGS_UNITS_METRIC } from '../users/constants'
import { updateUnits } from '../users/localization'
import { normalizeStreetWidth } from './width'
import { processWidthInput, prettifyWidth } from '../util/width_units'
import { updateStreetWidthAction as updateStreetWidth } from '../store/actions/street'

const StreetMetaWidthContainer = (props) => {
  const [isEditing, setEditing] = useState(false)
  const intl = useIntl()

  /**
   * When the street width label is clicked, only allow editing if street
   * width is not read-only
   */
  const handleClickLabel = (event) => {
    if (props.editable) {
      setEditing(true)
    }
  }

  /**
   * Handles changes to the <select> dropdown rendered in <StreetMetaWidthMenu />
   *
   * @param {string} - value from selected <option>
   */
  const handleChangeMenuSelection = (value) => {
    setEditing(false)

    const { units, width, occupiedWidth } = props.street
    const selection = Number.parseInt(value, 10)

    switch (selection) {
      case STREET_WIDTH_SWITCH_TO_METRIC:
        updateUnits(SETTINGS_UNITS_METRIC)
        break
      case STREET_WIDTH_SWITCH_TO_IMPERIAL:
        updateUnits(SETTINGS_UNITS_IMPERIAL)
        break
      // Prompt for new street width
      case STREET_WIDTH_CUSTOM: {
        const promptValue = normalizeStreetWidth(occupiedWidth, units)
        const promptString = intl.formatMessage({
          id: 'prompt.new-width',
          defaultMessage: 'New street width (from {minWidth} to {maxWidth}):'
        }, {
          minWidth: prettifyWidth(MIN_CUSTOM_STREET_WIDTH, units),
          maxWidth: prettifyWidth(MAX_CUSTOM_STREET_WIDTH, units)
        })
        const inputWidth = window.prompt(promptString, prettifyWidth(promptValue, units))

        if (inputWidth) {
          const newWidth = normalizeStreetWidth(processWidthInput(inputWidth, units), units)
          props.updateStreetWidth(newWidth)
        }

        break
      }
      // Do nothing if the selection is the original width
      case width:
        break
      // Change width to the desired selection
      default:
        if (selection) {
          props.updateStreetWidth(selection)
        }
        break
    }
  }

  return (
    <span className="street-metadata-width">
      {
        (isEditing)
          ? (
            <StreetMetaWidthMenu
              street={props.street}
              onChange={handleChangeMenuSelection}
            />
          )
          : (
            <StreetMetaWidthLabel
              street={props.street}
              editable={props.editable}
              onClick={handleClickLabel}
            />
          )
      }
    </span>
  )
}

StreetMetaWidthContainer.propTypes = {
  // from Redux mapStateToProps
  editable: PropTypes.bool,
  street: PropTypes.object.isRequired,

  // from Redux mapDispatchToProps
  updateStreetWidth: PropTypes.func.isRequired
}

StreetMetaWidthContainer.defaultProps = {
  editable: true
}

function mapStateToProps (state) {
  return {
    street: state.street,
    editable: !state.app.readOnly && state.flags.EDIT_STREET_WIDTH.value
  }
}

const mapDispatchToProps = {
  updateStreetWidth
}

export default connect(mapStateToProps, mapDispatchToProps)(StreetMetaWidthContainer)
