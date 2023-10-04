const postcss = require('postcss')
const replaceValuesPlugin = require('../dist/index').default

const test = async () => {
  const checkValue = await postcss([replaceValuesPlugin({values: {'#000': '#a00'}})]).process('div { color: #000; }', {from: undefined})
  console.log(checkValue.css)
}

test();
