module.exports = {
  downloadFinished,
  init,
  setBadge,
  setMenu
}

const { app, Menu } = require('electron')

const dialog = require('./dialog')
const log = require('./log')
const { t } = require('./i18n')

let menu = null

/**
 * Add a right-click menu to the dock icon. (Mac)
 */
function init () {
  if (process.platform !== 'darwin') return
  menu = Menu.buildFromTemplate(getMenuTemplate())
  app.dock.setMenu(menu)
}

/**
 * Bounce the Downloads stack if `path` is inside the Downloads folder. (Mac)
 */
function downloadFinished (path) {
  if (!app.dock) return
  log(`downloadFinished: ${path}`)
  app.dock.downloadFinished(path)
}

/**
 * Display a counter badge for the app. (Mac, Linux)
 */
function setBadge (count) {
  if (process.platform === 'darwin' ||
      (process.platform === 'linux' && app.isUnityRunning())) {
    log(`setBadge: ${count}`)
    app.badgeCount = Number(count)
  }
}

function setMenu (enabled) {
  if (process.platform !== 'darwin') return
  if (enabled) {
    app.dock.setMenu(menu)
  } else {
    app.dock.setMenu(null)
  }
}

function getMenuTemplate () {
  return [
    {
      label: t('dock.createNewTorrent'),
      accelerator: 'CmdOrCtrl+N',
      click: () => dialog.openSeedDirectory()
    },
    {
      label: t('dock.openTorrentFile'),
      accelerator: 'CmdOrCtrl+O',
      click: () => dialog.openTorrentFile()
    },
    {
      label: t('dock.openTorrentAddress'),
      accelerator: 'CmdOrCtrl+U',
      click: () => dialog.openTorrentAddress()
    }
  ]
}
