# Test Cases — ระบบแจ้งซ่อม (Maintenance Request System)

**Version:** 2.0 | **Date:** April 2026

---

## TC-01: Authentication

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|----------------|----------|
| TC-01-01 | Login สำเร็จ | กรอก admin/1234 → กด Login | เข้าสู่ Dashboard, แสดงชื่อผู้ใช้ที่ Sidebar | High |
| TC-01-02 | Login ผิด password | กรอก admin/wrong → กด Login | แสดงข้อความ "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" | High |
| TC-01-03 | Login user ไม่มี | กรอก unknown/1234 → กด Login | แสดงข้อความ error | High |
| TC-01-04 | Logout | กดปุ่ม 🚪 ที่ Sidebar | กลับไปหน้า Login, session ถูกลบ | High |
| TC-01-05 | Session expired | ไม่ใช้งาน 2 ชม. | Auto logout + แสดงข้อความ "เซสชันหมดอายุ" | Medium |
| TC-01-06 | เข้า Dashboard โดยไม่ login | เปิด /dashboard โดยตรง | Redirect กลับหน้า Login | High |

## TC-02: Dashboard

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|----------------|----------|
| TC-02-01 | แสดง Stat Cards | Login → ดู Dashboard | แสดง 5 cards: ทั้งหมด, รอ, กำลังดำเนินการ, เสร็จ, SLA Overdue | High |
| TC-02-02 | กราฟสถานะ drill-down | กดที่ส่วน PENDING ของ Doughnut | Popup แสดงรายการ case ที่เป็น PENDING พร้อมจำนวน | High |
| TC-02-03 | กราฟประเภท drill-down | กดที่แท่ง "ไฟฟ้า" ของ Bar chart | Popup แสดงรายการ case ประเภทไฟฟ้า | High |
| TC-02-04 | Workload drill-down | กดที่แท่งชื่อคน | Popup แสดง case ที่คนนั้นถืออยู่ | High |
| TC-02-05 | Drill-down → new tab | กดที่ case ใน popup | เปิด tab ใหม่ไปหน้ารายละเอียด case | High |
| TC-02-06 | SLA Overdue → new tab | กดที่แถว SLA Overdue | เปิด tab ใหม่ไปหน้ารายละเอียด case | Medium |
| TC-02-07 | Dashboard search | พิมพ์ "แอร์" ในช่องค้นหา | กราฟ + stat cards filter ตามคำค้น | Medium |

## TC-03: Case Management

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|----------------|----------|
| TC-03-01 | สร้าง Case สำเร็จ | กรอกครบทุก required field → กด สร้าง | Case ถูกสร้าง, redirect กลับรายการ | High |
| TC-03-02 | สร้าง Case ไม่กรอก required | ไม่กรอกหัวข้อ → กด สร้าง | แสดงข้อความแจ้งเตือนสีแดงที่ field ที่ขาด | High |
| TC-03-03 | เลือก Category Lv1 → แสดง Lv2 | กดเลือก "ไฟฟ้า" | แสดง sub-categories: หลอดไฟ, ปลั๊ก, สายไฟ พร้อม SLA | High |
| TC-03-04 | Location dropdown | กดเลือกสถานที่ | แสดง dropdown 2 level (ภายใน > ชั้น 1) | Medium |
| TC-03-05 | Priority selection | กดเลือก "เร่งด่วน" | ปุ่มเปลี่ยนเป็นสีแดง, highlight | Medium |
| TC-03-06 | แนบไฟล์ | กดอัพโหลดรูป + PDF | แสดง preview รูป + icon PDF + ขนาดไฟล์ | Medium |
| TC-03-07 | ลบไฟล์แนบ | กดปุ่ม ✕ ที่ไฟล์ | ไฟล์ถูกลบออกจากรายการ | Low |
| TC-03-08 | ดูรายละเอียด Case | กดที่แถว case ในตาราง | เปิด tab ใหม่ แสดงข้อมูลครบ + history | High |
| TC-03-09 | Case list ไม่มี Action column | ดูตาราง case | ไม่มีคอลัมน์ "จัดการ" | Medium |

## TC-04: Case Workflow

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|----------------|----------|
| TC-04-01 | Assign case | Login manager → เปิด PENDING case → กด มอบหมาย → เลือก member | สถานะเปลี่ยนเป็น ASSIGNED, history บันทึก | High |
| TC-04-02 | Self assign | Login manager → กด รับเอง | สถานะ ASSIGNED, assignee = ตัวเอง | High |
| TC-04-03 | Cancel case | Login manager → กด ยกเลิก → กรอกเหตุผล | สถานะ CANCELLED, บันทึกเหตุผล | High |
| TC-04-04 | Resolve case | Login member → เปิด ASSIGNED case → กด ส่งผลแก้ไข → กรอกสาเหตุ + วิธีแก้ | สถานะ RESOLVED | High |
| TC-04-05 | Approve case | Login manager → เปิด RESOLVED case → กด Approve | สถานะ APPROVED | High |
| TC-04-06 | Reject case | Login manager → กด Reject → กรอกเหตุผล | สถานะ REJECTED, member แก้ไขใหม่ได้ | High |
| TC-04-07 | Complete case | Login manager → เปิด APPROVED case → กด Complete | สถานะ COMPLETED | High |
| TC-04-08 | Re-resolve after reject | Login member → เปิด REJECTED case → กด ส่งผลแก้ไข | สถานะกลับเป็น RESOLVED | High |
| TC-04-09 | History timeline | ดูรายละเอียด case ที่ผ่านหลาย action | แสดง timeline ครบทุก action ตามลำดับเวลา | Medium |

## TC-05: RBAC

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|----------------|----------|
| TC-05-01 | Admin เห็นทุกเมนู | Login admin | Sidebar แสดงทุกเมนู รวม จัดการระบบ | High |
| TC-05-02 | Member ไม่เห็นเมนู Admin | Login member1 | ไม่แสดงเมนู จัดการผู้ใช้, Role, etc. | High |
| TC-05-03 | Member ไม่เห็นปุ่ม Assign | Login member → เปิด PENDING case | ไม่แสดงปุ่ม มอบหมาย/ยกเลิก | High |
| TC-05-04 | VIP สร้าง case ได้ | Login vip1 → สร้าง case | สร้างสำเร็จ | Medium |
| TC-05-05 | Assign ได้เฉพาะ manager/member | เปิด Assign modal | Dropdown แสดงเฉพาะ manager + member | Medium |

## TC-06: Reports & Export

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|----------------|----------|
| TC-06-01 | ดูรายงาน | ไปเมนู รายงาน | แสดง stat cards + กราฟ + ตารางสรุป | High |
| TC-06-02 | Filter ปี/เดือน | เลือกปี 2026, เดือน เมษายน | ข้อมูลแสดงเฉพาะเดือนที่เลือก | Medium |
| TC-06-03 | Export PDF | กดปุ่ม Export PDF | ดาวน์โหลดไฟล์ PDF | High |
| TC-06-04 | Export Excel | กดปุ่ม Export Excel | ดาวน์โหลดไฟล์ .xlsx | High |

## TC-07: Import Case

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|----------------|----------|
| TC-07-01 | Download template | กดปุ่ม Download Template | ดาวน์โหลดไฟล์ case-import-template.xlsx | High |
| TC-07-02 | Upload + preview | อัพโหลดไฟล์ Excel | แสดงตาราง preview ข้อมูล | High |
| TC-07-03 | Import สำเร็จ | กดปุ่ม นำเข้า | แสดงผลลัพธ์ success/failed | High |

## TC-08: Admin Functions

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|----------------|----------|
| TC-08-01 | สร้าง User | Admin → จัดการผู้ใช้ → เพิ่ม | User ถูกสร้าง แสดงในตาราง | High |
| TC-08-02 | แก้ไข Role permissions | Admin → จัดการ Role → แก้ไข → toggle permission | Permission อัปเดต, UI ซ่อน/แสดงตาม | High |
| TC-08-03 | Permission Tree | เปิด modal แก้ไข Role | แสดง tree 3 กลุ่ม, check/uncheck ทั้งกลุ่มได้ | Medium |
| TC-08-04 | เพิ่มประเภท Case | Admin → ประเภท Case → เพิ่ม | ประเภทใหม่แสดงในรายการ | Medium |
| TC-08-05 | เพิ่ม sub-category + SLA | เพิ่มประเภทย่อย กำหนด SLA 2 วัน | แสดง SLA badge "2d" | Medium |
| TC-08-06 | Master Data สถานที่ | Admin → Master Data → เพิ่มกลุ่ม/รายการ | แสดงใน dropdown สร้าง Case | Medium |

## TC-09: Logs

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|----------------|----------|
| TC-09-01 | Interface Log บันทึก | สร้าง Case → ไป Interface Log | แสดง POST /api/requests status 201 | High |
| TC-09-02 | Interface Log detail | กดที่ log entry | Modal แสดง request body + response body (JSON) | High |
| TC-09-03 | Login Log บันทึก | Login สำเร็จ/ไม่สำเร็จ → ไป Login Log | แสดงประวัติ login พร้อม IP, status | High |
| TC-09-04 | Login Log failed | Login ผิด password → ไป Login Log | แสดง ❌ Failed + reason "Wrong password" | Medium |

## TC-10: i18n

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|----------------|----------|
| TC-10-01 | เปลี่ยนภาษาเป็น English | หน้า Login → เลือก English | ทุก label เปลี่ยนเป็นภาษาอังกฤษ | Medium |
| TC-10-02 | เปลี่ยนภาษาใน Settings | Dashboard → Settings → เลือก English | ทุกหน้าเปลี่ยนภาษา | Medium |
| TC-10-03 | จำภาษาข้ามเซสชัน | เลือก English → logout → login ใหม่ | ยังเป็น English | Low |

## TC-11: SLA

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|----------------|----------|
| TC-11-01 | SLA คำนวณจาก sub-category | สร้าง Case เลือก "หลอดไฟ" (SLA 1d) | SLA deadline = วันนี้ + 1 วัน | High |
| TC-11-02 | SLA Overdue highlight | Case เกิน SLA deadline | แถวสีแดง + badge ⚠️ + จำนวนวันที่เกิน | High |
| TC-11-03 | SLA Overdue count | Dashboard | Stat card 🚨 แสดงจำนวน case เกิน SLA | Medium |
