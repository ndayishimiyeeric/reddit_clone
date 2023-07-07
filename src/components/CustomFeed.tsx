import {getAuthSession} from "@/lib/auth";
import {db} from "@/lib/db";
import {INFINITE_SCROLL_PAGE_SIZE} from "@/config";
import PostFeed from "@/components/PostFeed";
import React from "react";

const CustomFeed = async () => {
    const session = await getAuthSession();

    const followedCommunities = await db.subscription.findMany({
        where: {
            userId: session?.user.id,
        },
        include: {
            subreddit: true,
        }
    })

    const posts = await db.post.findMany({
        where: {
            subreddit: {
                name: {
                    in: followedCommunities.map((sub) => sub.subreddit.id)
                }
            }
        },
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

export default CustomFeed;