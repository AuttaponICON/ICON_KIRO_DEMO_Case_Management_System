import { describe, it, expect } from "vitest";
import { hasPermission, hasAnyPermission, ALL_PERMISSIONS } from "@/lib/permissions";

describe("hasPermission", () => {
  it("should return true when permission exists", () => {
    expect(hasPermission(["menu:dashboard", "case:create"], "case:create")).toBe(true);
  });

  it("should return false when permission missing", () => {
    expect(hasPermission(["menu:dashboard"], "case:create")).toBe(false);
  });

  it("should return false for empty permissions", () => {
    expect(hasPermission([], "menu:dashboard")).toBe(false);
  });
});

describe("hasAnyPermission", () => {
  it("should return true when any permission matches", () => {
    expect(hasAnyPermission(["menu:dashboard"], ["menu:dashboard", "menu:admin"])).toBe(true);
  });

  it("should return false when no permission matches", () => {
    expect(hasAnyPermission(["menu:dashboard"], ["menu:admin", "user:manage"])).toBe(false);
  });
});

describe("ALL_PERMISSIONS", () => {
  it("should have 13 permissions", () => {
    expect(ALL_PERMISSIONS.length).toBe(13);
  });

  it("should include menu and case permissions", () => {
    expect(ALL_PERMISSIONS).toContain("menu:dashboard");
    expect(ALL_PERMISSIONS).toContain("case:create");
    expect(ALL_PERMISSIONS).toContain("user:manage");
  });
});
