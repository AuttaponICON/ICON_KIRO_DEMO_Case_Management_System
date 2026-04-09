import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { SessionData, sessionOptions } from "@/lib/session";
import { demoRequests, demoUsers, demoCaseHistory, getUserPermissions, getNextHistoryId } from "@/lib/demo-data";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const perms = getUserPermissions(session.userId);
  if (!perms.includes("case:assign")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const idx = demoRequests.findIndex((r) => r.id === parseInt(id));
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (demoRequests[idx].status !== "PENDING") return NextResponse.json({ error: "Case must be PENDING" }, { status: 400 });

  const assignee = demoUsers.find((u) => u.id === body.assigneeId);
  demoRequests[idx] = { ...demoRequests[idx], status: "ASSIGNED", assigneeId: body.assigneeId, assignee: assignee ? { name: assignee.name } : null, updatedAt: new Date().toISOString() };

  const actor = demoUsers.find((u) => u.id === session.userId);
  demoCaseHistory.push({ id: getNextHistoryId(), requestId: demoRequests[idx].id, userId: session.userId, action: "ASSIGNED", comment: body.comment || `มอบหมายให้ ${assignee?.name || ""}`, createdAt: new Date().toISOString(), user: { name: actor?.name || "" } });

  return NextResponse.json(demoRequests[idx]);
}
