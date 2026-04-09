import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { SessionData, sessionOptions } from "@/lib/session";
import { demoRequests, demoUsers, demoCaseHistory, getUserPermissions, getNextHistoryId } from "@/lib/demo-data";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const perms = getUserPermissions(session.userId);
  if (!perms.includes("case:resolve")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  if (!body.rootCause || !body.resolution) return NextResponse.json({ error: "rootCause and resolution are required" }, { status: 400 });

  const idx = demoRequests.findIndex((r) => r.id === parseInt(id));
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!["ASSIGNED", "IN_PROGRESS", "REJECTED"].includes(demoRequests[idx].status)) {
    return NextResponse.json({ error: "Case must be ASSIGNED, IN_PROGRESS, or REJECTED" }, { status: 400 });
  }

  demoRequests[idx] = { ...demoRequests[idx], status: "RESOLVED", rootCause: body.rootCause, resolution: body.resolution, updatedAt: new Date().toISOString() };

  const actor = demoUsers.find((u) => u.id === session.userId);
  demoCaseHistory.push({ id: getNextHistoryId(), requestId: demoRequests[idx].id, userId: session.userId, action: "RESOLVED", comment: `สาเหตุ: ${body.rootCause} | แก้ไข: ${body.resolution}`, createdAt: new Date().toISOString(), user: { name: actor?.name || "" } });

  return NextResponse.json(demoRequests[idx]);
}
