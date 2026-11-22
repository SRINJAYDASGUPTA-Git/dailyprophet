import {NextResponse} from "next/server";
import {VerifyWWAccessRequest} from "@/types";

const BACKEND_URL =
    process.env.BACKEND_URL ?? "http://localhost:8081";

export async function POST(
    _request: VerifyWWAccessRequest
){
    try{
        const body = await _request.json();
        const authHeader =_request.headers.get("authorization")
        console.log(body)

        const backendResponse = await fetch(
            `${BACKEND_URL}/api/v1/users/verify-ww-access`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(authHeader ? { Authorization: authHeader } : {}),
                },
                cache: "no-store",
                body: JSON.stringify(body)
            }
        );


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