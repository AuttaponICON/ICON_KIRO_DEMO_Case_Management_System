import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { SessionData, sessionOptions } from "@/lib/session";
import { demoRequests } from "@/lib/demo-data";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const request = demoRequests.find((r) => r.id === parseInt(id));
  if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(request);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const idx = demoRequests.findIndex((r) => r.id === parseInt(id));
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  demoRequests[idx] = {
    ...demoRequests[idx],
    title: body.title ?? demoRequests[idx].title,
    location: body.location ?? demoRequests[idx].location,
    category: body.category ?? demoRequests[idx].category,
    detail: body.detail ?? demoRequests[idx].detail,
    status: body.status ?? demoRequests[idx].status,
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json(demoRequests[idx]);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const idx = demoRequests.findIndex((r) => r.id === parseInt(id));
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  demoRequests.splice(idx, 1);
  return NextResponse.json({ ok: true });
}
