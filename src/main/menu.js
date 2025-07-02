const { app, Menu, ipcMain } = require('electron')

const config = require('../config')
const windows = require('./windows')
const { t, setLocale } = require('./i18n')
const appConfig = require('application-config')('WebTorrent')

let menu = null

// 监听渲染进程语言切换事件
ipcMain.on('set-locale', (event, locale) => {
  setLocale(locale)
  init() // 重新设置菜单
})

// 读取已保存语言并设置
appConfig.read().then(config => {
  if (config && config.prefs && config.prefs.language) {
    setLocale(config.prefs.language)
  }
  init() // 初始化菜单
})

module.exports = {
  init,
  togglePlaybackControls,
  setWindowFocus,
  setAllowNav,
  onPlayerUpdate,
  onToggleAlwaysOnTop,
  onToggleFullScreen
}

function init () {
  menu = Menu.buildFromTemplate(getMenuTemplate())
  Menu.setApplicationMenu(menu)
}

function togglePlaybackControls (flag) {
  getMenuItem(t('menu.playPause')).enabled = flag
  getMenuItem(t('menu.skipNext')).enabled = flag
  getMenuItem(t('menu.skipPrevious')).enabled = flag
  getMenuItem(t('menu.increaseVolume')).enabled = flag
  getMenuItem(t('menu.decreaseVolume')).enabled = flag
  getMenuItem(t('menu.stepForward')).enabled = flag
  getMenuItem(t('menu.stepBackward')).enabled = flag
  getMenuItem(t('menu.increaseSpeed')).enabled = flag
  getMenuItem(t('menu.decreaseSpeed')).enabled = flag
  getMenuItem(t('menu.addSubtitlesFile')).enabled = flag

  if (flag === false) {
    getMenuItem(t('menu.skipNext')).enabled = false
    getMenuItem(t('menu.skipPrevious')).enabled = false
  }
}

function onPlayerUpdate (hasNext, hasPrevious) {
  getMenuItem(t('menu.skipNext')).enabled = hasNext
  getMenuItem(t('menu.skipPrevious')).enabled = hasPrevious
}

function setWindowFocus (flag) {
  getMenuItem(t('menu.fullScreen')).enabled = flag
  getMenuItem(t('menu.floatOnTop')).enabled = flag
}

// Disallow opening more screens on top of the current one.
function setAllowNav (flag) {
  getMenuItem(t('menu.preferences')).enabled = flag
  if (process.platform === 'darwin') {
    getMenuItem(t('menu.createNewTorrent')).enabled = flag
  } else {
    getMenuItem(t('menu.createNewTorrentFromFolder')).enabled = flag
    getMenuItem(t('menu.createNewTorrentFromFile')).enabled = flag
  }
}

function onToggleAlwaysOnTop (flag) {
  getMenuItem(t('menu.floatOnTop')).checked = flag
}

function onToggleFullScreen (flag) {
  getMenuItem(t('menu.fullScreen')).checked = flag
}

function getMenuItem (label) {
  for (const menuItem of menu.items) {
    const submenuItem = menuItem.submenu.items.find(item => item.label === label)
    if (submenuItem) return submenuItem
  }
  return {}
}

function getMenuTemplate () {
  const template = [
    {
      label: t('menu.file'),
      submenu: [
        {
          label: process.platform === 'darwin'
            ? t('menu.createNewTorrent')
            : t('menu.createNewTorrentFromFolder'),
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            const dialog = require('./dialog')
            dialog.openSeedDirectory()
          }
        },
        {
          label: t('menu.openTorrentFile'),
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            const dialog = require('./dialog')
            dialog.openTorrentFile()
          }
        },
        {
          label: t('menu.openTorrentAddress'),
          accelerator: 'CmdOrCtrl+U',
          click: () => {
            const dialog = require('./dialog')
            dialog.openTorrentAddress()
          }
        },
        {
          type: 'separator'
        },
        {
          label: t('menu.close'),
          accelerator: process.platform === 'darwin' ? 'Cmd+W' : 'Ctrl+W',
          click: () => {
            const { BrowserWindow } = require('electron')
            const focusedWindow = BrowserWindow.getFocusedWindow()
            if (focusedWindow) focusedWindow.close()
          }
        }
      ]
    },
    {
      label: t('menu.edit'),
      submenu: [
        {
          label: t('menu.undo'),
          role: 'undo'
        },
        {
          label: t('menu.redo'),
          role: 'redo'
        },
        {
          type: 'separator'
        },
        {
          label: t('menu.cut'),
          role: 'cut'
        },
        {
          label: t('menu.copy'),
          role: 'copy'
        },
        {
          label: t('menu.pasteTorrentAddress'),
          role: 'paste'
        },
        {
          label: t('menu.delete'),
          role: 'delete'
        },
        {
          label: t('menu.selectAll'),
          role: 'selectall'
        }
      ]
    },
    {
      label: t('menu.view'),
      submenu: [
        {
          label: t('menu.fullScreen'),
          type: 'checkbox',
          accelerator: process.platform === 'darwin'
            ? 'Ctrl+Command+F'
            : 'F11',
          click: () => windows.main.toggleFullScreen()
        },
        {
          label: t('menu.floatOnTop'),
          type: 'checkbox',
          click: () => windows.main.toggleAlwaysOnTop()
        },
        {
          type: 'separator'
        },
        {
          label: t('menu.goBack'),
          accelerator: 'Esc',
          click: () => windows.main.dispatch('escapeBack')
        },
        {
          type: 'separator'
        },
        {
          label: t('menu.developer'),
          submenu: [
            {
              label: t('menu.developerTools'),
              accelerator: process.platform === 'darwin'
                ? 'Alt+Command+I'
                : 'Ctrl+Shift+I',
              click: () => windows.main.toggleDevTools()
            },
            {
              label: t('menu.showWebTorrentProcess'),
              accelerator: process.platform === 'darwin'
                ? 'Alt+Command+P'
                : 'Ctrl+Shift+P',
              click: () => windows.webtorrent.toggleDevTools()
            }
          ]
        }
      ]
    },
    {
      label: t('menu.playback'),
      submenu: [
        {
          label: t('menu.playPause'),
          accelerator: 'Space',
          click: () => windows.main.dispatch('playPause'),
          enabled: false
        },
        {
          type: 'separator'
        },
        {
          label: t('menu.skipNext'),
          accelerator: 'N',
          click: () => windows.main.dispatch('nextTrack'),
          enabled: false
        },
        {
          label: t('menu.skipPrevious'),
          accelerator: 'P',
          click: () => windows.main.dispatch('previousTrack'),
          enabled: false
        },
        {
          type: 'separator'
        },
        {
          label: t('menu.increaseVolume'),
          accelerator: 'CmdOrCtrl+Up',
          click: () => windows.main.dispatch('changeVolume', 0.1),
          enabled: false
        },
        {
          label: t('menu.decreaseVolume'),
          accelerator: 'CmdOrCtrl+Down',
          click: () => windows.main.dispatch('changeVolume', -0.1),
          enabled: false
        },
        {
          type: 'separator'
        },
        {
          label: t('menu.stepForward'),
          accelerator: process.platform === 'darwin'
            ? 'CmdOrCtrl+Alt+Right'
            : 'Alt+Right',
          click: () => windows.main.dispatch('skip', 10),
          enabled: false
        },
        {
          label: t('menu.stepBackward'),
          accelerator: process.platform === 'darwin'
            ? 'CmdOrCtrl+Alt+Left'
            : 'Alt+Left',
          click: () => windows.main.dispatch('skip', -10),
          enabled: false
        },
        {
          type: 'separator'
        },
        {
          label: t('menu.increaseSpeed'),
          accelerator: 'CmdOrCtrl+=',
          click: () => windows.main.dispatch('changePlaybackRate', 1),
          enabled: false
        },
        {
          label: t('menu.decreaseSpeed'),
          accelerator: 'CmdOrCtrl+-',
          click: () => windows.main.dispatch('changePlaybackRate', -1),
          enabled: false
        },
        {
          type: 'separator'
        },
        {
          label: t('menu.addSubtitlesFile'),
          click: () => windows.main.dispatch('openSubtitles'),
          enabled: false
        }
      ]
    },
    {
      label: t('menu.transfers'),
      submenu: [
        {
          label: t('menu.pauseAll'),
          click: () => windows.main.dispatch('pauseAllTorrents')
        },
        {
          label: t('menu.resumeAll'),
          click: () => windows.main.dispatch('resumeAllTorrents')
        },
        {
          label: t('menu.removeAllFromList'),
          click: () => windows.main.dispatch('confirmDeleteAllTorrents', false)
        },
        {
          label: t('menu.removeAllDataFiles'),
          click: () => windows.main.dispatch('confirmDeleteAllTorrents', true)
        }
      ]
    },
    {
      label: t('menu.help'),
      role: 'help',
      submenu: [
        {
          label: t('menu.learnMore', { appName: config.APP_NAME }),
          click: () => {
            const shell = require('./shell')
            shell.openExternal(config.HOME_PAGE_URL)
          }
        },
        {
          label: t('menu.releaseNotes'),
          click: () => {
            const shell = require('./shell')
            shell.openExternal(config.GITHUB_URL_RELEASES)
          }
        },
        {
          label: t('menu.contributeOnGitHub'),
          click: () => {
            const shell = require('./shell')
            shell.openExternal(config.GITHUB_URL)
          }
        },
        {
          type: 'separator'
        },
        {
          label: t('menu.reportAnIssue'),
          click: () => {
            const shell = require('./shell')
            shell.openExternal(config.GITHUB_URL_ISSUES)
          }
        },
        {
          label: t('menu.followUsOnTwitter'),
          click: () => {
            const shell = require('./shell')
            shell.openExternal(config.TWITTER_PAGE_URL)
          }
        }
      ]
    }
  ]

  if (process.platform === 'darwin') {
    // WebTorrent menu (Mac)
    template.unshift({
      label: config.APP_NAME,
      submenu: [
        {
          role: 'about'
        },
        {
          type: 'separator'
        },
        {
          label: t('menu.preferences'),
          accelerator: 'Cmd+,',
          click: () => windows.main.dispatch('preferences')
        },
        {
          type: 'separator'
        },
        {
          role: 'services'
        },
        {
          type: 'separator'
        },
        {
          role: 'hide'
        },
        {
          role: 'hideothers'
        },
        {
          role: 'unhide'
        },
        {
          type: 'separator'
        },
        {
          role: 'quit'
        }
      ]
    })

    // Edit menu (Mac)
    template[2].submenu.push(
      {
        type: 'separator'
      },
      {
        label: t('menu.speech'),
        submenu: [
          {
            role: 'startspeaking'
          },
          {
            role: 'stopspeaking'
          }
        ]
      }
    )

    // Window menu (Mac)
    template.splice(6, 0, {
      role: 'window',
      submenu: [
        {
          role: 'minimize'
        },
        {
          type: 'separator'
        },
        {
          role: 'front'
        }
      ]
    })
  }

  // On Windows and Linux, open dialogs do not support selecting both files and
  // folders and files, so add an extra menu item so there is one for each type.
  if (process.platform === 'linux' || process.platform === 'win32') {
    // File menu (Windows, Linux)
    template[0].submenu.unshift({
      label: t('menu.createNewTorrentFromFile'),
      click: () => {
        const dialog = require('./dialog')
        dialog.openSeedFile()
      }
    })

    // Edit menu (Windows, Linux)
    template[1].submenu.push(
      {
        type: 'separator'
      },
      {
        label: t('menu.preferences'),
        accelerator: 'CmdOrCtrl+,',
        click: () => windows.main.dispatch('preferences')
      })

    // Help menu (Windows, Linux)
    template[5].submenu.push(
      {
        type: 'separator'
      },
      {
        label: t('menu.about', { appName: config.APP_NAME }),
        click: () => windows.about.init()
      }
    )
  }
  // Add "File > Quit" menu item so Linux distros where the system tray icon is
  // missing will have a way to quit the app.
  if (process.platform === 'linux') {
    // File menu (Linux)
    template[0].submenu.push({
      label: t('menu.quit'),
      click: () => app.quit()
    })
  }

  return template
}
