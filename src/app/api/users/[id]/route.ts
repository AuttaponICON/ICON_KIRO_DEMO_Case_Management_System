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
  return NextResponse.json({ id: user.id, username: user.username, name: user.name, email: user.email, phone: user.phone, department: user.department, position: user.position, roleId: user.roleId, roleName: role?.label || "", active: user.active });
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
  const u = demoUsers[idx];
  demoUsers[idx] = { ...u, name: body.name ?? u.name, email: body.email ?? u.email, phone: body.phone ?? u.phone, department: body.department ?? u.department, position: body.position ?? u.position, roleId: body.roleId ?? u.roleId, active: body.active ?? u.active };
  if (body.password) demoUsers[idx].password = body.password;
  const role = demoRoles.find((r) => r.id === demoUsers[idx].roleId);
  return NextResponse.json({ ...demoUsers[idx], password: undefined, roleName: role?.label || "" });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const perms = getUserPermissions(session.userId);
  if (!perms.includes("user:manage")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  if (parseInt(id) === session.userId) return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
  const idx = demoUsers.findIndex((u) => u.id === parseInt(id));
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  demoUsers.splice(idx, 1);
  return NextResponse.json({ ok: true });
}
