import React, { FC, memo, useCallback, useMemo, useRef } from 'react';
import { keymap } from '@codemirror/view';
import { startCompletion, nextSnippetField } from '@codemirror/autocomplete';
import PropTypes from 'prop-types';
import { TagSpec, html, htmlLanguage } from '@codemirror/lang-html';
import { cssLanguage } from '@codemirror/lang-css';
import { ReactCodeMirrorRef } from '@uiw/react-codemirror';

import formatText from '../../utils/format';
import completions from '../../utils/completions';
import mdxLinter from '../../utils/mdxLinter';
import { CHILDREN_PROP, STYLE_TAG } from '../../constants';
import { FragmentsPopupButton } from '../FragmentsPopup/FragmentsPopupButton';
import { PreviewPopupButton } from '../PreviewPopup/PreviewPopupButton';
import { useMdxRenderLinter } from '../../hooks/useMdxRenderLinter';

import * as S from './Editor.styled';
import { EditorProps, Fragment } from './Editor.types';

const EditorInner: FC<EditorProps> = ({
    onChange,
    value,
    disabled,
    name,
    label,
    fragments,
    components,
    previewUrl,
    keys,
}) => {
    const onEditorChange = useCallback(
        (newValue: string) => {
            onChange({ target: { name, value: newValue } });
        },
        [onChange, name],
    );

    const ref = useRef<ReactCodeMirrorRef>(null);

    const renderLinter = useMdxRenderLinter(value);

    const [extraTags, nestedAttributes] = useMemo(() => {
        if (!components) {
            return [];
        }

        const nestedAttrs: {
            name: string;
            tagName?: string;
            parser: any;
        }[] = [];

        const tags = Object.keys(components).reduce<Record<string, TagSpec>>((prev, tagName) => {
            return {
                ...prev,
                [tagName]: {
                    globalAttrs: false,
                    attrs: components[tagName]
                        .filter((attr) => attr.name !== CHILDREN_PROP)
                        .reduce((prevAttrs, attr) => {
                            if (tagName === STYLE_TAG) {
                                nestedAttrs.push({
                                    name: attr.name,
                                    tagName,
                                    parser: cssLanguage.parser,
                                });
                            }

                            const possibleValues = attr.type === 'boolean' ? [true, false] : attr.possibleValues;

                            return { ...prevAttrs, [attr.name]: possibleValues };
                        }, {}),
                    children: components[tagName].some((attr) => attr.name === CHILDREN_PROP) ? undefined : [],
                },
            };
        }, {});

        return [tags, nestedAttrs];
    }, [components]);

    const formatHandler = useCallback(() => {
        if (value) {
            formatText(value).then(onEditorChange);
        }
    }, [onEditorChange, value]);

    const extensions = useMemo(
        () => [
            mdxLinter,
            renderLinter,
            html({
                selfClosingTags: true,
                extraTags,
                extraGlobalAttributes: {
                    className: null,
                },
                nestedAttributes,
            }),
            htmlLanguage.data.of({
                autocomplete: completions,
                commentTokens: {
                    block: { open: '{/* <!--', close: '--> */}' },
                },
            }),
            keymap.of([
                {
                    key: 'Cmd-k',
                    run: startCompletion,
                },
                {
                    key: 'Ctrl-h',
                    mac: 'Cmd-h',
                    run: () => {
                        formatHandler();

                        return true;
                    },
                },
                {
                    key: 'Ctrl-j',
                    mac: 'Cmd-j',
                    run: (target) => {
                        return nextSnippetField(target);
                    },
                },
            ]),
        ],
        [extraTags, formatHandler, nestedAttributes, renderLinter],
    );

    const onChooseFragment = useCallback((fragment: Fragment) => {
        if (!ref.current) {
            return;
        }

        const { view } = ref.current;

        const cursor = view.state.selection.main.head;

        const transaction = view.state.update({
            changes: {
                from: cursor,
                insert: fragment.Content,
            },
            // the next 2 lines will set the appropriate cursor position after inserting the new text.
            selection: { anchor: cursor + fragment.Content.length },
            scrollIntoView: true,
        });

        if (transaction) {
            view.dispatch(transaction);

            view.focus();
        }
    }, []);

    const wrapSelection = useCallback(
        (prefix: string, suffix: string) => {
            if (!ref.current) {
                return;
            }

            const { view } = ref.current;

            const firstSelectionPos = view.state.selection.main.from;
            const lastSelectionPos = view.state.selection.main.to;

            const isEmptySelection = firstSelectionPos === lastSelectionPos;

            const selectedText = view.state.sliceDoc(firstSelectionPos, lastSelectionPos);

            const newText = `${prefix}${selectedText}${suffix}`;

            const transaction = view.state.replaceSelection(newText);

            // const cursor = view.state.selection.main.head;

            if (transaction) {
                view.dispatch(transaction);
                view.dispatch({
                    selection: { anchor: lastSelectionPos + prefix.length + (isEmptySelection ? 0 : suffix.length) },
                });

                view.focus();
            }
        },
        [ref],
    );

    const onClickBold = useCallback(() => wrapSelection('**', '**'), [wrapSelection]);

    const onClickItalic = useCallback(() => wrapSelection('*', '*'), [wrapSelection]);

    const onClickUnderline = useCallback(() => wrapSelection('<u>', '</u>'), [wrapSelection]);

    const onClickLink = useCallback(() => {
        if (!ref.current) {
            return;
        }

        const beforeHrefFragment = '<a href="';
        const afterHrefFragment = '" target="_blank">';
        const suffix = '</a>';

        const { view } = ref.current;

        const firstSelectionPos = view.state.selection.main.from;
        const lastSelectionPos = view.state.selection.main.to;

        const isEmptySelection = firstSelectionPos === lastSelectionPos;

        const selectedText = view.state.sliceDoc(firstSelectionPos, lastSelectionPos);

        const prefix = `${beforeHrefFragment}${isEmptySelection ? 'link' : ''}${afterHrefFragment}`;

        const newText = `${prefix}${selectedText}${suffix}`;

        const transaction = view.state.replaceSelection(newText);

        const cursor = view.state.selection.main.head;

        if (transaction) {
            view.dispatch(transaction);

            const anchor = isEmptySelection ? cursor + prefix.length : firstSelectionPos + beforeHrefFragment.length;

            view.dispatch({
                selection: { anchor },
            });

            view.focus();
        }
    }, [ref]);

    return (
        <S.Container>
            <S.Label htmlFor={name}>{label}</S.Label>
            <S.KeysText>
                <S.KeysLabel>Сочетания клавиш:</S.KeysLabel>
                <div>Control+Space (Cmd+K на macOS) — автодополнение тегов и атрибутов</div>
                <div>Control+H (Cmd+H на macOS) — форматировать содержимое</div>
            </S.KeysText>
            <S.Buttons>
                <S.ButtonsGroup>
                    <S.ActionButton onClick={onClickBold}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 32 32"
                            width="16"
                            height="16"
                            fill="currentColor"
                            aria-hidden="true"
                            focusable="false"
                        >
                            <path d="M22.135 14.308A6.001 6.001 0 0 0 17.5 4.5H9A1.5 1.5 0 0 0 7.5 6v19A1.5 1.5 0 0 0 9 26.5h10a6.5 6.5 0 0 0 3.135-12.192M10.5 7.5h7a3 3 0 0 1 0 6h-7zm8.5 16h-8.5v-7H19a3.5 3.5 0 1 1 0 7" />
                        </svg>
                    </S.ActionButton>
                    <S.ActionButton onClick={onClickItalic}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 32 32"
                            width="16"
                            height="16"
                            fill="currentColor"
                            aria-hidden="true"
                            focusable="false"
                        >
                            <path d="M25.5 7A1.5 1.5 0 0 1 24 8.5h-3.919l-5 15H18a1.5 1.5 0 1 1 0 3H8a1.5 1.5 0 1 1 0-3h3.919l5-15H14a1.5 1.5 0 0 1 0-3h10A1.5 1.5 0 0 1 25.5 7" />
                        </svg>
                    </S.ActionButton>
                    <S.ActionButton onClick={onClickUnderline}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 32 32"
                            width="16"
                            height="16"
                            fill="currentColor"
                            aria-hidden="true"
                            focusable="false"
                        >
                            <path d="M25.5 28a1.5 1.5 0 0 1-1.5 1.5H8a1.5 1.5 0 1 1 0-3h16a1.5 1.5 0 0 1 1.5 1.5M16 24.5a8.51 8.51 0 0 0 8.5-8.5V7a1.5 1.5 0 1 0-3 0v9a5.5 5.5 0 0 1-11 0V7a1.5 1.5 0 1 0-3 0v9a8.51 8.51 0 0 0 8.5 8.5" />
                        </svg>
                    </S.ActionButton>
                    <S.ActionButton onClick={onClickLink}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 32 32"
                            width="16"
                            height="16"
                            fill="currentColor"
                            aria-hidden="true"
                            focusable="false"
                        >
                            <path d="M17.046 23.441a1.5 1.5 0 0 1 0 2.125l-.742.743a7.502 7.502 0 1 1-10.61-10.61l3.015-3.014A7.5 7.5 0 0 1 19 12.375a1.506 1.506 0 0 1-2 2.25 4.5 4.5 0 0 0-6.171.184l-3.013 3.01a4.5 4.5 0 0 0 6.365 6.365l.743-.743a1.5 1.5 0 0 1 2.122 0m9.26-17.75a7.51 7.51 0 0 0-10.61 0l-.742.743a1.503 1.503 0 1 0 2.125 2.125l.742-.743a4.5 4.5 0 0 1 6.365 6.365l-3.014 3.015a4.5 4.5 0 0 1-6.172.179 1.506 1.506 0 1 0-2 2.25 7.5 7.5 0 0 0 10.288-.304l3.014-3.014a7.51 7.51 0 0 0 .004-10.613z" />
                        </svg>
                    </S.ActionButton>
                </S.ButtonsGroup>
                <S.ButtonsGroup>
                    <S.BigActionButton onClick={formatHandler}>Форматировать</S.BigActionButton>
                    <FragmentsPopupButton onChooseFragment={onChooseFragment} fragments={fragments} />
                    <PreviewPopupButton keys={keys} previewUrl={previewUrl} value={value} />
                </S.ButtonsGroup>
            </S.Buttons>

            <S.EditorContainer>
                <S.CodeMirror
                    ref={ref}
                    onChange={onEditorChange}
                    value={value ?? undefined}
                    readOnly={disabled ?? false}
                    extensions={extensions}
                />
            </S.EditorContainer>
        </S.Container>
    );
};

EditorInner.propTypes = {
    onChange: PropTypes.func.isRequired,
    name: PropTypes.string.isRequired,
    value: PropTypes.string,
    disabled: PropTypes.bool,
};

export const Editor = memo(EditorInner);
