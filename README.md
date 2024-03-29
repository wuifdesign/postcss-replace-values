# postcss-replace-values

![npm](https://img.shields.io/npm/v/postcss-replace-values)
![GitHub issues](https://img.shields.io/github/issues/wuifdesign/postcss-replace-values)
![GitHub Workflow Status (with event)](https://img.shields.io/github/actions/workflow/status/wuifdesign/postcss-replace-values/lint-and-test.yml)

## Install

```
npm install --save postcss postcss-replace-values
```

## Upgrade from v2 to v3

You now need to install `postcss` as a dependency in your project. This allows to update this on your own.

## Simple Usage

```js
const postcss = require('postcss');
const replaceValuesPlugin = require('postcss-replace-values');

postcss()
  .use(replaceValuesPlugin({ 
    values: {
      '#000': '#a00'
    }
  }))
```

Input CSS:

```css
body {
  color: #000;
}
```

Output CSS:

```css
body {
  color: #a00;
}
```

## Regex Usage

Only if the `selector` is matching the regex, the value will be replaced.

```js
const postcss = require('postcss');
const replaceValuesPlugin = require('postcss-replace-values');

postcss()
  .use(replaceValuesPlugin({ 
    values: {
      '#000': { value: '#a00', selector: /btn/ }
    }
  }))
```

Input CSS:

```css
body {
  color: #000;
}
.btn {
  color: #000;
}
```

Output CSS:

```css
body {
  color: #000;
}
.btn {
  color: #a00;
}
```

## License

MIT
