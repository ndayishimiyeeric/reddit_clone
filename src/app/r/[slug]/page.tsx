import React from "react";
import {getAuthSession} from "@/lib/auth";
import {db} from "@/lib/db";
import {INFINITE_SCROLL_PAGE_SIZE} from "@/config";
import {notFound} from "next/navigation";
import MiniCreatePost from "@/components/MiniCreatePost";

interface pageProps {
    params: {
        slug: string;
    }
}
const Page = async ({params}: pageProps) => {
    const {slug} = params;
    const session = await getAuthSession();
    const subreddit = await db.subreddit.findFirst({
        where: {
            name: slug,
        },
        include: {
            posts: {
                include: {
                    author: true,
                    votes: true,
                    subreddit: true,
                    comments: true,
                },

                take: INFINITE_SCROLL_PAGE_SIZE,
            },
        },
    })

    if (!subreddit) return notFound()
    return (
        <>
            <h1 className="font-bold text-3xl md:text-4xl h-14">r/{subreddit.name}</h1>
            <MiniCreatePost session={session} />

            {/* TODO: Show posts in user feed   */}
        </>
    )
};

export default Page;