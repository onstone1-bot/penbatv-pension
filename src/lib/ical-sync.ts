import { createAdminClient } from "@/lib/supabase/admin";

type ParsedIcalEvent = {
  uid: string;
  summary: string | null;
  checkIn: string;
  checkOut: string;
};

function unfoldIcalLines(text: string) {
  return text.replace(/\r\n[ \t]/g, "").replace(/\n[ \t]/g, "").split(/\r?\n/);
}

function valueFor(line: string) {
  const splitAt = line.indexOf(":");
  return splitAt === -1 ? "" : line.slice(splitAt + 1).trim();
}

function parseIcalDate(value: string) {
  const compact = value.trim();

  if (/^\d{8}$/.test(compact)) {
    return `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}`;
  }

  if (/^\d{4}-\d{2}-\d{2}/.test(compact)) {
    return compact.slice(0, 10);
  }

  if (/^\d{8}T/.test(compact)) {
    return `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}`;
  }

  throw new Error(`Unsupported iCal date format: ${value}`);
}

function addDays(date: string, amount: number) {
  const next = new Date(`${date}T00:00:00.000Z`);
  next.setUTCDate(next.getUTCDate() + amount);
  return next.toISOString().slice(0, 10);
}

export function parseIcalEvents(text: string): ParsedIcalEvent[] {
  const lines = unfoldIcalLines(text);
  const events: ParsedIcalEvent[] = [];
  let current: Record<string, string> | null = null;

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      current = {};
      continue;
    }

    if (line === "END:VEVENT") {
      if (current?.UID && current.DTSTART) {
        const checkIn = parseIcalDate(current.DTSTART);
        const checkOut = current.DTEND ? parseIcalDate(current.DTEND) : addDays(checkIn, 1);

        if (checkIn < checkOut) {
          events.push({
            uid: current.UID,
            summary: current.SUMMARY ?? null,
            checkIn,
            checkOut
          });
        }
      }
      current = null;
      continue;
    }

    if (!current) continue;

    if (line.startsWith("UID")) current.UID = valueFor(line);
    if (line.startsWith("SUMMARY")) current.SUMMARY = valueFor(line);
    if (line.startsWith("DTSTART")) current.DTSTART = valueFor(line);
    if (line.startsWith("DTEND")) current.DTEND = valueFor(line);
  }

  return events;
}

export async function syncIcalBlocks(input: {
  roomId: string;
  provider: string;
  icalUrl?: string | null;
  icalText?: string | null;
  syncPolicy?: "import_only" | "two_way_later";
}) {
  if (!input.icalUrl && !input.icalText) {
    throw new Error("iCal URL or iCal text is required.");
  }

  const text: string =
    input.icalText ||
    (await fetch(input.icalUrl!, { next: { revalidate: 0 } }).then((response) => {
      if (!response.ok) throw new Error(`iCal fetch failed: ${response.status}`);
      return response.text();
    }));
  const events = parseIcalEvents(text);
  const supabase = createAdminClient();
  const { data: source, error: sourceError } = await supabase
    .from("calendar_sync_sources")
    .upsert(
      {
        room_id: input.roomId,
        provider: input.provider,
        ical_url: input.icalUrl ?? null,
        sync_policy: input.syncPolicy ?? "import_only",
        status: "active",
        last_error: null,
        last_synced_at: new Date().toISOString()
      },
      { onConflict: "room_id,provider" }
    )
    .select()
    .single();

  if (sourceError) throw sourceError;

  await supabase.from("room_blocks").delete().eq("external_source_id", source.id);

  if (events.length > 0) {
    const { error: eventError } = await supabase.from("calendar_sync_events").upsert(
      events.map((event) => ({
        source_id: source.id,
        room_id: input.roomId,
        external_uid: event.uid,
        summary: event.summary,
        check_in: event.checkIn,
        check_out: event.checkOut,
        status: "blocked" as const
      })),
      { onConflict: "source_id,external_uid" }
    );

    if (eventError) throw eventError;

    const { data: blocks, error: blockError } = await supabase
      .from("room_blocks")
      .insert(
        events.map((event) => ({
          room_id: input.roomId,
          check_in: event.checkIn,
          check_out: event.checkOut,
          reason: event.summary ? `${input.provider}: ${event.summary}` : `${input.provider}: external booking`,
          external_source_id: source.id,
          external_uid: event.uid,
          source_channel: input.provider
        }))
      )
      .select();

    if (blockError) throw blockError;

    return { source, eventCount: events.length, blockCount: blocks?.length ?? 0, events };
  }

  return { source, eventCount: 0, blockCount: 0, events };
}
