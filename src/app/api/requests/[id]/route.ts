import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { SessionData, sessionOptions } from "@/lib/session";
import { demoRequests, demoCaseHistory, getUserPermissions } from "@/lib/demo-data";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const request = demoRequests.find((r) => r.id === parseInt(id));
  if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const history = demoCaseHistory.filter((h) => h.requestId === request.id).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  return NextResponse.json({ ...request, history });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const perms = getUserPermissions(session.userId);
  if (!perms.includes("case:cancel")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const idx = demoRequests.findIndex((r) => r.id === parseInt(id));
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  demoRequests.splice(idx, 1);
  return NextResponse.json({ ok: true });
}
