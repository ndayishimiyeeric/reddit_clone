import React from "react";
import dynamic from "next/dynamic";
import Image from "next/image";

const Output = dynamic(
    async () => (await import('editorjs-react-renderer')).default, {
        ssr: false,
    })

interface EditorOutputProps {
    content: any;
}

const CustomImageRenderer = ({data}: any) => {
    const src = data.file.url;

    return (
        <div className='relative w-full min-h-[15rem]'>
            <Image src={src} alt='image' fill className='object-contain' />
        </div>
    )
}

const CustomCodeRenderer = ({data}: any) => {
    return (
        <pre className='bg-gray-800 p-4 rounded-md'>
            <code className='text-gray-100 text-sm'>{data.code}</code>
        </pre>
    )
}

const renderers = {
    image: CustomImageRenderer,
    code: CustomCodeRenderer,
};

const style = {
    paragraph: {
        fontSize: '0.875rem',
        lineHeight: '1.25rem',
    }
}

const EditorOutput: React.FC<EditorOutputProps> = ({content}) => {
  return <Output data={content} style={style} className='text-sm' renderers={renderers}/>;
}

export default EditorOutput;
