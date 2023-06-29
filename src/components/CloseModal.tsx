"use client"

import React from "react";
import {Button} from "@/components/ui/Button";
import {X} from "lucide-react";
import {useRouter} from "next/navigation"

interface CloseModalProps {}

const CloseModal: React.FC<CloseModalProps> = ({}) => {
    const router = useRouter();
    return (
        <Button
            className='h-6 w-6 p-0 rounded-md'
            aria-label='close modal'
            variant='subtle'
            onClick={() => router.back()}
        >
            <X className='h-4 w-4'/>
        </Button>
    )
};

export default CloseModal;
