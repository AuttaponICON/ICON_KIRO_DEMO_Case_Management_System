import { describe, it, expect, beforeEach } from "vitest";
import { demoUsers, demoRequests, getNextId } from "@/lib/demo-data";

describe("Demo Data", () => {
  describe("demoUsers", () => {
    it("should have at least 2 users", () => {
      expect(demoUsers.length).toBeGreaterThanOrEqual(2);
    });

    it("should have admin user with correct credentials", () => {
      const admin = demoUsers.find((u) => u.username === "admin");
      expect(admin).toBeDefined();
      expect(admin!.password).toBe("1234");
      expect(admin!.role).toBe("admin");
    });

    it("each user should have required fields", () => {
      demoUsers.forEach((u) => {
        expect(u.id).toBeTypeOf("number");
        expect(u.username).toBeTypeOf("string");
        expect(u.name).toBeTypeOf("string");
        expect(u.role).toBeTypeOf("string");
      });
    });
  });

  describe("demoRequests", () => {
    it("should have 5 seed requests", () => {
      expect(demoRequests.length).toBeGreaterThanOrEqual(5);
    });

    it("each request should have required fields", () => {
      demoRequests.forEach((r) => {
        expect(r.id).toBeTypeOf("number");
        expect(r.code).toMatch(/^REQ-\d{3}$/);
        expect(r.title).toBeTypeOf("string");
        expect(r.location).toBeTypeOf("string");
        expect(["ELECTRICAL", "PLUMBING", "AC", "BUILDING", "OTHER"]).toContain(r.category);
        expect(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).toContain(r.status);
      });
    });

    it("should have unique codes", () => {
      const codes = demoRequests.map((r) => r.code);
      expect(new Set(codes).size).toBe(codes.length);
    });

    it("should cover multiple statuses", () => {
      const statuses = new Set(demoRequests.map((r) => r.status));
      expect(statuses.size).toBeGreaterThanOrEqual(3);
    });

    it("should cover multiple categories", () => {
      const categories = new Set(demoRequests.map((r) => r.category));
      expect(categories.size).toBeGreaterThanOrEqual(3);
    });
  });

  describe("getNextId", () => {
    it("should return incrementing ids", () => {
      const id1 = getNextId();
      const id2 = getNextId();
      expect(id2).toBe(id1 + 1);
    });
  });
});
