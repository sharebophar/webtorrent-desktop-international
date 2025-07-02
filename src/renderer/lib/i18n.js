const fs = require('fs')
const path = require('path')
const State = require('./state')

let savedLang = 'en'
try {
  // 兼容首次启动和已保存配置
  const appConfig = require('application-config')('WebTorrent')
  const saved = appConfig.readSync ? appConfig.readSync() : null
  if (saved && saved.prefs && saved.prefs.language) {
    savedLang = saved.prefs.language
  }
} catch (e) {}

class I18n {
  constructor () {
    this.currentLocale = 'en'
    this.translations = {}
    this.loadTranslations()
  }

  // 加载语言文件
  loadTranslations () {
    // 用require直接引入，兼容webpack/electron渲染进程
    this.translations['en'] = require('../../../static/locales/en.json')
    this.translations['zh'] = require('../../../static/locales/zh.json')
  }

  // 设置当前语言
  setLocale (locale) {
    if (this.translations[locale]) {
      this.currentLocale = locale
      return true
    }
    return false
  }

  // 获取当前语言
  getLocale () {
    return this.currentLocale
  }

  // 获取翻译文本
  t (key, params = {}) {
    const keys = key.split('.')
    let value = this.translations[this.currentLocale]
    
    // 遍历嵌套键
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        // 如果当前语言没有找到，回退到英文
        value = this.translations['en']
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey]
          } else {
            return key // 如果连英文都没有，返回原始键
          }
        }
        break
      }
    }

    // 如果找到的是字符串，进行参数替换
    if (typeof value === 'string') {
      return this.interpolate(value, params)
    }

    return key
  }

  // 参数插值
  interpolate (text, params) {
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key] !== undefined ? params[key] : match
    })
  }

  // 获取所有可用语言
  getAvailableLocales () {
    return Object.keys(this.translations)
  }

  // 检查语言是否可用
  isLocaleAvailable (locale) {
    return locale in this.translations
  }
}

// 创建单例实例
const i18n = new I18n()

// 导出便捷函数
module.exports = {
  t: (key, params) => i18n.t(key, params),
  setLocale: (locale) => i18n.setLocale(locale),
  getLocale: () => i18n.getLocale(),
  getAvailableLocales: () => i18n.getAvailableLocales(),
  isLocaleAvailable: (locale) => i18n.isLocaleAvailable(locale),
  i18n // 导出实例以便高级用法
} 