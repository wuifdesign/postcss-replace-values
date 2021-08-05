const postcss = require('postcss');
import replaceValuesPlugin from './index';

const process = async (css, options) => {
  return postcss()
    .use(replaceValuesPlugin(options))
    .process(css, { from: undefined })
    .then(result => result.css.toString());
};

it('should replace color', async () => {
  const source = 'div { color: #000; }';
  const checkValue = await process(source, { values: { '#000': '#a00' } });
  expect(checkValue).toBe('div { color: #a00; }');
});

it('should replace color inside string', async () => {
  const source = 'div { border: 1px solid #000; }';
  const checkValue = await process(source, { values: { '#000': '#a00' } });
  expect(checkValue).toBe('div { border: 1px solid #a00; }');
});

it('should replace multi colors inside string', async () => {
  const source = 'div { box-shadow:inset 10px 10px 20px 10px #000, inset 10px -10px 20px 10px #000 }';
  const checkValue = await process(source, { values: { '#000': '#a00' } });
  expect(checkValue).toBe('div { box-shadow:inset 10px 10px 20px 10px #a00, inset 10px -10px 20px 10px #a00 }');
});

it('should replace for selector regex', async () => {
  const source = 'div { color: #000; } .btn { color: #000 }';
  const checkValue = await process(source, { values: { '#000': { value: '#a00', selector: /btn/ } } });
  expect(checkValue).toBe('div { color: #000; } .btn { color: #a00 }');
});

it('should not replace css variable', async () => {
  const source = 'div { --primary: #000; } .btn { color: #000 }';
  const checkValue = await process(source, { values: { '#000': '#a00' } });
  expect(checkValue).toBe('div { --primary: #000; } .btn { color: #a00 }');
});
