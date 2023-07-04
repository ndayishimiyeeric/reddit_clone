"use client"

import React, {useCallback, useRef, useEffect, useState} from "react";
import TextareaAutosize from "react-textarea-autosize";
import {useForm} from "react-hook-form";
import {PostCreationValidatorType, PostValidator} from "@/lib/validators/post";
import {zodResolver} from "@hookform/resolvers/zod";
import type EditorJS from "@editorjs/editorjs";
import {uploadFiles} from "@/lib/uploadthing";
import {toast} from "@/hooks/use-toast";
import {useMutation} from "@tanstack/react-query";
import axios from "axios";
import {usePathname, useRouter} from "next/navigation";

interface EditorProps {
    subredditId: string;
}
const Editor: React.FC<EditorProps> = ({subredditId}) => {
    const pathname = usePathname();
    const router = useRouter();
    const ref = useRef<EditorJS>();
    const [isMounted, setIsMounted] = useState<boolean>(false);
    const _titleRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsMounted(true);
        }
    }, [])

    const {
        register,
        handleSubmit,
        formState: {errors}
    } = useForm<PostCreationValidatorType>({
        resolver: zodResolver(PostValidator),
        defaultValues: {
            subredditId,
            title: '',
            content: null,
        }
    });

    const initializeEditor = useCallback(async () => {
        const EditorJS = (await import('@editorjs/editorjs')).default
        const Header = (await import('@editorjs/header')).default
        const Embed = (await import('@editorjs/embed')).default
        const List = (await import('@editorjs/list')).default
        const Table = (await import('@editorjs/table')).default
        const Code = (await import('@editorjs/code')).default
        const LinkTool = (await import('@editorjs/link')).default
        const InlineCode = (await import('@editorjs/inline-code')).default
        const ImageTool = (await import('@editorjs/image')).default

        if(!ref.current) {
            const editor = new EditorJS({
                holder: 'editorJs',
                onReady() {
                    ref.current = editor;
                },
                placeholder: 'Start typing your post...',
                inlineToolbar: true,
                data: {blocks: []},
                tools: {
                    header: Header,
                    linkTool: {
                        class: LinkTool,
                        config: {
                            endpoint: '/api/link'
                        },
                    },
                    image: {
                        class: ImageTool,
                        config: {
                            uploader: {
                                async uploadByFile(file: File) {
                                    const [res] = await uploadFiles([file], 'imageUploader')
                                    return {
                                        success: 1,
                                        file: {
                                            url: res.fileUrl,
                                        },
                                    }
                                },
                            },
                        },
                    },
                    code: Code,
                    inlineCode: InlineCode,
                    list: List,
                    table: Table,
                    embed: Embed,
                },
            })
        }
    }, [])

    useEffect(() => {
        if (Object.keys(errors).length) {
            for(const [_key, value] of Object.entries(errors)) {
                toast({
                    title: 'Something went wrong',
                    description: (value as {message: string}).message,
                    variant: 'destructive'
                })
            }
        }
    }, [errors])

    useEffect(() => {
        const init = async () => {
            await initializeEditor();

            setTimeout(() => {
                _titleRef.current?.focus();
            }, 0)
        }

        if (isMounted) {
            init().then(r => r);

            return () => {
                ref.current?.destroy();
                ref.current = undefined;
            }
        }
    }, [isMounted, initializeEditor])

    const {mutate: createPost} = useMutation({
        mutationFn: async ({title, content, subredditId}: PostCreationValidatorType) => {
            const payload: PostCreationValidatorType = {
                title,
                content,
                subredditId,
            }
            const {data} = await axios.post('/api/subreddit/post/create', payload)
            return data;
        },

        onError: () => {
            return toast({
                title: 'Something went wrong',
                description: 'Post not published try again later.',
                variant: 'destructive'
            })
        },

        onSuccess: () => {
            const newPathname = pathname.split('/').slice(0, -1).join('/')
            router.push(newPathname)

            router.refresh();

            return toast({
                title: 'Post published',
                description: `Your post has been published`,
            })
        },
    })

    async function submit(data: PostCreationValidatorType) {
        const blocks = await ref.current?.save();
        const payload: PostCreationValidatorType = {
            title: data.title,
            content: blocks,
            subredditId: subredditId,
        }

        createPost(payload);
    }

    if(!isMounted) return null;

    const {ref: titleRef, ...rest} = register('title');

    return (
        <div className='w-full p-4 bg-zinc-50 rounded-lg border border-zinc-200'>
            <form
                id='subreddit-post-form'
                className='w-fit'
                onSubmit={handleSubmit(submit)}
            >
                <div className='prose prose-stone dark:prose-invert'>
                    <TextareaAutosize
                        ref={(e) => {
                            titleRef(e)

                            // @ts-ignore
                            _titleRef.current = e
                        }}
                        {...rest}
                        placeholder='Title'
                        className='w-full resize-none appearance-none overflow-hidden bg-transparent text-5xl font-bold focus:outline-none'
                    />

                    <div id="editorJs" className='min-h-[500px]'/>
                </div>
            </form>
        </div>
    )
};

export default Editor;