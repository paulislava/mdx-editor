type Maybe<T> = T | null;

interface EditorFieldProps {
    name: string;
    value?: Maybe<string>;
}

export type MdxComponents = Record<
    string,
    {
        name: string;
        type: string;
        possibleTypes: string[];
        possibleValues: string[];
    }[]
>;

export interface EditorOnChangeEvent {
    target: EditorFieldProps;
}

export type Fragment = {
    Title: string;
    Content: string;
    Description?: string;
    Preview?: {
        url: string;
    };
};

export interface EditorProps extends EditorFieldProps {
    onChange(event: EditorOnChangeEvent): void;
    label?: string;
    required?: Maybe<boolean>;
    disabled?: Maybe<boolean>;
    fragments?: Fragment[];
    components?: Maybe<MdxComponents>;
    previewUrl?: string;
    keys?: string[];
}
