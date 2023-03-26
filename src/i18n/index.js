import Vue from 'vue'
import VueI18n from 'vue-i18n'
import { en } from './en.js'
import { zh_cn } from './zh_cn.js'

Vue.use(VueI18n);

const i18nConfig = {
  en: en,
  'zh-CN': zh_cn,
}

const i18n = new VueI18n({
  locale: 'en',
  messages: i18nConfig,
});

export default i18n