"use strict";
exports.__esModule = true;
var postcss = require("postcss");
exports["default"] = postcss.plugin('replace-values', function (options) {
    if (!options || !options.values) {
        throw new Error('Required options is missing');
    }
    var replaceColors = options.values;
    var replaceColorsKeys = Object.keys(options.values);
    return function (root) {
        root.walkDecls(function (decl) {
            replaceColorsKeys.some(function (checkColor) {
                if (decl.value.indexOf(checkColor) !== -1) {
                    var value = replaceColors[checkColor];
                    if (typeof value !== 'string') {
                        var selector = decl.parent.selector;
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
