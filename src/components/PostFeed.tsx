"use client"

import React from "react";
import {ExtendedPost} from "@/types/db";
import {useIntersection} from "@mantine/hooks";
import {useInfiniteQuery} from "@tanstack/react-query";
import {INFINITE_SCROLL_PAGE_SIZE} from "@/config";
import axios from "axios";
import Post from "@/components/Post";
import type {Session} from "next-auth";

interface PostFeedProps {
    initialPosts: ExtendedPost[];
    subredditName?: string;
    session: Session | null;
}
const PostFeed: React.FC<PostFeedProps> = ({initialPosts, subredditName, session}) => {
    const lastPostRef = React.useRef<HTMLElement>(null);

    const {ref, entry} = useIntersection({
        root: lastPostRef.current,
        threshold: 1,
    })

    const {data, fetchNextPage, isFetchingNextPage} = useInfiniteQuery(["infinite-posts"], async ({pageParam = 1}) => {
            const query = `/api/posts?limit=${INFINITE_SCROLL_PAGE_SIZE}&page=${pageParam}` + (!!subredditName ? `&subredditName=${subredditName}` : "");
            const {data} = await axios.get(query);
            return data as ExtendedPost[];
        },
        {
            getNextPageParam: (_, pages) => {
                return pages.length + 1;
            },
            initialData: {pages: [initialPosts], pageParams: [1]},
        },
    )

    React.useEffect(() => {
        if (entry?.isIntersecting) {
            fetchNextPage().then(r => r);
        }
    }, [entry, fetchNextPage]);

    const posts = data?.pages.flatMap((page) => page) ?? initialPosts;

    return <ul className='flex flex-col col-span-2 space-y-6'>
        {posts.map((post, index) => {
            const voteCount = post.votes.reduce((acc, vote) => {
                if (vote.type === "UP") return acc + 1;
                if (vote.type === "DOWN") return acc - 1;
                return acc;
            }, 0)

            const userVote = post.votes.find((vote) => vote.userId === session?.user.id);

            if(index === posts.length -1) {
                return <li key={post.id} ref={ref}>
                    <Post
                        subredditName={post.subreddit.name}
                        post={post}
                        commentCount={post.comments.length}
                        currentVote={userVote}
                        voteCount={voteCount}
                    />
                </li>
            } else {
                return <Post
                    key={post.id}
                    subredditName={post.subreddit.name}
                    post={post}
                    commentCount={post.comments.length}
                    currentVote={userVote}
                    voteCount={voteCount}
                />
            }
        })}
    </ul>
};

export default PostFeed;