import { CompletionContext, CompletionResult, Completion, snippetCompletion } from '@codemirror/autocomplete';

import formatText from './format';

function getCellsContent(columnCount: number, rowCount: number): string {
    const columnWidth = 12 / columnCount;

    let result = '';
    for (let i = 0; i < rowCount; i++) {
        for (let j = 0; j < columnCount; j++) {
            result += `<Cell width={${columnWidth}}>#{}</Cell>`;
        }
    }

    return result;
}

function pluralize(count: number, words: string[]) {
    const cases = [2, 0, 1, 1, 1, 2];

    return `${count} ${words[count % 100 > 4 && count % 100 < 20 ? 2 : cases[Math.min(count % 10, 5)]]}`;
}

async function completions(context: CompletionContext): Promise<CompletionResult | null> {
    const word = context.matchBefore(/\<Grid[0-9\w\s]*/);

    if (!word || (word.from == word.to && !context.explicit)) return null;

    const options: Completion[] = [];

    const matchGroupSnippet = word.text.match(/^(<Grid([0-9]{1,}))(c($|([0-9]{1,})))?(r($|([0-9]{1,})))?$/);

    if (matchGroupSnippet) {
        const gridWidth = matchGroupSnippet[2];
        const columnCount = (matchGroupSnippet[5] && Number(matchGroupSnippet[5])) || 1;
        const rowCount = (matchGroupSnippet[8] && Number(matchGroupSnippet[8])) || 1;

        const cellsContent = getCellsContent(columnCount, rowCount);

        options.push(
            snippetCompletion(await formatText(`<Grid width={${gridWidth}}>${cellsContent}</Grid>`), {
                label: `<Grid${gridWidth}c${columnCount ?? 1}r${rowCount ?? 1}`,
                detail: `Вставить <Grid> с длиной ${gridWidth}, ${pluralize(columnCount, [
                    'столбец',
                    'столбца',
                    'столбцов',
                ])}, ${pluralize(rowCount, ['строка', 'строки', 'строк'])}`,
                type: 'tag',
            }),
        );
    }

    options.push(
        snippetCompletion(await formatText('<Grid width={12}><Cell>${}</Cell></Grid>'), {
            label: '<Grid width={12}>',
            detail: 'Вставить <Grid> с одним столбцом',
        }),
    );

    return {
        from: word.from,
        options,
    };
}

export default completions;
