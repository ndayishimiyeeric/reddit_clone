import React from "react";
import Link from "next/link";
import {cn} from "@/lib/utils";
import {buttonVariants} from "@/components/ui/Button";
import {ChevronLeft} from "lucide-react";
import SignUp from "@/components/SignUp";

interface pageProps {}
const page: React.FC<pageProps> = () => {
    return (
        <div className="absolute inset-0">
            <div className='h-full max-w-2xl mx-auto flex flex-col items-center justify-center gap-20'>
                <Link href='/' className={cn(buttonVariants({variant: 'ghost'}), 'self-start -mt-20')}>
                    <ChevronLeft className='mr-2 w-4 h-4'/> Home
                </Link>
                <SignUp />
            </div>
        </div>
    )
};

export default page;
