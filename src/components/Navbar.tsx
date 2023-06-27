import Link from "next/link";
import {Icons} from "@/components/Icons";
import {buttonVariants} from "@/components/ui/Button";
import {getAuthSession} from "@/lib/auth";

const Navbar = async () => {
    const session = await getAuthSession();
    return (
        <>
            <div className='fixed top-0 inset-x-0 h-fit bg-zinc-100 border-b border-zinc-300 z-10 py-2'>
                <div className='container max-w-7xl h-full mx-auto flex items-center justify-between gap-2'>
                    <Icons.logo className='h-8 w-8 sm:h-6 sm:w-6' />
                    <Link href='/' className='flex gap-2 items-center'>
                        <p className='hidden text-zinc-700 text-sm font-medium md:block'>Reddit Clone</p>
                    </Link>

                    {session ? (
                        <p>Youre logged in</p>
                        ) : (
                        <Link href='/sign-in' className={buttonVariants()}>Sign In</Link>
                        )}
                </div>
            </div>
        </>
    )
}

export default Navbar
