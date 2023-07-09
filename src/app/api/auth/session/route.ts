import {getAuthSession} from "@/lib/auth";

export async function GET(req: Request) {
    const session = await getAuthSession();

    if (!session) {
        return new Response(null, {
            status: 401,
        });
    }

    return new Response(JSON.stringify(session), {
        status: 200,
    });
}