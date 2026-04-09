# Design: ระบบแจ้งซ่อม (Maintenance Request System)

## Tech Stack
- **Frontend**: Next.js 15 (App Router) + Tailwind CSS 4
- **Backend**: Next.js API Routes (Route Handlers)
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Auth**: Session-based (cookie + iron-session)
- **Language**: TypeScript

## File Structure
```
├── prisma/
│   └── schema.prisma           # Prisma schema
│   └── seed.ts                 # Seed data
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Login page
│   │   ├── dashboard/
│   │   │   ├── layout.tsx      # Dashboard layout (sidebar)
│   │   │   ├── page.tsx        # Dashboard overview
│   │   │   ├── requests/
│   │   │   │   └── page.tsx    # แจ้งซ่อม
│   │   │   ├── reports/
│   │   │   │   └── page.tsx    # รายงาน
│   │   │   └── settings/
│   │   │       └── page.tsx    # ตั้งค่า
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── login/route.ts
│   │       │   ├── logout/route.ts
│   │       │   └── me/route.ts
│   │       └── requests/
│   │           ├── route.ts        # GET all, POST create
│   │           └── [id]/route.ts   # GET one, PUT update, DELETE
│   ├── lib/
│   │   ├── prisma.ts           # Prisma client singleton
│   │   └── session.ts          # Session config
│   └── components/
│       ├── Sidebar.tsx
│       ├── StatCard.tsx
│       ├── RequestModal.tsx
│       └── StatusBadge.tsx
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
└── .env
```

## Database Schema (Prisma)

### User
| Field    | Type   | Note          |
|----------|--------|---------------|
| id       | Int    | PK, auto      |
| username | String | unique        |
| password | String | hashed        |
| name     | String |               |
| role     | String | default "user"|

### Request
| Field     | Type     | Note                                      |
|-----------|----------|-------------------------------------------|
| id        | Int      | PK, auto                                  |
| code      | String   | unique, REQ-XXX                           |
| title     | String   |                                           |
| location  | String   |                                           |
| category  | Enum     | ELECTRICAL, PLUMBING, AC, BUILDING, OTHER |
| detail    | String?  |                                           |
| status    | Enum     | PENDING, IN_PROGRESS, COMPLETED, CANCELLED|
| createdAt | DateTime | default now()                             |
| updatedAt | DateTime | auto                                      |
| userId    | Int      | FK → User                                 |

## API Endpoints

| Method | Path                | Description        |
|--------|---------------------|--------------------|
| POST   | /api/auth/login     | เข้าสู่ระบบ         |
| POST   | /api/auth/logout    | ออกจากระบบ          |
| GET    | /api/auth/me        | ข้อมูล user ปัจจุบัน |
| GET    | /api/requests       | รายการแจ้งซ่อมทั้งหมด |
| POST   | /api/requests       | สร้างรายการใหม่      |
| GET    | /api/requests/[id]  | ดูรายละเอียด        |
| PUT    | /api/requests/[id]  | แก้ไขรายการ         |
| DELETE | /api/requests/[id]  | ลบรายการ           |

## Auth Flow
```
Login Page → POST /api/auth/login → set encrypted cookie → redirect /dashboard
Dashboard → GET /api/auth/me → verify cookie → return user / 401
Logout → POST /api/auth/logout → clear cookie → redirect /
```
