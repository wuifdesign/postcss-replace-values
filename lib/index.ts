import * as postcss from 'postcss';
import { conv } from "./lib/color-shorthand-hex-to-six-digit";
const replaceAll = require('string.prototype.replaceall');

export type ReplaceValuesOptions = {
  values: { [key: string]: string | { value: string, selector: RegExp } }
  replaceCssVariables?: boolean
}

// @ts-ignore
export = postcss.plugin('replace-values', (options: ReplaceValuesOptions) => {
  if (!options || !options.values) {
    throw new Error('Required options is missing');
  }
  const replaceCssVariables = typeof options.replaceCssVariables === 'undefined' ? true : options.replaceCssVariables;
  const replaceColors = options.values;
  const replaceColorsKeys = Object.keys(options.values);

  return (root) => {
    root.walkDecls((decl) => {
      replaceColorsKeys.some((checkColor) => {
        var search = checkColor;
        var replaceValue = decl.value;
        if (/^#([0-9A-F]{3}){1,2}$/i.test(search)) {
          search = conv(search);
          replaceValue = conv(replaceValue);
        }
        if (replaceValue.indexOf(search) !== -1) {
          if (!replaceCssVariables && decl.prop.slice(0, 2) === '--') {
            return;
          }
          let value = replaceColors[checkColor];
          if (typeof value !== 'string') {
            const selector = (decl.parent as any).selector;
            if (!new RegExp(value.selector).test(selector)) {
              return;
            }
            value = value.value;
          }
          decl.value = replaceAll(replaceValue, search, value);
        }
      });
    });
  };
});
