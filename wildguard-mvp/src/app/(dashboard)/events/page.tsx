"use client";

import { withRoleGuard } from "@/lib/auth/withRoleGuard";
import { useEvents } from "@/hooks/useDomainData";
import { EventFeed } from "@/components/dashboard/EventFeed";

function EventsPage() {
  const { data: events, isMock } = useEvents(100);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Event history</h1>
        <p className="text-sm text-slate-500">
          Full log of hazard detections, clearances and manual reports.
        </p>
      </div>
      {isMock && (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Connect Firebase and trigger Demo Mode to populate this feed.
        </p>
      )}
      <EventFeed events={events} />
    </div>
  );
}

export default withRoleGuard(EventsPage, ["admin", "driver", "logistics", "wildlife"]);
