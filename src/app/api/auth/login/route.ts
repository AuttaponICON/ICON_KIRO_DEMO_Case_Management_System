import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { SessionData, sessionOptions } from "@/lib/session";
import { demoUsers, getUserPermissions, demoRoles } from "@/lib/demo-data";
import { addLoginLog, addInterfaceLog } from "@/lib/logs";

export async function POST(req: Request) {
  const start = Date.now();
  const body = await req.json();
  const { username, password } = body;
  const ua = req.headers.get("user-agent") || "";
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";

  const user = demoUsers.find((u) => u.username === username && u.password === password && u.active);

  if (!user) {
    const reason = demoUsers.find((u) => u.username === username) ? "Wrong password" : "User not found";
    addLoginLog({ timestamp: new Date().toISOString(), username, success: false, ip, userAgent: ua, reason });

    const resBody = { error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" };
    addInterfaceLog({ timestamp: new Date().toISOString(), method: "POST", path: "/api/auth/login", statusCode: 401, success: false, requestBody: { username, password: "***" }, responseBody: resBody, userId: null, userName: username, durationMs: Date.now() - start });

    return NextResponse.json(resBody, { status: 401 });
  }

  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  session.userId = user.id;
  session.username = user.username;
  session.name = user.name;
  session.role = demoRoles.find((r) => r.id === user.roleId)?.name || "user";
  await session.save();

  addLoginLog({ timestamp: new Date().toISOString(), username, success: true, ip, userAgent: ua, reason: null });

  const resBody = { id: user.id, username: user.username, name: user.name, role: session.role, permissions: getUserPermissions(user.id) };
  addInterfaceLog({ timestamp: new Date().toISOString(), method: "POST", path: "/api/auth/login", statusCode: 200, success: true, requestBody: { username, password: "***" }, responseBody: { id: user.id, username: user.username, name: user.name }, userId: user.id, userName: user.username, durationMs: Date.now() - start });

  return NextResponse.json(resBody);
}
