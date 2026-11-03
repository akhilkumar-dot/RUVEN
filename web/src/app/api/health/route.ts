import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: "founderbridge-web",
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
  });
}
