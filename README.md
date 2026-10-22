# postcss-replace-values

[![npm](https://img.shields.io/npm/v/postcss-replace-values)](https://www.npmjs.com/package/postcss-replace-values)
[![Tests](https://github.com/wuifdesign/postcss-replace-values/actions/workflows/lint-and-test.yml/badge.svg)](https://github.com/wuifdesign/postcss-replace-values/actions/workflows/lint-and-test.yml)
[![license](https://img.shields.io/npm/l/postcss-replace-values)](https://github.com/wuifdesign/postcss-replace-values/blob/main/package.json)

[PostCSS] plugin to replace values in your CSS declarations: colors, CSS variables or any other string.

- Hex colors match in short and long form: `#000` also matches `#000000`, `#ffee` also matches `#ffffeeee`
- CSS variables are matched as a whole: `--foo` does not touch `var(--foobar)`
- Values are matched as whole tokens: `red` does not touch `darkred`
- Strings and `url()` are left untouched: `url(icons.svg#fab)` keeps its fragment
- All keys are replaced in a single pass, so values can be swapped
- Replacements can be limited to rules whose selector matches a RegExp

```css
/* Input */
.btn {
  color: #000;
  border: 1px solid #000000;
}

/* Output with { values: { '#000': '#a00' } } */
.btn {
  color: #a00;
  border: 1px solid #a00;
}
```

[PostCSS]: https://github.com/postcss/postcss

## Install

```sh
npm install --save-dev postcss postcss-replace-values
```

`postcss` (`^8.0.0`) is a peer dependency, so you control its version. Requires Node.js 22 or newer.

## Usage

With a `postcss.config.js`:

```js
module.exports = {
  plugins: {
    'postcss-replace-values': {
      values: {
        '#000': '#a00',
      },
    },
  },
}
```

With the PostCSS API (ESM and CommonJS are both supported):

```js
import postcss from 'postcss'
import replaceValues from 'postcss-replace-values'
// or: const replaceValues = require('postcss-replace-values')

const result = await postcss([
  replaceValues({
    values: {
      '#000': '#a00',
    },
  }),
]).process(css, { from: undefined })
```

## Options

| Option                | Default  | Description                                                                                                   |
|-----------------------|----------|---------------------------------------------------------------------------------------------------------------|
| `values`              | required | Object of search values and their replacement: a string or `{ value: string, selector?: RegExp \| string }`. |
| `replaceCssVariables` | `true`   | Set to `false` to leave custom property declarations (`--foo: …`) untouched.                                  |
| `ignoreCase`          | `false`  | Set to `true` to match keys that are no hex color in any case, e.g. `Arial` also matches `arial`.             |

Invalid options, like an empty key or a replacement without `value`, throw an error when the plugin is created.

TypeScript types are included, the options type is exported as `ReplaceValuesOptions`.

### Colors

Hex keys match their short and long form in any case, so the notation in your CSS does not matter. A key does not match part of a longer color: `#000` does not touch `#000fff`.

```js
replaceValues({
  values: {
    '#000': '#a00',  // matches #000 and #000000
    '#ffee': '#a00', // matches #ffee and #ffffeeee
  },
})
```

### CSS variables

Replace a whole `var()` or only the variable name, also inside functions:

```js
replaceValues({
  values: {
    'var(--replace-me)': '#a00', // color: var(--replace-me)       -> color: #a00
    '--color': '--brand',        // color: rgba(var(--color), 0.9) -> color: rgba(var(--brand), 0.9)
  },
})
```

Only values are replaced, the property name of a custom property declaration (`--color: …`) stays the same.

To replace values everywhere except in custom property declarations, set `replaceCssVariables: false`:

```js
replaceValues({
  values: { '#000': '#a00' },
  replaceCssVariables: false,
})
```

```css
/* Input */
:root { --primary: #000; }
.btn { color: #000; }

/* Output */
:root { --primary: #000; }
.btn { color: #a00; }
```

### Limit to selectors

Pass an object with a `selector` RegExp (or a string, which is turned into one) to replace a value only inside matching rules. Declarations outside of rules, like inside `@font-face`, are skipped:

```js
replaceValues({
  values: {
    '#000': { value: '#a00', selector: /btn/ },
  },
})
```

```css
/* Input */
body { color: #000; }
.btn { color: #000; }

/* Output */
body { color: #000; }
.btn { color: #a00; }
```

### Any other value

Keys that are no color or CSS variable are replaced wherever they appear in a value. They are case-sensitive unless `ignoreCase` is set, which works for all letters with a single upper and lower case form (`ä` matches `Ä`, but `ß` does not match `SS`):

```js
replaceValues({
  values: { 'Arial': 'Helvetica' }, // font-family: Arial, sans-serif -> font-family: Helvetica, sans-serif
})
```

### Strings and URLs

Values inside quoted strings and `url()` are not replaced, so `content: "#000"` and `url(icons.svg#fab)` stay as they are. To replace a whole string or URL, use it as the key, including the quotes:

```js
replaceValues({
  values: {
    '"Open Sans"': '"Inter"',       // font-family: "Open Sans", sans-serif -> font-family: "Inter", sans-serif
    'url(old.png)': 'url(new.png)',
  },
})
```

### Swapping values

All keys are replaced in a single pass and a replacement is never replaced again, so values can be swapped:

```js
replaceValues({
  values: { '#000': '#fff', '#fff': '#000' }, // linear-gradient(#000, #fff) -> linear-gradient(#fff, #000)
})
```

When two keys match at the same position, the first one wins.

## Upgrading

### v3 to v4

- The package ships ESM and CommonJS builds. `require('postcss-replace-values')` returns the plugin directly, remove `.default` if you used it.
- Node.js 22 or newer is required.
- Values inside quoted strings and `url()` are no longer replaced. Use the whole string or URL as the key to replace it.
- Keys are replaced in a single pass instead of one after another: `{ '#000': '#a00', '#a00': '#0a0' }` now turns `#000` into `#a00` instead of `#0a0`.
- Other hex colors in a changed declaration keep their notation instead of being written in their long, lowercase form.
- Error messages are prefixed with `postcss-replace-values:`.

### v2 to v3

`postcss` is now a peer dependency, install it in your project next to this plugin.

## License

MIT
