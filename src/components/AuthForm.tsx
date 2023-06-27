"use client"

import React from "react";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/Button";
import {signIn} from "next-auth/react";
import {Icons} from "@/components/Icons";
import {useToast} from "@/hooks/use-toast";

interface AuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}
const AuthForm: React.FC<AuthFormProps> = ({className, ...props}) => {
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const {toast} = useToast();

    const loginWithGoogle = async () => {
        setIsLoading(true);
        try {
            await signIn('google')
        } catch (error) {
            // toast notification
            toast({
                title: 'There was an error',
                description: 'There was an error logging in with Google. Please try again.',
                variant: 'destructive'
            })
        } finally {
            setIsLoading(false);
        }
    }
    return (
        <div className={cn('flex justify-center', className)} {...props}>
            <Button onClick={loginWithGoogle} isLoading={isLoading} size='lg'>
                {isLoading ? null : <Icons.google className='h-5 w-5 mr-2' />}
                Google
            </Button>
        </div>
    )
};

export default AuthForm;