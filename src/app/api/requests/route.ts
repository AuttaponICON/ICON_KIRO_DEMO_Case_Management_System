import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { SessionData, sessionOptions } from "@/lib/session";
import { demoRequests, demoUsers, getUserPermissions, getNextRequestId, demoCaseHistory, getNextHistoryId } from "@/lib/demo-data";

export async function GET() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const perms = getUserPermissions(session.userId);
  let filtered = [...demoRequests];

  // Member sees only cases assigned to them or created by them
  if (!perms.includes("case:assign") && !perms.includes("case:approve")) {
    filtered = filtered.filter((r) => r.creatorId === session.userId || r.assigneeId === session.userId);
  }

  const sorted = filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return NextResponse.json(sorted);
}

export async function POST(req: Request) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const perms = getUserPermissions(session.userId);
  if (!perms.includes("case:create")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const nextNum = demoRequests.length + 1;
  const code = `REQ-${String(nextNum).padStart(3, "0")}`;
  const now = new Date().toISOString();
  const user = demoUsers.find((u) => u.id === session.userId);

  const slaDate = new Date();
  slaDate.setDate(slaDate.getDate() + 3);

  const newReq = {
    id: getNextRequestId(), code, title: body.title, location: body.location,
    category: body.category, detail: body.detail || null, status: "PENDING",
    rootCause: null, resolution: null, cancelReason: null, rejectReason: null,
    slaDeadline: slaDate.toISOString(),
    createdAt: now, updatedAt: now, creatorId: session.userId, assigneeId: null,
    creator: { name: user?.name || "Unknown" }, assignee: null,
  };

  demoRequests.push(newReq);
  demoCaseHistory.push({ id: getNextHistoryId(), requestId: newReq.id, userId: session.userId, action: "CREATED", comment: null, createdAt: now, user: { name: user?.name || "" } });

  return NextResponse.json(newReq, { status: 201 });
}
