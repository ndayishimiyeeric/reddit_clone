import React from "react";
import {getAuthSession} from "@/lib/auth";
import {redirect} from "next/navigation";
import UserNameForm from "@/components/UserNameForm";

export const metadata = {
    title: "Settings",
    description: "Manage your account settings",
}

const Page = async () => {
    const session = await getAuthSession();

    if (!session?.user) {
        redirect("/sign-in")
    }
    return (
        <div className="max-w-4xl mx-auto py-12">
            <div className="grid items-start gap-8 mb-6">
                <h1 className="font-bold text-3xl md:text-4xl">Settings</h1>
            </div>

            <div className="grid gap-10">
                <UserNameForm session={session}/>
            </div>
        </div>
    );
};

export default Page;