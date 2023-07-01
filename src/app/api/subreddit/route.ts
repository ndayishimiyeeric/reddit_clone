import {getAuthSession} from "@/lib/auth";
import {SubredditSchema} from "@/lib/validators/subreddit";
import {db} from "@/lib/db";
import {z} from "zod";

export  async function POST(req: Request) {
    try {
        const session = await getAuthSession();

        if (!session?.user) {
            return new Response('Unauthorized', {status: 401});
        }

        const body = await req.json();
        const {name} = SubredditSchema.parse(body);

        const subredditExists = await db.subreddit.findFirst({
            where: {
                name,
            },
        });
        if (subredditExists) {
            return new Response('Subreddit already exists', {status: 409});
        }

        const subreddit = await db.subreddit.create({
            data: {
                name,
                creatorId: session.user.id,
            }
        });

        await db.subscription.create({
            data: {
                userId: session.user.id,
                subredditId: subreddit.id,
            }
        })

        return new Response(subreddit.name, {status: 201})
    } catch (e) {
        if (e instanceof z.ZodError) {
            return new Response(e.message, {status: 422})
        }

        return new Response("Could not create subreddit", {status: 500})
    }
}