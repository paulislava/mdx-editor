import React, { useState, FC, useRef, useEffect, useMemo } from 'react';

import * as S from '../PreviewPopup/PreviewPopup.styled';
import { useSetFalse, useSetTrue } from '../../hooks/booleans';
import { BigActionButton } from '../Editor/Editor.styled';
import { Popup } from '../Popup/Popup';

type PreviewPopupButtonProps = {
    previewUrl: string;
    value?: string;
    keys?: string[];
};

export const PreviewPopupButton: FC<PreviewPopupButtonProps> = ({ previewUrl, value, keys }) => {
    const [isOpen, setIsOpen] = useState(false);

    const close = useSetFalse(setIsOpen);
    const open = useSetTrue(setIsOpen);

    const ref = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        ref.current?.contentWindow.postMessage({ mdx: value }, '*');

        const handleMessage = (event: MessageEvent) => {
            if (event.data?.mdxLoaded !== undefined) {
                ref.current?.contentWindow.postMessage({ mdx: value }, '*');
            }
        };

        window.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [value, ref]);

    const finalKeys = useMemo(() => ['preview', ...(keys || [])], [keys]);

    if (!previewUrl) {
        return null;
    }

    return (
        <>
            <BigActionButton $open={isOpen} onClick={open}>
                Предпросмотр
            </BigActionButton>

            <Popup isOpen={isOpen} onClose={close} title="Предпросмотр" keys={finalKeys} resizable>
                <S.Container src={previewUrl} ref={ref} />
            </Popup>
        </>
    );
};
