# Design: ระบบแจ้งซ่อม (Maintenance Request System) v2

## Tech Stack
- **Frontend**: Next.js 15 (App Router) + Tailwind CSS 4
- **Backend**: Next.js API Routes (Route Handlers)
- **ORM**: Prisma (demo mode ใช้ in-memory)
- **Database**: PostgreSQL
- **Auth**: iron-session
- **Language**: TypeScript

## Updated File Structure
```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Login
│   ├── dashboard/
│   │   ├── layout.tsx              # Auth + RBAC sidebar
│   │   ├── page.tsx                # Dashboard
│   │   ├── requests/page.tsx       # Case list + workflow
│   │   ├── reports/page.tsx
│   │   ├── settings/page.tsx
│   │   └── admin/
│   │       ├── users/page.tsx      # User management
│   │       └── roles/page.tsx      # Role + Permission management
│   └── api/
│       ├── auth/ (login, logout, me)
│       ├── requests/
│       │   ├── route.ts            # GET all, POST create
│       │   └── [id]/
│       │       ├── route.ts        # GET, PUT, DELETE
│       │       ├── assign/route.ts # POST assign
│       │       ├── cancel/route.ts # POST cancel
│       │       ├── resolve/route.ts# POST resolve
│       │       ├── approve/route.ts# POST approve
│       │       ├── reject/route.ts # POST reject
│       │       └── complete/route.ts# POST complete
│       ├── users/
│       │   ├── route.ts            # GET all, POST create
│       │   └── [id]/route.ts       # GET, PUT, DELETE
│       └── roles/
│           ├── route.ts            # GET all, POST create
│           └── [id]/route.ts       # GET, PUT, DELETE
├── lib/
│   ├── prisma.ts
│   ├── session.ts
│   ├── demo-data.ts               # Updated with roles, permissions
│   └── permissions.ts             # Permission constants + checker
└── components/
    ├── Sidebar.tsx                 # RBAC-aware
    ├── StatCard.tsx
    ├── StatusBadge.tsx
    ├── RequestModal.tsx
    ├── WorkflowActions.tsx         # Case workflow buttons
    ├── AssignModal.tsx
    ├── ResolveModal.tsx
    ├── RejectModal.tsx
    ├── CancelModal.tsx
    └── PermissionGate.tsx          # Conditional render by permission
```

## Data Model

### Role
| Field       | Type     | Note                    |
|-------------|----------|-------------------------|
| id          | Int      | PK                      |
| name        | String   | unique (admin, manager…) |
| label       | String   | Display name            |
| permissions | String[] | Array of permission keys |

### User
| Field    | Type   | Note           |
|----------|--------|----------------|
| id       | Int    | PK             |
| username | String | unique         |
| password | String |                |
| name     | String |                |
| roleId   | Int    | FK → Role      |
| active   | Bool   | default true   |

### Request (Case)
| Field       | Type     | Note                                      |
|-------------|----------|-------------------------------------------|
| id          | Int      | PK                                        |
| code        | String   | unique, REQ-XXX                           |
| title       | String   |                                           |
| location    | String   |                                           |
| category    | Enum     | ELECTRICAL, PLUMBING, AC, BUILDING, OTHER |
| detail      | String?  |                                           |
| status      | Enum     | PENDING, ASSIGNED, IN_PROGRESS, RESOLVED, APPROVED, REJECTED, COMPLETED, CANCELLED |
| rootCause   | String?  | สาเหตุ (filled by member)                 |
| resolution  | String?  | วิธีแก้ไข (filled by member)               |
| cancelReason| String?  | เหตุผลยกเลิก                               |
| rejectReason| String?  | เหตุผล reject                              |
| createdAt   | DateTime |                                           |
| updatedAt   | DateTime |                                           |
| creatorId   | Int      | FK → User (ผู้สร้าง)                       |
| assigneeId  | Int?     | FK → User (ผู้รับผิดชอบ)                    |

### CaseHistory
| Field     | Type     | Note                    |
|-----------|----------|-------------------------|
| id        | Int      | PK                      |
| requestId | Int      | FK → Request             |
| userId    | Int      | FK → User (ผู้ทำ action) |
| action    | String   | CREATED, ASSIGNED, etc. |
| comment   | String?  |                         |
| createdAt | DateTime |                         |

## Case Status Flow
```
PENDING ──→ ASSIGNED (Manager assign ให้ Member)
        ├─→ IN_PROGRESS (Manager ทำเอง)
        └─→ CANCELLED (Manager ยกเลิก + เหตุผล)

ASSIGNED ──→ RESOLVED (Member ระบุสาเหตุ + วิธีแก้ไข)

IN_PROGRESS ──→ RESOLVED (Manager ระบุสาเหตุ + วิธีแก้ไข)

RESOLVED ──→ APPROVED (Manager approve)
         └─→ REJECTED (Manager reject + เหตุผล)

REJECTED ──→ RESOLVED (Member แก้ไขใหม่)

APPROVED ──→ COMPLETED (Manager complete)
```

## Default Role Permissions
| Permission     | admin | vip | manager | member |
|----------------|-------|-----|---------|--------|
| menu:dashboard | ✅    | ✅  | ✅      | ✅     |
| menu:requests  | ✅    | ✅  | ✅      | ✅     |
| menu:reports   | ✅    | ✅  | ✅      | ❌     |
| menu:settings  | ✅    | ✅  | ✅      | ✅     |
| menu:admin     | ✅    | ❌  | ❌      | ❌     |
| case:create    | ✅    | ✅  | ✅      | ✅     |
| case:assign    | ✅    | ❌  | ✅      | ❌     |
| case:cancel    | ✅    | ❌  | ✅      | ❌     |
| case:resolve   | ✅    | ❌  | ✅      | ✅     |
| case:approve   | ✅    | ❌  | ✅      | ❌     |
| case:complete  | ✅    | ❌  | ✅      | ❌     |
| user:manage    | ✅    | ❌  | ❌      | ❌     |
| role:manage    | ✅    | ❌  | ❌      | ❌     |
