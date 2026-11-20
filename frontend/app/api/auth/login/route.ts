import { NextRequest, NextResponse } from "next/server";
import {AuthenticationResponse} from "@/types";

const BACKEND_URL =
    process.env.BACKEND_URL ?? "http://localhost:8081";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const backendResponse = await fetch(
            `${BACKEND_URL}/api/v1/auth/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
                cache: "no-store",
            }
        );

        const data: AuthenticationResponse = await backendResponse.json();
        // console.log({data})

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
            { message: "Authentication service unavailable." },
            { status: 502 }
        );
    }
}