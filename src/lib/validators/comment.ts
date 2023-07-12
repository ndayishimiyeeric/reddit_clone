import {z} from "zod";

export const CommentSchema = z.object({
    postId: z.string(),
    content: z.string(),
    replyToId: z.string().optional(),
});

export type CommentType = z.infer<typeof CommentSchema>;
