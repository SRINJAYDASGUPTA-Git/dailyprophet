import {NextRequest, NextResponse} from "next/server";
import {VerifyWWAccessRequest} from "@/types";

const BACKEND_URL =
    process.env.BACKEND_URL ?? "http://localhost:8081";

function getAccessToken() {
    return localStorage.getItem("access_token");
}

function unauthorized() {
    return NextResponse.json(
        {message: "Unauthorized"},
        {status: 401}
    );
}

export async function GET(
    _request: VerifyWWAccessRequest
){
    try{
        const accessToken = getAccessToken();

        const body = _request.json();

        if (!accessToken) {
            return unauthorized();
        }

        const backendResponse = await fetch(
            `${BACKEND_URL}/api/v1/users/verify-ww-access`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
                cache: "no-store",
                body: JSON.stringify(body)
            }
        );

        const data= await backendResponse.json();

        return NextResponse.json({
            status: backendResponse.status,
        });

    }
    catch (error) {
        console.error("User Verify Wizardin world profile access proxy failed", error);

        return NextResponse.json(
            {message: "User Verify Wizardin world profile access unavailable."},
            {status: 503}
        );
    }
}