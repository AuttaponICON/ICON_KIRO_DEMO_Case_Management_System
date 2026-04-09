import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { SessionData, sessionOptions } from "@/lib/session";
import { demoRequests, demoUsers, demoCaseHistory, getUserPermissions, getNextHistoryId } from "@/lib/demo-data";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const perms = getUserPermissions(session.userId);
  if (!perms.includes("case:approve")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  if (!body.reason) return NextResponse.json({ error: "Reason is required" }, { status: 400 });

  const idx = demoRequests.findIndex((r) => r.id === parseInt(id));
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (demoRequests[idx].status !== "RESOLVED") return NextResponse.json({ error: "Case must be RESOLVED" }, { status: 400 });

  demoRequests[idx] = { ...demoRequests[idx], status: "REJECTED", rejectReason: body.reason, updatedAt: new Date().toISOString() };

  const actor = demoUsers.find((u) => u.id === session.userId);
  demoCaseHistory.push({ id: getNextHistoryId(), requestId: demoRequests[idx].id, userId: session.userId, action: "REJECTED", comment: body.reason, createdAt: new Date().toISOString(), user: { name: actor?.name || "" } });

  return NextResponse.json(demoRequests[idx]);
}
