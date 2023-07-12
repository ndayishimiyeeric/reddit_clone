"use client"

import React from "react";
import {Label} from "@/components/ui/Label";
import {Textarea} from "@/components/ui/Textarea";
import {Button} from "@/components/ui/Button";
import {useMutation} from "@tanstack/react-query";
import {CommentType} from "@/lib/validators/comment";
import axios, {AxiosError}  from "axios";
import {toast} from "@/hooks/use-toast";
import {useCustomToast} from "@/hooks/use-custom_toast";
import {useRouter} from "next/navigation";

interface CreateCommentProps {
    postId: string;
    replyToId?: string;
}

const CreateComment = ({postId, replyToId}: CreateCommentProps) => {
    const [comment, setComment] = React.useState('');
    const {loginToast} = useCustomToast();
    const router = useRouter();

    const {mutate: createComment, isLoading} = useMutation({
        mutationFn: async ({postId, content, replyToId}: CommentType) => {
            const payload: CommentType = {
                postId,
                content,
                replyToId,
            }

            const {data} = await axios.patch(`/api/subreddit/post/comment`, payload);
            return data;
        },
        onError: (err) => {
            if (err instanceof AxiosError) {
                if (err.response?.status === 401) {
                    return loginToast();
                }
            }

            return toast({
                title: "An error occurred.",
                description: `Unable to comment to reply to this post.`,
                variant: "destructive",
            })
        },
        onSuccess: () => {
            router.refresh();
            setComment('');
        },
    })
    return (
        <div className='grid w-full gap-1.5'>
            <Label htmlFor='comment'>Your comment</Label>
            <div className='mt-2'>
                <Textarea
                    id='comment'
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={1}
                    placeholder={'What are your thoughts?'}
                />
            </div>

            <div className='mt-2 flex justify-end'>
                <Button
                    disabled={comment.length === 0}
                    isLoading={isLoading}
                    onClick={() => createComment({postId, content: comment, replyToId})}
                >Post</Button>
            </div>
        </div>
    )
};

export default CreateComment;
