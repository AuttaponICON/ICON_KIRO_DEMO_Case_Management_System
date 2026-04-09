# Tasks: ระบบแจ้งซ่อม v2

## Task 1–14: (Completed — ดู git history)
- [x] Project setup, Prisma, Auth, CRUD, Pages, Docker, Git, OpenAPI, Tests

## Task 15: Permission System
- [ ] สร้าง `src/lib/permissions.ts` (permission constants + hasPermission helper)
- [ ] สร้าง `src/components/PermissionGate.tsx` (conditional render)

#[[file:src/lib/permissions.ts]]
#[[file:src/components/PermissionGate.tsx]]

## Task 16: Update Demo Data (Roles, Users, Cases)
- [ ] อัปเดต `src/lib/demo-data.ts` เพิ่ม roles, permissions, case fields, history

#[[file:src/lib/demo-data.ts]]

## Task 17: Role & User API Routes
- [ ] สร้าง `GET/POST /api/roles`
- [ ] สร้าง `GET/PUT/DELETE /api/roles/[id]`
- [ ] สร้าง `GET/POST /api/users`
- [ ] สร้าง `GET/PUT/DELETE /api/users/[id]`

## Task 18: Case Workflow API Routes
- [ ] สร้าง `POST /api/requests/[id]/assign`
- [ ] สร้าง `POST /api/requests/[id]/cancel`
- [ ] สร้าง `POST /api/requests/[id]/resolve`
- [ ] สร้าง `POST /api/requests/[id]/approve`
- [ ] สร้าง `POST /api/requests/[id]/reject`
- [ ] สร้าง `POST /api/requests/[id]/complete`

## Task 19: Update Auth API (return permissions)
- [ ] อัปเดต `/api/auth/login` และ `/api/auth/me` ให้ return permissions

## Task 20: Update Sidebar (RBAC-aware)
- [ ] อัปเดต Sidebar ให้แสดงเมนูตาม permissions

#[[file:src/components/Sidebar.tsx]]

## Task 21: Workflow Action Components
- [ ] สร้าง `WorkflowActions.tsx` (ปุ่ม action ตาม status + permission)
- [ ] สร้าง `AssignModal.tsx`
- [ ] สร้าง `ResolveModal.tsx`
- [ ] สร้าง `RejectModal.tsx`
- [ ] สร้าง `CancelModal.tsx`

## Task 22: Update Requests Page (Workflow UI)
- [ ] อัปเดตหน้า requests ให้แสดง workflow actions
- [ ] แสดง case history

## Task 23: Admin Pages
- [ ] สร้าง `src/app/dashboard/admin/users/page.tsx`
- [ ] สร้าง `src/app/dashboard/admin/roles/page.tsx`

## Task 24: Update Tests
- [ ] เพิ่ม tests สำหรับ permissions, workflow, roles

## Task 25: Update OpenAPI Spec
- [ ] เพิ่ม workflow endpoints, role/user endpoints

## Task 26: Git Commit
- [ ] Commit ทั้งหมด
