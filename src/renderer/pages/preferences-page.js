const React = require('react')
const PropTypes = require('prop-types')
const electron = window.require ? window.require('electron') : null

const colors = require('material-ui/styles/colors')
const Checkbox = require('material-ui/Checkbox').default
const RaisedButton = require('material-ui/RaisedButton').default
const TextField = require('material-ui/TextField').default
const SelectField = require('material-ui/SelectField').default
const MenuItem = require('material-ui/MenuItem').default
const Heading = require('../components/heading')
const PathSelector = require('../components/path-selector')

const { dispatch } = require('../lib/dispatcher')
const config = require('../../config')
const { t, setLocale, getLocale, getAvailableLocales } = require('../lib/i18n')

class PreferencesPage extends React.Component {
  constructor (props) {
    super(props)

    this.handleDownloadPathChange =
      this.handleDownloadPathChange.bind(this)

    this.handleOpenExternalPlayerChange =
      this.handleOpenExternalPlayerChange.bind(this)

    this.handleExternalPlayerPathChange =
      this.handleExternalPlayerPathChange.bind(this)

    this.handleStartupChange =
      this.handleStartupChange.bind(this)

    this.handleSoundNotificationsChange =
      this.handleSoundNotificationsChange.bind(this)

    this.handleSetGlobalTrackers =
      this.handleSetGlobalTrackers.bind(this)

    this.handleLanguageChange =
      this.handleLanguageChange.bind(this)

    const globalTrackers = this.props.state.getGlobalTrackers().join('\n')

    this.state = {
      globalTrackers,
      currentLocale: getLocale()
    }
  }

  downloadPathSelector () {
    return (
      <Preference>
        <PathSelector
          dialog={{
            title: t('preferences.selectDownloadDirectory'),
            properties: ['openDirectory']
          }}
          onChange={this.handleDownloadPathChange}
          title={t('preferences.downloadLocation')}
          value={this.props.state.saved.prefs.downloadPath}
        />
      </Preference>
    )
  }

  handleDownloadPathChange (filePath) {
    dispatch('updatePreferences', 'downloadPath', filePath)
  }

  openExternalPlayerCheckbox () {
    return (
      <Preference>
        <Checkbox
          className='control'
          checked={!this.props.state.saved.prefs.openExternalPlayer}
          label={t('preferences.playTorrentMediaFiles')}
          onCheck={this.handleOpenExternalPlayerChange}
        />
      </Preference>
    )
  }

  handleOpenExternalPlayerChange (e, isChecked) {
    dispatch('updatePreferences', 'openExternalPlayer', !isChecked)
  }

  highestPlaybackPriorityCheckbox () {
    return (
      <Preference>
        <Checkbox
          className='control'
          checked={this.props.state.saved.prefs.highestPlaybackPriority}
          label={t('preferences.highestPlaybackPriority')}
          onCheck={this.handleHighestPlaybackPriorityChange}
        />
        <p>{t('preferences.highestPlaybackPriorityDesc')}</p>
      </Preference>
    )
  }

  handleHighestPlaybackPriorityChange (e, isChecked) {
    dispatch('updatePreferences', 'highestPlaybackPriority', isChecked)
  }

  externalPlayerPathSelector () {
    const playerPath = this.props.state.saved.prefs.externalPlayerPath
    const playerName = this.props.state.getExternalPlayerName()

    const description = this.props.state.saved.prefs.openExternalPlayer
      ? t('preferences.externalPlayerDesc', { playerName })
      : t('preferences.externalPlayerDescAlt', { playerName })

    return (
      <Preference>
        <p>{description}</p>
        <PathSelector
          dialog={{
            title: t('preferences.selectMediaPlayerApp'),
            properties: ['openFile']
          }}
          onChange={this.handleExternalPlayerPathChange}
          title={t('preferences.externalPlayer')}
          value={playerPath}
        />
      </Preference>
    )
  }

  handleExternalPlayerPathChange (filePath) {
    dispatch('updatePreferences', 'externalPlayerPath', filePath)
  }

  autoAddTorrentsCheckbox () {
    return (
      <Preference>
        <Checkbox
          className='control'
          checked={this.props.state.saved.prefs.autoAddTorrents}
          label={t('preferences.watchForNewTorrents')}
          onCheck={(e, value) => { this.handleAutoAddTorrentsChange(e, value) }}
        />
      </Preference>
    )
  }

  handleAutoAddTorrentsChange (e, isChecked) {
    const torrentsFolderPath = this.props.state.saved.prefs.torrentsFolderPath
    if (isChecked && !torrentsFolderPath) {
      alert(t('preferences.selectTorrentsFolderFirst')) // eslint-disable-line
      e.preventDefault()
      return
    }

    dispatch('updatePreferences', 'autoAddTorrents', isChecked)

    if (isChecked) {
      dispatch('startFolderWatcher')
      return
    }

    dispatch('stopFolderWatcher')
  }

  torrentsFolderPathSelector () {
    const torrentsFolderPath = this.props.state.saved.prefs.torrentsFolderPath

    return (
      <Preference>
        <PathSelector
          dialog={{
            title: t('preferences.selectFolderToWatch'),
            properties: ['openDirectory']
          }}
          onChange={this.handleTorrentsFolderPathChange}
          title={t('preferences.folderToWatch')}
          value={torrentsFolderPath}
        />
      </Preference>
    )
  }

  handleTorrentsFolderPathChange (filePath) {
    dispatch('updatePreferences', 'torrentsFolderPath', filePath)
  }

  setDefaultAppButton () {
    const isFileHandler = this.props.state.saved.prefs.isFileHandler
    if (isFileHandler) {
      return (
        <Preference>
          <p>{t('preferences.defaultAppHooray')}</p>
        </Preference>
      )
    }
    return (
      <Preference>
        <p>{t('preferences.defaultAppNotSet')}</p>
        <RaisedButton
          className='control'
          onClick={this.handleSetDefaultApp}
          label={t('preferences.makeDefault')}
        />
      </Preference>
    )
  }

  handleStartupChange (e, isChecked) {
    dispatch('updatePreferences', 'startup', isChecked)
  }

  setStartupCheckbox () {
    if (config.IS_PORTABLE) {
      return
    }

    return (
      <Preference>
        <Checkbox
          className='control'
          checked={this.props.state.saved.prefs.startup}
          label='Open WebTorrent on startup'
          onCheck={this.handleStartupChange}
        />
      </Preference>
    )
  }

  soundNotificationsCheckbox () {
    return (
      <Preference>
        <Checkbox
          className='control'
          checked={this.props.state.saved.prefs.soundNotifications}
          label='Enable sounds'
          onCheck={this.handleSoundNotificationsChange}
        />
      </Preference>
    )
  }

  handleSoundNotificationsChange (e, isChecked) {
    dispatch('updatePreferences', 'soundNotifications', isChecked)
  }

  handleSetDefaultApp () {
    dispatch('updatePreferences', 'isFileHandler', true)
  }

  setGlobalTrackers () {
    // Align the text fields
    const textFieldStyle = { width: '100%' }
    const textareaStyle = { margin: 0 }

    return (
      <Preference>
        <TextField
          className='torrent-trackers control'
          style={textFieldStyle}
          textareaStyle={textareaStyle}
          multiLine
          rows={2}
          rowsMax={10}
          value={this.state.globalTrackers}
          onChange={this.handleSetGlobalTrackers}
        />
      </Preference>
    )
  }

  handleSetGlobalTrackers (e, globalTrackers) {
    this.setState({ globalTrackers })

    const announceList = globalTrackers
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s !== '')

    dispatch('updatePreferences', 'globalTrackers', announceList)
    dispatch('updateGlobalTrackers', announceList)
  }

  handleLanguageChange (event, index, value) {
    this.setState({ currentLocale: value })
    setLocale(value)
    dispatch('updatePreferences', 'language', value)
    if (electron && electron.ipcRenderer) {
      electron.ipcRenderer.send('set-locale', value)
    }
    window.location.reload()
  }

  languageSelector () {
    const locales = getAvailableLocales()
    const localeNames = {
      'en': 'English',
      'zh': '中文'
    }

    return (
      <Preference>
        <SelectField
          className='control'
          value={this.state.currentLocale}
          onChange={this.handleLanguageChange}
          floatingLabelText={t('preferences.language')}
          style={{ width: '100%' }}
        >
          {locales.map(locale => (
            <MenuItem
              key={locale}
              value={locale}
              primaryText={localeNames[locale] || locale}
            />
          ))}
        </SelectField>
      </Preference>
    )
  }

  render () {
    const style = {
      color: colors.grey400,
      marginLeft: 25,
      marginRight: 25
    }
    return (
      <div style={style}>
        <PreferencesSection title={t('preferences.language')}>
          {this.languageSelector()}
        </PreferencesSection>
        <PreferencesSection title={t('preferences.folders')}>
          {this.downloadPathSelector()}
          {this.autoAddTorrentsCheckbox()}
          {this.torrentsFolderPathSelector()}
        </PreferencesSection>
        <PreferencesSection title={t('preferences.playback')}>
          {this.openExternalPlayerCheckbox()}
          {this.externalPlayerPathSelector()}
          {this.highestPlaybackPriorityCheckbox()}
        </PreferencesSection>
        <PreferencesSection title={t('preferences.defaultTorrentApp')}>
          {this.setDefaultAppButton()}
        </PreferencesSection>
        <PreferencesSection title={t('preferences.general')}>
          {this.setStartupCheckbox()}
          {this.soundNotificationsCheckbox()}
        </PreferencesSection>
        <PreferencesSection title={t('preferences.trackers')}>
          {this.setGlobalTrackers()}
        </PreferencesSection>
      </div>
    )
  }
}

class PreferencesSection extends React.Component {
  static get propTypes () {
    return {
      title: PropTypes.string
    }
  }

  render () {
    const style = {
      marginBottom: 25,
      marginTop: 25
    }
    return (
      <div style={style}>
        <Heading level={2}>{this.props.title}</Heading>
        {this.props.children}
      </div>
    )
  }
}

class Preference extends React.Component {
  render () {
    const style = { marginBottom: 10 }
    return (<div style={style}>{this.props.children}</div>)
  }
}

module.exports = PreferencesPage
