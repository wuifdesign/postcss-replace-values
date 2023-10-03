import postcss from 'postcss'
import replaceValuesPlugin, { ReplaceValuesOptions } from './index'

const cases: [string, string, ReplaceValuesOptions, string][] = [
  ['should replace color', 'div { color: #000; }', {values: {'#000': '#a00'}}, 'div { color: #a00; }'],
  ['should not replace part of color', 'div { color: #000fff; }', {values:{'#000': '#a00'}}, 'div { color: #000fff; }'],
  ['should replace css variable', 'div { color: var(--replace-me); }', {values: {'var(--replace-me)': '#a00'}}, 'div { color: #a00; }'],
  ['should replace long hex with short hex', 'div { color: #000000; background: #000; invalid: #000aa; }', {values: {'#000': '#a00'}}, 'div { color: #a00; background: #a00; invalid: #000aa; }'],
  ['should replace color inside string', 'div { border: 1px solid #000; }', {values: {'#000': '#a00'}}, 'div { border: 1px solid #a00; }'],
  ['should replace multi colors inside string', 'div { box-shadow:inset 10px 10px 20px 10px #000, inset 10px -10px 20px 10px #000000 }', {values: {'#000': '#a00'}}, 'div { box-shadow:inset 10px 10px 20px 10px #a00, inset 10px -10px 20px 10px #a00 }'],
  ['should replace for selector regex', 'div { color: #000; } .btn { color: #000 }', {values: {'#000': {value: '#a00', selector: /btn/}}}, 'div { color: #000; } .btn { color: #a00 }'],
  ['should not replace css variable', 'div { --primary: #000; } .btn { color: #000 }', {values: {'#000': '#a00'}, replaceCssVariables: false}, 'div { --primary: #000; } .btn { color: #a00 }'],
  ['should replace css variable', 'div { --primary: var(--test); } .btn { color: var(--test) }', {values: {'var(--test)': '#a00'}}, 'div { --primary: #a00; } .btn { color: #a00 }'],
  ['should not replace part of a css variable', 'div { color: var(--foobar); }', {values: {'--foo': '--boz', '--foobar': '--baz'}}, 'div { color: var(--baz); }'],
  ['should support 4 digit rgba', 'div { color: #ffeeff; } .btn { color: #ffffeeee; } .btn-2 { color: #ffee; }', {values: {'#ffee': '#a00'}}, 'div { color: #ffeeff; } .btn { color: #a00; } .btn-2 { color: #a00; }'],
  ['should support 8 digit rgba', 'div { color: #ffeeff; } .btn { color: #ffffeeee; } .btn-2 { color: #ffee; }', {values: {'#ffffeeee': '#a00'}}, 'div { color: #ffeeff; } .btn { color: #a00; } .btn-2 { color: #a00; }'],
  ['should support replacing variables within functions', 'div { color: rgba(var(--color), 0.9); }', {values: {'--color': '--foo'}}, 'div { color: rgba(var(--foo), 0.9); }'],
];

describe('replaceValuesPlugin', () => {
  test.each(cases)("%p", async (_, source, options, expectedResult) => {
      const checkValue = await postcss([replaceValuesPlugin(options)]).process(source, {from: undefined})
      expect(checkValue.css).toBe(expectedResult)
    }
  );
})
