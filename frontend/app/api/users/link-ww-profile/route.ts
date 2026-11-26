import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
    process.env.BACKEND_URL ?? "http://localhost:8081";

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get("authorization");
        const uid = request.nextUrl.searchParams.get("uid");

        if (!uid) {
            return NextResponse.json(
                { message: "Profile UID is required." },
                { status: 400 }
            );
        }

        const backendResponse = await fetch(
            `${BACKEND_URL}/api/v1/users/link-ww-profile?uid=${encodeURIComponent(uid)}`,
            {
                method: "GET",
                headers: {
                    ...(authHeader ? { Authorization: authHeader } : {}),
                },
                cache: "no-store",
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
        console.error("Wizarding World profile linking proxy failed:", error);

        return NextResponse.json(
            { message: "Profile linking unavailable." },
            { status: 503 }
        );
    }
}