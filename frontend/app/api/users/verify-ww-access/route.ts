// app/api/users/verify-ww-access/route.ts

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
    process.env.BACKEND_URL ?? "http://localhost:8081";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const authHeader = request.headers.get("authorization");

        const backendResponse = await fetch(
            `${BACKEND_URL}/api/v1/users/verify-ww-access`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(authHeader ? { Authorization: authHeader } : {}),
                },
                cache: "no-store",
                body: JSON.stringify(body),
            }
        );

        const responseBody = await backendResponse.text();

        return new NextResponse(responseBody || null, {
            status: backendResponse.status,
            headers: {
                "Content-Type":
                    backendResponse.headers.get("content-type") ??
                    "application/json",
            },
        });
    } catch (error) {
        console.error("User Verify Wizarding World profile proxy failed:", error);

        return NextResponse.json(
            { message: "User Verify Wizarding World profile access unavailable." },
            { status: 503 }
        );
    }
}