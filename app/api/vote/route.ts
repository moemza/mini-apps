import { NextResponse } from "next/server";
import redisClient from "@/lib/redis";

const candidates = [1, 2, 3];

export async function POST(req: Request) {
  const { candidateId } = await req.json();
  if (!candidates.includes(candidateId)) {
    return NextResponse.json({ error: "Invalid candidate" }, { status: 400 });
  }
  // Ensure redis is connected
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
  await redisClient.hIncrBy("votes", String(candidateId), 1);
  return NextResponse.json({ success: true });
}

export async function GET() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
  const votes = await redisClient.hGetAll("votes");
  return NextResponse.json({ votes });
}