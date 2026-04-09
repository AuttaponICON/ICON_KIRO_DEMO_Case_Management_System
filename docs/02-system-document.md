# System Document — ระบบแจ้งซ่อม (Maintenance Request System)

**Version:** 2.0 | **Date:** April 2026

---

## 1. Overview

ระบบแจ้งซ่อม (Case Management System) เป็น Web Application สำหรับจัดการงานแจ้งซ่อมบำรุง รองรับ Workflow ตั้งแต่การสร้าง Case จนถึง Complete พร้อมระบบ RBAC, SLA Tracking, และ Reporting

## 2. Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | Next.js 15 (App Router) + React 19 |
| Styling | Tailwind CSS 4 |
| Backend | Next.js API Routes |
| ORM | Prisma (PostgreSQL) |
| Auth | iron-session (cookie-based) |
| Charts | Chart.js + react-chartjs-2 |
| Export | jsPDF + xlsx |
| Language | TypeScript |
| Container | Docker + docker-compose |

## 3. Architecture

### 3.1 File Structure
```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Login
│   ├── dashboard/         # Protected pages
│   │   ├── page.tsx       # Dashboard + Charts
│   │   ├── requests/      # Case management
│   │   │   ├── page.tsx   # Case list
│   │   │   ├── create/    # Create case (one-page)
│   │   │   ├── [id]/      # Case detail (one-page)
│   │   │   └── import/    # Import from Excel
│   │   ├── reports/       # Reports + Export
│   │   ├── settings/      # Settings
│   │   └── admin/         # Admin pages
│   └── api/               # API Routes
├── components/            # Reusable components
├── lib/                   # Utilities
└── locales/               # i18n (th.json, en.json)
```

### 3.2 Authentication Flow
1. User เข้าหน้า Login → กรอก username/password
2. POST /api/auth/login → ตรวจสอบ → สร้าง encrypted cookie (TTL 2 ชม.)
3. ทุกหน้า Dashboard ตรวจสอบ session ผ่าน GET /api/auth/me
4. Idle timeout 2 ชม. → auto logout + redirect กลับ Login

### 3.3 Case Workflow
```
PENDING → ASSIGNED (Manager assign) → RESOLVED (Member ส่งผล)
       → CANCELLED (Manager ยกเลิก)   → APPROVED (Manager อนุมัติ)
       → IN_PROGRESS (Manager ทำเอง)   → REJECTED (Manager ปฏิเสธ)
                                        → COMPLETED (Manager complete)
```

## 4. Role-Based Access Control (RBAC)

### 4.1 Default Roles
| Role | Description |
|------|------------|
| admin | เข้าถึงทุกฟังก์ชัน จัดการ User/Role/Permission |
| vip | สร้าง Case + ดูรายงาน |
| manager | จัดการ Case workflow (assign/approve/reject/complete) |
| member | สร้าง Case + ส่งผลแก้ไข |

### 4.2 Permission System
- 13 permissions แบ่ง 3 กลุ่ม: Menu, Case, Admin
- Permission Tree UI สำหรับกำหนดสิทธิ์แบบ visual
- UI ซ่อนเมนู/ปุ่มที่ไม่มีสิทธิ์อัตโนมัติ

## 5. Features

### 5.1 Dashboard
- Stat Cards (ทั้งหมด, รอ, กำลังดำเนินการ, เสร็จ, SLA Overdue)
- Status Doughnut Chart + Category Bar Chart
- Workload per Person Chart
- SLA Overdue Table
- Advanced Search + Filter
- Drill-down: กดกราฟ → popup รายการ → กด case → new tab detail

### 5.2 Case Management
- Create Case (One Page): หัวข้อ, รายละเอียด, หมวดหมู่ Lv1/Lv2, สถานที่ (dropdown), ลำดับความสำคัญ, ผู้แจ้ง, แนบไฟล์
- Case Detail (One Page): แสดงข้อมูลครบ + workflow buttons + history timeline
- Case List: ตาราง + advanced search + กดแถว → new tab
- Import Case: upload Excel + preview + batch import
- SLA คำนวณอัตโนมัติจาก sub-category

### 5.3 Reports
- สรุปตามสถานะ/ประเภท + Charts
- Filter ปี/เดือน
- Export PDF + Excel

### 5.4 Admin
- User Management (username, name, email, phone, department, position, role)
- Role Management + Permission Tree
- Category Config (2 Level + SLA per sub-category)
- Master Data (Location Lv1/Lv2)
- Interface Log (API request/response viewer)
- Login Log (success/failed + IP + user agent)

### 5.5 i18n
- รองรับ ไทย/English
- ไฟล์ภาษาแยก: src/locales/th.json, en.json
- เพิ่มภาษาใหม่: สร้างไฟล์ + เพิ่มใน i18n.tsx

## 6. Deployment

### Docker
```bash
docker compose up -d
```

### Manual
```bash
npm install
npx prisma db push
npm run db:seed
npm run build
npm start
```

## 7. Environment Variables
| Variable | Description |
|----------|-----------|
| DATABASE_URL | PostgreSQL connection string |
| SESSION_SECRET | Cookie encryption key (min 32 chars) |
