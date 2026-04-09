# Tasks: ระบบแจ้งซ่อม v2

## Task 1–14: (Completed — ดู git history)
- [x] Project setup, Prisma, Auth, CRUD, Pages, Docker, Git, OpenAPI, Tests

## Task 15: Permission System
- [x] สร้าง `src/lib/permissions.ts` (permission constants + hasPermission helper)
- [x] สร้าง `src/components/PermissionGate.tsx` (conditional render)

#[[file:src/lib/permissions.ts]]
#[[file:src/components/PermissionGate.tsx]]

## Task 16: Update Demo Data (Roles, Users, Cases)
- [x] อัปเดต `src/lib/demo-data.ts` เพิ่ม roles, permissions, case fields, history

#[[file:src/lib/demo-data.ts]]

## Task 17: Role & User API Routes
- [x] สร้าง `GET/POST /api/roles`
- [x] สร้าง `GET/PUT/DELETE /api/roles/[id]`
- [x] สร้าง `GET/POST /api/users`
- [x] สร้าง `GET/PUT/DELETE /api/users/[id]`

#[[file:src/app/api/roles/route.ts]]
#[[file:src/app/api/users/route.ts]]

## Task 18: Case Workflow API Routes
- [x] สร้าง `POST /api/requests/[id]/assign`
- [x] สร้าง `POST /api/requests/[id]/cancel`
- [x] สร้าง `POST /api/requests/[id]/resolve`
- [x] สร้าง `POST /api/requests/[id]/approve`
- [x] สร้าง `POST /api/requests/[id]/reject`
- [x] สร้าง `POST /api/requests/[id]/complete`

#[[file:src/app/api/requests/[id]/assign/route.ts]]
#[[file:src/app/api/requests/[id]/cancel/route.ts]]
#[[file:src/app/api/requests/[id]/resolve/route.ts]]
#[[file:src/app/api/requests/[id]/approve/route.ts]]
#[[file:src/app/api/requests/[id]/reject/route.ts]]
#[[file:src/app/api/requests/[id]/complete/route.ts]]

## Task 19: Update Auth API (return permissions)
- [x] อัปเดต `/api/auth/login` และ `/api/auth/me` ให้ return permissions

## Task 20: Update Sidebar (RBAC-aware)
- [x] อัปเดต Sidebar ให้แสดงเมนูตาม permissions

#[[file:src/components/Sidebar.tsx]]

## Task 21: Workflow Action Components
- [x] สร้าง `AssignModal.tsx`
- [x] สร้าง `ResolveModal.tsx`
- [x] สร้าง `RejectModal.tsx`
- [x] สร้าง `CancelModal.tsx`
- [x] สร้าง `PermissionGate.tsx`

## Task 22: Update Requests Page (Workflow UI)
- [x] อัปเดตหน้า requests ให้แสดง workflow actions ตาม permission + status
- [x] แสดง case detail + history

#[[file:src/app/dashboard/requests/page.tsx]]

## Task 23: Admin Pages
- [x] สร้าง `src/app/dashboard/admin/users/page.tsx`
- [x] สร้าง `src/app/dashboard/admin/roles/page.tsx`

#[[file:src/app/dashboard/admin/users/page.tsx]]
#[[file:src/app/dashboard/admin/roles/page.tsx]]

## Task 24: Update Tests
- [x] เพิ่ม tests สำหรับ permissions (3 tests)
- [x] เพิ่ม tests สำหรับ RBAC logic (6 tests)
- [x] เพิ่ม tests สำหรับ workflow logic (5 tests)
- [x] ทั้งหมด 37 tests ผ่าน

#[[file:src/__tests__/permissions.test.ts]]
#[[file:src/__tests__/api-logic.test.ts]]
#[[file:src/__tests__/demo-data.test.ts]]

## Task 25: Git Commit & Push
- [x] Commit + Push ขึ้น GitHub
