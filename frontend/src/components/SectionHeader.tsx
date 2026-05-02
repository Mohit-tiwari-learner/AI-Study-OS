import { ReactNode } from "react";

interface Props {
  title: string;
  badge?: string;
  badgeColor?: string;
  icon?: ReactNode;
}

/**
 * Consistent section header — title + optional status badge.
 * Replaces the repeated flex-between pattern across all route cards.
 */
export function SectionHeader({ title, badge, badgeColor, icon }: Props) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h2 className="font-display font-semibold text-base flex items-center gap-2">
        {icon}
        {title}
      </h2>
      {badge && (
        <span className={`status-badge ${badgeColor ?? "text-muted-foreground"}`}>
          {badge}
        </span>
      )}
    </div>
  );
}
