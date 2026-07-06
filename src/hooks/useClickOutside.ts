import { useRef, useEffect, RefObject } from 'react';

/**
 * Хук, который вызывает callback() при клике вне элемента,
 * но не срабатывает, если кликнули по элементу из параметра exceptions
 * @param callback Функция, вызываевая при клике помимо элемента
 * @param exceptions Список рефов элементов, при клике на которые событие не должно срабатывать
 * @returns RefObject, который нужно присвоить элементу (компоненту) в параметре ref
 */
export const useClickOutside = <T extends HTMLElement = HTMLDivElement>(
    callback: () => void,
    exceptions?: RefObject<HTMLElement>[],
    active?: boolean,
) => {
    const domNode = useRef<T>(null);

    useEffect(() => {
        const callbackHandler = (event: MouseEvent) => {
            if (
                !domNode.current?.contains(event.target as Element) &&
                !exceptions?.some((elem) => elem.current?.contains(event.target as Element))
            ) {
                callback();
            }
        };

        if (active) {
            document.addEventListener('mousedown', callbackHandler);
        }

        return () => {
            document.removeEventListener('mousedown', callbackHandler);
        };
    }, [domNode, callback, exceptions, active]);

    return domNode;
};
