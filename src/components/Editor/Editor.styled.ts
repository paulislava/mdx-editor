import styled, { css } from 'styled-components';
import CodeMirrorCore from '@uiw/react-codemirror';

export const Container = styled.div`
    font-size: 14px;
`;

export const EditorContainer = styled.div`
    position: relative;
`;

export const CodeMirror = styled(CodeMirrorCore)`
    margin-bottom: 2.8rem;
    max-height: calc(100vh - 90px);
    overflow-y: scroll;

    color: #000;

    & .cm-content {
        flex: 1;
        overflow: hidden;
    }

    & .cm-activeLine {
        white-space: break-spaces;
    }
`;

export const KeysText = styled.div`
    margin: 1rem 0;
    font-size: 0.8em;
    display: block;
`;

export const KeysLabel = styled.div`
    font-weight: 500;
`;

export const Label = styled.label`
    display: block;
    margin-bottom: 1rem;
    width: 100%;
    font-weight: 500;
    font-size: 1.2rem;
    color: rgb(51, 55, 64);
`;

export const Buttons = styled.div`
    padding-right: 13px;
    padding-left: 50px;
    display: flex;
    flex-flow: row;
    gap: 8px;
    width: 100%;
    box-sizing: border-box;
    justify-content: space-between;
    position: relative;
`;

export const ButtonsGroup = styled.div`
    display: flex;
    flex-flow: row;
    gap: 8px;
`;

export const ActionButton = styled.div`
    background: #545b62;
    color: #fff;
    text-align: center;
    padding: 8px;
    border-radius: 8px;
    cursor: pointer;
    border: none;
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
    min-width: 32px;
    min-height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

export const BigActionButton = styled(ActionButton)<{ $open?: boolean }>`
    min-width: 100px;

    ${({ $open: $isOpen }) =>
        $isOpen &&
        css`
            background: #f5f5f5;
            color: #6c6c6c;
        `}
`;
