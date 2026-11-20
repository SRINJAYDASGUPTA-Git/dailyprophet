import {NextRequest, NextResponse} from "next/server";
import {UserFullResponse} from "@/types";

const BACKEND_URL =
    process.env.BACKEND_URL ?? "http://localhost:8081";

export async function GET(
    _request: NextRequest
){
    const searchParams = _request.nextUrl.searchParams;
    const uid = searchParams.get("uid");

    try{
        const backendResponse = await fetch(`${BACKEND_URL}/api/v1/users/link-ww-profile?uid=${uid}`, {
            method: "GET",
            headers: _request.headers,
        });

        const data:UserFullResponse = await backendResponse.json();

        return NextResponse.json(data, {
            status: backendResponse.status,
        });
    }
    catch(error){
        console.error("User Linking Wizarding World Profile proxy failed", error);

        return NextResponse.json(
            {message: "User linking wizarding world profile unavailable."},
            {status: 503}
        );
    }
}