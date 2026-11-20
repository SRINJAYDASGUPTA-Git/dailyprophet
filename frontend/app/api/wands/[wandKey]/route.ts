import {NextRequest, NextResponse} from "next/server";

const BACKEND_URL =
    process.env.BACKEND_URL ?? "http://localhost:8081";

export async function GET(
    _request: NextRequest,
    {params}: { params: Promise<{ wandKey: string }> }
) {
    try {
        const {wandKey} = await params;

        const backendResponse = await fetch(
            `${BACKEND_URL}/api/v1/wands/${wandKey}`,
            {
                method: "GET",
                headers: _request.headers,
                cache: "no-store",
            }
        );

        if (backendResponse instanceof NextResponse) {
            return backendResponse;
        }

        const data = await backendResponse.json();

        return NextResponse.json(data, {
            status: backendResponse.status,
        });
    } catch (error) {
        console.error("wand GET by wandKey proxy failed:", error);

        return NextResponse.json(
            {message: "wand service unavailable."},
            {status: 503}
        );
    }
}