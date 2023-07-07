import React from "react";
import {db} from "@/lib/db";
import {INFINITE_SCROLL_PAGE_SIZE} from "@/config";
import PostFeed from "@/components/PostFeed";
import {getAuthSession} from "@/lib/auth";

const GeneralFeed = async () => {
    const session = await getAuthSession();
    const posts = await db.post.findMany({
        orderBy: {
            createdAt: 'desc',
        },
        include: {
            votes: true,
            author: true,
            comments: true,
            subreddit: true,
        },
        take: INFINITE_SCROLL_PAGE_SIZE,
    })

    return (
        <PostFeed initialPosts={posts} session={session}/>
    )
};

export default GeneralFeed;