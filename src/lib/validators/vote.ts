import {z} from "zod";

export  const PostVoteSchema = z.object({
    postId: z.string(),
    voteType: z.enum(["UP", "DOWN"])
})

export type PostVoteType = z.infer<typeof PostVoteSchema>

export  const CommentVoteSchema = z.object({
    commentId: z.string(),
    voteType: z.enum(["UP", "DOWN"])
})

export type CommentVoteType = z.infer<typeof CommentVoteSchema>
