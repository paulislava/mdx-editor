export function getCharNumber(text: string, line: number, column: number) {
    let pos = 0;
    const strings = text.split('\n');
    for (let i = 0; i < line - 1; i++) {
        pos += strings[i].length + 1;
    }

    return pos + column - 1;
}
