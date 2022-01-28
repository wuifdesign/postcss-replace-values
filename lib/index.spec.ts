const postcss = require('postcss');
import replaceValuesPlugin from './index';

const process = async (css, options) => {
  return postcss()
    .use(replaceValuesPlugin(options))
    .process(css, { from: undefined })
    .then(result => result.css.toString());
};

describe('replaceValuesPlugin', () => {
  it('should replace color', async () => {
    const source = 'div { color: #000; }';
    const checkValue = await process(source, { values: { '#000': '#a00' } });
    expect(checkValue).toBe('div { color: #a00; }');
  });

  it('should not replace part of color', async () => {
    const source = 'div { color: #000fff; }';
    const checkValue = await process(source, { values: { '#000': '#a00' } });
    expect(checkValue).toBe('div { color: #000fff; }');
  });

  it('should replace css variable', async () => {
    const source = 'div { color: var(--replace-me); }';
    const checkValue = await process(source, { values: { 'var(--replace-me)': '#a00' } });
    expect(checkValue).toBe('div { color: #a00; }');
  });

  it('should replace long hex with short hex', async () => {
    const source = 'div { color: #000000; background: #000; invalid: #000aa; }';
    const checkValue = await process(source, { values: { '#000': '#a00' } });
    expect(checkValue).toBe('div { color: #a00; background: #a00; invalid: #000aa; }');
  });

  it('should replace color inside string', async () => {
    const source = 'div { border: 1px solid #000; }';
    const checkValue = await process(source, { values: { '#000': '#a00' } });
    expect(checkValue).toBe('div { border: 1px solid #a00; }');
  });

  it('should replace multi colors inside string', async () => {
    const source = 'div { box-shadow:inset 10px 10px 20px 10px #000, inset 10px -10px 20px 10px #000000 }';
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
    const checkValue = await process(source, { values: { '#000': '#a00' }, replaceCssVariables: false });
    expect(checkValue).toBe('div { --primary: #000; } .btn { color: #a00 }');
  });

  it('should replace css variable', async () => {
    const source = 'div { --primary: var(--test); } .btn { color: var(--test) }';
    const checkValue = await process(source, { values: { 'var(--test)': '#a00' } });
    expect(checkValue).toBe('div { --primary: #a00; } .btn { color: #a00 }');
  });

  it('should not replace part of a css variable', async () => {
    const source = 'div { color: var(--foobar); }';
    const checkValue = await process(source, { values: { '--foo': '--boz', '--foobar': '--baz' } });
    expect(checkValue).toBe('div { color: var(--baz); }');
  });

  it('should support 4 digit rgba', async () => {
    const source = 'div { color: #ffeeff; } .btn { color: #ffffeeee; } .btn-2 { color: #ffee; }';
    const checkValue = await process(source, { values: { '#ffee': '#a00' } });
    expect(checkValue).toBe('div { color: #ffeeff; } .btn { color: #a00; } .btn-2 { color: #a00; }');
  });

  it('should support 8 digit rgba', async () => {
    const source = 'div { color: #ffeeff; } .btn { color: #ffffeeee; } .btn-2 { color: #ffee; }';
    const checkValue = await process(source, { values: { '#ffffeeee': '#a00' } });
    expect(checkValue).toBe('div { color: #ffeeff; } .btn { color: #a00; } .btn-2 { color: #a00; }');
  });

  it('should support replacing variables within functions', async () => {
    const source = 'div { color: rgba(var(--color), 0.9); }';
    const checkValue = await process(source, { values: { '--color': '--foo' } });
    expect(checkValue).toBe('div { color: rgba(var(--foo), 0.9); }');
  });

});
