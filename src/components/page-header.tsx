import type { ReactNode } from "react";

export function PageHeader({ eyebrow, title, subtitle, actions }: { eyebrow?: string; title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="border-b border-border px-5 py-7 md:px-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h1 className="mt-1 text-2xl font-semibold md:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
