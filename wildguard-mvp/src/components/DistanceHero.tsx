import ProximityBar from "./ProximityBar";
import { formatStatusLabel, statusTone } from "@/lib/format";
import type { TelemetryStatus } from "@/lib/types";

interface DistanceHeroProps {
  distance: number;
  status: TelemetryStatus;
}

const TONE_TEXT: Record<string, string> = {
  critical: "text-danger",
  caution: "text-accent",
  positive: "text-safe",
  neutral: "text-muted",
};

export default function DistanceHero({ distance, status }: DistanceHeroProps) {
  const tone = statusTone(status);

  return (
    <div className="rounded border border-border bg-surface p-5 md:p-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="text-sm text-muted mb-1">Distance</div>
          <div className="flex items-baseline gap-2">
            <span className="mono text-5xl md:text-6xl font-semibold text-text leading-none">
              {distance.toFixed(2)}
            </span>
            <span className="text-lg text-muted">cm</span>
          </div>
        </div>
        <div className={["text-sm font-medium", TONE_TEXT[tone]].join(" ")}>
          {formatStatusLabel(status)}
        </div>
      </div>

      <div className="mt-5">
        <ProximityBar distance={distance} status={status} />
        <div className="mt-2 flex justify-between text-[11px] text-muted">
          <span>0 cm</span>
          <span>80 cm+</span>
        </div>
      </div>
    </div>
  );
}
