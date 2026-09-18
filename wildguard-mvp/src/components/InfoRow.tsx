interface InfoRowProps {
  label: string;
  value: React.ReactNode;
}

export default function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-border last:border-b-0">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm text-text mono text-right">{value}</span>
    </div>
  );
}
