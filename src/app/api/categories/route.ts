import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { SessionData, sessionOptions } from "@/lib/session";
import { demoCategoryConfigs, getNextCatId, getNextSubCatId } from "@/lib/demo-data";

export async function GET() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(demoCategoryConfigs);
}

export async function POST(req: Request) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (body.type === "category") {
    const newCat = { id: getNextCatId(), key: body.key.toUpperCase(), name: body.name, icon: body.icon || "📦", subCategories: [] };
    demoCategoryConfigs.push(newCat);
    return NextResponse.json(newCat, { status: 201 });
  }
  if (body.type === "subCategory") {
    const cat = demoCategoryConfigs.find((c) => c.id === body.categoryId);
    if (!cat) return NextResponse.json({ error: "Category not found" }, { status: 404 });
    const newSub = { id: getNextSubCatId(), name: body.name, slaDays: body.slaDays || 3 };
    cat.subCategories.push(newSub);
    return NextResponse.json(newSub, { status: 201 });
  }
  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}

export async function PUT(req: Request) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (body.type === "category") {
    const cat = demoCategoryConfigs.find((c) => c.id === body.id);
    if (!cat) return NextResponse.json({ error: "Not found" }, { status: 404 });
    cat.name = body.name ?? cat.name;
    cat.icon = body.icon ?? cat.icon;
    return NextResponse.json(cat);
  }
  if (body.type === "subCategory") {
    for (const cat of demoCategoryConfigs) {
      const sub = cat.subCategories.find((s) => s.id === body.id);
      if (sub) { sub.name = body.name ?? sub.name; sub.slaDays = body.slaDays ?? sub.slaDays; return NextResponse.json(sub); }
    }
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}

export async function DELETE(req: Request) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const id = parseInt(searchParams.get("id") || "0");

  if (type === "subCategory") {
    for (const cat of demoCategoryConfigs) {
      const idx = cat.subCategories.findIndex((s) => s.id === id);
      if (idx >= 0) { cat.subCategories.splice(idx, 1); return NextResponse.json({ ok: true }); }
    }
  }
  if (type === "category") {
    const idx = demoCategoryConfigs.findIndex((c) => c.id === id);
    if (idx >= 0) { demoCategoryConfigs.splice(idx, 1); return NextResponse.json({ ok: true }); }
  }
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
