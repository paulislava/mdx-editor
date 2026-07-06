import { useCallback } from 'react';

export const useSetFalse = (func: (opened: boolean) => void) => useCallback(() => func(false), [func]);

export const useSetTrue = (func: (opened: boolean) => void, condition = true) =>
    useCallback(() => condition && func(true), [func, condition]);

export const useToggle = (func: React.Dispatch<React.SetStateAction<boolean>>) =>
    useCallback(() => func((prev) => !prev), [func]);
