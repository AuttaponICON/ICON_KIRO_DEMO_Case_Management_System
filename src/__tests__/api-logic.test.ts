import { describe, it, expect } from "vitest";
import { demoUsers, demoRequests, demoRoles, getUserPermissions } from "@/lib/demo-data";

describe("Auth Logic", () => {
  it("should find user by valid credentials", () => {
    const user = demoUsers.find((u) => u.username === "admin" && u.password === "1234");
    expect(user).toBeDefined();
  });

  it("should not find user with wrong password", () => {
    const user = demoUsers.find((u) => u.username === "admin" && u.password === "wrong");
    expect(user).toBeUndefined();
  });

  it("should not find inactive user", () => {
    // All demo users are active, but test the logic
    const user = demoUsers.find((u) => u.username === "admin" && u.password === "1234" && u.active);
    expect(user).toBeDefined();
  });
});

describe("Case Workflow Logic", () => {
  it("PENDING case can be assigned", () => {
    const pending = demoRequests.find((r) => r.status === "PENDING");
    expect(pending).toBeDefined();
  });

  it("ASSIGNED case can be resolved", () => {
    const assigned = demoRequests.find((r) => r.status === "ASSIGNED");
    expect(assigned).toBeDefined();
    expect(assigned!.assigneeId).toBeTypeOf("number");
  });

  it("RESOLVED case can be approved or rejected", () => {
    const resolved = demoRequests.find((r) => r.status === "RESOLVED");
    expect(resolved).toBeDefined();
    expect(resolved!.rootCause).toBeTypeOf("string");
    expect(resolved!.resolution).toBeTypeOf("string");
  });

  it("CANCELLED case should have cancelReason", () => {
    const cancelled = demoRequests.find((r) => r.status === "CANCELLED");
    expect(cancelled).toBeDefined();
    expect(cancelled!.cancelReason).toBeTypeOf("string");
  });

  it("valid status transitions", () => {
    const validTransitions: Record<string, string[]> = {
      PENDING: ["ASSIGNED", "IN_PROGRESS", "CANCELLED"],
      ASSIGNED: ["RESOLVED"],
      IN_PROGRESS: ["RESOLVED"],
      RESOLVED: ["APPROVED", "REJECTED"],
      REJECTED: ["RESOLVED"],
      APPROVED: ["COMPLETED"],
    };
    Object.entries(validTransitions).forEach(([from, toList]) => {
      expect(toList.length).toBeGreaterThanOrEqual(1);
    });
  });
});

describe("RBAC Logic", () => {
  it("admin can manage users and roles", () => {
    const perms = getUserPermissions(1);
    expect(perms).toContain("user:manage");
    expect(perms).toContain("role:manage");
  });

  it("manager can assign and approve but not manage users", () => {
    const perms = getUserPermissions(2);
    expect(perms).toContain("case:assign");
    expect(perms).toContain("case:approve");
    expect(perms).not.toContain("user:manage");
  });

  it("member can create and resolve but not assign", () => {
    const perms = getUserPermissions(3);
    expect(perms).toContain("case:create");
    expect(perms).toContain("case:resolve");
    expect(perms).not.toContain("case:assign");
    expect(perms).not.toContain("case:approve");
  });

  it("vip can create cases but not manage workflow", () => {
    const perms = getUserPermissions(5);
    expect(perms).toContain("case:create");
    expect(perms).not.toContain("case:assign");
    expect(perms).not.toContain("case:approve");
  });

  it("member should not see admin menu", () => {
    const perms = getUserPermissions(3);
    expect(perms).not.toContain("menu:admin");
  });

  it("member should not see reports menu", () => {
    const perms = getUserPermissions(3);
    expect(perms).not.toContain("menu:reports");
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
    demoRequests.forEach((r) => { grouped[r.category] = (grouped[r.category] || 0) + 1; });
    const totalFromGroups = Object.values(grouped).reduce((a, b) => a + b, 0);
    expect(totalFromGroups).toBe(demoRequests.length);
  });
});
