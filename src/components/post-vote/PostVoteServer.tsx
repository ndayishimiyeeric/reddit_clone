import React from "react";
import {Post, Vote, VoteType} from "@prisma/client";
import {getAuthSession} from "@/lib/auth";
import {notFound} from "next/navigation";
import PostVoteClient from "@/components/post-vote/PostVoteClient";

interface PostVoteServerProps {
    postId: string;
    initialVotesCount?: number;
    initialUserVote?: VoteType | null;
    getData?: () => Promise<(Post & {votes: Vote[]}) | null>
}

const PostVoteServer = async (
    {
        postId,
        initialVotesCount,
        initialUserVote,
        getData,
    } : PostVoteServerProps
) => {
    const session = await getAuthSession()

    let _votesCount: number = 0
    let _userVote: VoteType | null | undefined = undefined

    if (getData) {
        const post = await getData()
        if (!post)  return notFound()

        _votesCount = post.votes.reduce((acc, vote) => {
            if (vote.type === 'UP') return acc + 1
            if (vote.type === 'DOWN') return acc - 1
            return acc
        }, 0)

        _userVote = post.votes.find(vote => vote.userId === session?.user.id)?.type
    } else {
        _votesCount = initialVotesCount || 0
        _userVote = initialUserVote
    }

    return <PostVoteClient
        postId={postId}
        initialVotesCount={_votesCount}
        initialVoteType={_userVote}
    />;
};

export default PostVoteServer;
