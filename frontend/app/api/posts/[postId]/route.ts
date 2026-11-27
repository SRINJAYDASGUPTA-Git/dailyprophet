import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

type RouteContext = { params: Promise<{ postId: string }> };

export async function GET(req: NextRequest, { params }: RouteContext) {
    const { postId } = await params;
    return proxyToBackend(req, `/posts/${postId}`, "GET");
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
    const { postId } = await params;
    return proxyToBackend(req, `/posts/${postId}`, "DELETE");
}