import { i18n, TOptions } from 'i18next';
import * as _i18next from 'i18next';
import { observable, action } from 'mobx';

import { isServer , isFunction,mixin, isExternalUrl, loadFetch, parseLanguageHeader, parseLanguageHeaderCookie} from "./tools"

const i18next = (_i18next as unknown as i18n)

interface I18nProxy {
    changeLanguage: Function;
    currentLanguage: string;
    t: Function;
    addResourceBundle(lng: string, ns: string, resources: any):I18nProxy;
    hasResourceBundle(lng: string, ns: string):boolean;
    on(event: string, listener: (...args: any[]) => void): void;
}

interface I18NextExtendsProxy extends i18n {
    currentLanguage: string;
    i18nMap: Record<string, Record<string, string>>;
    
}

interface ProcessI18NextProxy extends NodeJS.Process {
  I18NextProxy?: { severLanguage: string };
}

interface I18NextHeaders {
  'accept-language'?: string;
  cookie?: string;
}

export class I18NextMobxProxy<T=i18n>{
    target: T|I18nProxy;
  
    i18nMap: Record<string, Record<string, string>> = {};
  
    @observable
    currentLanguage: string = '';
  
    @action
    changeLanguage = async (lng: string, ns: string = 'translation') => {
      if (!(this.target as i18n).hasResourceBundle(lng, ns)) {
        const data = await loadLanguage(lng);
        (this.target as i18n).addResourceBundle(lng, ns, data);
      }
      await (this.target as I18nProxy).changeLanguage(lng);
      this.currentLanguage = lng;
    }

    t = (
      key: string | string[],
      defaultValue?: string | undefined,
      options?:
        | string
        | TOptions<{
            returnDetails: true;
            returnObjects: true;
          }>
        | undefined,
    ) => {
      const keyIdx = Array.isArray(key) ? key.join('=') : key;
      this.i18nMap[this.currentLanguage] ||= {};
      this.i18nMap[this.currentLanguage][keyIdx] ||= (this.target as I18nProxy).t(key, defaultValue, options) 

      return this.i18nMap[this.currentLanguage][keyIdx] ?? key;
    }

    constructor(target: T|I18nProxy,setup?:Function) {
      this.target = target;
      isFunction(setup)&&setup.bind(this)(target);
      mixin(this, this.target as object);
    }
}

const i18nProxy = new I18NextMobxProxy<i18n>(i18next,defaultSetup) as unknown as I18NextExtendsProxy;

const loadLanguage = async (lng: string) => {
  let _loadPath:string ="/locales/{{lng}}.json";
  const  optionsLoadPath = i18next.options?.backend&&(i18next.options.backend as any).addPath

  if(optionsLoadPath){
    isFunction(optionsLoadPath)?( _loadPath = optionsLoadPath(lng,"translation")):(_loadPath = optionsLoadPath);
  }
 
 return  await loadFetch(_loadPath.replace(/\{\{lng\}\}/gi,lng));
};

const loadServerLanguage = (lng: string,ns:string="translation") => {
  return new Promise(resolve => {
    let _loadPath:string ="locales/{{lng}}.json";
    const  optionsLoadPath = i18next.options?.backend&&(i18next.options.backend as any).addPath

    if(optionsLoadPath){
      isFunction(optionsLoadPath)?( _loadPath = optionsLoadPath(lng,"translation")):(_loadPath = optionsLoadPath);
    }
     _loadPath = _loadPath.replace(/\{\{lng\}\}/gi,lng)

    if(isExternalUrl(_loadPath)){
      loadFetch(_loadPath).then((data)=>{
        i18nProxy.addResourceBundle(lng, ns, data ||{});
        i18next.changeLanguage(lng);
        i18nProxy.currentLanguage = lng;
        resolve(lng);
      })
    }else{
      try {
        const { readFileSync } = require('fs');
        const path = require('path');
        const data = readFileSync(
          path.join(process.cwd(), 'public', _loadPath.replace(/\{\{lng\}\}/gi,lng)),
          'utf-8',
        );
        i18nProxy.addResourceBundle(lng, ns, JSON.parse(data || '{}'));
      } catch (error) {}
      i18next.changeLanguage(lng);
      i18nProxy.currentLanguage = lng;
      resolve(lng);
    }
  });
};

function defaultSetup(){
  if (!isServer()) {
    i18next.on("languageChanged", function (lng: string) {
      if (!i18next.hasResourceBundle(lng, 'translation')) {
        loadLanguage(lng).then(data => {
          i18next.addResourceBundle(lng, 'translation', data);
        });
        i18next.off('languageChanged');
      }
    });
  }
}

function parseLanguage(headersData: I18NextHeaders) {
  const languages = parseLanguageHeader(
    headersData['accept-language'] || 'zh-CN,zh;q=0.9',
  );
  const cookieLanguage = parseLanguageHeaderCookie(
    headersData.cookie,
  );

  return cookieLanguage || languages[0];
}

function setI18nConfiguration(HeadersData?: I18NextHeaders) {
  if (HeadersData) {
    (process as ProcessI18NextProxy).I18NextProxy = {
      severLanguage: parseLanguage(HeadersData),
    };
  }
}

export function getSeverLanguage() {
  return (process as ProcessI18NextProxy).I18NextProxy?.severLanguage;
}

export const withNextServerI18n = (nextAppComponent: {
  ({ Component, pageProps });
  getInitialProps?: any;
}) => {
  if (nextAppComponent.getInitialProps) {
    nextAppComponent.getInitialProps = (function (_getInitialProps: {
      apply: (
        arg0: {
          ({ Component, pageProps });
          getInitialProps?: any;
        },
        arg1: IArguments,
      ) => void;
    }) {
      return function () {
        const HeadersData = arguments[0].ctx.req?.headers;
        setI18nConfiguration(HeadersData);
        const arg = arguments;
        const lng = getSeverLanguage();

        return new Promise(resolve => {
          loadServerLanguage(lng);
          resolve(_getInitialProps.apply(nextAppComponent, arg));
        });
      };
    })(nextAppComponent.getInitialProps);
  } else {
    nextAppComponent.getInitialProps = async ({
      Component,
      ctx,
    }) => {
      const HeadersData = ctx.req?.headers;
      setI18nConfiguration(HeadersData);
      const lng = getSeverLanguage();
      await loadServerLanguage(lng);
      let pageProps = {};
      if (Component.getInitialProps) {
        pageProps = await Component.getInitialProps(ctx);
      }
      return { pageProps };
    };
  }
  return nextAppComponent;
};

export const t = function (
  key: string | string[],
  defaultValue?: string | undefined,
  options?:
    | string
    | TOptions<{
        returnDetails: true;
        returnObjects: true;
      }>
    | undefined,
) {
  return i18nProxy.t(key, defaultValue, options);
};

export const changeLanguage = i18nProxy.changeLanguage;

export const currentLanguage = i18nProxy.currentLanguage;

export default i18nProxy;