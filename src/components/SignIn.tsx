import React from "react";
import {Icons} from "@/components/Icons";
import Link from "next/link";
import AuthForm from "@/components/AuthForm";

const SignIn = () => {
    return (
        <>
            <div className='container mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]'>
                <div className='flex flex-col space-y-2 text-center'>
                    <Icons.logo className='mx-auto h-6 w-6' />
                    <h1 className='text-2xl font-semibold tracking-tight'>Welcome Back</h1>
                    <p className='text-sm max-w-xs mx-auto'>By Continuing you agree to our User privacy policies</p>
                </div>

                <AuthForm />

                <p className='px-8 text-center text-sm text-muted-foreground'>
                    Don&lsquo;t have an account? {' '}
                    <Link href='/sign-up' className='hover:text-zinc-800 text-sm underline underline-offset-4'>Sign Up</Link>
                </p>

            </div>
        </>
    )
}

export default SignIn;
