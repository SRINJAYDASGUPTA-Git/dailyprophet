import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ postId: string }> }
) {
    const { postId } = await params;
    return proxyToBackend(req, `/posts/${postId}/unlike`, "DELETE");
}