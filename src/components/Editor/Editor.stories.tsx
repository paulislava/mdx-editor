import React, { useCallback, useEffect, useState } from 'react';
import type { StoryFn, Meta } from '@storybook/react';

import { Container } from '../StorybookContainer/StorybookContainer';

import { Editor } from './Editor';
import { EditorOnChangeEvent, EditorProps, MdxComponents } from './Editor.types';

export default {
    title: 'Example/Editor',
    component: Editor,
} as Meta;

const editorName = 'editor';

type StoryProps = EditorProps & {
    componentsUrl?: string;
};

const Template: StoryFn<StoryProps> = ({ componentsUrl, components: rawComponents, ...props }) => {
    const [value, setValue] = useState<string>('');
    const [components, setComponents] = useState<MdxComponents>(rawComponents);

    const onChange = useCallback(
        (event: EditorOnChangeEvent) => {
            setValue(event.target.value);
        },
        [setValue],
    );

    useEffect(() => {
        fetch(componentsUrl).then(async (res) => setComponents(await res.json()));
    }, [componentsUrl]);

    return (
        <Container>
            <Editor name={editorName} onChange={onChange} value={value} components={components} {...props} />
        </Container>
    );
};

export const Default = Template.bind({});
Default.args = {
    previewUrl:
        'https://paulislava.space/iframe.html?viewMode=story&id=example-mdx--default',
    componentsUrl: 'https://paulislava.space/mdx-components.json',
    fragments: [
        {
            Title: 'test',
            Content: 'asdasdasd',
            Description: 'asfdsgsdg',
            Preview: {
                url: 'https://paulislava.space/misc/0.0.0/assets/common/b33920fb_humane_analyst.jpeg',
            },
        },
        {
            Title: 'test',
            Content: 'asdasdasd',
            Description: 'asfdsgsdg',
            Preview: {
                url: 'https://paulislava.space/misc/0.0.0/assets/common/b33920fb_humane_analyst.jpeg',
            },
        },
        {
            Title: 'test',
            Content: 'asdasdasd',
            Description: 'asfdsgsdg',
            Preview: {
                url: 'https://paulislava.space/misc/0.0.0/assets/common/b33920fb_humane_analyst.jpeg',
            },
        },
        {
            Title: 'test',
            Content: 'asdasdasd',
            Description: 'asfdsgsdg',
            Preview: {
                url: 'https://paulislava.space/misc/0.0.0/assets/common/b33920fb_humane_analyst.jpeg',
            },
        },
        {
            Title: 'test',
            Content: 'asdasdasd',
            Description: 'asfdsgsdg',
            Preview: {
                url: 'https://paulislava.space/misc/0.0.0/assets/common/b33920fb_humane_analyst.jpeg',
            },
        },
        {
            Title: 'test',
            Content: 'asdasdasd',
            Description: 'asfdsgsdg',
            Preview: {
                url: 'https://paulislava.space/misc/0.0.0/assets/common/b33920fb_humane_analyst.jpeg',
            },
        },
        {
            Title: 'test',
            Content: 'asdasdasd',
            Description: 'asfdsgsdg',
            Preview: {
                url: 'https://paulislava.space/misc/0.0.0/assets/common/b33920fb_humane_analyst.jpeg',
            },
        },
    ],
} as Partial<StoryProps>;
