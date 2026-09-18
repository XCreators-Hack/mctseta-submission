interface ConnectionStatusProps {
  online: boolean;
  label?: string;
}

export default function ConnectionStatus({ online, label }: ConnectionStatusProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surfaceRaised px-2.5 py-1 text-xs">
      <span
        className={[
          "h-1.5 w-1.5 rounded-full",
          online ? "bg-safe pulse" : "bg-danger",
        ].join(" ")}
      />
      <span className={online ? "text-text" : "text-muted"}>
        {label ?? (online ? "Online" : "Offline")}
      </span>
    </div>
  );
}
