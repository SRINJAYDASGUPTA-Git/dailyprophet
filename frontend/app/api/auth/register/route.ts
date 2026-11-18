import { NextRequest, NextResponse } from "next/server";
import {AuthenticationRequest, AuthenticationResponse} from "@/types";
import * as http2 from "node:http2";

const BACKEND_URL =
    process.env.BACKEND_URL ?? "http://localhost:8081";

export async function POST(request: AuthenticationRequest) {
    try {
        const body = await request.json();

        const backendResponse = await fetch(
            `${BACKEND_URL}/api/v1/auth/register`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
                cache: "no-store",
            }
        );

        return NextResponse.json({
            status: backendResponse.status,
        });
    } catch (error) {
        console.error("Login proxy failed:", error);

        return NextResponse.json(
            { message: "Authentication service unavailable." },
            { status: 502 }
        );
    }
}