import type { ReactNode } from "react";

export function Section({
  title,
  count,
  action,
  empty,
  children,
}: {
  title: string;
  count?: number;
  action?: ReactNode;
  empty: string;
  children: ReactNode[];
}) {
  return (
    <section className="section">
      <header className="section-head">
        <h2 className="section-title">
          {title}
          {count !== undefined && count > 0 && <span className="count">{count}</span>}
        </h2>
        {action}
      </header>
      {children.length > 0 ? <ul className="list">{children}</ul> : <p className="empty">{empty}</p>}
    </section>
  );
}
