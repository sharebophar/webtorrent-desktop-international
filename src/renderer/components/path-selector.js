const path = require('path')

const colors = require('material-ui/styles/colors')
const remote = require('@electron/remote')
const React = require('react')
const PropTypes = require('prop-types')
const { t } = require('../lib/i18n')

const RaisedButton = require('material-ui/RaisedButton').default
const TextField = require('material-ui/TextField').default

// Lets you pick a file or directory.
// Uses the system Open File dialog.
// You can't edit the text field directly.
class PathSelector extends React.Component {
  static propTypes () {
    return {
      className: PropTypes.string,
      dialog: PropTypes.object.isRequired,
      id: PropTypes.string,
      onChange: PropTypes.func.isRequired,
      title: PropTypes.string.isRequired,
      value: PropTypes.string
    }
  }

  constructor (props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick () {
    const { dialog, onChange } = this.props
    const { remote } = require('electron')

    remote.dialog.showOpenDialog(remote.getCurrentWindow(), dialog)
      .then((result) => {
        if (!result.canceled && result.filePaths.length > 0) {
          onChange(result.filePaths[0])
        }
      })
      .catch((err) => {
        console.error(err)
      })
  }

  render () {
    const id = this.props.title.replace(' ', '-').toLowerCase()
    const wrapperStyle = {
      alignItems: 'center',
      display: 'flex',
      width: '100%'
    }
    const labelStyle = {
      flex: '0 auto',
      marginRight: 10,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
    const textareaStyle = {
      color: colors.grey50
    }
    const textFieldStyle = {
      flex: '1'
    }
    const text = this.props.value || ''
    const buttonStyle = {
      marginLeft: 10
    }

    return (
      <div className={this.props.className} style={wrapperStyle}>
        <div className='label' style={labelStyle}>
          {this.props.title}:
        </div>
        <TextField
          className='control' disabled id={id} value={text}
          inputStyle={textareaStyle} style={textFieldStyle}
        />
        <RaisedButton
          className='control' label={t('pathSelector.change')} onClick={this.handleClick}
          style={buttonStyle}
        />
      </div>
    )
  }
}

module.exports = PathSelector
