# เอกสาร API — ระบบแจ้งซ่อม

เวอร์ชัน 2.0 | วันที่ เมษายน 2569 | URL หลัก: http://localhost:3000

---

## 1. การยืนยันตัวตน

### POST /api/auth/login — เข้าสู่ระบบ

ข้อมูลที่ส่ง:
- username (ข้อความ) — ชื่อผู้ใช้
- password (ข้อความ) — รหัสผ่าน

ตัวอย่าง: { "username": "admin", "password": "1234" }

ผลลัพธ์สำเร็จ (200): ข้อมูลผู้ใช้ + สิทธิ์ทั้งหมด
ผลลัพธ์ล้มเหลว (401): ข้อความแจ้งเตือน "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"

### POST /api/auth/logout — ออกจากระบบ

ลบ session cookie ออก
ผลลัพธ์ (200): { "ok": true }

### GET /api/auth/me — ข้อมูลผู้ใช้ปัจจุบัน

ต้องเข้าสู่ระบบแล้ว
ผลลัพธ์ (200): ข้อมูลผู้ใช้ + สิทธิ์
ผลลัพธ์ (401): ยังไม่ได้เข้าสู่ระบบ

---

## 2. รายการแจ้งซ่อม (Cases)

### GET /api/requests — ดูรายการทั้งหมด

สมาชิกเห็นเฉพาะ Case ที่ตัวเองสร้างหรือได้รับมอบหมาย
ผู้จัดการ/แอดมินเห็นทั้งหมด

### POST /api/requests — สร้างรายการใหม่

ต้องมีสิทธิ์ case:create

ข้อมูลที่ส่ง:
- title (ข้อความ, จำเป็น) — หัวข้อ Case
- location (ข้อความ, จำเป็น) — สถานที่
- category (ข้อความ, จำเป็น) — หมวดหมู่หลัก เช่น AC, ELECTRICAL
- subCategory (ข้อความ) — หมวดหมู่ย่อย เช่น แอร์ไม่เย็น
- priority (ข้อความ) — ลำดับความสำคัญ: LOW, MEDIUM, HIGH, CRITICAL
- detail (ข้อความ) — รายละเอียด
- reporterName (ข้อความ) — ชื่อผู้แจ้ง
- reporterPhone (ข้อความ) — เบอร์ติดต่อ
- attachments (รายการ) — ไฟล์แนบ

ระบบจะสร้างรหัสอัตโนมัติ (REQ-XXX) และคำนวณ SLA จากหมวดหมู่ย่อย

### GET /api/requests/[id] — ดูรายละเอียด Case พร้อมประวัติ

### DELETE /api/requests/[id] — ลบ Case

---

## 3. การดำเนินการ Case (Workflow)

### POST /api/requests/[id]/assign — มอบหมายงาน
- สิทธิ์: case:assign
- สถานะต้องเป็น: รอดำเนินการ (PENDING)
- ข้อมูล: assigneeId (ตัวเลข), comment (ข้อความ)

### POST /api/requests/[id]/cancel — ยกเลิก Case
- สิทธิ์: case:cancel
- สถานะต้องเป็น: รอดำเนินการ (PENDING)
- ข้อมูล: reason (ข้อความ, จำเป็น)

### POST /api/requests/[id]/resolve — ส่งผลการแก้ไข
- สิทธิ์: case:resolve
- สถานะต้องเป็น: มอบหมายแล้ว/กำลังดำเนินการ/ถูกปฏิเสธ
- ข้อมูล: rootCause (ข้อความ, จำเป็น), resolution (ข้อความ, จำเป็น)

### POST /api/requests/[id]/approve — อนุมัติ
- สิทธิ์: case:approve
- สถานะต้องเป็น: ส่งผลแก้ไขแล้ว (RESOLVED)

### POST /api/requests/[id]/reject — ปฏิเสธ
- สิทธิ์: case:approve
- สถานะต้องเป็น: ส่งผลแก้ไขแล้ว (RESOLVED)
- ข้อมูล: reason (ข้อความ, จำเป็น)

### POST /api/requests/[id]/complete — เสร็จสิ้น
- สิทธิ์: case:complete
- สถานะต้องเป็น: อนุมัติแล้ว (APPROVED)

---

## 4. ผู้ใช้งาน

### GET /api/users — รายชื่อผู้ใช้ทั้งหมด
### POST /api/users — สร้างผู้ใช้ใหม่ (สิทธิ์: user:manage)
### GET/PUT/DELETE /api/users/[id] — ดู/แก้ไข/ลบผู้ใช้
### GET /api/users/members — รายชื่อเฉพาะผู้จัดการและสมาชิก (สำหรับมอบหมายงาน)

---

## 5. บทบาท (Roles)

### GET /api/roles — รายการบทบาททั้งหมด
### POST /api/roles — สร้างบทบาทใหม่ (สิทธิ์: role:manage)
### GET/PUT/DELETE /api/roles/[id] — ดู/แก้ไข/ลบบทบาท

---

## 6. หมวดหมู่ Case

### GET /api/categories — รายการหมวดหมู่ (2 ระดับ + SLA)
### POST /api/categories — สร้างหมวดหมู่/หมวดหมู่ย่อย
### PUT /api/categories — แก้ไขหมวดหมู่
### DELETE /api/categories?type=subCategory&id=1 — ลบหมวดหมู่

---

## 7. ข้อมูลหลัก (Master Data)

### GET /api/master/locations — รายการสถานที่ (2 ระดับ)
### POST /api/master/locations — เพิ่มกลุ่ม/รายการสถานที่
### DELETE /api/master/locations?type=parent&id=1 — ลบสถานที่

---

## 8. บันทึก (Logs)

### GET /api/logs/interface — บันทึก API (ข้อมูลที่ส่ง/ตอบกลับ)
### GET /api/logs/login — ประวัติการเข้าสู่ระบบ

---

## ลำดับสถานะ Case

รอดำเนินการ -> มอบหมายแล้ว -> ส่งผลแก้ไขแล้ว -> อนุมัติแล้ว -> เสร็จสิ้น
รอดำเนินการ -> ยกเลิก
ส่งผลแก้ไขแล้ว -> ถูกปฏิเสธ -> ส่งผลแก้ไขแล้ว (วนซ้ำ)

## สิทธิ์ทั้งหมด (13 รายการ)

กลุ่มเมนู: menu:dashboard, menu:requests, menu:reports, menu:settings, menu:admin
กลุ่ม Case: case:create, case:assign, case:cancel, case:resolve, case:approve, case:complete
กลุ่มจัดการ: user:manage, role:manage
