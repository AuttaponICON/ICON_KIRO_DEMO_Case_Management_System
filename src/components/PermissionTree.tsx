"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";

interface TreeNode {
  key: string;
  labelKey: string;
  children?: TreeNode[];
}

const permissionTree: TreeNode[] = [
  {
    key: "menu", labelKey: "permTree.menu",
    children: [
      { key: "menu:dashboard", labelKey: "permLabel.menu:dashboard" },
      { key: "menu:requests", labelKey: "permLabel.menu:requests" },
      { key: "menu:reports", labelKey: "permLabel.menu:reports" },
      { key: "menu:settings", labelKey: "permLabel.menu:settings" },
      { key: "menu:admin", labelKey: "permLabel.menu:admin" },
    ],
  },
  {
    key: "case", labelKey: "permTree.case",
    children: [
      { key: "case:create", labelKey: "permLabel.case:create" },
      { key: "case:assign", labelKey: "permLabel.case:assign" },
      { key: "case:cancel", labelKey: "permLabel.case:cancel" },
      { key: "case:resolve", labelKey: "permLabel.case:resolve" },
      { key: "case:approve", labelKey: "permLabel.case:approve" },
      { key: "case:complete", labelKey: "permLabel.case:complete" },
    ],
  },
  {
    key: "admin", labelKey: "permTree.admin",
    children: [
      { key: "user:manage", labelKey: "permLabel.user:manage" },
      { key: "role:manage", labelKey: "permLabel.role:manage" },
    ],
  },
];

interface Props {
  selected: string[];
  onChange: (perms: string[]) => void;
}

export default function PermissionTree({ selected, onChange }: Props) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ menu: true, case: true, admin: true });

  const toggleExpand = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const togglePerm = (key: string) => {
    onChange(selected.includes(key) ? selected.filter((p) => p !== key) : [...selected, key]);
  };

  const toggleGroup = (node: TreeNode) => {
    const childKeys = node.children?.map((c) => c.key) || [];
    const allSelected = childKeys.every((k) => selected.includes(k));
    if (allSelected) {
      onChange(selected.filter((p) => !childKeys.includes(p)));
    } else {
      const newPerms = new Set([...selected, ...childKeys]);
      onChange(Array.from(newPerms));
    }
  };

  const isGroupChecked = (node: TreeNode) => {
    const childKeys = node.children?.map((c) => c.key) || [];
    return childKeys.every((k) => selected.includes(k));
  };

  const isGroupIndeterminate = (node: TreeNode) => {
    const childKeys = node.children?.map((c) => c.key) || [];
    const some = childKeys.some((k) => selected.includes(k));
    const all = childKeys.every((k) => selected.includes(k));
    return some && !all;
  };

  return (
    <div className="space-y-1">
      {permissionTree.map((group) => (
        <div key={group.key} className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 cursor-pointer hover:bg-slate-100"
            onClick={() => toggleExpand(group.key)}>
            <span className="text-xs text-slate-400 w-4">{expanded[group.key] ? "▼" : "▶"}</span>
            <input
              type="checkbox"
              checked={isGroupChecked(group)}
              ref={(el) => { if (el) el.indeterminate = isGroupIndeterminate(group); }}
              onChange={() => toggleGroup(group)}
              onClick={(e) => e.stopPropagation()}
              className="rounded"
            />
            <span className="text-sm font-semibold">{t(group.labelKey)}</span>
            <span className="text-xs text-slate-400 ml-auto">
              {group.children?.filter((c) => selected.includes(c.key)).length}/{group.children?.length}
            </span>
          </div>
          {expanded[group.key] && group.children && (
            <div className="px-3 py-1.5 space-y-1">
              {group.children.map((child) => (
                <label key={child.key} className="flex items-center gap-2 py-1 pl-6 cursor-pointer hover:bg-slate-50 rounded text-sm">
                  <input
                    type="checkbox"
                    checked={selected.includes(child.key)}
                    onChange={() => togglePerm(child.key)}
                    className="rounded"
                  />
                  <span>{t(child.labelKey)}</span>
                  <span className="text-xs text-slate-400 font-mono ml-auto">{child.key}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
