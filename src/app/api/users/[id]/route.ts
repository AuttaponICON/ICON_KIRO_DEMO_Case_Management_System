import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { SessionData, sessionOptions } from "@/lib/session";
import { demoUsers, demoRoles, getUserPermissions } from "@/lib/demo-data";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const user = demoUsers.find((u) => u.id === parseInt(id));
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const role = demoRoles.find((r) => r.id === user.roleId);
  return NextResponse.json({ id: user.id, username: user.username, name: user.name, roleId: user.roleId, roleName: role?.label || "", active: user.active });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const perms = getUserPermissions(session.userId);
  if (!perms.includes("user:manage")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const idx = demoUsers.findIndex((u) => u.id === parseInt(id));
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  demoUsers[idx] = { ...demoUsers[idx], name: body.name ?? demoUsers[idx].name, roleId: body.roleId ?? demoUsers[idx].roleId, active: body.active ?? demoUsers[idx].active };
  if (body.password) demoUsers[idx].password = body.password;

  const role = demoRoles.find((r) => r.id === demoUsers[idx].roleId);
  return NextResponse.json({ id: demoUsers[idx].id, username: demoUsers[idx].username, name: demoUsers[idx].name, roleId: demoUsers[idx].roleId, roleName: role?.label || "", active: demoUsers[idx].active });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const perms = getUserPermissions(session.userId);
  if (!perms.includes("user:manage")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const userId = parseInt(id);
  if (userId === session.userId) return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });

  const idx = demoUsers.findIndex((u) => u.id === userId);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  demoUsers.splice(idx, 1);
  return NextResponse.json({ ok: true });
}
