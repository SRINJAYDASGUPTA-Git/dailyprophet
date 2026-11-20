import {NextRequest, NextResponse} from "next/server";

const BACKEND_URL =
    process.env.BACKEND_URL ?? "http://localhost:8081";

export async function GET(
    _request: NextRequest
){
    const searchParams = _request.nextUrl.searchParams;
    const uid = searchParams.get("uid");

    try{
        const backendResponse = await fetch(`${BACKEND_URL}/api/v1/users/check-username?uid=${uid}`, {
            method: "GET",
            headers: _request.headers,
        });

        const data:{ usernameAvailable: boolean } = await backendResponse.json();

        return NextResponse.json(data, {
            status: backendResponse.status,
        });
    }
    catch(error){
        console.error("User Check Username proxy failed", error);

        return NextResponse.json(
            {message: "User Check Username Available unavailable."},
            {status: 503}
        );
    }
}