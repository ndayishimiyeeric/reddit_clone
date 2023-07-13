import React from "react";
import {getAuthSession} from "@/lib/auth";
import {db} from "@/lib/db";
import CommentSectionClient from "@/components/CommentSection/CommentSectionClient";

interface CommentSectionProps {
    postId: string;
}

const CommentSection = async ({postId}: CommentSectionProps) => {
    const session = await getAuthSession();
    const comments = await db.comment.findMany({
        where: {
            postId: postId,
            replyToId: null,
        },
        include: {
            author: true,
            votes: true,
            replies: {
                include: {
                    author: true,
                    votes: true,
                }
            },
        }
    })
    return <CommentSectionClient postId={postId} session={session} comments={comments}/>
};

export default CommentSection;
