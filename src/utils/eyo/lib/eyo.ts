import { Dictionary } from './dictionary';

const punctuation = '[{}()[\\]|<>=\\_"\'«»„“#$^%&*+-:;.,?!]';
const re = new RegExp(
    `([А-ЯЁа-яё])[а-яё]+(?![а-яё]|\\.[ \u00A0\t]+([а-яё]|[А-ЯЁ]{2}|${punctuation})|\\.${punctuation})`,
    'g',
);

interface Position {
    line: number;
    column: number;
    index: number;
}

interface Replacement {
    before: string;
    after: string;
    position: Position;
}

interface ResultReplacement extends Omit<Replacement, 'position'> {
    count?: number;
    position: Position | Position[];
}

class Eyo {
    dictionary: Dictionary;

    constructor() {
        this.dictionary = new Dictionary();
    }

    /**
     * Ищет варианты замены буквы «е» на «ё».
     *
     * @param {string} text
     * @param {boolean} [groupByWords] - Группировать по словам.
     *
     * @returns {Array}
     */
    lint(text: string, groupByWords: boolean) {
        const that = this;
        let replacement: ResultReplacement[] = [];

        if (!text || !this._hasEYo(text)) {
            return [];
        }

        text.replace(re, function replace(wordE) {
            const pos = arguments[arguments.length - 2];
            const wordYo = that.dictionary.restoreWord(wordE);

            if (wordYo !== wordE) {
                replacement.push({
                    before: wordE,
                    after: wordYo,
                    position: that._getPosition(text, pos),
                });

                return wordYo;
            }

            return wordE;
        });

        if (groupByWords) {
            replacement.sort(this._sort);
            replacement = this._delDuplicates(replacement);
        }

        return replacement;
    }

    /**
     * Восстанавливает букву «ё» в тексте.
     *
     * @param {string} text
     *
     * @returns {string}
     */
    restore(text: string) {
        if (!text || !this._hasEYo(text)) {
            return text || '';
        }

        text = text.replace(re, (wordE) => {
            const wordYo = this.dictionary.restoreWord(wordE);

            return wordYo === wordE ? wordE : wordYo;
        });

        return text;
    }

    _hasEYo(text: string) {
        return text.search(/[ЕЁеё]/) > -1;
    }

    _getPosition(text: string, index: number) {
        const buf = text.substr(0, index).split(/\r?\n/);

        return {
            line: buf.length,
            column: buf[buf.length - 1].length + 1,
            index,
        };
    }

    _delDuplicates(data: ResultReplacement[]) {
        const count: Record<string, number> = {};
        const position: Record<string, Position[]> = {};
        const result: ResultReplacement[] = [];

        data.forEach((el) => {
            const { before } = el;

            if (count[before]) {
                count[before]++;
            } else {
                count[before] = 1;
            }

            if (!position[before]) {
                position[before] = [];
            }

            position[before].push(...(Array.isArray(el.position) ? el.position : [el.position]));
        });

        const added: Record<string, unknown> = {};
        data.forEach((el) => {
            const { before } = el;

            if (!added[before]) {
                result.push({ ...el, count: count[before], position: position[before] });

                added[before] = true;
            }
        });

        return result;
    }

    _sort(a: ResultReplacement, b: ResultReplacement) {
        const aBefore = a.before;
        const bBefore = b.before;
        const aBeforeLower = aBefore.toLowerCase();
        const bBeforeLower = bBefore.toLowerCase();

        if (aBefore[0] !== bBefore[0] && aBeforeLower[0] === bBeforeLower[0]) {
            if (aBefore > bBefore) {
                return 1;
            }

            return -1;
        }

        if (aBeforeLower > bBeforeLower) {
            return 1;
        }

        if (aBeforeLower < bBeforeLower) {
            return -1;
        }

        return 0;
    }
}

export default Eyo;
