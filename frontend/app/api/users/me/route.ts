import {NextRequest, NextResponse} from "next/server";

const BACKEND_URL =
    process.env.BACKEND_URL ?? "http://localhost:8080";

async function getBackendResponse(
    method: string,
    id?: string,
    body?: unknown,
    headers?: any
) {
    return fetch(
        `${BACKEND_URL}/api/v1/users/me`,
        {
            method: method,
            headers: headers,
            cache: "no-store",
        }
    );
}
export async function GET(
    _request: NextRequest
) {
    try {
        console.log(_request.headers)
        const backendResponse = await getBackendResponse(
            "GET",
            undefined,
            null,
            _request.headers,
        );

        if (backendResponse instanceof NextResponse) {
            return backendResponse;
        }

        const data = await backendResponse.json();

        return NextResponse.json(data, {
            status: backendResponse.status,
        });
    } catch (error) {
        console.error("Todo GET by ID proxy failed:", error);

        return NextResponse.json(
            {message: "Todo service unavailable."},
            {status: 502}
        );
    }
}

export async function PUT(
    request: NextRequest,
    {params}: { params: Promise<{ id: string }> }
) {
    try {
        const {id} = await params;
        const body = await request.json();

        const backendResponse = await getBackendResponse(
            id,
            "PUT",
            body
        );

        if (backendResponse instanceof NextResponse) {
            return backendResponse;
        }

        const data = await backendResponse.json();

        console.log(data)
        return NextResponse.json(data, {
            status: backendResponse.status,
        });
    } catch (error) {
        console.error("Todo PUT proxy failed:", error);

        return NextResponse.json(
            {message: "Todo service unavailable."},
            {status: 502}
        );
    }
}