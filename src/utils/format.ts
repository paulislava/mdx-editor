import Typograf from 'typograf';

import { STYLE_TAG } from '../constants';

import Eyo from './eyo/lib/eyo';
import * as prettier from './prettier/standalone';
import mdxPlugin from './prettier/markdown';
import cssPlugin from './prettier/postcss';
import babelPlugin from './prettier/babel';
import estreePlugin from './prettier/estree';

const tp = new Typograf({ locale: ['ru', 'en-US'] });
tp.enableRule('common/nbsp/afterNumber');
tp.disableRule('common/punctuation/quote');
tp.disableRule('common/space/afterExclamationMark');
tp.disableRule('common/space/delBeforePunctuation');

const TAB_STRING = '  ';

/* eslint-disable */
const styleRegexp = /<ResponsiveStyle([\w\s!"'\/>:;,?{}#\[\]\.=\-\(\).]*?)\/>/gm;
const attrsRegexp = /\n*(\s*)(.*?)=(("([^"]*?)")|('([^']*?)'))/gm;
/* eslint-enable */

function prefixStrings(text: string, prefix: string) {
    return text
        .split('\n')
        .map((line) => (line === '' ? TAB_STRING : `${prefix}${line}`))
        .join('\n');
}

async function formatHTML(html: string) {
    let result: string = await prettier.format(html, {
        parser: 'mdx',
        plugins: [babelPlugin, estreePlugin, mdxPlugin],
    });

    result = result.replace(/^-\s/gim, '* ');

    let tag;

    // eslint-disable-next-line no-cond-assign
    while ((tag = styleRegexp.exec(result)) !== null) {
        let tagResult = `<${STYLE_TAG}`;

        let attr;

        // eslint-disable-next-line no-cond-assign
        while ((attr = attrsRegexp.exec(tag[1])) !== null) {
            const space = attr[1];

            const attrContent = attr[5] || attr[7];

            let attrValue = '';

            if (attrContent) {
                // eslint-disable-next-line no-await-in-loop
                const formattedCss = await prettier
                    .format(attrContent, {
                        parser: 'css',
                        singleQuote: true,
                        plugins: [cssPlugin],
                    })
                    .catch(() => attrContent);
                attrValue = `="\n${prefixStrings(formattedCss, space + TAB_STRING)}"`;
            }

            tagResult += `\n${space}${attr[2]}${attrValue}`;
        }

        tagResult += '\n/>';

        result = result.replace(tag[0], tagResult);
    }

    return result;
}

export const eyo = new Eyo();
eyo.dictionary.loadSafe();

export default function formatText(text: string) {
    return formatHTML(tp.execute(eyo.restore(text)));
}
