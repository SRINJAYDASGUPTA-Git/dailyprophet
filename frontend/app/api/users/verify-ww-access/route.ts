import {NextResponse} from "next/server";
import {VerifyWWAccessRequest} from "@/types";

const BACKEND_URL =
    process.env.BACKEND_URL ?? "http://localhost:8081";

export async function GET(
    _request: VerifyWWAccessRequest
){
    try{
        const body = _request.json();

        const backendResponse = await fetch(
            `${BACKEND_URL}/api/v1/users/verify-ww-access`,
            {
                method: "GET",
                headers: _request.headers,
                cache: "no-store",
                body: JSON.stringify(body)
            }
        );

        const data= await backendResponse.json();

        return NextResponse.json(data, {
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