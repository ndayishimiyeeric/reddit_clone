"use client"

import React, {startTransition} from "react"
import {Button} from "@/components/ui/Button";
import {useMutation} from "@tanstack/react-query";
import {SubredditSubscriptionPayload} from "@/lib/validators/subreddit";
import axios, {AxiosError} from "axios";
import {useCustomToast} from "@/hooks/use-custom_toast";
import {toast} from "@/hooks/use-toast";
import {useRouter} from "next/navigation";

interface SubscriberLeaveToggleProps {
    subredditID: string;
    subredditName: string;
    isSubscribed: boolean;
}

const SubscriberLeaveToggle: React.FC<SubscriberLeaveToggleProps> = (
    {subredditID, subredditName, isSubscribed}
) => {
    const {loginToast} = useCustomToast();
    const router = useRouter();

    const {mutate: subscribe, isLoading: isSubscriptionLoading} = useMutation({
        mutationFn: async () => {
            const payload: SubredditSubscriptionPayload = {
                subredditId: subredditID,
            }

            const {data} = await axios.post('/api/subreddit/subscribe', payload)

            return data as string;
        },
        onError: (err) => {
            if (err instanceof AxiosError) {
                if (err.response?.status === 401) {
                    return loginToast();
                }
            }

            return toast({
                title: "An error occurred.",
                description: `Unable to subscribe to r/${subredditName}.`,
                variant: "destructive",
            })
        },

        onSuccess: () => {
            startTransition(() => {
                router.refresh()
            })

            return toast({
                title: 'Subscribed',
                description: `You are now subscribed to r/${subredditName}`
            })
        }
    })

    const {mutate: unsubscribe, isLoading: isUnSubscriptionLoading} = useMutation({
        mutationFn: async () => {
            const payload: SubredditSubscriptionPayload = {
                subredditId: subredditID,
            }

            const {data} = await axios.post('/api/subreddit/unsubscribe', payload)

            return data as string;
        },
        onError: (err) => {
            if (err instanceof AxiosError) {
                if (err.response?.status === 401) {
                    return loginToast();
                }
            }

            return toast({
                title: "An error occurred.",
                description: `Unable to unsubscribe to r/${subredditName}.`,
                variant: "destructive",
            })
        },

        onSuccess: () => {
            startTransition(() => {
                router.refresh()
            })

            return toast({
                title: 'Unsubscribed',
                description: `You are now unsubscribed from r/${subredditName}.`
            })
        }
    })

    return isSubscribed ? (
        <Button
            className='w-full mt-1 mb-4'
            onClick={() => unsubscribe()}
            isLoading={isUnSubscriptionLoading}
        >Leave Community</Button>
    ) : (
        <Button
            className='w-full mt-1 mb-4'
            onClick={() => subscribe()}
            isLoading={isSubscriptionLoading}
        >Join Community</Button>
    )
}

export default SubscriberLeaveToggle