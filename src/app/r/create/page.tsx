"use client"

import React from "react";
import {Input} from "@/components/ui/Input";
import {Button} from "@/components/ui/Button";
import {useRouter} from "next/navigation";
import  {useMutation} from "@tanstack/react-query";
import axios, {AxiosError} from "axios";
import {CreateSubredditPayload} from "@/lib/validators/subreddit";
import {toast} from "@/hooks/use-toast";
import {useCustomToast} from "@/hooks/use-custom_toast";

interface pageProps {}
const Page: React.FC<pageProps> = () => {
    const [input, setInput] = React.useState<string>("")
    const router = useRouter();
    const {loginToast} = useCustomToast();
    const {mutate: createCommunity, isLoading} = useMutation({
        mutationFn: async () => {
            const payload: CreateSubredditPayload = {
                name: input,
            }
            const {data} = await axios.post("/api/subreddit", payload);
            return data as string;
        },
        onError: (err) => {
            if(err instanceof AxiosError) {
                if(err.response?.status === 409) {
                    return toast({
                        title: "Community already exists.",
                        description: "A community with that name already exists.",
                        variant: "destructive"
                    })
                }

                if(err.response?.status === 422) {
                    return toast({
                        title: "Invalid Community name.",
                        description: "Community names must be between 3 and 21 characters long and can only contain letters, numbers, and underscores.",
                        variant: "destructive"
                    })
                }

                if(err.response?.status === 401) {
                    return loginToast();
                }
            }

            return toast({
                title: "An error occurred.",
                description: "Could not create Community. Please try again later.",
                variant: "destructive"
            })
        },

        onSuccess: (data) => {
            router.push(`/r/${data}`)
        },
    })
    return (
        <div className='container flex items-center h-full max-w-3xl mx-auto'>
            <div className="relative bg-white w-full h-fit p-4 rounded-lg space-y-6">
                <div className='flex justify-between items-center'>
                    <h1 className="text-xl font-semibold">Create a community</h1>
                </div>
                <hr className="bg-zinc-500 h-px"/>

                <div>
                    <p className="text-lg font-medium">Name</p>
                    <p className='text-xs pb-2'>Community names including capitalization cannot be changed.</p>

                    <div className='relative'>
                        <p className="absolute text-sm left-0 w-8 inset-y-0 grid place-items-center text-zinc-400">r/</p>
                        <Input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            className='pl-6'
                        />
                    </div>
                </div>

                <div className='flex justify-end gap-4'>
                    <Button
                        variant='subtle'
                        onClick={() => router.back()}
                    >Cancel</Button>
                    <Button
                        isLoading={isLoading}
                        disabled={input.length === 0}
                        onClick={() => createCommunity()}
                    >Create Community</Button>
                </div>
            </div>
        </div>
    )
};

export default Page;