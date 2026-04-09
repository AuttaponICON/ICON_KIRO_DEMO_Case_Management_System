import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { SessionData, sessionOptions } from "@/lib/session";
import { locationMaster, getNextMasterId, getNextMasterSubId } from "@/lib/master-data";

export async function GET() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(locationMaster);
}

export async function POST(req: Request) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  if (body.type === "parent") {
    const item = { id: getNextMasterId(), name: body.name, children: [] };
    locationMaster.push(item);
    return NextResponse.json(item, { status: 201 });
  }
  if (body.type === "child") {
    const parent = locationMaster.find((l) => l.id === body.parentId);
    if (!parent) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const child = { id: getNextMasterSubId(), name: body.name };
    parent.children.push(child);
    return NextResponse.json(child, { status: 201 });
  }
  return NextResponse.json({ error: "Invalid" }, { status: 400 });
}

export async function DELETE(req: Request) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const id = parseInt(searchParams.get("id") || "0");
  if (type === "child") {
    for (const p of locationMaster) {
      const idx = p.children.findIndex((c) => c.id === id);
      if (idx >= 0) { p.children.splice(idx, 1); return NextResponse.json({ ok: true }); }
    }
  }
  if (type === "parent") {
    const idx = locationMaster.findIndex((l) => l.id === id);
    if (idx >= 0) { locationMaster.splice(idx, 1); return NextResponse.json({ ok: true }); }
  }
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
