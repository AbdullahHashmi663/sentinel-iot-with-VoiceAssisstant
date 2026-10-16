import type { DomainType } from "@/types/sentinel";
import type { Section } from "./assistant";

export interface WorkspaceSnapshot { section: Section; domain: DomainType; demo: boolean; paused: boolean }
export type WorkspacePatch = Partial<WorkspaceSnapshot>;
export interface WorkspaceChange { label: string; before: WorkspacePatch; after: WorkspacePatch }
const fields = ["section", "domain", "demo", "paused"] as const;

export function workspaceChange(current: WorkspaceSnapshot, patch: WorkspacePatch, label: string): WorkspaceChange | null {
  const before: WorkspacePatch = {}, after: WorkspacePatch = {};
  for (const key of fields) {
    if (patch[key] !== undefined && patch[key] !== current[key]) {
      Object.assign(before, { [key]: current[key] });
      Object.assign(after, { [key]: patch[key] });
    }
  }
  return Object.keys(after).length ? { label, before, after } : null;
}

export function undoPatch(current: WorkspaceSnapshot, change: WorkspaceChange): WorkspacePatch | null {
  // A change made outside these controls must never be silently overwritten.
  return fields.some(key => change.after[key] !== undefined && current[key] !== change.after[key]) ? null : { ...change.before };
}

export function undoMessage(change: WorkspaceChange) {
  const resetsFeed = change.before.demo !== undefined || change.before.domain !== undefined;
  return `Undid ${change.label.toLowerCase()}.${resetsFeed ? " Previous source settings restored. The observation window starts fresh; earlier observations are not restored." : " Previous settings restored."}`;
}
