import {CommentSchema} from "@/lib/validators/comment";
import {getAuthSession} from "@/lib/auth";
import {db} from "@/lib/db";
import {z} from "zod";

export async function PATCH(req: Request) {
    try {
        const payload = await req.json();
        const {postId, content, replyToId} = CommentSchema.parse(payload);

        const session = await getAuthSession();
        if (!session?.user) {
            return new Response("Unauthorized", {status: 401});
        }

        await db.comment.create({
            data: {
                content,
                postId,
                authorId: session.user.id,
                replyToId,
            }
        })

        return new Response('Commented successfully', {status: 200});
    } catch (e) {
        if (e instanceof z.ZodError) {
            return new Response('Invalid request data', {status: 422});
        }

        return new Response('Could not comment at this time, Try again later', {status: 500});
    }
}