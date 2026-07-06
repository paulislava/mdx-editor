import { Diagnostic, linter } from '@codemirror/lint';

import { HTMLHint } from './HTMLHint';
import eyo from './eyo';
import { getCharNumber } from './charNumber';

const mdxLinter = linter((view) => {
    const diagnostics: Diagnostic[] = [];

    const content = view.state.doc.toString();

    const messages = HTMLHint.verify(content, {
        'tagname-lowercase': false,
        'attr-lowercase': false,
        'attr-value-double-quotes': false,
        'doctype-first': false,
        'tag-pair': true,
        'spec-char-escape': false,
        'title-require': false,
        'id-unique': true,
        'src-not-empty': true,
        'attr-no-duplication': true,
    });

    console.log('HTMLHint messages:');
    console.dir(messages, { depth: null });

    messages.forEach((message) => {
        let from = getCharNumber(content, message.line, message.col);

        let to = message.raw.length > 0 ? from + message.raw.length - 1 : from + 1;

        if (to > content.length) {
            to--;
            from--;
        }

        diagnostics.push({
            from,
            to,
            severity: message.type,
            message: message.message,
        });
    });

    const eyoMessages = eyo.lint(content, false);
    console.log("Check 'ё' messages:");
    console.dir(eyoMessages, { depth: null });

    eyoMessages.forEach((message) => {
        const positions = Array.isArray(message.position) ? message.position : [message.position];

        positions.forEach((position) => {
            diagnostics.push({
                from: position.index,
                to: position.index + message.before.length,
                severity: 'warning',
                message: `Возможно: ${message.after}`,
            });
        });
    });

    console.log('Final lint diagnostics:');
    console.dir(diagnostics, { depth: null });

    return diagnostics;
});

export default mdxLinter;
