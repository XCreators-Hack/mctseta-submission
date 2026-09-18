interface SpecPanelProps {
  title: string;
  children: React.ReactNode;
}

export default function SpecPanel({ title, children }: SpecPanelProps) {
  return (
    <div>
      <div className="text-sm text-muted mb-2">{title}</div>
      <div className="rounded border border-border bg-surface px-4">{children}</div>
    </div>
  );
}
