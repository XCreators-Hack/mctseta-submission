import { statusTone } from "@/lib/format";
import type { TelemetryStatus } from "@/lib/types";

interface ProximityBarProps {
  distance: number;
  status: TelemetryStatus;
}

const SEGMENT_COUNT = 12;
const MAX_RANGE_CM = 80; // beyond this, sensor reads fully clear

const TONE_FILL: Record<string, string> = {
  critical: "bg-danger",
  caution: "bg-accent",
  positive: "bg-safe",
  neutral: "bg-safe",
};

const TONE_TRACK: Record<string, string> = {
  critical: "bg-danger/15",
  caution: "bg-accent/15",
  positive: "bg-safe/15",
  neutral: "bg-safe/15",
};

/**
 * Renders a fixed number of segments. Closer objects light up more
 * segments (and shift toward the danger colour), mirroring how a physical
 * parking-sensor readout communicates proximity at a glance — the same
 * ultrasonic sensing principle this device uses.
 */
export default function ProximityBar({ distance, status }: ProximityBarProps) {
  const tone = statusTone(status);
  const clamped = Math.max(0, Math.min(distance, MAX_RANGE_CM));
  const proximityFraction = 1 - clamped / MAX_RANGE_CM; // 1 = right on top of it
  const litSegments = Math.max(1, Math.round(proximityFraction * SEGMENT_COUNT));

  return (
    <div className="flex gap-1" role="img" aria-label={`Proximity: ${litSegments} of ${SEGMENT_COUNT} segments lit`}>
      {Array.from({ length: SEGMENT_COUNT }).map((_, i) => {
        const lit = i < litSegments;
        return (
          <span
            key={i}
            className={[
              "h-8 flex-1 rounded-sm transition-colors",
              lit ? TONE_FILL[tone] : TONE_TRACK[tone],
            ].join(" ")}
          />
        );
      })}
    </div>
  );
}
