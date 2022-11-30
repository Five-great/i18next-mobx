import i18nProxy from '../src/index'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

const zhCN = require('./locales/zh-CN.json')
const en = require('./locales/en-US.json')



describe('init', () => {
    test('init', async() => {
        await i18nProxy.init({
            lng: 'zh-CN',
            debug: false,
            fallbackLng: ['zh-CN', 'en-US'],
            resources: {
                'zh-CN': {
                    translation: zhCN,
                },
                'en-US': {
                    translation: en,
                },
            },
        })
        expect(i18nProxy.t('test')).toBe('一个 i18nxet mobx状态管理方案')
    })
    test('changeLanguage en-US', async() => {
        await i18nProxy.init({
            lng: 'zh-CN',
            debug: false,
            fallbackLng: ['zh-CN', 'en-US'],
            resources: {
                'zh-CN': {
                    translation: zhCN,
                },
                'en-US': {
                    translation: en,
                },
            },
        })
        await i18nProxy.changeLanguage('en-US')
        expect(i18nProxy.t('test')).toBe('A management scheme for i18nxet mobx')
    })

    test('changeLanguage currentLanguage change en-US', async() => {
        await i18nProxy.init({
            lng: 'zh-CN',
            debug: false,
            fallbackLng: ['zh-CN', 'en-US'],
            resources: {
                'zh-CN': {
                    translation: zhCN,
                },
                'en-US': {
                    translation: en,
                },
            },
        })
        await i18nProxy.changeLanguage('en-US')
        expect(i18nProxy.currentLanguage).toBe('en-US')
    })
})

