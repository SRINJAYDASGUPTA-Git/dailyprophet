import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

export async function GET(req: NextRequest) {
    return proxyToBackend(req, "/posts", "GET");
}

export async function POST(req: NextRequest) {
    return proxyToBackend(req, "/posts", "POST");
}

export async function PUT(req: NextRequest) {
    return proxyToBackend(req, "/posts", "PUT");
}