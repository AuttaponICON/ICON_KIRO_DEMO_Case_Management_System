import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { SessionData, sessionOptions } from "@/lib/session";
import { demoUsers, demoRoles } from "@/lib/demo-data";

// Returns only users with role manager or member (for assign dropdown)
export async function GET() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allowedRoleNames = ["manager", "member"];
  const allowedRoleIds = demoRoles.filter((r) => allowedRoleNames.includes(r.name)).map((r) => r.id);

  const users = demoUsers
    .filter((u) => u.active && allowedRoleIds.includes(u.roleId))
    .map((u) => {
      const role = demoRoles.find((r) => r.id === u.roleId);
      return { id: u.id, name: u.name, roleName: role?.label || "" };
    });

  return NextResponse.json(users);
}
