import { detectionSubline, detectionTone } from "@/lib/format";
import type { TelemetryStatus } from "@/lib/types";

interface DirectiveBannerProps {
  status: TelemetryStatus;
  /**
   * "command" reads ROAD CLEAR / SLOW DOWN / STOP, for reserve-operations
   * and the main overview. "driver" reads PROCEED / SLOW DOWN / STOP, for
   * the fleet/logistics view where the audience is behind the wheel.
   */
  variant?: "command" | "driver";
}

const HEADLINES: Record<"command" | "driver", Record<TelemetryStatus, string>> = {
  command: {
    road_clear: "ROAD CLEAR",
    animal_crossing: "SLOW DOWN",
    animal_ahead: "STOP",
  },
  driver: {
    road_clear: "PROCEED",
    animal_crossing: "SLOW DOWN",
    animal_ahead: "STOP",
  },
};

const TONE_BG: Record<string, string> = {
  critical: "bg-danger/10 border-danger",
  caution: "bg-accent/10 border-accent",
  positive: "bg-safe/10 border-safe",
  neutral: "bg-surfaceRaised border-border",
};

const TONE_TEXT: Record<string, string> = {
  critical: "text-danger",
  caution: "text-accent",
  positive: "text-safe",
  neutral: "text-muted",
};

export default function DirectiveBanner({ status, variant = "command" }: DirectiveBannerProps) {
  const tone = detectionTone(status);

  return (
    <div className={["rounded border p-5 md:p-6 text-center", TONE_BG[tone]].join(" ")}>
      <div className={["text-3xl md:text-4xl font-bold tracking-wide mono", TONE_TEXT[tone]].join(" ")}>
        {HEADLINES[variant][status]}
      </div>
      <div className="mt-1.5 text-sm text-muted">{detectionSubline(status)}</div>
    </div>
  );
}
