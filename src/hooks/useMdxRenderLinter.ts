import { useEffect, useMemo, useState } from 'react';
import { Diagnostic, linter } from '@codemirror/lint';

import { getCharNumber } from '../utils/charNumber';

type Position = {
    _bufferIndex: number;
    _index: number;
    line: number;
    column: number;
    offset: number;
};

export type MdxRenderError = {
    column?: number;
    file?: string;
    message: string;
    line?: number;
    name?: string;
    place?:
        | Position
        | {
              start: Position;
              end: Position;
          };
    reason?: string;
    ruleId?: string;
    source?: string;
    url?: string;
    type?: 'error' | 'warning' | 'hint';
};

export const useMdxRenderLinter = (value: unknown) => {
    const [renderErrors, setRenderErrors] = useState<MdxRenderError[]>([]);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.mdxError !== undefined) {
                try {
                    const parsedError = JSON.parse(event.data.mdxError);
                    setRenderErrors((prev) => [...prev, parsedError]);
                    console.log('MDX Render Error:', parsedError);
                } catch (error) {
                    console.error('Failed to parse MDX error:', error);
                }
            }
        };

        window.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, []);

    useEffect(() => {
        setRenderErrors([]);
    }, [value]);

    const renderLinter = useMemo(
        () =>
            linter((view) => {
                const content = view.state.doc.toString();
                const diagnostics: Diagnostic[] = [];

                renderErrors.forEach((renderError) => {
                    let from = 0;
                    let to = content.length;

                    // Если есть информация о позиции ошибки
                    if (renderError.place) {
                        // Обработка разных форматов place
                        if ('start' in renderError.place && 'end' in renderError.place) {
                            // Формат с start и end
                            from = Math.max(
                                getCharNumber(
                                    content,
                                    renderError.place.start.line,
                                    renderError.place.start.column + 1,
                                ),
                                0,
                            );
                            to = Math.min(
                                getCharNumber(content, renderError.place.end.line, renderError.place.end.column + 1),
                                content.length,
                            );
                        } else {
                            // Простой формат Position
                            const position = renderError.place as Position;
                            from = Math.max(getCharNumber(content, position.line, position.column + 1), 0);

                            // Для простой позиции отмечаем до конца строки
                            const lines = content.split('\n');
                            const errorLine = lines[position.line - 1] || '';
                            to = Math.min(from + errorLine.length - position.column, content.length);
                        }

                        if (from > to) {
                            from = 0;
                            to = content.length;
                        }
                    } else {
                        // Если place не указан, отмечаем весь контент
                        console.warn('No position information for error, marking entire content');
                    }

                    const message = renderError.message || renderError.reason;

                    // Создаем диагностику с actions
                    const diagnostic: Diagnostic = {
                        severity: renderError.type ?? 'error',
                        message: message || 'Неизвестная ошибка',
                        from,
                        to,
                    };

                    const copyAction = {
                        name: '📋 Копировать ошибку',
                        apply: () => {
                            const errorInfo = `Ошибка MDX: ${JSON.stringify(renderError)}`;

                            navigator.clipboard.writeText(errorInfo).catch((err) => {
                                console.error('Failed to copy error:', err);
                            });
                        },
                    };

                    const actions = message ? [copyAction] : [];

                    // Добавляем действие "Подробнее" если есть URL
                    if (renderError.url) {
                        actions.push({
                            name: '📖 Подробнее об ошибке',
                            apply: () => {
                                window.open(renderError.url, '_blank', 'noopener,noreferrer');
                            },
                        });
                    }

                    diagnostic.actions = actions;

                    diagnostics.push(diagnostic);

                    console.log('MDX Render Diagnostic:', diagnostic);
                });

                return diagnostics;
            }),
        [renderErrors],
    );

    return renderLinter;
};
