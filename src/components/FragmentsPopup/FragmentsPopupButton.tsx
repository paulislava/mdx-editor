import React, { useState, FC, useRef } from 'react';

import * as S from '../FragmentsPopup/FragmentsPopup.styled';
import { Fragment } from '../Editor/Editor.types';
import { useSetFalse, useSetTrue } from '../../hooks/booleans';
import { BigActionButton } from '../Editor/Editor.styled';
import { Popup } from '../Popup/Popup';

type FragmentsPopupButtonProps = {
    fragments?: Fragment[];
    onChooseFragment(fragment: Fragment): void;
};

const keys = ['fragments'];

export const FragmentsPopupButton: FC<FragmentsPopupButtonProps> = ({ fragments, onChooseFragment }) => {
    const [isOpen, setIsOpen] = useState(false);
    const open = useSetTrue(setIsOpen);
    const close = useSetFalse(setIsOpen);

    const buttonRef = useRef<HTMLDivElement>(null);

    if (!fragments?.length) {
        return null;
    }

    return (
        <>
            <BigActionButton ref={buttonRef} $open={isOpen} onClick={open}>
                Фрагменты
            </BigActionButton>
            {isOpen && (
                <Popup isOpen={isOpen} onClose={close} title="Фрагменты" keys={keys}>
                    <S.Fragments>
                        {fragments.map((fragment) => (
                            <S.Fragment
                                onClick={() => {
                                    close();
                                    onChooseFragment(fragment);
                                }}
                                key={fragment.Title}
                            >
                                <S.FragmentContent>
                                    <S.FragmentTitle>{fragment.Title}</S.FragmentTitle>
                                    {fragment.Description && <S.Description>{fragment.Description}</S.Description>}
                                </S.FragmentContent>

                                {fragment.Preview && <S.Preview src={fragment.Preview.url} />}
                            </S.Fragment>
                        ))}
                    </S.Fragments>
                </Popup>
            )}
        </>
    );
};
