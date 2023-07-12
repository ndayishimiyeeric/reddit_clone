"use client"

import React, {useRef} from "react";
import UserAvatar from "@/components/UserAvatar";
import type {User, CommentVote, Comment} from "@prisma/client";
import {formatTimeToNow} from "@/utils";
import CommentVotes from "@/components/CommentVotes";
import {Button} from "@/components/ui/Button";
import {EyeIcon, EyeOff, MessageSquare} from "lucide-react";
import type {Session} from "next-auth";
import {useRouter} from "next/navigation";
import {Textarea} from "@/components/ui/Textarea";
import {useMutation} from "@tanstack/react-query";
import {CommentType} from "@/lib/validators/comment";
import axios, {AxiosError} from "axios";
import {toast} from "@/hooks/use-toast";
import {useCustomToast} from "@/hooks/use-custom_toast";

type ExtendedComment = Comment & {
    votes: CommentVote[];
    author: User;
};
interface PostCommentProps {
    comment: ExtendedComment;
    votesCount: number;
    currentVote: CommentVote | undefined;
    postId: string;
    session: Session | null;
    repliesCount?: number;
    showRepliesOfComment?: string;
    setShowRepliesOfComment?: (id: string) => void;
}

const PostComment = (
    {
        comment,
        votesCount,
        currentVote,
        session,
        postId,
        repliesCount,
        showRepliesOfComment,
        setShowRepliesOfComment,
    }: PostCommentProps
) => {
    const commentRef = useRef<HTMLDivElement>(null);
    const router = useRouter()
    const {loginToast} = useCustomToast();

    const [isReplying, setIsReplying] = React.useState<boolean>(false);
    const [input, setInput] = React.useState<string>('');

    const handleShowReplies = (id: string) => {
        if (showRepliesOfComment === id) {
            setShowRepliesOfComment ? setShowRepliesOfComment('') : null;
        } else {
            setShowRepliesOfComment ? setShowRepliesOfComment(id) : null;
        }
    }

    const {mutate: createComment, isLoading} = useMutation({
        mutationFn: async ({postId, content, replyToId}: CommentType) => {
            const payload: CommentType = {
                postId,
                content,
                replyToId,
            }

            const {data} = await axios.patch('/api/subreddit/post/comment', payload)

            return data
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
            setInput('');
            setIsReplying(false);
        },
    })
    return (
        <div className='flex flex-col' ref={commentRef}>
            <div className='flex items-center'>
                <UserAvatar
                    user={{name: comment.author.name || null, image: comment.author.image || null}}
                    className='w-6 h-6'
                />

                <div className='ml-2 flex items-center gap-x-2'>
                    <p className='text-sm font-medium text-gray-900'>u/{comment.author.username}</p>
                    <p className='max-h-40 truncate text-xs text-zinc-500'>{formatTimeToNow(new Date(comment.createdAt))}</p>
                </div>
            </div>
            <p className='text-sm text-zinc-900 mt-2'>{comment.content}</p>

            <div className='flex gap-2 items-center flex-wrap'>
                <CommentVotes
                    commentId={comment.id}
                    initialVotesCount={votesCount}
                    initialVoteType={currentVote}
                />

                <Button
                    variant="ghost"
                    size='xs'
                    aria-label='reply'
                    onClick={() => {
                        if(!session?.user) return router.push('/sign-in')

                        setIsReplying(true)
                    }}
                >
                    <p className='text-zinc-500 text-xs mr-1'>{repliesCount}</p>
                    <MessageSquare className='w-4 h-4 mr-1.5'/>
                </Button>

                {isReplying ? (
                    <div className='grid w-full gap-1.5'>
                        <div className='mt-2'>
                            <Textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                rows={1}
                                placeholder={'What are your thoughts?'}
                            />
                        </div>

                        <div className='mt-2 flex justify-end'>
                            <Button
                                tabIndex={-1}
                                variant='subtle'
                                onClick={() => {
                                    setIsReplying(false)
                                    setInput('')
                                }}
                                className='mr-2'
                            >Cancel</Button>
                            <Button
                                disabled={input.length === 0}
                                isLoading={isLoading}
                                onClick={() => {
                                    if (input.length === 0) return;
                                    createComment({
                                        postId: postId,
                                        content: input,
                                        replyToId: comment.replyToId ?? comment.id,
                                    })
                                }}
                            >Post</Button>
                        </div>
                    </div>
                ) : null}

                {!comment.replyToId &&
                    (
                        <Button
                            variant={"ghost"}
                            size={"sm"}
                            className='text-xs text-zinc-500'
                            onClick={() => {
                                if (repliesCount === 0) return;
                                if (setShowRepliesOfComment) {
                                    handleShowReplies(comment.id);
                                }
                            }}
                        >
                            {showRepliesOfComment != comment.id ? (<EyeIcon className='w-5 h-5'/>) : (<EyeOff className='w-5 h-5'/>)}
                        </Button>
                    )
                }
            </div>
        </div>
    )
};

export default PostComment;
