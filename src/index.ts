import { i18n, TOptions } from 'i18next';
import * as _i18next from 'i18next';
import { observable, action} from 'mobx';

import { isServer , isFunction,mixin,loadFetch} from "./tools"

 const i18next = (_i18next.default as unknown as i18n)||(_i18next as unknown as i18n)

interface I18nProxy {
    changeLanguage: Function;
    currentLanguage: string;
    init: Function;
    t: Function;
    addResourceBundle(lng: string, ns: string, resources: any):I18nProxy;
    hasResourceBundle(lng: string, ns: string):boolean;
    on(event: string, listener: (...args: any[]) => void): void;
}

interface I18NextExtendsProxy extends i18n {
    currentLanguage: string;
    changeCurrentLanguage: Function;
    i18nMap: Record<string, Record<string, string>>;
    
}

export class I18NextMobxProxy<T=i18n>{
    target: T|I18nProxy;
  
    i18nMap: Record<string, Record<string, string>> = {};
  
    @observable
    currentLanguage: string = '';

    @action 
    changeCurrentLanguage=(lng: string) => {
      if(globalThis.document)document.documentElement.lang = lng;
      this.currentLanguage = lng;
    }

    @action
    changeLanguage = async (lng: string, ns: string = 'translation') => {
      if (!(this.target as i18n).hasResourceBundle(lng, ns)) {
        const data = await loadLanguage(lng);
        (this.target as i18n).addResourceBundle(lng, ns, data);
      }
      await (this.target as I18nProxy).changeLanguage(lng);
      this.changeCurrentLanguage(i18next.language);
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


function defaultSetup(){
  if (!isServer()) {
    i18next.on("languageChanged", function(lng: string) {
       if(lng !== i18nProxy.currentLanguage) {
              if(!i18next.hasResourceBundle(lng,"translation")){
                  loadLanguage(lng).then(data=>{
                      i18next.addResourceBundle(lng, 'translation', data)
                      i18next.changeLanguage(lng).then(()=>{
                        i18nProxy.changeCurrentLanguage(i18next.language) 
                      })
                  })
                  
              }else{
                  i18nProxy.changeCurrentLanguage(lng) 
              }
          }
    });
  }
}

export {
  isServer,
  i18next,
}

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