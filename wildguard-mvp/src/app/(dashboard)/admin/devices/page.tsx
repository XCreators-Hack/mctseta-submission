"use client";

import { withRoleGuard } from "@/lib/auth/withRoleGuard";
import { useDevices } from "@/hooks/useDomainData";
import { DeviceStatusBadge } from "@/components/ui/StatusBadge";

function DeviceManagement() {
  const { data: devices, isMock } = useDevices();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Device management</h1>
          <p className="text-sm text-slate-500">
            Registered ESP32 roadside units and their live status.
          </p>
        </div>
      </div>

      {isMock && (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Showing demo devices — connect Firebase to manage real hardware.
        </p>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2.5">Device</th>
              <th className="px-4 py-2.5">Zone</th>
              <th className="px-4 py-2.5">Corridor</th>
              <th className="px-4 py-2.5">Threshold</th>
              <th className="px-4 py-2.5">Firmware</th>
              <th className="px-4 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {devices.map((d) => (
              <tr key={d.id}>
                <td className="px-4 py-2.5 font-medium text-slate-800">{d.deviceCode}</td>
                <td className="px-4 py-2.5 text-slate-600">{d.zoneId}</td>
                <td className="px-4 py-2.5 text-slate-600">{d.corridorId}</td>
                <td className="px-4 py-2.5 text-slate-600">{d.hazardThresholdCm} cm</td>
                <td className="px-4 py-2.5 text-slate-500">{d.firmwareVersion}</td>
                <td className="px-4 py-2.5">
                  <DeviceStatusBadge status={d.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default withRoleGuard(DeviceManagement, ["admin"]);
