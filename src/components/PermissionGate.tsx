"use client";

import { Permission, hasPermission, hasAnyPermission } from "@/lib/permissions";

interface Props {
  permissions: string[];
  required?: Permission;
  any?: Permission[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function PermissionGate({ permissions, required, any, children, fallback = null }: Props) {
  if (required && !hasPermission(permissions, required)) return <>{fallback}</>;
  if (any && !hasAnyPermission(permissions, any)) return <>{fallback}</>;
  return <>{children}</>;
}
