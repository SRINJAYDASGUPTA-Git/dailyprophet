import {NextRequest, NextResponse} from "next/server";

const BACKEND_URL =
    process.env.BACKEND_URL ?? "http://localhost:8081";

export async function GET(
    _request: NextRequest,
    {params}: { params: Promise<{ name: string }> }
) {
    try {
        const {name} = await params;

        const backendResponse = await fetch(
            `${BACKEND_URL}/api/v1/houses/${name}`,
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
        console.error("House GET by ID proxy failed:", error);

        return NextResponse.json(
            {message: "House service unavailable."},
            {status: 502}
        );
    }
}