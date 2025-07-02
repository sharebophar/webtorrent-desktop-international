const about = module.exports = {
  init,
  win: null
}

const config = require('../../config')
const { BrowserWindow } = require('electron')
const { t } = require('../i18n')

function init () {
  if (about.win) {
    return about.win.show()
  }

  const win = about.win = new BrowserWindow({
    backgroundColor: '#ECECEC',
    center: true,
    fullscreen: false,
    height: 250,
    icon: getIconPath(),
    maximizable: false,
    minimizable: false,
    resizable: false,
    show: false,
    skipTaskbar: true,
    title: t('about.title', { appName: config.APP_WINDOW_TITLE }),
    useContentSize: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableBlinkFeatures: 'AudioVideoTracks',
      enableRemoteModule: true,
      backgroundThrottling: false
    },
    width: 300
  })
  require('@electron/remote/main').enable(win.webContents)

  win.loadURL(config.WINDOW_ABOUT)

  win.once('ready-to-show', () => {
    win.show()
    // No menu on the About window
    // Hack: BrowserWindow removeMenu method not working on electron@7
    // https://github.com/electron/electron/issues/21088
    win.setMenuBarVisibility(false)
  })

  win.once('closed', () => {
    about.win = null
  })
}

function getIconPath () {
  return process.platform === 'win32'
    ? config.APP_ICON + '.ico'
    : config.APP_ICON + '.png'
}
