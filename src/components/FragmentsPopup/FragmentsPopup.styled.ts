import styled from 'styled-components';

export const Fragments = styled.div`
    display: flex;
    flex-flow: row wrap;
    gap: 16px;
`;

export const Fragment = styled.div`
    flex: 1;
    max-width: 250px;
    min-width: 200px;
    background: #eee;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    display: flex;
    flex-flow: column;
`;

export const FragmentTitle = styled.h4`
    font-size: 18px;
`;
export const Description = styled.div`
    margin-top: 8px;
    opacity: 0.75;
`;

export const Preview = styled.img`
    max-width: 100%;
    margin-top: 8px;
    height: auto;
`;

export const Block = styled.div`
    display: flex;
    flex-flow: row;
`;

export const FragmentContent = styled.div`
    padding: 8px;
`;
