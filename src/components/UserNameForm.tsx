"use client";

import React from "react";
import {useForm} from "react-hook-form";
import {UsernameSchema, UsernameSchemaType} from "@/lib/validators/username";
import {zodResolver} from "@hookform/resolvers/zod";
import type {Session} from "next-auth";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/Card";
import {Label} from "@/components/ui/Label";
import {Input} from "@/components/ui/Input";
import {Button} from "@/components/ui/Button";
import {useMutation} from "@tanstack/react-query";
import axios, {AxiosError} from "axios";
import {toast} from "@/hooks/use-toast";
import {useRouter} from "next/navigation";
import {useCustomToast} from "@/hooks/use-custom_toast";

interface UserNameFormProps{
    session: Session | null;
}

const UserNameForm = ({session} : UserNameFormProps) => {
    const router = useRouter();
    const {loginToast} = useCustomToast();

    const {
        register,
        handleSubmit,
        formState: {errors},
    } = useForm<UsernameSchemaType>({
        resolver: zodResolver(UsernameSchema),
        defaultValues: {
            name: session?.user.username || "",
        },
    })

    const {mutate: updateUsername, isLoading} = useMutation({
        mutationFn: async ({name}: UsernameSchemaType) => {
            const payload: UsernameSchemaType = {
                name,
            }

            const {data} = await axios.patch('/api/settings', payload)
            return data
        },
        onError: (err) => {
            if(err instanceof AxiosError) {
                if(err.response?.status === 409) {
                    return toast({
                        title: "username not available.",
                        description: "A user with that username already exists.",
                        variant: "destructive"
                    })
                }

                if(err.response?.status === 422) {
                    return toast({
                        title: "Invalid username name.",
                        description: "Username must be between 3 and 32 characters long and can only contain letters, numbers, and underscores.",
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

        onSuccess: () => {
            toast({
                title: "Username updated.",
                description: "Your username has been updated.",
            })
            router.refresh();
        },
    })
    return (
        <form onSubmit={handleSubmit((e) => updateUsername(e))} id='change-username'>
            <Card>
                <CardHeader>
                    <CardTitle>Your username</CardTitle>
                    <CardDescription>Please add a display username</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative grid gap-1">
                        <div className="absolute top-0 left-0 w-8 h-10 grid place-items-center">
                            <span className='text-sm text-zinc-400'>u/</span>
                        </div>

                        <Label className="sr-only" htmlFor='name'>Name</Label>
                        <Input
                            id='name'
                            className='w-[400px] pl-6'
                            size={32}
                            {...register("name")}
                            placeholder={session?.user.username || "Username"}
                        />
                        {errors?.name && (
                            <p className='px-1 text-xs text-red-600'>{errors.name.message}</p>
                        )}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type='submit' id='change-username' isLoading={isLoading}>Update username</Button>
                </CardFooter>
            </Card>
        </form>
    );
};

export default UserNameForm;
