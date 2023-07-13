import {getAuthSession} from "@/lib/auth";
import {UsernameSchema} from "@/lib/validators/username";
import {db} from "@/lib/db";
import {z} from "zod";
import {redis} from "@/lib/redis";
import {CachedPost} from "@/types/redis";

export async function PATCH(req: Request) {
    try {
        const session = await getAuthSession();
        const payload = await req.json();
        const {name} = UsernameSchema.parse(payload);

        if (!session?.user) {
            return new Response('Unauthorized', {status: 401});
        }

        const usernameExists = await db.user.findFirst({
            where: {
                username: name,
            },
        })

        if (usernameExists) {
            return new Response('Username already exists', {status: 409});
        }

        const oldUsername = session.user.username

        await db.user.update({
            where: {
                id: session.user.id,
            },
            data: {
                username: name,
            },
        })

        // update all cached posts with new username
        const postKeys = await redis.keys(`post:*`);
        if (postKeys.length > 0) {
            for (const key of postKeys) {
                const cachedPost = await redis.hgetall(key) as CachedPost;

                if (cachedPost.authorUsername === oldUsername) {
                    cachedPost.authorUsername = name;

                    await redis.hmset(key, cachedPost);
                }
            }
        }

        return new Response('OK', {status: 200});
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response('Invalid data', {status: 422});
        }

        return new Response('Internal Server Error could not update username', {status: 500});
    }
}