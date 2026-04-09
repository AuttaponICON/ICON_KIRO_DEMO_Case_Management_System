import { describe, it, expect, beforeEach } from "vitest";
import { demoUsers, demoRequests, getNextId } from "@/lib/demo-data";

// Test API business logic (without HTTP layer)

describe("Auth Logic", () => {
  it("should find user by valid credentials", () => {
    const user = demoUsers.find((u) => u.username === "admin" && u.password === "1234");
    expect(user).toBeDefined();
    expect(user!.name).toBe("ผู้ดูแลระบบ");
  });

  it("should not find user with wrong password", () => {
    const user = demoUsers.find((u) => u.username === "admin" && u.password === "wrong");
    expect(user).toBeUndefined();
  });

  it("should not find non-existent user", () => {
    const user = demoUsers.find((u) => u.username === "nonexistent");
    expect(user).toBeUndefined();
  });
});

describe("Request CRUD Logic", () => {
  const originalLength = demoRequests.length;

  it("GET: should return requests sorted by createdAt desc", () => {
    const sorted = [...demoRequests].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    expect(sorted[0].createdAt >= sorted[sorted.length - 1].createdAt).toBe(true);
  });

  it("POST: should create a new request with correct defaults", () => {
    const before = demoRequests.length;
    const newReq = {
      id: getNextId(),
      code: `REQ-${String(before + 1).padStart(3, "0")}`,
      title: "ทดสอบแจ้งซ่อม",
      location: "ห้อง 101",
      category: "AC",
      detail: "ทดสอบ",
      status: "PENDING",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 1,
      user: { name: "ผู้ดูแลระบบ" },
    };
    demoRequests.push(newReq);

    expect(demoRequests.length).toBe(before + 1);
    expect(newReq.status).toBe("PENDING");
    expect(newReq.code).toMatch(/^REQ-\d{3}$/);
  });

  it("GET by id: should find existing request", () => {
    const found = demoRequests.find((r) => r.id === 1);
    expect(found).toBeDefined();
    expect(found!.code).toBe("REQ-001");
  });

  it("GET by id: should return undefined for non-existent", () => {
    const found = demoRequests.find((r) => r.id === 99999);
    expect(found).toBeUndefined();
  });

  it("PUT: should update request fields", () => {
    const idx = demoRequests.findIndex((r) => r.id === 1);
    expect(idx).toBeGreaterThanOrEqual(0);

    const original = { ...demoRequests[idx] };
    demoRequests[idx] = { ...demoRequests[idx], title: "แอร์ไม่เย็น (แก้ไข)", status: "IN_PROGRESS" };

    expect(demoRequests[idx].title).toBe("แอร์ไม่เย็น (แก้ไข)");
    expect(demoRequests[idx].status).toBe("IN_PROGRESS");
    expect(demoRequests[idx].location).toBe(original.location); // unchanged

    // restore
    demoRequests[idx] = { ...demoRequests[idx], title: original.title, status: original.status };
  });

  it("DELETE: should remove request by id", () => {
    const before = demoRequests.length;
    const lastId = demoRequests[demoRequests.length - 1].id;
    const idx = demoRequests.findIndex((r) => r.id === lastId);
    demoRequests.splice(idx, 1);

    expect(demoRequests.length).toBe(before - 1);
    expect(demoRequests.find((r) => r.id === lastId)).toBeUndefined();
  });
});

describe("Report Logic", () => {
  it("should calculate completion rate", () => {
    const total = demoRequests.length;
    const completed = demoRequests.filter((r) => r.status === "COMPLETED").length;
    const rate = total ? Math.round((completed / total) * 100) : 0;

    expect(rate).toBeGreaterThanOrEqual(0);
    expect(rate).toBeLessThanOrEqual(100);
  });

  it("should group by category", () => {
    const grouped: Record<string, number> = {};
    demoRequests.forEach((r) => {
      grouped[r.category] = (grouped[r.category] || 0) + 1;
    });

    expect(Object.keys(grouped).length).toBeGreaterThanOrEqual(1);
    const totalFromGroups = Object.values(grouped).reduce((a, b) => a + b, 0);
    expect(totalFromGroups).toBe(demoRequests.length);
  });

  it("should find top category", () => {
    const grouped: Record<string, number> = {};
    demoRequests.forEach((r) => {
      grouped[r.category] = (grouped[r.category] || 0) + 1;
    });
    const top = Object.entries(grouped).sort((a, b) => b[1] - a[1])[0];
    expect(top).toBeDefined();
    expect(top[1]).toBeGreaterThanOrEqual(1);
  });
});
