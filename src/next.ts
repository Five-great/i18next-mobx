import { i18next, changeLanguage } from './index'
import {
    isExternalUrl,
    isFunction,
    isServer,
    loadExternalLanguage,
    parseLanguageHeader,
    parseLanguageHeaderCookie,
} from './tools'

interface ProcessI18NextProxy extends NodeJS.Process {
    I18NextProxy?: { severLanguage: string }
}

interface I18NextHeaders {
    'accept-language'?: string
    cookie?: string
}

function parseLanguage(headersData: I18NextHeaders) {
    const languages = parseLanguageHeader(headersData['accept-language'] || 'zh-CN,zh;q=0.9')
    const cookieLanguage = parseLanguageHeaderCookie(headersData.cookie)

    return cookieLanguage || languages[0]
}
const loadServerLanguageData = (lng: string, ns: string = 'translation') => {
    return new Promise((resolve) => {
        let _loadPath: string = '/locales/{{lng}}.json'
        const optionsLoadPath = i18next.options?.backend && (i18next.options.backend as any).addPath

        if (optionsLoadPath) {
            isFunction(optionsLoadPath)
                ? (_loadPath = optionsLoadPath(lng, 'translation'))
                : (_loadPath = optionsLoadPath)
        }
        _loadPath = _loadPath.replace(/\{\{lng\}\}/gi, lng)
        if (isExternalUrl(_loadPath)) {
            loadExternalLanguage(_loadPath).then((data) => {
                resolve(data)
            })
        } else {
            let data = '{}'
            try {
                const { readFileSync } = require('fs')
                const path = require('path')
                data = readFileSync(path.join(process.cwd(), 'public', _loadPath), 'utf-8')
            } catch (error) {}
            resolve(JSON.parse(data))
        }
    })
}

export const loadServerLanguage = async (lng: string) => {
    if (lng && !i18next.hasResourceBundle(lng, 'translation')) {
        let data = await loadServerLanguageData(lng)
        i18next.addResourceBundle(lng, 'translation', data)
    }
    await changeLanguage(lng)
}
function setI18nConfiguration(HeadersData?: I18NextHeaders) {
    if (HeadersData) {
        ;(process as ProcessI18NextProxy).I18NextProxy = {
            severLanguage: parseLanguage(HeadersData),
        }
    }
}
export function getSeverLanguage() {
    return (process as ProcessI18NextProxy).I18NextProxy?.severLanguage
}

export const withNextI18NextMobxApp = (nextAppComponent: { ({ Component, pageProps }); getInitialProps?: any }) => {
    if (nextAppComponent.getInitialProps) {
        nextAppComponent.getInitialProps = (function (_getInitialProps: {
            apply: (
                arg0: {
                    ({ Component, pageProps })
                    getInitialProps?: any
                },
                arg1: IArguments,
            ) => void
        }) {
            return function () {
                const arg = arguments
                const HeadersData = arg[0].ctx.req?.headers
                setI18nConfiguration(HeadersData)
                arg[0].ctx.query.i18nextLanguage = i18next.options.lng || getSeverLanguage()

                return new Promise((resolve) => {
                    if (isServer()) {
                        loadServerLanguage(arg[0].ctx.query.i18nextLanguage || i18next.language).then(() => {
                            resolve(_getInitialProps.apply(nextAppComponent, arg))
                        })
                    } else {
                        resolve(_getInitialProps.apply(nextAppComponent, arg))
                    }
                })
            }
        })(nextAppComponent.getInitialProps)
    } else {
        nextAppComponent.getInitialProps = async ({ Component, ctx }) => {
            const HeadersData = ctx.req?.headers
            setI18nConfiguration(HeadersData)
            ctx.query.i18nextLanguage = i18next.options.lng || getSeverLanguage()
            if (isServer()) {
                await loadServerLanguage(ctx.query.i18nextLanguage || i18next.language)
            }
            let pageProps = {}
            if (Component.getInitialProps) {
                pageProps = await Component.getInitialProps(ctx)
            }
            return { pageProps }
        }
    }

    return nextAppComponent
}
