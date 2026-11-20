import {NextRequest, NextResponse} from "next/server";
import {AuthenticationResponse} from "@/types";

const BACKEND_URL =
    process.env.BACKEND_URL ?? "http://localhost:8081";

export async function POST(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token');

    try {
        const backendResponse = await fetch(`${BACKEND_URL}/api/v1/auth/activate?token=${token}`, {
            method: "POST",

        });

        const data: AuthenticationResponse = await backendResponse.json();
        console.log({data})
        if (!backendResponse.ok) {
            return NextResponse.json(data, {
                status: backendResponse.status,
            });
        }

        const response = NextResponse.json(
            {message: "Login successful", data: data},
            {status: 200}
        );

        if (data.access_token === null || data.access_token === undefined || data.refresh_token === null || data.refresh_token === undefined) {
            throw new Error("Access token not returned by server");
        }

        return response;
    } catch (error) {
        console.error("Login proxy failed:", error);

        return NextResponse.json(
            {message: "Authentication service unavailable."},
            {status: 502}
        );
    }
}