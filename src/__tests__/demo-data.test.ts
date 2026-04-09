import { describe, it, expect } from "vitest";
import { demoUsers, demoRequests, demoRoles, demoCaseHistory, getUserPermissions, getUserRole } from "@/lib/demo-data";

describe("Demo Roles", () => {
  it("should have 4 default roles", () => {
    expect(demoRoles.length).toBe(4);
  });

  it("admin role should have all permissions", () => {
    const admin = demoRoles.find((r) => r.name === "admin");
    expect(admin).toBeDefined();
    expect(admin!.permissions).toContain("user:manage");
    expect(admin!.permissions).toContain("role:manage");
    expect(admin!.permissions).toContain("menu:admin");
  });

  it("member role should not have admin permissions", () => {
    const member = demoRoles.find((r) => r.name === "member");
    expect(member).toBeDefined();
    expect(member!.permissions).not.toContain("menu:admin");
    expect(member!.permissions).not.toContain("case:assign");
    expect(member!.permissions).not.toContain("case:approve");
  });

  it("manager role should have workflow permissions", () => {
    const mgr = demoRoles.find((r) => r.name === "manager");
    expect(mgr!.permissions).toContain("case:assign");
    expect(mgr!.permissions).toContain("case:approve");
    expect(mgr!.permissions).toContain("case:complete");
    expect(mgr!.permissions).toContain("case:cancel");
  });
});

describe("Demo Users", () => {
  it("should have at least 5 users", () => {
    expect(demoUsers.length).toBeGreaterThanOrEqual(5);
  });

  it("each user should have a valid roleId", () => {
    const roleIds = demoRoles.map((r) => r.id);
    demoUsers.forEach((u) => expect(roleIds).toContain(u.roleId));
  });
});

describe("getUserPermissions", () => {
  it("should return admin permissions for admin user", () => {
    const perms = getUserPermissions(1);
    expect(perms).toContain("user:manage");
    expect(perms).toContain("role:manage");
  });

  it("should return member permissions for member user", () => {
    const perms = getUserPermissions(3); // member1
    expect(perms).toContain("case:create");
    expect(perms).toContain("case:resolve");
    expect(perms).not.toContain("case:assign");
  });

  it("should return empty for non-existent user", () => {
    expect(getUserPermissions(999)).toEqual([]);
  });
});

describe("getUserRole", () => {
  it("should return correct role", () => {
    const role = getUserRole(2); // manager1
    expect(role?.name).toBe("manager");
  });
});

describe("Demo Requests", () => {
  it("should have multiple statuses", () => {
    const statuses = new Set(demoRequests.map((r) => r.status));
    expect(statuses.size).toBeGreaterThanOrEqual(3);
  });

  it("each request should have creatorId", () => {
    demoRequests.forEach((r) => expect(r.creatorId).toBeTypeOf("number"));
  });
});

describe("Demo Case History", () => {
  it("should have history entries", () => {
    expect(demoCaseHistory.length).toBeGreaterThanOrEqual(5);
  });

  it("each entry should have action and requestId", () => {
    demoCaseHistory.forEach((h) => {
      expect(h.action).toBeTypeOf("string");
      expect(h.requestId).toBeTypeOf("number");
    });
  });
});
