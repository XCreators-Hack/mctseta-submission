import { CROSSING_ZONES } from "@/data/zones";
import ZoneCard from "@/components/ZoneCard";

export default function ZonesPage() {
  return (
    <div className="flex flex-col gap-4 max-w-5xl">
      <p className="text-xs text-muted max-w-2xl">
        Demo/configuration records for this prototype — not real reserve geography. Each zone maps
        to one EcoWildGuard unit; a zone with no reporting unit shows as having no telemetry rather
        than a placeholder reading.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {CROSSING_ZONES.map((zone) => (
          <ZoneCard key={zone.id} zone={zone} />
        ))}
      </div>
    </div>
  );
}
