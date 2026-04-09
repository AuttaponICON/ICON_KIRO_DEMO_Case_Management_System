import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { SessionData, sessionOptions } from "@/lib/session";
import { demoRequests, demoUsers, getNextId } from "@/lib/demo-data";

export async function GET() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sorted = [...demoRequests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return NextResponse.json(sorted);
}

export async function POST(req: Request) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const nextNum = demoRequests.length + 1;
  const code = `REQ-${String(nextNum).padStart(3, "0")}`;
  const now = new Date().toISOString();
  const user = demoUsers.find((u) => u.id === session.userId);

  const newReq = {
    id: getNextId(),
    code,
    title: body.title,
    location: body.location,
    category: body.category,
    detail: body.detail || null,
    status: "PENDING",
    createdAt: now,
    updatedAt: now,
    userId: session.userId,
    user: { name: user?.name || "Unknown" },
  };

  demoRequests.push(newReq);
  return NextResponse.json(newReq, { status: 201 });
}
