import * as postcss from 'postcss';
export declare type ReplaceValuesOptions = {
    values: {
        [key: string]: string | {
            value: string;
            selector: RegExp;
        };
    };
};
declare const _default: postcss.Plugin<ReplaceValuesOptions>;
export default _default;
