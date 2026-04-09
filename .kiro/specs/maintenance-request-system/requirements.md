# Requirements: ระบบแจ้งซ่อม (Maintenance Request System)

## Requirement 1: Authentication (การเข้าสู่ระบบ)
### User Stories
- ในฐานะผู้ใช้งาน ฉันต้องการเข้าสู่ระบบด้วยชื่อผู้ใช้และรหัสผ่าน เพื่อเข้าถึงระบบแจ้งซ่อม
- ในฐานะผู้ใช้งาน ฉันต้องการออกจากระบบได้ เพื่อความปลอดภัย

### Acceptance Criteria
1. แสดงหน้า Login พร้อมฟอร์มกรอกชื่อผู้ใช้และรหัสผ่าน
2. ตรวจสอบข้อมูลเข้าสู่ระบบ หากถูกต้องนำไปยังหน้า Dashboard
3. หากข้อมูลไม่ถูกต้อง แสดงข้อความแจ้งเตือน
4. หากยังไม่ได้ login ไม่สามารถเข้าถึงหน้า Dashboard ได้
5. มีปุ่มออกจากระบบที่ Sidebar

---

## Requirement 2: Role-Based Access Control (RBAC)
### User Stories
- ในฐานะ Admin ฉันต้องการสร้าง Role และกำหนด Permission ได้
- ในฐานะ Admin ฉันต้องการกำหนดว่า Role ไหนเห็นเมนูอะไร และเห็นปุ่มอะไรบ้าง
- ในฐานะผู้ใช้งาน ฉันควรเห็นเฉพาะเมนูและปุ่มที่ Role ของฉันมีสิทธิ์

### Acceptance Criteria
1. ระบบมี 4 Roles: admin, vip, manager, member
2. Admin สามารถสร้าง/แก้ไข/ลบ Role ได้
3. Admin สามารถกำหนด Permissions ต่อ Role ได้ (menu visibility, button visibility)
4. Permissions ประกอบด้วย:
   - `menu:dashboard` — เห็นเมนูแดชบอร์ด
   - `menu:requests` — เห็นเมนูแจ้งซ่อม
   - `menu:reports` — เห็นเมนูรายงาน
   - `menu:settings` — เห็นเมนูตั้งค่า
   - `menu:admin` — เห็นเมนูจัดการระบบ (users, roles)
   - `case:create` — สร้าง Case ได้
   - `case:assign` — Assign Case ให้ Member ได้
   - `case:cancel` — ยกเลิก Case ได้
   - `case:resolve` — ระบุสาเหตุ/วิธีแก้ไข ส่งกลับได้
   - `case:approve` — Approve/Reject Case ได้
   - `case:complete` — Complete Case ได้
   - `user:manage` — จัดการ User ได้
   - `role:manage` — จัดการ Role ได้
5. UI ซ่อนเมนู/ปุ่มที่ไม่มีสิทธิ์โดยอัตโนมัติ

---

## Requirement 3: User Management (Admin)
### User Stories
- ในฐานะ Admin ฉันต้องการสร้าง/แก้ไข/ลบ User และกำหนด Role ให้ User ได้

### Acceptance Criteria
1. หน้าจัดการ User แสดงตาราง: ชื่อผู้ใช้, ชื่อ, Role, สถานะ
2. สร้าง User ใหม่พร้อมกำหนด Role
3. แก้ไขข้อมูล User และเปลี่ยน Role ได้
4. ลบ User ได้ (ยกเว้นตัวเอง)
5. เฉพาะ Role ที่มี permission `user:manage` เท่านั้นที่เข้าถึงได้

---

## Requirement 4: Case Workflow (Flow Approve)
### User Stories
- ในฐานะ Member/คนนอก ฉันต้องการสร้าง Case แจ้งซ่อมได้
- ในฐานะ Manager ฉันต้องการ Assign Case ให้ Member หรือทำเอง หรือยกเลิก Case ได้
- ในฐานะ Member ฉันต้องการระบุสาเหตุและวิธีแก้ไข แล้วส่งกลับ Manager
- ในฐานะ Manager ฉันต้องการ Approve หรือ Reject Case ที่ Member ส่งมา
- ในฐานะ Manager ฉันต้องการ Complete Case ที่ Approve แล้ว

### Acceptance Criteria — Case Status Flow:
```
PENDING → (Manager) ASSIGNED / CANCELLED / IN_PROGRESS(ทำเอง)
ASSIGNED → (Member) RESOLVED
RESOLVED → (Manager) APPROVED / REJECTED
REJECTED → (Member) RESOLVED (แก้ไขใหม่)
APPROVED → (Manager) COMPLETED
IN_PROGRESS → (Manager) RESOLVED → APPROVED → COMPLETED
```

1. สร้าง Case: ใครก็ได้ที่มี `case:create` สร้างได้ สถานะเริ่มต้น PENDING
2. Assign: Manager เลือก Member จาก dropdown กำหนดให้ทำ → สถานะเป็น ASSIGNED
3. ยกเลิก: Manager กด Cancel → ต้องกรอกเหตุผล → สถานะเป็น CANCELLED
4. ทำเอง: Manager กด "รับเรื่องเอง" → สถานะเป็น IN_PROGRESS, assignee = ตัวเอง
5. ระบุสาเหตุ: Member กรอก rootCause + resolution แล้วส่ง → สถานะเป็น RESOLVED
6. Approve: Manager ตรวจแล้วกด Approve → สถานะเป็น APPROVED
7. Reject: Manager กด Reject + กรอกเหตุผล → สถานะเป็น REJECTED → Member แก้ไขใหม่
8. Complete: Manager กด Complete → สถานะเป็น COMPLETED
9. ทุก action บันทึกเป็น Case History (who, when, action, comment)

---

## Requirement 5: Dashboard
### Acceptance Criteria
1. แสดง Stat Cards ตามสถานะทั้งหมด
2. แสดงตารางรายการล่าสุด 5 รายการ
3. ข้อมูลแสดงตาม Role (Member เห็นเฉพาะ Case ที่ assign ให้ตัวเอง + ที่ตัวเองสร้าง)

---

## Requirement 6: Reports
### Acceptance Criteria
1. สรุปจำนวนทั้งหมด, อัตราเสร็จสิ้น, ประเภทที่แจ้งมากสุด
2. ตารางสรุปตามประเภท

---

## Requirement 7: Settings
### Acceptance Criteria
1. Toggle การแจ้งเตือน
2. เลือกภาษา, จำนวนรายการต่อหน้า

---

## Requirement 8: Layout & Navigation
### Acceptance Criteria
1. Sidebar แสดงเมนูตาม Permission ของ Role
2. เมนูที่ไม่มีสิทธิ์จะถูกซ่อน
3. Responsive รองรับมือถือ
