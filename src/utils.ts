import {db} from "@/lib/db";

export const getSubreddit = async (name: string) => {
    const subredditData = await db.subreddit.findFirst({
        where: {
            name: name
        },
        include: {
            posts: {
                include: {
                    author: true,
                    subreddit: true,
                    votes: true,
                    comments: true,
                }
            },
        },
    })

    return subredditData
}