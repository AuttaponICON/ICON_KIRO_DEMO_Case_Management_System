import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { SessionData, sessionOptions } from "@/lib/session";
import { demoRoles, getUserPermissions, getNextRoleId } from "@/lib/demo-data";

export async function GET() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(demoRoles);
}

export async function POST(req: Request) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const perms = getUserPermissions(session.userId);
  if (!perms.includes("role:manage")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const newRole = { id: getNextRoleId(), name: body.name, label: body.label, permissions: body.permissions || [] };
  demoRoles.push(newRole);
  return NextResponse.json(newRole, { status: 201 });
}
