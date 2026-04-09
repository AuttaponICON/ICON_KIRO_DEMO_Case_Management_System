# API Specification — ระบบแจ้งซ่อม (Maintenance Request System)

**Version:** 2.0 | **Date:** April 2026 | **Base URL:** `http://localhost:3000`

---

## 1. Authentication

### POST /api/auth/login
เข้าสู่ระบบ

**Request Body:**
```json
{ "username": "admin", "password": "1234" }
```

**Response 200:**
```json
{
  "id": 1, "username": "admin", "name": "ผู้ดูแลระบบ",
  "role": "admin", "permissions": ["menu:dashboard", "case:create", ...]
}
```

**Response 401:**
```json
{ "error": "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }
```

### POST /api/auth/logout
ออกจากระบบ — ลบ session cookie

**Response 200:** `{ "ok": true }`

### GET /api/auth/me
ข้อมูลผู้ใช้ปัจจุบัน (ต้อง login แล้ว)

**Response 200:** เหมือน login response
**Response 401:** `{ "error": "Unauthorized" }`

---

## 2. Requests (Cases)

### GET /api/requests
รายการแจ้งซ่อมทั้งหมด (filter ตาม role — member เห็นเฉพาะของตัวเอง)

**Response 200:** Array of Request objects

### POST /api/requests
สร้างรายการแจ้งซ่อมใหม่ — ต้องมี permission `case:create`

**Request Body:**
```json
{
  "title": "แอร์ไม่เย็น",
  "location": "ภายในอาคาร > ชั้น 3",
  "category": "AC",
  "subCategory": "แอร์ไม่เย็น",
  "priority": "HIGH",
  "detail": "รายละเอียด",
  "reporterName": "สมชาย",
  "reporterPhone": "081-xxx-xxxx",
  "attachments": [{ "name": "photo.jpg", "type": "image/jpeg", "size": 102400 }]
}
```

**Response 201:** Request object with auto-generated code, SLA deadline

### GET /api/requests/[id]
รายละเอียด case พร้อม history

### DELETE /api/requests/[id]
ลบ case — ต้องมี permission `case:cancel`

---

## 3. Case Workflow Actions

### POST /api/requests/[id]/assign
มอบหมายงาน — permission: `case:assign`, status ต้องเป็น PENDING

**Body:** `{ "assigneeId": 3, "comment": "มอบหมายให้สมชาย" }`

### POST /api/requests/[id]/cancel
ยกเลิก case — permission: `case:cancel`, status ต้องเป็น PENDING

**Body:** `{ "reason": "ซ้ำกับเคสอื่น" }`

### POST /api/requests/[id]/resolve
ส่งผลแก้ไข — permission: `case:resolve`, status: ASSIGNED/IN_PROGRESS/REJECTED

**Body:** `{ "rootCause": "ซีลยางเสื่อม", "resolution": "เปลี่ยนซีลยางใหม่" }`

### POST /api/requests/[id]/approve
อนุมัติ — permission: `case:approve`, status ต้องเป็น RESOLVED

### POST /api/requests/[id]/reject
ปฏิเสธ — permission: `case:approve`, status ต้องเป็น RESOLVED

**Body:** `{ "reason": "ข้อมูลไม่ครบ" }`

### POST /api/requests/[id]/complete
เสร็จสิ้น — permission: `case:complete`, status ต้องเป็น APPROVED

---

## 4. Users

### GET /api/users
รายชื่อผู้ใช้ทั้งหมด (พร้อม role, email, phone, department, position)

### POST /api/users
สร้างผู้ใช้ใหม่ — permission: `user:manage`

### GET/PUT/DELETE /api/users/[id]
ดู/แก้ไข/ลบผู้ใช้

### GET /api/users/members
รายชื่อเฉพาะ manager + member (สำหรับ assign dropdown)

---

## 5. Roles

### GET /api/roles | POST /api/roles
รายการ/สร้าง Role — permission: `role:manage`

### GET/PUT/DELETE /api/roles/[id]
ดู/แก้ไข/ลบ Role

---

## 6. Categories

### GET /api/categories
รายการประเภท Case (2 level + SLA)

### POST /api/categories
สร้างประเภท/ประเภทย่อย

### PUT /api/categories
แก้ไขประเภท/ประเภทย่อย

### DELETE /api/categories?type=subCategory&id=1
ลบประเภท/ประเภทย่อย

---

## 7. Master Data

### GET /api/master/locations
รายการสถานที่ (2 level)

### POST /api/master/locations
เพิ่มกลุ่ม/รายการสถานที่

### DELETE /api/master/locations?type=parent&id=1
ลบสถานที่

---

## 8. Logs

### GET /api/logs/interface
Interface Log — บันทึก API request/response

### GET /api/logs/login
Login Log — ประวัติการเข้าสู่ระบบ

---

## Status Flow
```
PENDING → ASSIGNED → RESOLVED → APPROVED → COMPLETED
       → CANCELLED              → REJECTED → RESOLVED (loop)
       → IN_PROGRESS → RESOLVED
```

## Permissions (13 keys)
menu:dashboard, menu:requests, menu:reports, menu:settings, menu:admin,
case:create, case:assign, case:cancel, case:resolve, case:approve, case:complete,
user:manage, role:manage
