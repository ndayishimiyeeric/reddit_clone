import {getAuthSession} from "@/lib/auth";
import {SubredditSubscriptionSchema} from "@/lib/validators/subreddit";
import {db} from "@/lib/db";
import {z} from "zod";

export async function POST(req: Request) {
    try {
        const session = await getAuthSession()

        if(!session?.user) {
            return new Response('Unauthorized', {status: 401})
        }

        const payload = await req.json()
        const {subredditId} = SubredditSubscriptionSchema.parse(payload)

        const subscriptionExists = await db.subscription.findFirst({
            where: {
                subredditId: subredditId,
                userId: session.user.id
            }
        })

        if (!subscriptionExists) {
            return new Response('You are not subscribed to this subreddit.', {status: 400})
        }

        // Check if the user is the creator of the subreddit
        const subreddit = await db.subreddit.findFirst({
            where: {
                id: subredditId,
                creatorId: session.user.id
            }
        })

        if(subreddit) {
            return new Response('You can not unsubscribe from your own community', {status: 400})
        }

        await db.subscription.delete({
            where: {
                userId_subredditId: {
                    subredditId,
                    userId: session.user.id
                }
            }
        })

        return new Response('Unsubscribed to Community', {status: 200})
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response('Invalid request data', {status: 422});
        }

        return new Response('Could not subscribe, Try again later', {status: 500});
    }
}