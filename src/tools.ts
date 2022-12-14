import * as https from 'https'
import * as http from 'http'

export const isServer = () => typeof window === 'undefined'

export const isFunction = (value) => Object.prototype.toString.call(value) === '[object Function]'

export const isExternalUrl = (value) => /^(https?:){0,1}\/\/\S/.test(value.trim())

export const loadFetch = async (value) => await fetch(value.trim()).then((res) => res.json())

export const loadExternalLanguage = (value) =>
    new Promise((resolve) => {
        let protocol = new URL(value).protocol == 'https:' ? https : http
        protocol
            .get(value, (res) => {
                let list = []
                res.on('data', (chunk) => {
                    list.push(chunk)
                })
                res.on('end', () => {
                    let data = {}
                    try {
                        data = JSON.parse(Buffer.concat(list).toString())
                    } catch (error) {
                        console.error('language path does not exist')
                    }
                    resolve(data)
                })
            })
            .on('error', (err) => {
                console.log('Error: ', err.message)
            })
    })

export function mixin(target: object, sources: object) {
    for (const key of Object.getOwnPropertyNames(sources || {})) {
        if (!target[key]) {
            target[key] = sources[key]
        }
    }
}

function parseCookie(cookie: string) {
    let pattern = /([^=]+)=([^;]+);?\s*/g,
        result: string[],
        value: Record<string, string> = {}
    while ((result = pattern.exec(cookie)) != null) {
        value[result[1]] = result[2]
    }
    return value
}

export const parseLanguageHeaderCookie = (value: string, name: string = 'i18next') => {
    let result = parseCookie(value)
    return result[name] ? result[name] : ''
}

export const parseLanguageHeader = (value: string) =>
    value
        .split(',')
        .map((language) => {
            const [name, quantity = ''] = language.split(';')
            const [_, value = '1'] = quantity.split('=')

            return [name.trim(), +value] as const
        })
        .sort(([_, a], [__, b]) => b - a)
        .map(([name]) => name)
