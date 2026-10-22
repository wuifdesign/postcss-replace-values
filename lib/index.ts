import { hexVariants, isHex } from './utils/hex'
import type { Declaration, PluginCreator, Rule } from 'postcss'

export type ReplaceValue = string | { value: string, selector?: RegExp | string }

export type ReplaceValuesOptions = {
  values: Record<string, ReplaceValue>
  replaceCssVariables?: boolean
  ignoreCase?: boolean
}

type Replacement = {
  index: number
  pattern: string
  value: string
  selector?: RegExp
}

// strings and url() are skipped, so `content: "#000"` and `url(icons.svg#fab)` stay as they are
const quoted = String.raw`"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'`
const protectedPattern = String.raw`${quoted}|\b[uU][rR][lL]\(\s*(?:(?:${quoted})\s*|[^)]*)\)`

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// match letters in any case without the `i` flag, which would apply to every key
const anyCase = (pattern: string) => pattern.replace(/\p{L}/gu, (char) => {
  const lower = char.toLowerCase()
  const upper = char.toUpperCase()
  // skip letters without a single character counterpart, e.g. `ß` -> `SS`
  return lower === upper || [...lower].length !== 1 || [...upper].length !== 1 ? char : `(?:${lower}|${upper})`
})

const toSelectorRegex = (selector: RegExp | string) => typeof selector === 'string'
  ? new RegExp(selector)
  // drop stateful flags, the regex is reused for every declaration
  : new RegExp(selector.source, selector.flags.replace(/[gy]/g, ''))

const optionError = (message: string) => new Error(`postcss-replace-values: ${message}`)

// the options often come from a plain JS config without type checks
const validateValue = (key: string, target: unknown): void => {
  if (key === '') {
    throw optionError('the keys of "values" must not be empty')
  }
  if (typeof target === 'string') {
    return
  }
  if (typeof target !== 'object' || target === null || typeof (target as { value?: unknown }).value !== 'string') {
    throw optionError(`the replacement for "${key}" must be a string or { value: string, selector?: RegExp | string }`)
  }
  const selector = (target as { selector?: unknown }).selector
  if (selector !== undefined && typeof selector !== 'string' && !(selector instanceof RegExp)) {
    throw optionError(`the selector for "${key}" must be a RegExp or a string`)
  }
}

const plugin: PluginCreator<ReplaceValuesOptions> = (options) => {
  if (!options || typeof options.values !== 'object' || options.values === null) {
    throw optionError('the "values" option is required')
  }
  for (const [key, target] of Object.entries(options.values)) {
    validateValue(key, target)
  }
  const replaceCssVariables = options.replaceCssVariables ?? true
  const ignoreCase = options.ignoreCase ?? false

  const replacements: Replacement[] = Object.entries(options.values).map(([key, target], index) => ({
    index,
    // hex colors match in short and long form and in any case
    pattern: isHex(key)
      ? hexVariants(key).map(anyCase).join('|')
      : ignoreCase ? anyCase(escapeRegex(key)) : escapeRegex(key),
    value: typeof target === 'string' ? target : target.value,
    selector: typeof target === 'string' || target.selector === undefined ? undefined : toSelectorRegex(target.selector),
  }))

  // one regex per set of replacements that apply to a selector, all keys are replaced in a single pass
  const matchers = new Map<string, { regex: RegExp, replacements: Replacement[] }>()
  const getMatcher = (selector: string | undefined) => {
    const applicable = replacements.filter((replacement) => !replacement.selector
      || (selector !== undefined && replacement.selector.test(selector)))
    if (applicable.length === 0) {
      return undefined
    }
    const cacheKey = applicable.map((replacement) => replacement.index).join()
    let matcher = matchers.get(cacheKey)
    if (!matcher) {
      const keys = applicable.map((replacement) => `(${replacement.pattern})`).join('|')
      matcher = {
        // match whole tokens only, so `red` does not touch `darkred` and `--foo` does not touch `--foobar`
        regex: new RegExp(`(?<![\\p{L}\\p{N}_.-])(?:${keys})(?![\\p{L}\\p{N}_.-])|${protectedPattern}`, 'gu'),
        replacements: applicable,
      }
      matchers.set(cacheKey, matcher)
    }
    return matcher
  }

  // PostCSS revisits changed declarations, remember our own result to not replace it again
  const processed = new WeakMap<Declaration, string>()

  return {
    postcssPlugin: 'replace-values',
    Declaration(decl) {
      if (processed.get(decl) === decl.value) {
        return
      }
      if (!replaceCssVariables && decl.prop.startsWith('--')) {
        return
      }
      const selector = decl.parent?.type === 'rule' ? (decl.parent as Rule).selector : undefined
      const matcher = getMatcher(selector)
      if (!matcher) {
        return
      }
      const value = decl.value.replace(matcher.regex, (match: string, ...groups: unknown[]) => {
        const index = groups.slice(0, matcher.replacements.length).findIndex((group) => group !== undefined)
        // no key matched: a string or url() that is kept as it is
        return index === -1 ? match : matcher.replacements[index].value
      })
      if (value !== decl.value) {
        decl.value = value
      }
      processed.set(decl, decl.value)
    }
  }
}

plugin.postcss = true

export default plugin
