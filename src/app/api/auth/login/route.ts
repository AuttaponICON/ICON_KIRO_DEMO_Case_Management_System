import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { SessionData, sessionOptions } from "@/lib/session";
import { demoUsers } from "@/lib/demo-data";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  const user = demoUsers.find((u) => u.username === username && u.password === password);
  if (!user) {
    return NextResponse.json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
  }

  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  session.userId = user.id;
  session.username = user.username;
  session.name = user.name;
  session.role = user.role;
  await session.save();

  return NextResponse.json({ id: user.id, username: user.username, name: user.name, role: user.role });
}
