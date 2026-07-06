/* eslint-disable salute-rules/no-redundant-commit */
import React, { FC, useEffect, useState, useCallback } from 'react';
import styled, { css } from 'styled-components';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';

// Иконки в виде SVG компонентов
const CloseIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 5L5 15M5 5L15 15" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const FullscreenIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M4 8V6C4 4.89543 4.89543 4 6 4H8M16 12V14C16 15.1046 15.1046 16 14 16H12M12 4H14C15.1046 4 16 4.89543 16 6V8M8 16H6C4.89543 16 4 15.1046 4 14V12"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
        />
    </svg>
);

const WindowedIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M16 8V6C16 4.89543 15.1046 4 14 4H6C4.89543 4 4 4.89543 4 6V14C4 15.1046 4.89543 16 6 16H8M12 4H14C15.1046 4 16 4.89543 16 6V8M4 12V14C4 15.1046 4.89543 16 6 16H8M16 12V14C16 15.1046 15.1046 16 14 16H12"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
        />
    </svg>
);

const Wrapper = styled.div<{ $visible?: boolean }>`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: auto;
    z-index: 1001;

    ${({ $visible }) =>
        !$visible &&
        css`
            display: none;
        `}
`;

const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    cursor: pointer;
    z-index: 1000;
`;

const Container = styled.div<{
    $fullScreen: boolean;
    $isMobile: boolean;
}>`
    position: relative;
    display: flex;
    flex-direction: column;
    background: #fff;
    overflow: hidden;
    margin: auto;
    z-index: 1002;

    ${({ $fullScreen, $isMobile }) => {
        if ($fullScreen || $isMobile) {
            return css`
                width: 100%;
                height: 100%;
                border-radius: 0;
            `;
        }

        return css`
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        `;
    }}
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    background: #1a1a1a;
    color: #fff;
    user-select: none;
    flex-shrink: 0;
    gap: 16px;
`;

const Title = styled.div`
    font-size: 16px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
`;

const HeaderRight = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    justify-content: right;
`;

const HeaderCenter = styled.div`
    flex: 1;
`;

const SizeInput = styled.input`
    width: 70px;
    padding: 4px 8px;
    border: 1px solid #444;
    border-radius: 4px;
    background: #333;
    color: #fff;
    font-size: 14px;
    text-align: center;

    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button {
        display: none;
    }

    &:focus {
        outline: none;
        border-color: #666;
    }
`;

const SizeLabel = styled.span`
    color: #999;
    font-size: 14px;
    margin: 0 4px;
`;

const SizeControls = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
`;

const IconButton = styled.button`
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;

    &:hover {
        opacity: 0.8;
    }

    &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
    }

    svg {
        width: 20px;
        height: 20px;
    }
`;

const Content = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    background: #fff;
    position: relative;
`;

const StyledResizableBox = styled(ResizableBox)`
    margin: auto;

    .react-resizable-handle {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 20px;
        height: 20px;
        background: linear-gradient(135deg, transparent 50%, #666 50%);
        opacity: 0.5;
        cursor: se-resize;
        z-index: 1010;

        &:hover {
            opacity: 1;
        }
    }
`;

interface PopupSize {
    width: number;
    height: number;
    isFullscreen: boolean;
}

type PopupProps = {
    title: string;
    children: React.ReactNode;
    isOpen: boolean;
    onClose(): void;
    resizable?: boolean;
    keys?: string[];
};

export const Popup: FC<PopupProps> = ({ children, isOpen, onClose, title, keys, resizable = false }) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [size, setSize] = useState<PopupSize>({
        width: Math.min(800, window.innerWidth * 0.9),
        height: Math.min(600, window.innerHeight * 0.9),
        isFullscreen: false,
    });
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
    const [widthInput, setWidthInput] = useState<string>(String(Math.min(800, window.innerWidth * 0.9)));
    const [heightInput, setHeightInput] = useState<string>(String(Math.min(600, window.innerHeight * 0.9)));

    // Проверка на мобильное устройство
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 1024);
        };

        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Загрузка сохраненных размеров из localStorage
    useEffect(() => {
        if (!keys?.length) return;

        for (let i = keys.length - 1; i >= 0; i--) {
            const saved = localStorage.getItem(`popup_${keys[i]}`);

            if (saved) {
                try {
                    const parsed = JSON.parse(saved) as PopupSize;

                    // Проверяем, чтобы размеры не превышали экран
                    const validWidth = parsed.width;
                    const validHeight = parsed.height;

                    setSize({
                        width: validWidth,
                        height: validHeight,
                        isFullscreen: parsed.isFullscreen,
                    });

                    setWidthInput(String(validWidth));
                    setHeightInput(String(validHeight));
                    setIsFullscreen(parsed.isFullscreen);

                    return;
                } catch (e) {
                    console.error('Error parsing saved popup size:', e);
                }
            }
        }
    }, [keys]);

    // Сохранение размеров в localStorage
    useEffect(() => {
        if (!keys?.length) return;

        const currentKey = keys[keys.length - 1];
        localStorage.setItem(
            `popup_${currentKey}`,
            JSON.stringify({
                width: size.width,
                height: size.height,
                isFullscreen,
            }),
        );
    }, [size, isFullscreen, keys]);

    // Обработчик клика по оверлею
    const handleOverlayClick = useCallback(
        (e: React.MouseEvent) => {
            if (e.target === e.currentTarget) {
                onClose();
            }
        },
        [onClose],
    );

    // Обработчик переключения полноэкранного режима
    const toggleFullscreen = useCallback(() => {
        setIsFullscreen((prev) => !prev);
    }, []);

    // Обработчик изменения размера через ресайз
    const handleResize = useCallback(
        (e: React.SyntheticEvent, { size: newSize }: { size: { width: number; height: number } }) => {
            const roundedWidth = Math.round(newSize.width);
            const roundedHeight = Math.round(newSize.height);

            setSize((prev) => ({
                ...prev,
                width: roundedWidth,
                height: roundedHeight,
            }));

            setWidthInput(String(roundedWidth));
            setHeightInput(String(roundedHeight));
        },
        [],
    );

    // Обработчик изменения ширины через инпут
    const handleWidthChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setWidthInput(e.target.value);
    }, []);

    // Обработчик изменения высоты через инпут
    const handleHeightChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setHeightInput(e.target.value);
    }, []);

    // Применение нового размера
    const applySize = useCallback(() => {
        const newWidth = Math.max(parseInt(widthInput, 10) || 300, 300);
        const newHeight = Math.max(parseInt(heightInput, 10) || 300, 300);

        setSize({
            width: newWidth,
            height: newHeight,
            isFullscreen,
        });

        setWidthInput(String(newWidth));
        setHeightInput(String(newHeight));
    }, [widthInput, heightInput, isFullscreen]);

    // Обработчик нажатия Enter в инпутах
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Enter') {
                applySize();
            }
        },
        [applySize],
    );

    // Обработчик потери фокуса инпутами
    const handleBlur = useCallback(() => {
        applySize();
    }, [applySize]);

    // Обработчик клавиши Escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleEscape);
        }

        return () => {
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    const isWindowed = !isFullscreen && !isMobile;

    // Рендерим содержимое попапа
    const popupContent = (
        <Container
            $fullScreen={isFullscreen || isMobile}
            $isMobile={isMobile}
            style={
                isWindowed
                    ? {
                          width: size.width,
                          height: size.height,
                      }
                    : undefined
            }
        >
            <Header>
                <HeaderCenter>
                    <Title>{title}</Title>
                </HeaderCenter>

                <HeaderLeft>
                    {resizable && isWindowed && (
                        <SizeControls>
                            <SizeInput
                                type="number"
                                value={widthInput}
                                onChange={handleWidthChange}
                                onBlur={handleBlur}
                                onKeyDown={handleKeyDown}
                                min={300}
                                max={window.innerWidth * 0.9}
                                disabled={!isWindowed}
                            />
                            <SizeLabel>×</SizeLabel>
                            <SizeInput
                                type="number"
                                value={heightInput}
                                onChange={handleHeightChange}
                                onBlur={handleBlur}
                                onKeyDown={handleKeyDown}
                                min={300}
                                max={window.innerHeight * 0.9}
                                disabled={!isWindowed}
                            />
                            <SizeLabel>px</SizeLabel>
                        </SizeControls>
                    )}
                </HeaderLeft>

                <HeaderRight>
                    {!isMobile && (
                        <IconButton onClick={toggleFullscreen}>
                            {isFullscreen ? <WindowedIcon /> : <FullscreenIcon />}
                        </IconButton>
                    )}
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </HeaderRight>
            </Header>
            <Content>{children}</Content>
        </Container>
    );

    return (
        <Wrapper $visible={isOpen}>
            <Overlay onClick={handleOverlayClick} />
            {resizable && isWindowed ? (
                <StyledResizableBox
                    width={size.width}
                    height={size.height}
                    onResize={handleResize}
                    minConstraints={[300, 300]}
                    resizeHandles={['w', 'e', 'sw', 's', 'se']}
                >
                    {popupContent}
                </StyledResizableBox>
            ) : (
                popupContent
            )}
        </Wrapper>
    );
};
