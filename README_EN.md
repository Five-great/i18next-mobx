# i18next-mobx
**I18next mobx state management scheme**  

 Use [`mobx`](https://github.com/mobxjs/mobx) to manage [`i18next`](http://github.com/i18next)



[![release candidate](https://img.shields.io/npm/v/i18next-mobx.svg)](https://www.npmjs.com/package/i18next-mobx)&nbsp;
[![i18next Version](https://img.shields.io/badge/i18next-=>20.0.6-green.svg)](http://github.com/i18next)&nbsp; 
[![Mobx Version](https://img.shields.io/badge/mobx-=>5.x.x-green.svg)](https://github.com/mobxjs/mobx)&nbsp; 
[![GitHub license](https://img.shields.io/github/license/i18next-mobx.svg)](https://github.com/five-great/i18next-mobx/blob/main/LICENSE)&nbsp;



## Download

```sh
npm i i18next-mobx 或 yarn add i18next-mobx
```

## Introduction and use

使用方式，配置和插件扩展等 基本与 [`i18next`](http://github.com/i18next) 保持一致, 详情配置[可点击前往i18next官网查看](https://www.i18next.com/overview/getting-started#basic-sample)

The usage mode, configuration and plug-in extension are basically consistent with [`i18next`](http://github.com/i18next).  to the Click to go [`official website for details`](https://www.i18next.com/overview/getting-started#basic-sample) 

```js
import i18NextMobx from "i18next-mobx";

i18NextMobx.init({
  lng: 'en', // if you're using a language detector, do not define the lng option
  debug: true,
  resources: {
    en: {
      translation: {
        "key": "hello world"
      }
    }
  }
});
// initialized and ready to go!
// i18nMobx is already initialized, because the translation resources where passed via init function
document.getElementById('output').innerHTML = i18nMobx.t('key');
```
### Using Extensions

```js
import i18NextMobx from "i18next-mobx";
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"

i18NextMobx
 .use(LanguageDetector)
 .use(initReactI18next)
  .init({
  lng: 'en', // if you're using a language detector, do not define the lng option
  debug: true,
  resources: {
    en: {
      translation: {
        "key": "hello world"
      }
    }
  }
});
// initialized and ready to go!
// i18nMobx is already initialized, because the translation resources where passed via init function
document.getElementById('output').innerHTML = i18nMobx.t('key');
```
