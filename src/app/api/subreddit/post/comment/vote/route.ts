import {getAuthSession} from "@/lib/auth";
import {CommentVoteSchema} from "@/lib/validators/vote";
import {db} from "@/lib/db";
import {z} from "zod";

export async function PATCH(req: Request) {
    try {
        const session = await getAuthSession();
        const payload = await req.json();
        const {commentId, voteType} = CommentVoteSchema.parse(payload);

        if(!session?.user) {
            return new Response("Unauthorized", {status: 401});
        }

        const voteExists = await db.commentVote.findFirst({
            where: {
                userId: session.user.id,
                commentId: commentId
            }
        })

        const comment = await db.comment.findUnique({
            where: {
                id: commentId
            },
            include: {
                author: true,
                votes: true,
            },
        })

        if (!comment) {
            return new Response("Comment not found", {status: 404});
        }

        if (voteExists) {
            if (voteExists.type === voteType) {
                await db.commentVote.delete({
                    where: {
                        userId_commentId: {
                            commentId: commentId,
                            userId: session.user.id
                        }
                    }
                })
                return new Response("Vote removed", {status: 200});
            }

            await db.commentVote.update({
                where: {
                    userId_commentId: {
                        commentId: commentId,
                        userId: session.user.id
                    }
                },
                data: {
                    type: voteType
                }
            })
            return new Response("Vote updated", {status: 200});
        }

        await db.commentVote.create({
            data: {
                type: voteType,
                commentId: commentId,
                userId: session.user.id
            }
        })
        return new Response("Vote created", {status: 200});
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response('Invalid request data', {status: 422});
        }

        return new Response('Could not vote at this time, Try again later', {status: 500});
    }
}
