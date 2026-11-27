import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://localhost:8081";

export async function proxyToBackend(
    req: NextRequest,
    backendPath: string,
    method: string = req.method
) {
    const targetUrl = `${BACKEND_BASE}/api/v1${backendPath}${req.nextUrl.search}`;
    console.log(`ProxyTo backend ${targetUrl}`);
    const headers = new Headers();
    const auth = req.headers.get("authorization");
    if (auth) headers.set("authorization", auth);

    const contentType = req.headers.get("content-type");
    if (contentType) headers.set("content-type", contentType);

    let body: string | undefined;
    if (method !== "GET" && method !== "HEAD" && method !== "DELETE") {
        const raw = await req.text();
        if (raw) body = raw;
    }

    try {
        const upstream = await fetch(targetUrl, {
            method,
            headers,
            body,
            cache: "no-store",
        });

        if (upstream.status === 204) {
            return new NextResponse(null, { status: 204 });
        }

        const text = await upstream.text();
        if (!text) {
            return new NextResponse(null, { status: upstream.status });
        }

        try {
            return NextResponse.json(JSON.parse(text), { status: upstream.status });
        } catch {
            return new NextResponse(text, { status: upstream.status });
        }
    } catch (err) {
        console.error(`[Proxy Error] ${method} ${targetUrl}:`, err);
        return NextResponse.json(
            { message: "Unable to reach Daily Prophet backend." },
            { status: 502 }
        );
    }
}