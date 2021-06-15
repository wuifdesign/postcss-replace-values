import * as postcss from 'postcss';

export type ReplaceValuesOptions = {
  values: { [key: string]: string | { value: string, selector: RegExp } }
}

export default postcss.plugin('replace-values', (options: ReplaceValuesOptions) => {
  if (!options || !options.values) {
    throw new Error('Required options is missing');
  }
  const replaceColors = options.values;
  const replaceColorsKeys = Object.keys(options.values);

  return (root) => {
    root.walkDecls((decl) => {
      replaceColorsKeys.some((checkColor) => {
        if (decl.value.indexOf(checkColor) !== -1) {
          let value = replaceColors[checkColor];
          if (typeof value !== 'string') {
            const selector = (decl.parent as any).selector;
            if (!new RegExp(value.selector).test(selector)) {
              return;
            }
            value = value.value;
          }
          decl.value = decl.value.replace(new RegExp(checkColor, 'g'), value);
        }
      });
    });
  };
});
