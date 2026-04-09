// ===== Category Config (2-Level + SLA) =====
export interface DemoSubCategory {
  id: number;
  name: string;
  slaDays: number;
}

export interface DemoCategoryConfig {
  id: number;
  key: string;
  name: string;
  icon: string;
  subCategories: DemoSubCategory[];
}

export const demoCategoryConfigs: DemoCategoryConfig[] = [
  { id: 1, key: "ELECTRICAL", name: "ไฟฟ้า", icon: "⚡", subCategories: [
    { id: 1, name: "หลอดไฟ/แสงสว่าง", slaDays: 1 },
    { id: 2, name: "ปลั๊ก/สวิตช์", slaDays: 2 },
    { id: 3, name: "สายไฟ/ระบบไฟฟ้า", slaDays: 3 },
  ]},
  { id: 2, key: "PLUMBING", name: "ประปา", icon: "🚿", subCategories: [
    { id: 4, name: "ก๊อกน้ำ/วาล์ว", slaDays: 2 },
    { id: 5, name: "ท่อน้ำรั่ว/ตัน", slaDays: 1 },
    { id: 6, name: "สุขภัณฑ์", slaDays: 3 },
  ]},
  { id: 3, key: "AC", name: "แอร์", icon: "❄️", subCategories: [
    { id: 7, name: "แอร์ไม่เย็น", slaDays: 2 },
    { id: 8, name: "แอร์มีเสียงดัง", slaDays: 3 },
    { id: 9, name: "แอร์น้ำหยด", slaDays: 2 },
    { id: 10, name: "ล้างแอร์/บำรุงรักษา", slaDays: 5 },
  ]},
  { id: 4, key: "BUILDING", name: "อาคาร", icon: "🏢", subCategories: [
    { id: 11, name: "ประตู/หน้าต่าง", slaDays: 3 },
    { id: 12, name: "หลังคา/ฝ้าเพดาน", slaDays: 5 },
    { id: 13, name: "พื้น/ผนัง", slaDays: 4 },
    { id: 14, name: "ลิฟต์/บันไดเลื่อน", slaDays: 1 },
  ]},
  { id: 5, key: "OTHER", name: "อื่นๆ", icon: "📦", subCategories: [
    { id: 15, name: "เฟอร์นิเจอร์", slaDays: 5 },
    { id: 16, name: "อุปกรณ์สำนักงาน", slaDays: 3 },
    { id: 17, name: "อื่นๆ", slaDays: 3 },
  ]},
];

let nextCatId = 6;
let nextSubCatId = 18;
export function getNextCatId() { return nextCatId++; }
export function getNextSubCatId() { return nextSubCatId++; }

export function getSlaDays(categoryKey: string, subCategoryName?: string): number {
  const cat = demoCategoryConfigs.find((c) => c.key === categoryKey);
  if (!cat) return 3;
  if (subCategoryName) {
    const sub = cat.subCategories.find((s) => s.name === subCategoryName);
    if (sub) return sub.slaDays;
  }
  return cat.subCategories[0]?.slaDays || 3;
}

// ===== Roles =====
export interface DemoRole {
  id: number;
  name: string;
  label: string;
  permissions: string[];
}

export const demoRoles: DemoRole[] = [
  { id: 1, name: "admin", label: "ผู้ดูแลระบบ", permissions: ["menu:dashboard","menu:requests","menu:reports","menu:settings","menu:admin","case:create","case:assign","case:cancel","case:resolve","case:approve","case:complete","user:manage","role:manage"] },
  { id: 2, name: "vip", label: "VIP", permissions: ["menu:dashboard","menu:requests","menu:reports","menu:settings","case:create"] },
  { id: 3, name: "manager", label: "ผู้จัดการ", permissions: ["menu:dashboard","menu:requests","menu:reports","menu:settings","case:create","case:assign","case:cancel","case:resolve","case:approve","case:complete"] },
  { id: 4, name: "member", label: "สมาชิก", permissions: ["menu:dashboard","menu:requests","menu:settings","case:create","case:resolve"] },
];

// ===== Users (extended fields) =====
export interface DemoUser {
  id: number;
  username: string;
  password: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  roleId: number;
  active: boolean;
}

export const demoUsers: DemoUser[] = [
  { id: 1, username: "admin", password: "1234", name: "ผู้ดูแลระบบ", email: "admin@company.com", phone: "081-111-1111", department: "IT", position: "System Admin", roleId: 1, active: true },
  { id: 2, username: "manager1", password: "1234", name: "สมศักดิ์ จัดการดี", email: "somsak@company.com", phone: "081-222-2222", department: "Facility", position: "Facility Manager", roleId: 3, active: true },
  { id: 3, username: "member1", password: "1234", name: "สมชาย ใจดี", email: "somchai@company.com", phone: "081-333-3333", department: "Facility", position: "Technician", roleId: 4, active: true },
  { id: 4, username: "member2", password: "1234", name: "สมหญิง รักงาน", email: "somying@company.com", phone: "081-444-4444", department: "Facility", position: "Technician", roleId: 4, active: true },
  { id: 5, username: "vip1", password: "1234", name: "คุณวิชัย VIP", email: "wichai@company.com", phone: "081-555-5555", department: "Management", position: "Director", roleId: 2, active: true },
];

// ===== Requests =====
export interface DemoRequest {
  id: number; code: string; title: string; location: string;
  category: string; subCategory: string;
  detail: string | null; status: string;
  priority: string;
  reporterName: string | null; reporterPhone: string | null;
  attachments: { name: string; type: string; size: number }[];
  rootCause: string | null; resolution: string | null;
  cancelReason: string | null; rejectReason: string | null;
  slaDeadline: string; createdAt: string; updatedAt: string;
  creatorId: number; assigneeId: number | null;
  creator?: { name: string }; assignee?: { name: string } | null;
}

export const demoRequests: DemoRequest[] = [
  { id: 1, code: "REQ-001", title: "แอร์ไม่เย็น", location: "ห้อง 301", category: "AC", subCategory: "แอร์ไม่เย็น", detail: "แอร์เปิดแล้วไม่เย็น มีเสียงดัง", status: "PENDING", priority: "HIGH", reporterName: "สมชาย ใจดี", reporterPhone: "081-333-3333", attachments: [], rootCause: null, resolution: null, cancelReason: null, rejectReason: null, slaDeadline: "2026-04-09T00:00:00.000Z", createdAt: "2026-04-07T00:00:00.000Z", updatedAt: "2026-04-07T00:00:00.000Z", creatorId: 3, assigneeId: null, creator: { name: "สมชาย ใจดี" } },
  { id: 2, code: "REQ-002", title: "ไฟห้องน้ำไม่ติด", location: "ชั้น 2 ห้องน้ำชาย", category: "ELECTRICAL", subCategory: "หลอดไฟ/แสงสว่าง", detail: "หลอดไฟขาด", status: "ASSIGNED", priority: "MEDIUM", reporterName: "คุณวิชัย VIP", reporterPhone: "081-555-5555", attachments: [], rootCause: null, resolution: null, cancelReason: null, rejectReason: null, slaDeadline: "2026-04-09T00:00:00.000Z", createdAt: "2026-04-08T00:00:00.000Z", updatedAt: "2026-04-08T00:00:00.000Z", creatorId: 5, assigneeId: 3, creator: { name: "คุณวิชัย VIP" }, assignee: { name: "สมชาย ใจดี" } },
  { id: 3, code: "REQ-003", title: "ก๊อกน้ำรั่ว", location: "ห้องครัว ชั้น 1", category: "PLUMBING", subCategory: "ก๊อกน้ำ/วาล์ว", detail: "น้ำหยดตลอดเวลา", status: "COMPLETED", priority: "MEDIUM", reporterName: "สมชาย ใจดี", reporterPhone: "081-333-3333", attachments: [], rootCause: "ซีลยางเสื่อม", resolution: "เปลี่ยนซีลยางใหม่", cancelReason: null, rejectReason: null, slaDeadline: "2026-04-08T00:00:00.000Z", createdAt: "2026-04-06T00:00:00.000Z", updatedAt: "2026-04-06T00:00:00.000Z", creatorId: 3, assigneeId: 4, creator: { name: "สมชาย ใจดี" }, assignee: { name: "สมหญิง รักงาน" } },
  { id: 4, code: "REQ-004", title: "ประตูปิดไม่สนิท", location: "ห้องประชุม A", category: "BUILDING", subCategory: "ประตู/หน้าต่าง", detail: "บานพับหลวม", status: "RESOLVED", priority: "LOW", reporterName: "สมหญิง รักงาน", reporterPhone: "081-444-4444", attachments: [], rootCause: "บานพับสึกหรอ", resolution: "เปลี่ยนบานพับใหม่", cancelReason: null, rejectReason: null, slaDeadline: "2026-04-12T00:00:00.000Z", createdAt: "2026-04-09T00:00:00.000Z", updatedAt: "2026-04-09T00:00:00.000Z", creatorId: 4, assigneeId: 3, creator: { name: "สมหญิง รักงาน" }, assignee: { name: "สมชาย ใจดี" } },
  { id: 5, code: "REQ-005", title: "ปลั๊กไฟชำรุด", location: "ห้อง 205", category: "ELECTRICAL", subCategory: "ปลั๊ก/สวิตช์", detail: "ปลั๊กหลวม มีประกายไฟ", status: "CANCELLED", priority: "CRITICAL", reporterName: "สมชาย ใจดี", reporterPhone: "081-333-3333", attachments: [], rootCause: null, resolution: null, cancelReason: "ซ้ำกับ REQ-002", rejectReason: null, slaDeadline: "2026-04-07T00:00:00.000Z", createdAt: "2026-04-05T00:00:00.000Z", updatedAt: "2026-04-05T00:00:00.000Z", creatorId: 3, assigneeId: null, creator: { name: "สมชาย ใจดี" } },
  { id: 6, code: "REQ-006", title: "หลังคารั่ว", location: "อาคาร B ชั้น 3", category: "BUILDING", subCategory: "หลังคา/ฝ้าเพดาน", detail: "น้ำรั่วเวลาฝนตก", status: "ASSIGNED", priority: "HIGH", reporterName: "คุณวิชัย VIP", reporterPhone: "081-555-5555", attachments: [], rootCause: null, resolution: null, cancelReason: null, rejectReason: null, slaDeadline: "2026-04-06T00:00:00.000Z", createdAt: "2026-04-01T00:00:00.000Z", updatedAt: "2026-04-01T00:00:00.000Z", creatorId: 5, assigneeId: 4, creator: { name: "คุณวิชัย VIP" }, assignee: { name: "สมหญิง รักงาน" } },
  { id: 7, code: "REQ-007", title: "แอร์มีเสียงดัง", location: "ห้อง 102", category: "AC", subCategory: "แอร์มีเสียงดัง", detail: "เสียงดังผิดปกติ", status: "PENDING", priority: "MEDIUM", reporterName: "สมหญิง รักงาน", reporterPhone: "081-444-4444", attachments: [], rootCause: null, resolution: null, cancelReason: null, rejectReason: null, slaDeadline: "2026-04-07T00:00:00.000Z", createdAt: "2026-04-04T00:00:00.000Z", updatedAt: "2026-04-04T00:00:00.000Z", creatorId: 4, assigneeId: null, creator: { name: "สมหญิง รักงาน" } },
];

// ===== Case History =====
export interface DemoCaseHistory { id: number; requestId: number; userId: number; action: string; comment: string | null; createdAt: string; user?: { name: string }; }

export const demoCaseHistory: DemoCaseHistory[] = [
  { id: 1, requestId: 1, userId: 3, action: "CREATED", comment: null, createdAt: "2026-04-07T00:00:00.000Z", user: { name: "สมชาย ใจดี" } },
  { id: 2, requestId: 2, userId: 5, action: "CREATED", comment: null, createdAt: "2026-04-08T00:00:00.000Z", user: { name: "คุณวิชัย VIP" } },
  { id: 3, requestId: 2, userId: 2, action: "ASSIGNED", comment: "มอบหมายให้สมชาย", createdAt: "2026-04-08T01:00:00.000Z", user: { name: "สมศักดิ์ จัดการดี" } },
  { id: 4, requestId: 3, userId: 3, action: "CREATED", comment: null, createdAt: "2026-04-06T00:00:00.000Z", user: { name: "สมชาย ใจดี" } },
  { id: 5, requestId: 4, userId: 4, action: "CREATED", comment: null, createdAt: "2026-04-09T00:00:00.000Z", user: { name: "สมหญิง รักงาน" } },
  { id: 6, requestId: 4, userId: 3, action: "RESOLVED", comment: "เปลี่ยนบานพับใหม่แล้ว", createdAt: "2026-04-09T02:00:00.000Z", user: { name: "สมชาย ใจดี" } },
  { id: 7, requestId: 5, userId: 2, action: "CANCELLED", comment: "ซ้ำกับ REQ-002", createdAt: "2026-04-05T01:00:00.000Z", user: { name: "สมศักดิ์ จัดการดี" } },
];

// ===== ID Generators =====
let nextRequestId = 8;
let nextUserId = 6;
let nextRoleId = 5;
let nextHistoryId = 8;

export function getNextRequestId() { return nextRequestId++; }
export function getNextUserId() { return nextUserId++; }
export function getNextRoleId() { return nextRoleId++; }
export function getNextHistoryId() { return nextHistoryId++; }

// ===== Helpers =====
export function getUserRole(userId: number): DemoRole | undefined {
  const user = demoUsers.find((u) => u.id === userId);
  if (!user) return undefined;
  return demoRoles.find((r) => r.id === user.roleId);
}

export function getUserPermissions(userId: number): string[] {
  return getUserRole(userId)?.permissions || [];
}
