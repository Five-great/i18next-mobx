# i18next-mobx
**i18next mobx状态管理方案**  
 通过 [`mobx`](https://github.com/mobxjs/mobx) 去代理管理 [`i18next`](http://github.com/i18next)

 你的程序 如果是采用 **Mobx** 来做 状态管理 那么 用 **i18next-mobx** 来实现国际化就是不错的选择



[![release candidate](https://img.shields.io/npm/v/i18next-mobx.svg)](https://www.npmjs.com/package/i18next-mobx)&nbsp;
[![i18next Version](https://img.shields.io/badge/i18next-=>20.0.6-green.svg)](http://github.com/i18next)&nbsp; 
[![Mobx Version](https://img.shields.io/badge/mobx-=>5.x.x-green.svg)](https://github.com/mobxjs/mobx)&nbsp; 
[![GitHub license](https://img.shields.io/github/license/five-great/i18next-mobx.svg)](https://github.com/five-great/i18next-mobx/blob/main/LICENSE)&nbsp;

## Demo 

[React Demo](https://codesandbox.io/embed/i18next-mobx-react-demo-99bs5y?fontsize=14&hidenavigation=1&theme=dark&view=preview)

## 下载

```sh
npm i i18next-mobx 或 yarn add i18next-mobx
```

## 引入与使用

使用方式，配置和插件扩展等 基本与 [`i18next`](http://github.com/i18next) 保持一致, 详情配置[可点击前往i18next官网查看](https://www.i18next.com/overview/getting-started#basic-sample)

```js
import i18NextMobx from "i18next-mobx";

i18NextMobx.init({
  lng: 'zh-CN',
  debug: true,
  resources: {
    en: {
      translation: {
        "key": "hello world"
      }
    }
  }
});
//已初始化并准备就绪！
//i18nMobx已经初始化，因为转换资源是通过init函数传递的
document.getElementById('output').innerHTML = i18nMobx.t('key');
```
### 使用扩展插件

```js
import i18NextMobx from "i18next-mobx";
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"

i18NextMobx
 .use(LanguageDetector)
 .use(initReactI18next)
 .init({
  lng: 'zh-CN',
  debug: true,
  resources: {
    en: {
      translation: {
        "key": "hello world"
      }
    }
  }
});
//已初始化并准备就绪！
//i18nMobx已经初始化，因为转换资源是通过init函数传递的
document.getElementById('output').innerHTML = i18nMobx.t('key');
```

### 组件中使用

#### 函数式组件

✨(**推荐使用**)引入 `i18next-mobx` 后的使用方法

```js
import { t } from 'i18next-mobx';

export const MyComponent = observer(function () {
  return <p>{t('my translated text')}</p>
})
```
同时也兼容已有[Hooks](https://react.i18next.com/latest/usetranslation-hook) 方案

```js
import { useTranslation } from 'react-i18next';

export const MyComponent = function() {
  const { t, i18n } = useTranslation();
  // or const [t, i18n] = useTranslation();
  return <p>{t('my translated text')}</p>
}
```

#### Class(类)组件

✨(**推荐使用**)引入 `i18next-mobx` 后的使用方法

```js
import React from 'react';
import {observer} from "mobx-react";
import { t } from 'i18next-mobx';

@observer
export class MyComponent extends React.Component {
    render() {
        return (<p>{t('my translated text')}</p>)
    }
};

```

同时也兼容已有的[Hoc](https://react.i18next.com/latest/withtranslation-hoc)方案

```js
import React from 'react';
import { withTranslation } from 'react-i18next';

class MyComponent extends React.Component {

  render() {
	const { t } = this.props;
	return (<p>{t('my translated text')}</p>);
  }
}

export default withTranslation()(MyComponent);
```