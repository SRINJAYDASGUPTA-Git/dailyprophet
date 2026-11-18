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
    name: string,
    method: string,
    body?: unknown
) {
    const accessToken = getAccessToken();

    if (!accessToken) {
        return unauthorized();
    }

    return fetch(
        `${BACKEND_URL}/api/v1/houses/${name}`,
        {
            method,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                ...(body !== undefined && {
                    "Content-Type": "application/json",
                }),
            },
            cache: "no-store",
        }
    );
}

export async function GET(
    _request: NextRequest,
    {params}: { params: Promise<{ name: string }> }
) {
    try {
        const {name} = await params;

        const backendResponse = await getBackendResponse(
            name,
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
        console.error("House GET by ID proxy failed:", error);

        return NextResponse.json(
            {message: "House service unavailable."},
            {status: 502}
        );
    }
}