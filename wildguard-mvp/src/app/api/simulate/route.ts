import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ingestSensorEvent } from "@/lib/eventPipeline";

// Demo Mode scenarios map to a distance value that the shared pipeline
// interprets exactly like a real sensor reading. This is what makes the
// simulated flow indistinguishable from a live ESP32 to the rest of the
// system.
const SCENARIO_DISTANCE: Record<string, number> = {
  NORMAL: 400,
  HAZARD_DETECTED: 45,
  WARNING_ACTIVE: 30,
  INTERVENTION_ACTIVE: 15,
  CLEARANCE: 400,
};

const SimulateSchema = z.object({
  deviceId: z.string().min(1),
  scenario: z.enum([
    "NORMAL",
    "HAZARD_DETECTED",
    "WARNING_ACTIVE",
    "INTERVENTION_ACTIVE",
    "CLEARANCE",
  ]),
});

export async function POST(req: NextRequest) {
  // In a full build this would also check the caller's Firebase ID token /
  // role. For the hackathon MVP, an optional shared secret is enough to gate
  // the endpoint while keeping the demo button simple to wire up client-side.
  const secret = process.env.DEMO_MODE_SECRET;
  if (secret) {
    const provided = req.headers.get("x-demo-secret");
    if (provided !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const body = await req.json().catch(() => null);
  const parsed = SimulateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const result = await ingestSensorEvent({
      deviceId: parsed.data.deviceId,
      distance: SCENARIO_DISTANCE[parsed.data.scenario],
      source: "demo",
    });
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Simulation failed" },
      { status: 500 }
    );
  }
}
