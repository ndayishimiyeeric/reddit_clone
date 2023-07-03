import {getAuthSession} from "@/lib/auth";
import {SubredditSubscriptionSchema} from "@/lib/validators/subreddit";
import {db} from "@/lib/db";
import {z} from "zod";

export async function POST(req: Request) {
    try {
        const session = await getAuthSession();

        if (!session?.user) {
            return new Response('Unauthorized', {status: 401});
        }

        const payload = await req.json();

        const {subredditId} = SubredditSubscriptionSchema.parse(payload);

        const subscriptionExists = await db.subscription.findFirst({
            where: {
                subredditId: subredditId,
                userId: session.user.id,
            },
        })

        if (subscriptionExists) {
            return new Response('Already subscribed to this community.', {status: 400});
        }

        await db.subscription.create({
            data: {
                subredditId: subredditId,
                userId: session.user.id,
            },
        })
        return new Response('Subscribed to community.', {status: 200});
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response('Invalid request data', {status: 422});
        }

        return new Response('Could not subscribe, Try again later', {status: 500});
    }
}
