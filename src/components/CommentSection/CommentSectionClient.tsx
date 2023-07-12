"use client"

import React from "react";
import PostComment from "@/components/PostComment";
import CreateComment from "@/components/CreateComment";
import {Session} from "next-auth";
import type {Comment, CommentVote, User} from "@prisma/client";

type ExtenedReply = Comment & {
    author: User;
    votes: CommentVote[];
}
type ExtendedComment = Comment & {
    author: User;
    votes: CommentVote[];
    replies: ExtenedReply[];
}

interface CommentSectionClientProps {
    postId: string;
    session: Session | null;
    comments: ExtendedComment[]
}

const CommentSectionClient = ({postId, session, comments}: CommentSectionClientProps) => {
    const [showRepliesOfComment, setShowRepliesOfComment] = React.useState<string>('');

    return (
        <div className='flex flex-col gap-y-4 mt-4'>
            <hr className='w-full h-px my-6'/>

            {/* Create comment */}
            <CreateComment postId={postId}/>

            <div className='flex flex-col gap-y-6 mt-4'>
                {comments
                    .filter((comment) => !comment.replyToId)
                    .map((comment) => {
                        const commentsVotesCount = comment.votes.reduce((acc,vote) => {
                            if (vote.type === 'UP') return acc + 1;
                            if (vote.type === 'DOWN') return acc - 1;
                            return acc;
                        }, 0)

                        const userCommentVote = comment.votes.find((vote) => vote.userId === session?.user.id);

                        const repliesCount = comment.replies.length;
                        return <div key={comment.id}>
                            <div className='mb-2'>
                                <PostComment
                                    comment={comment}
                                    postId={postId}
                                    votesCount={commentsVotesCount}
                                    currentVote={userCommentVote}
                                    session={session}
                                    repliesCount={repliesCount}
                                    showRepliesOfComment={showRepliesOfComment}
                                    setShowRepliesOfComment={setShowRepliesOfComment}
                                />
                            </div>

                            {/* rendering replies */}
                            {showRepliesOfComment === comment.id && comment.replies
                                .sort((a, b) => b.votes.length - a.votes.length)
                                .map((reply) => {
                                    const replyVotesCount = reply.votes.reduce((acc,vote) => {
                                        if (vote.type === 'UP') return acc + 1;
                                        if (vote.type === 'DOWN') return acc - 1;
                                        return acc;
                                    }, 0)

                                    const userReplyVote = reply.votes.find((vote) => vote.userId === session?.user.id);
                                    return (
                                        <div
                                            key={reply.id}
                                            className='ml-2 py-2 pl-4 border-l border-zinc-200'
                                        >
                                            <PostComment
                                                comment={reply}
                                                currentVote={userReplyVote}
                                                votesCount={replyVotesCount}
                                                postId={postId}
                                                session={session}
                                            />
                                        </div>
                                    )
                                })
                            }
                        </div>
                })}
            </div>

        </div>
    )
};

export default CommentSectionClient;
