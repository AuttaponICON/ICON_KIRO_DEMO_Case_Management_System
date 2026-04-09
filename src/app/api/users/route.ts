import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { SessionData, sessionOptions } from "@/lib/session";
import { demoUsers, demoRoles, getUserPermissions, getNextUserId } from "@/lib/demo-data";

export async function GET() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const users = demoUsers.map((u) => {
    const role = demoRoles.find((r) => r.id === u.roleId);
    return { id: u.id, username: u.username, name: u.name, roleId: u.roleId, roleName: role?.label || "", active: u.active };
  });
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const perms = getUserPermissions(session.userId);
  if (!perms.includes("user:manage")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  if (demoUsers.find((u) => u.username === body.username)) {
    return NextResponse.json({ error: "Username already exists" }, { status: 400 });
  }

  const newUser = { id: getNextUserId(), username: body.username, password: body.password || "1234", name: body.name, roleId: body.roleId, active: true };
  demoUsers.push(newUser);

  const role = demoRoles.find((r) => r.id === newUser.roleId);
  return NextResponse.json({ id: newUser.id, username: newUser.username, name: newUser.name, roleId: newUser.roleId, roleName: role?.label || "", active: true }, { status: 201 });
}
