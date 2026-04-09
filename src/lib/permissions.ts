export const ALL_PERMISSIONS = [
  "menu:dashboard",
  "menu:requests",
  "menu:reports",
  "menu:settings",
  "menu:admin",
  "case:create",
  "case:assign",
  "case:cancel",
  "case:resolve",
  "case:approve",
  "case:complete",
  "user:manage",
  "role:manage",
] as const;

export type Permission = (typeof ALL_PERMISSIONS)[number];

export function hasPermission(userPermissions: string[], required: Permission): boolean {
  return userPermissions.includes(required);
}

export function hasAnyPermission(userPermissions: string[], required: Permission[]): boolean {
  return required.some((p) => userPermissions.includes(p));
}
