import {db} from "@/lib/db";

export const getSubreddit = async (id: string) => {
    const subreddit = await db.subreddit.findFirst({
        where: {
            id: id,
        },
    })

    return subreddit?.name || null
}