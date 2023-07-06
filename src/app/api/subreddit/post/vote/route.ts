import {PostVoteSchema} from "@/lib/validators/vote";
import {getAuthSession} from "@/lib/auth";
import {db} from "@/lib/db";
import type  {CachedPost} from "@/types/redis";
import {redis} from "@/lib/redis";
import {z} from "zod";


const  CACHE_AFTER_UPVOTES = 1
export async function PATCH(req: Request) {
    try {
        const  payload = await req.json()
        const { postId, voteType } = PostVoteSchema.parse(payload)

        const session = await getAuthSession()

        if (!session?.user) {
            return new Response("Unauthorized", { status: 401 })
        }

        const voteExists = await db.vote.findFirst({
            where: {
                userId: session.user.id,
                postId: postId
            },
        })

        const post = await db.post.findUnique({
            where: {
                id: postId
            },
            include: {
                author: true,
                votes: true,
            },
        })

        if (!post) {
            return new Response("Post not found", { status: 404 })
        }

        if (voteExists) {
            if (voteExists.type === voteType) {
                await db.vote.delete({
                    where: {
                        userId_postId: {
                            postId: postId,
                            userId: session.user.id
                        }
                    },
                })
                return new Response("Vote removed", { status: 200 })
            }

            await db.vote.update({
                where: {
                    userId_postId: {
                        postId: postId,
                        userId: session.user.id
                    }
                },
                data: {
                    type: voteType
                }
            })

            // recount the votes
            const votesCount = post.votes.reduce((acc, vote) => {
                if (vote.type === "UP") return acc + 1
                if (vote.type === "DOWN") return acc - 1
                return acc
            }, 0)

            if(votesCount >= CACHE_AFTER_UPVOTES) {
                const cachePayload: CachedPost = {
                    id: post.id,
                    authorUsername: post.author.username ?? "",
                    content: JSON.stringify(post.content),
                    createdAt: post.createdAt,
                    title: post.title,
                    currentVote: voteType,
                }

                await redis.hset(`post:${post.id}`, cachePayload)
            }
            return new Response("Vote updated", { status: 200 })
        }

        await db.vote.create({
            data: {
                type: voteType,
                userId: session.user.id,
                postId: postId
            },
        })

        // recount the votes
        const votesCount = post.votes.reduce((acc, vote) => {
            if (vote.type === "UP") return acc + 1
            if (vote.type === "DOWN") return acc - 1
            return acc
        }, 0)

        if(votesCount >= CACHE_AFTER_UPVOTES) {
            const cachePayload: CachedPost = {
                id: post.id,
                authorUsername: post.author.username ?? "",
                content: JSON.stringify(post.content),
                createdAt: post.createdAt,
                title: post.title,
                currentVote: voteType,
            }

            await redis.hset(`post:${post.id}`, cachePayload)
        }

        return new Response("Vote created", { status: 200 })

    } catch (e) {
        if (e instanceof z.ZodError) {
            return new Response('Invalid request data', {status: 422});
        }

        return new Response('Could not vote at this time, Try again later', {status: 500});

    }
}