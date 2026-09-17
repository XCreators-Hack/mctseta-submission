import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ingestSensorEvent } from "@/lib/eventPipeline";

// ESP32 firmware sends: { deviceId, distance, timestamp? }
// Authenticated via a shared header, NOT a full user session — devices
// can't do an interactive Firebase Auth login flow.
const EventSchema = z.object({
  deviceId: z.string().min(1),
  distance: z.number().nonnegative(),
  timestamp: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-device-api-key");
  if (!process.env.DEVICE_API_KEY || apiKey !== process.env.DEVICE_API_KEY) {
    return NextResponse.json({ error: "Unauthorized device" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = EventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const result = await ingestSensorEvent({
      ...parsed.data,
      source: "esp32",
    });
    // The ESP32 uses this response to decide servo/LED/LCD state.
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Ingestion failed" },
      { status: 500 }
    );
  }
}
