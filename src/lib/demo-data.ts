export interface DemoUser {
  id: number;
  username: string;
  password: string;
  name: string;
  role: string;
}

export interface DemoRequest {
  id: number;
  code: string;
  title: string;
  location: string;
  category: string;
  detail: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  user?: { name: string };
}

export const demoUsers: DemoUser[] = [
  { id: 1, username: "admin", password: "1234", name: "ผู้ดูแลระบบ", role: "admin" },
  { id: 2, username: "user1", password: "1234", name: "สมชาย ใจดี", role: "user" },
];

export const demoRequests: DemoRequest[] = [
  { id: 1, code: "REQ-001", title: "แอร์ไม่เย็น", location: "ห้อง 301", category: "AC", detail: "แอร์เปิดแล้วไม่เย็น มีเสียงดัง", status: "PENDING", createdAt: "2026-04-07T00:00:00.000Z", updatedAt: "2026-04-07T00:00:00.000Z", userId: 1, user: { name: "ผู้ดูแลระบบ" } },
  { id: 2, code: "REQ-002", title: "ไฟห้องน้ำไม่ติด", location: "ชั้น 2 ห้องน้ำชาย", category: "ELECTRICAL", detail: "หลอดไฟขาด", status: "IN_PROGRESS", createdAt: "2026-04-08T00:00:00.000Z", updatedAt: "2026-04-08T00:00:00.000Z", userId: 1, user: { name: "ผู้ดูแลระบบ" } },
  { id: 3, code: "REQ-003", title: "ก๊อกน้ำรั่ว", location: "ห้องครัว ชั้น 1", category: "PLUMBING", detail: "น้ำหยดตลอดเวลา", status: "COMPLETED", createdAt: "2026-04-06T00:00:00.000Z", updatedAt: "2026-04-06T00:00:00.000Z", userId: 1, user: { name: "ผู้ดูแลระบบ" } },
  { id: 4, code: "REQ-004", title: "ประตูปิดไม่สนิท", location: "ห้องประชุม A", category: "BUILDING", detail: "บานพับหลวม", status: "PENDING", createdAt: "2026-04-09T00:00:00.000Z", updatedAt: "2026-04-09T00:00:00.000Z", userId: 1, user: { name: "ผู้ดูแลระบบ" } },
  { id: 5, code: "REQ-005", title: "ปลั๊กไฟชำรุด", location: "ห้อง 205", category: "ELECTRICAL", detail: "ปลั๊กหลวม มีประกายไฟ", status: "COMPLETED", createdAt: "2026-04-05T00:00:00.000Z", updatedAt: "2026-04-05T00:00:00.000Z", userId: 1, user: { name: "ผู้ดูแลระบบ" } },
];

let nextId = 6;
export function getNextId() { return nextId++; }
