/* eslint-disable no-underscore-dangle */
import fetch from 'node-fetch';

export class Dictionary {
    _dict: Record<string, string>;

    constructor() {
        this._dict = {};
    }

    /**
     * Синхронно загружает словарь.
     *
     * @param {string} url
     */
    async load(url: string) {
        this.set(await (await fetch(url)).text());
    }

    /*
     * Синхронно загружает безопасный встроенный словарь.
     */
    async loadSafe() {
        // TODO: Загрузить куда-нибудь на CDN
        if (typeof window !== 'undefined') {
            await this.load('/eyo.txt');
        }
    }

    /**
     * Очищает словарь.
     */
    clear() {
        this._dict = {};
    }

    /**
     * Восстанавливает в слове букву «ё».
     *
     * @param {string} word
     *
     * @returns {string}
     */
    restoreWord(word: string) {
        return this._dict[this._replaceYo(word)] || word;
    }

    /**
     * Добавляет слово в словарь.
     *
     * @param {string} rawWord
     */
    addWord(rawWord: string) {
        let word = rawWord;

        if (rawWord.search('#') > -1) {
            word = word.split('#')[0].trim();
        }

        if (word.search(/\(/) > -1) {
            const parts = word.split(/[(|)]/);
            for (let i = 1, len = parts.length - 1; i < len; i++) {
                this._addWord(parts[0] + parts[i]);
            }
        } else {
            this._addWord(word);
        }
    }

    _addWord(word: string) {
        // Слово может использоваться только со строчной буквы.
        // Пример: _киёв. Киев и только киёв.
        const hasUnderscore = word.search('_') === 0;
        word = word.replace(/^_/, '');

        const key = this._replaceYo(word);

        this._dict[key] = word;

        if (word.search(/^[А-ЯЁ]/) === -1 && !hasUnderscore) {
            this._dict[this._capitalize(key)] = this._capitalize(word);
        }
    }

    /**
     * Удаляет слово из словаря.
     *
     * @param {string} word
     */
    removeWord(word: string) {
        const wordE = this._replaceYo(word);

        delete this._dict[wordE];

        if (word.search(/^[А-ЯЁ]/) === -1) {
            delete this._dict[this._capitalize(wordE)];
        }
    }

    /**
     * Установить словарь.
     *
     * @param {string|string[]} dict
     */
    set(dict: string[] | string) {
        this.clear();

        if (!dict) {
            return;
        }

        const buffer = Array.isArray(dict) ? dict : dict.trim().split(/\r?\n/);

        for (const word of buffer) {
            this.addWord(word);
        }
    }

    /**
     * Получить словарь.
     *
     * @returns {Object}
     */
    get() {
        return this._dict;
    }

    _capitalize(text: string) {
        return text.substr(0, 1).toUpperCase() + text.substr(1);
    }

    _replaceYo(word: string) {
        return word.replace(/Ё/g, 'Е').replace(/ё/g, 'е');
    }
}
