import React from "react";
import {User} from "next-auth";
import {Avatar, AvatarFallback} from "@/components/ui/Avatar";
import Image from "next/image";
import {Icons} from "@/components/Icons";
import {AvatarProps} from "@radix-ui/react-avatar";

interface UserAvatarProps extends AvatarProps{
    user: Pick<User, 'name' | 'image'>
}

const UserAvatar: React.FC<UserAvatarProps> = ({user, ...props}) => {
    return (
        <>
            <Avatar {...props}>
                {user.image ? (
                    <div className="relative aspect-square h-full w-full">
                        <Image src={user.image} alt={user.name!} fill referrerPolicy='no-referrer'/>
                    </div>
                    ) : (
                    <AvatarFallback>
                        <span className='sr-only'>{user?.name}</span>
                        <Icons.user className='h-5 w-5'/>
                    </AvatarFallback>
                )}
            </Avatar>
        </>
    )
};

export default UserAvatar;
