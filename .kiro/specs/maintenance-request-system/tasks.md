# Tasks: ระบบแจ้งซ่อม (Maintenance Request System)

## Task 1: Project Setup
- [x] สร้าง Next.js project พร้อม TypeScript + Tailwind CSS
- [x] ติดตั้ง dependencies (prisma, @prisma/client, iron-session, bcryptjs)
- [x] สร้าง `.env` สำหรับ DATABASE_URL และ SESSION_SECRET
- [x] สร้าง `next.config.ts`

## Task 2: Prisma Schema & Database
- [x] สร้าง `prisma/schema.prisma` (User, Request models, enums)
- [x] สร้าง `src/lib/prisma.ts` (Prisma client singleton)
- [x] สร้าง `prisma/seed.ts` (seed users + sample requests)
- [x] เพิ่ม prisma seed script ใน package.json

#[[file:prisma/schema.prisma]]

## Task 3: Session & Auth Utilities
- [x] สร้าง `src/lib/session.ts` (iron-session config)
- [x] สร้าง API route `POST /api/auth/login`
- [x] สร้าง API route `POST /api/auth/logout`
- [x] สร้าง API route `GET /api/auth/me`

#[[file:src/lib/session.ts]]
#[[file:src/app/api/auth/login/route.ts]]
#[[file:src/app/api/auth/logout/route.ts]]
#[[file:src/app/api/auth/me/route.ts]]

## Task 4: Request API Routes
- [x] สร้าง `GET /api/requests` (list all, รองรับ query params)
- [x] สร้าง `POST /api/requests` (create new request)
- [x] สร้าง `GET /api/requests/[id]` (get single)
- [x] สร้าง `PUT /api/requests/[id]` (update)
- [x] สร้าง `DELETE /api/requests/[id]` (delete)

#[[file:src/app/api/requests/route.ts]]
#[[file:src/app/api/requests/[id]/route.ts]]

## Task 5: Login Page (Frontend)
- [x] สร้าง `src/app/layout.tsx` (root layout + Tailwind)
- [x] สร้าง `src/app/page.tsx` (Login form)
- [x] เรียก API login, redirect ไป /dashboard เมื่อสำเร็จ

#[[file:src/app/page.tsx]]
#[[file:src/app/layout.tsx]]

## Task 6: Dashboard Layout & Components
- [x] สร้าง `src/components/Sidebar.tsx`
- [x] สร้าง `src/components/StatCard.tsx`
- [x] สร้าง `src/components/StatusBadge.tsx`
- [x] สร้าง `src/app/dashboard/layout.tsx` (sidebar + auth check)

#[[file:src/components/Sidebar.tsx]]
#[[file:src/components/StatCard.tsx]]
#[[file:src/components/StatusBadge.tsx]]
#[[file:src/app/dashboard/layout.tsx]]

## Task 7: Dashboard Page
- [x] สร้าง `src/app/dashboard/page.tsx`
- [x] แสดง Stat Cards (ทั้งหมด, รอ, กำลังดำเนินการ, เสร็จ)
- [x] แสดงตารางรายการล่าสุด 5 รายการ

#[[file:src/app/dashboard/page.tsx]]

## Task 8: Requests Page (แจ้งซ่อม)
- [x] สร้าง `src/components/RequestModal.tsx`
- [x] สร้าง `src/app/dashboard/requests/page.tsx`
- [x] ตารางรายการทั้งหมด + ปุ่มแก้ไข/ลบ
- [x] Modal สำหรับเพิ่ม/แก้ไข
- [x] เรียก API CRUD

#[[file:src/components/RequestModal.tsx]]
#[[file:src/app/dashboard/requests/page.tsx]]

## Task 9: Reports Page (รายงาน)
- [x] สร้าง `src/app/dashboard/reports/page.tsx`
- [x] Stat Cards (จำนวนทั้งหมด, อัตราเสร็จสิ้น, ประเภทที่แจ้งมากสุด)
- [x] ตารางสรุปตามประเภท

#[[file:src/app/dashboard/reports/page.tsx]]

## Task 10: Settings Page (ตั้งค่า)
- [x] สร้าง `src/app/dashboard/settings/page.tsx`
- [x] หมวดการแจ้งเตือน (toggles)
- [x] หมวดทั่วไป (ภาษา, จำนวนรายการ)

#[[file:src/app/dashboard/settings/page.tsx]]
