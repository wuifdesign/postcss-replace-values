import { conv } from './lib/color-shorthand-hex-to-six-digit'
import { AcceptedPlugin } from 'postcss'

const replaceAll = require('string.prototype.replaceall');

export type ReplaceValuesOptions = {
  values: { [key: string]: string | { value: string, selector: RegExp } }
  replaceCssVariables?: boolean
}

const plugin = (options: ReplaceValuesOptions): AcceptedPlugin => {
  if (!options || !options.values) {
    throw new Error('Required options is missing')
  }
  const replaceCssVariables = typeof options.replaceCssVariables === 'undefined' ? true : options.replaceCssVariables
  const replaceColors = options.values
  const replaceColorsKeys = Object.keys(options.values)

  const checkMatching = (replaceValue: string, search: string) => {
    if (search.slice(0, 2) === '--') {
      return replaceValue === search || replaceValue.indexOf(`${search.replace(' ', '')})`) !== -1
    }
    return replaceValue.indexOf(search) !== -1
  }
  return {
    postcssPlugin: 'replace-values',
    Declaration(decl) {
      replaceColorsKeys.some((checkColor) => {
        let search = checkColor
        let replaceValue = decl.value
        if (/^#([0-9A-F]{3,4}){1,2}$/i.test(search)) {
          search = conv(search)
          replaceValue = conv(replaceValue)
        }
        if (checkMatching(replaceValue, search)) {
          if (!replaceCssVariables && decl.prop.slice(0, 2) === '--') {
            return
          }
          let value = replaceColors[checkColor]
          if (typeof value !== 'string') {
            const selector = (decl.parent as any).selector
            if (!new RegExp(value.selector).test(selector)) {
              return
            }
            value = value.value
          }
          decl.value = replaceAll(replaceValue, search, value)
        }
      })
    }
  }
}

export default plugin
