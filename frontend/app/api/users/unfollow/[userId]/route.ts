import {NextRequest, NextResponse} from "next/server";

const BACKEND_URL =
    process.env.BACKEND_URL ?? "http://localhost:8081";

export async function DELETE(
    _request: NextRequest,
    {params}: { params: Promise<{ userId: string }> }
){
    try {
        const {userId} = await params;

        const backendResponse = await fetch(
            `${BACKEND_URL}/api/v1/users/unfollow/${userId}`,
            {
                method: "DELETE",
                headers: _request.headers,
                cache: "no-store",
            }
        );

        return NextResponse.json({
            status: backendResponse.status,
        });
    }
    catch (error) {
        console.error("User follow proxy failed", error);

        return NextResponse.json(
            {message: "User service unavailable."},
            {status: 503}
        );
    }
}