import { PrismaClient, Category, Status } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("1234", 10);

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: { username: "admin", password: hash, name: "ผู้ดูแลระบบ", role: "admin" },
  });

  await prisma.user.upsert({
    where: { username: "user1" },
    update: {},
    create: { username: "user1", password: hash, name: "สมชาย ใจดี", role: "user" },
  });

  const existing = await prisma.request.count();
  if (existing === 0) {
    await prisma.request.createMany({
      data: [
        { code: "REQ-001", title: "แอร์ไม่เย็น", location: "ห้อง 301", category: Category.AC, detail: "แอร์เปิดแล้วไม่เย็น มีเสียงดัง", status: Status.PENDING, userId: admin.id },
        { code: "REQ-002", title: "ไฟห้องน้ำไม่ติด", location: "ชั้น 2 ห้องน้ำชาย", category: Category.ELECTRICAL, detail: "หลอดไฟขาด", status: Status.IN_PROGRESS, userId: admin.id },
        { code: "REQ-003", title: "ก๊อกน้ำรั่ว", location: "ห้องครัว ชั้น 1", category: Category.PLUMBING, detail: "น้ำหยดตลอดเวลา", status: Status.COMPLETED, userId: admin.id },
        { code: "REQ-004", title: "ประตูปิดไม่สนิท", location: "ห้องประชุม A", category: Category.BUILDING, detail: "บานพับหลวม", status: Status.PENDING, userId: admin.id },
        { code: "REQ-005", title: "ปลั๊กไฟชำรุด", location: "ห้อง 205", category: Category.ELECTRICAL, detail: "ปลั๊กหลวม มีประกายไฟ", status: Status.COMPLETED, userId: admin.id },
      ],
    });
  }

  console.log("Seed completed");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
