import { SessionOptions } from "iron-session";

export interface SessionData {
  userId?: number;
  username?: string;
  name?: string;
  role?: string;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || "this-is-a-secret-key-change-in-production-min-32-chars",
  cookieName: "maintenance-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
  },
};
