// ===== Interface Log (API Log) =====
export interface InterfaceLog {
  id: number;
  timestamp: string;
  method: string;
  path: string;
  statusCode: number;
  success: boolean;
  requestBody: unknown | null;
  responseBody: unknown | null;
  userId: number | null;
  userName: string | null;
  durationMs: number;
}

export const interfaceLogs: InterfaceLog[] = [];
let nextLogId = 1;

export function addInterfaceLog(log: Omit<InterfaceLog, "id">) {
  const entry = { id: nextLogId++, ...log };
  interfaceLogs.unshift(entry); // newest first
  if (interfaceLogs.length > 500) interfaceLogs.pop(); // keep max 500
  return entry;
}

// ===== Login Log =====
export interface LoginLog {
  id: number;
  timestamp: string;
  username: string;
  success: boolean;
  ip: string;
  userAgent: string;
  reason: string | null;
}

export const loginLogs: LoginLog[] = [
  { id: 1, timestamp: "2026-04-09T08:00:00.000Z", username: "admin", success: true, ip: "127.0.0.1", userAgent: "Mozilla/5.0", reason: null },
  { id: 2, timestamp: "2026-04-09T07:55:00.000Z", username: "admin", success: false, ip: "127.0.0.1", userAgent: "Mozilla/5.0", reason: "Wrong password" },
  { id: 3, timestamp: "2026-04-08T14:30:00.000Z", username: "manager1", success: true, ip: "192.168.1.10", userAgent: "Mozilla/5.0", reason: null },
  { id: 4, timestamp: "2026-04-08T09:00:00.000Z", username: "member1", success: true, ip: "192.168.1.20", userAgent: "Mozilla/5.0", reason: null },
  { id: 5, timestamp: "2026-04-07T16:00:00.000Z", username: "hacker", success: false, ip: "10.0.0.99", userAgent: "curl/7.88", reason: "User not found" },
];
let nextLoginLogId = 6;

export function addLoginLog(log: Omit<LoginLog, "id">) {
  const entry = { id: nextLoginLogId++, ...log };
  loginLogs.unshift(entry);
  if (loginLogs.length > 500) loginLogs.pop();
  return entry;
}
