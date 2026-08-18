import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";

export type PilotChecklist = {
  youtubeLinkChecked: boolean;
  bookingFlowChecked: boolean;
  paymentChecked: boolean;
  notificationChecked: boolean;
  hostDashboardChecked: boolean;
  mobileChecked: boolean;
};

const requiredChecks: Array<keyof PilotChecklist> = [
  "youtubeLinkChecked",
  "bookingFlowChecked",
  "paymentChecked",
  "notificationChecked",
  "hostDashboardChecked",
  "mobileChecked"
];

export function getPilotReadiness(checklist: PilotChecklist) {
  const passed = requiredChecks.filter((key) => checklist[key]).length;

  return {
    passed,
    total: requiredChecks.length,
    ready: passed === requiredChecks.length,
    missing: requiredChecks.filter((key) => !checklist[key])
  };
}

export async function createPilotRun(input: {
  accommodationId: string;
  checklist: PilotChecklist;
}) {
  const readiness = getPilotReadiness(input.checklist);
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("pilot_runs")
    .insert({
      accommodation_id: input.accommodationId,
      status: readiness.ready ? "open" : "rehearsal",
      checklist: input.checklist as unknown as Json,
      opened_at: readiness.ready ? new Date().toISOString() : null
    })
    .select()
    .single();

  if (error) throw error;

  return { pilotRun: data, readiness };
}

export async function getLatestPilotRuns(limit = 10) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("pilot_runs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return data ?? [];
}
