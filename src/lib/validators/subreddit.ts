import {z} from 'zod';

export const SubredditSchema = z.object({
    name: z.string().min(3).max(21).regex(/^[a-zA-Z0-9_]+$/),
})

export type CreateSubredditPayload = z.infer<typeof SubredditSchema>

export const SubredditSubscriptionSchema = z.object({
    subredditId: z.string()
})

export type SubredditSubscriptionPayload = z.infer<typeof SubredditSubscriptionSchema>
