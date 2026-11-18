import {NextRequest, NextResponse} from "next/server";

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

async function getBackendResponse(
    wandKey: string,
    method: string
) {
    const accessToken = getAccessToken();

    if (!accessToken) {
        return unauthorized();
    }

    return fetch(
        `${BACKEND_URL}/api/v1/wands/${wandKey}`,
        {
            method,
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
            cache: "no-store",
        }
    );
}

export async function GET(
    _request: NextRequest,
    {params}: { params: Promise<{ wandKey: string }> }
) {
    try {
        const {wandKey} = await params;

        const backendResponse = await getBackendResponse(
            wandKey,
            "GET"
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
            {status: 502}
        );
    }
}