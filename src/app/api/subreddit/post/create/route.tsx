import {getAuthSession} from "@/lib/auth";
import {db} from "@/lib/db";
import {z} from "zod";
import {PostValidator} from "@/lib/validators/post";

export async function POST(req: Request) {
    try {
        const session = await getAuthSession();

        if (!session?.user) {
            return new Response('Unauthorized', {status: 401});
        }

        const payload = await req.json();

        const {subredditId, title, content} = PostValidator.parse(payload);

        const subscriptionExists = await db.subscription.findFirst({
            where: {
                subredditId: subredditId,
                userId: session.user.id,
            },
        })

        if (!subscriptionExists) {
            return new Response('Subscribe to post.', {status: 400});
        }

        await db.post.create({
            data: {
                title,
                content,
                authorId: session.user.id,
                subredditId,
            },
        })
        return new Response('OK.', {status: 200});
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response('Invalid request data', {status: 422});
        }

        return new Response('Could not post at this time, Try again later', {status: 500});
    }
}
