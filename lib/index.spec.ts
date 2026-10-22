import { describe, expect, test } from 'vitest'
import postcss from 'postcss'
import replaceValuesPlugin, { ReplaceValuesOptions } from './index'

const cases: [string, string, ReplaceValuesOptions, string][] = [
  ['should replace color', 'div { color: #000; }', { values: { '#000': '#a00' } }, 'div { color: #a00; }'],
  ['should not replace part of color', 'div { color: #000fff; }', { values: { '#000': '#a00' } }, 'div { color: #000fff; }'],
  ['should replace css variable', 'div { color: var(--replace-me); }', { values: { 'var(--replace-me)': '#a00' } }, 'div { color: #a00; }'],
  ['should replace long hex with short hex', 'div { color: #000000; background: #000; invalid: #000aa; }', { values: { '#000': '#a00' } }, 'div { color: #a00; background: #a00; invalid: #000aa; }'],
  ['should replace short hex with long hex', 'div { color: #000000; background: #000; }', { values: { '#000000': '#a00' } }, 'div { color: #a00; background: #a00; }'],
  ['should replace color inside string', 'div { border: 1px solid #000; }', { values: { '#000': '#a00' } }, 'div { border: 1px solid #a00; }'],
  ['should replace multi colors inside string', 'div { box-shadow:inset 10px 10px 20px 10px #000, inset 10px -10px 20px 10px #000000 }', { values: { '#000': '#a00' } }, 'div { box-shadow:inset 10px 10px 20px 10px #a00, inset 10px -10px 20px 10px #a00 }'],
  ['should replace for selector regex', 'div { color: #000; } .btn { color: #000 }', { values: { '#000': { value: '#a00', selector: /btn/ } } }, 'div { color: #000; } .btn { color: #a00 }'],
  ['should not replace css variable', 'div { --primary: #000; } .btn { color: #000 }', { values: { '#000': '#a00' }, replaceCssVariables: false }, 'div { --primary: #000; } .btn { color: #a00 }'],
  ['should replace css variable value', 'div { --primary: var(--test); } .btn { color: var(--test) }', { values: { 'var(--test)': '#a00' } }, 'div { --primary: #a00; } .btn { color: #a00 }'],
  ['should not replace part of a css variable', 'div { color: var(--foobar); }', { values: { '--foo': '--boz', '--foobar': '--baz' } }, 'div { color: var(--baz); }'],
  ['should support 4 digit rgba', 'div { color: #ffeeff; } .btn { color: #ffffeeee; } .btn-2 { color: #ffee; }', { values: { '#ffee': '#a00' } }, 'div { color: #ffeeff; } .btn { color: #a00; } .btn-2 { color: #a00; }'],
  ['should support 8 digit rgba', 'div { color: #ffeeff; } .btn { color: #ffffeeee; } .btn-2 { color: #ffee; }', { values: { '#ffffeeee': '#a00' } }, 'div { color: #ffeeff; } .btn { color: #a00; } .btn-2 { color: #a00; }'],
  ['should support replacing variables within functions', 'div { color: rgba(var(--color), 0.9); }', { values: { '--color': '--foo' } }, 'div { color: rgba(var(--foo), 0.9); }'],
  ['should match uppercase hex', 'div { color: #FFF; }', { values: { '#fff': '#a00' } }, 'div { color: #a00; }'],
  ['should match with uppercase hex key', 'div { color: #ffffff; }', { values: { '#FFF': '#a00' } }, 'div { color: #a00; }'],
  ['should not change hex casing without match', 'div { color: #FFF; }', { values: { '#000': '#a00' } }, 'div { color: #FFF; }'],
  ['should not change other hex in changed declaration', 'div { background: #FFF linear-gradient(#000, #ABC); }', { values: { '#000': '#a00' } }, 'div { background: #FFF linear-gradient(#a00, #ABC); }'],
  ['should replace multiple keys in different declarations', 'div { border: 1px solid #000; outline: 2px dotted #fff; }', { values: { '#000': '#a00', '#fff': '#0a0' } }, 'div { border: 1px solid #a00; outline: 2px dotted #0a0; }'],
  ['should not chain replacements', 'div { color: #000; }', { values: { '#000': '#a00', '#a00': '#0a0' } }, 'div { color: #a00; }'],
  ['should swap values', 'div { background: #000; color: #fff; border: 1px solid #000 }', { values: { '#000': '#fff', '#fff': '#000' } }, 'div { background: #fff; color: #000; border: 1px solid #fff }'],
  ['should swap values in the same declaration', 'div { background: linear-gradient(#000, #fff); }', { values: { '#000': '#fff', '#fff': '#000' } }, 'div { background: linear-gradient(#fff, #000); }'],
  ['should replace plain values', 'div { font-family: Arial, sans-serif; }', { values: { 'Arial': 'Helvetica' } }, 'div { font-family: Helvetica, sans-serif; }'],
  ['should match plain values case sensitive', 'div { font-family: arial, sans-serif; }', { values: { 'Arial': 'Helvetica' } }, 'div { font-family: arial, sans-serif; }'],
  ['should match plain values case insensitive with ignoreCase', 'div { font-family: arial, ARIAL; }', { values: { 'Arial': 'Helvetica' }, ignoreCase: true }, 'div { font-family: Helvetica, Helvetica; }'],
  ['should not replace part of a word', 'div { color: darkred; }', { values: { 'red': 'blue' } }, 'div { color: darkred; }'],
  ['should not replace part of a number', 'div { margin: 1.5px 15px; }', { values: { '5px': '10px' } }, 'div { margin: 1.5px 15px; }'],
  ['should not replace start of 8 digit hex', 'div { color: #000000ff; }', { values: { '#000': '#a00' } }, 'div { color: #000000ff; }'],
  ['should replace css variable with fallback', 'div { color: var(--foo, red); }', { values: { '--foo': '--bar' } }, 'div { color: var(--bar, red); }'],
  ['should not replace part of a css variable in the same declaration', 'div { color: var(--foobar, var(--foo)); }', { values: { '--foo': '--bar' } }, 'div { color: var(--foobar, var(--bar)); }'],
  ['should not apply selector values outside of rules', '@font-face { font-family: Arial; }', { values: { 'Arial': { value: 'Helvetica', selector: /undefined/ } } }, '@font-face { font-family: Arial; }'],
  ['should replace for selector string', 'div { color: #000; } .btn { color: #000 }', { values: { '#000': { value: '#a00', selector: 'btn' } } }, 'div { color: #000; } .btn { color: #a00 }'],
  ['should replace for global selector regex', 'div { color: #000; } .btn { color: #000 } .btn-2 { color: #000 }', { values: { '#000': { value: '#a00', selector: /btn/g } } }, 'div { color: #000; } .btn { color: #a00 } .btn-2 { color: #a00 }'],
  ['should not replace again when the replacement contains the key', 'div { font-family: Arial; }', { values: { 'Arial': 'Arial Black' } }, 'div { font-family: Arial Black; }'],
  ['should insert replacement literally', 'div { content: a; }', { values: { 'a': '"$&$&"' } }, 'div { content: "$&$&"; }'],
  ['should not touch url fragments', 'div { background: #000 url(icons.svg#fab); }', { values: { '#000': '#a00', '#fab': '#a00' } }, 'div { background: #a00 url(icons.svg#fab); }'],
  ['should not touch quoted urls', 'div { background: url("#000") #000, URL( \'a.png#000\' ); }', { values: { '#000': '#a00' } }, 'div { background: url("#000") #a00, URL( \'a.png#000\' ); }'],
  ['should not touch strings', 'div { content: "#000 \\" #000" \'#000\' #000; }', { values: { '#000': '#a00' } }, 'div { content: "#000 \\" #000" \'#000\' #a00; }'],
  ['should replace a whole quoted key', 'div { font-family: "Open Sans", Open Sans; }', { values: { '"Open Sans"': '"Inter"' } }, 'div { font-family: "Inter", Open Sans; }'],
  ['should replace a whole url key', 'div { background: url(a.png); }', { values: { 'url(a.png)': 'url(b.png)' } }, 'div { background: url(b.png); }'],
  ['should replace everywhere without selector', 'div { color: #000; }', { values: { '#000': { value: '#a00' } } }, 'div { color: #a00; }'],
  ['should match non ascii letters case insensitive with ignoreCase', 'div { font-family: ÄBC, äbc; }', { values: { 'äbc': 'x' }, ignoreCase: true }, 'div { font-family: x, x; }'],
  ['should match letters without single case counterpart as they are', 'div { font-family: Straße, STRASSE; }', { values: { 'straße': 'x' }, ignoreCase: true }, 'div { font-family: x, STRASSE; }'],
  ['should not replace part of a non ascii word', 'div { font-family: Brot, Schwarzbrot, Grünbrot; }', { values: { 'brot': 'x' }, ignoreCase: true }, 'div { font-family: x, Schwarzbrot, Grünbrot; }'],
]

const invalidOptions: [string, unknown, string][] = [
  ['without options', undefined, 'the "values" option is required'],
  ['without values', {}, 'the "values" option is required'],
  ['with values that are no object', { values: '#000' }, 'the "values" option is required'],
  ['with an empty key', { values: { '': 'x' } }, 'the keys of "values" must not be empty'],
  ['with a number as replacement', { values: { red: 42 } }, 'the replacement for "red" must be a string or { value: string, selector?: RegExp | string }'],
  ['with null as replacement', { values: { red: null } }, 'the replacement for "red" must be a string or { value: string, selector?: RegExp | string }'],
  ['without value in the replacement', { values: { red: { selector: /a/ } } }, 'the replacement for "red" must be a string or { value: string, selector?: RegExp | string }'],
  ['with an invalid selector', { values: { red: { value: 'blue', selector: 42 } } }, 'the selector for "red" must be a RegExp or a string'],
]

describe('replaceValuesPlugin', () => {
  test.each(cases)('%s', async (_, source, options, expectedResult) => {
    const result = await postcss([replaceValuesPlugin(options)]).process(source, { from: undefined })
    expect(result.css).toBe(expectedResult)
  })

  test.each(invalidOptions)('should throw %s', (_, options, message) => {
    expect(() => replaceValuesPlugin(options as ReplaceValuesOptions)).toThrow(`postcss-replace-values: ${message}`)
  })
})
