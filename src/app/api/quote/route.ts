import { NextResponse } from "next/server";
import { z } from "zod";
import { getRoomQuote } from "@/lib/pricing";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ISODateString } from "@/lib/types";

const optionItemSchema = z.object({
  optionId: z.string().min(1),
  quantity: z.number().int().min(1).max(20).default(1)
});

const quoteSchema = z.object({
  roomId: z.string().min(1),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  adultCount: z.number().int().min(1).max(30).default(1),
  childCount: z.number().int().min(0).max(30).default(0),
  optionItems: z.array(optionItemSchema).default([]),
  optionIds: z.array(z.string().min(1)).optional(),
  utmCode: z.string().nullable().optional(),
  utmCampaign: z.string().nullable().optional()
});

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }

  return "Unknown quote error";
}

function normalizeQuoteBody(body: z.infer<typeof quoteSchema>) {
  return {
    ...body,
    optionItems:
      body.optionItems.length > 0
        ? body.optionItems
        : (body.optionIds ?? []).map((optionId) => ({ optionId, quantity: 1 }))
  };
}

async function calculateQuote(body: unknown) {
  const parsed = quoteSchema.safeParse(body);

  if (!parsed.success) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    };
  }

  try {
    const supabase = createAdminClient();
    const input = normalizeQuoteBody(parsed.data);
    const quote = await getRoomQuote(supabase, {
      ...input,
      checkIn: input.checkIn as ISODateString,
      checkOut: input.checkOut as ISODateString
    });

    return {
      ok: true as const,
      response: NextResponse.json({ quote })
    };
  } catch (error) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
    };
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const optionIds = url.searchParams.getAll("optionId");
  const result = await calculateQuote({
    roomId: url.searchParams.get("roomId"),
    checkIn: url.searchParams.get("checkIn"),
    checkOut: url.searchParams.get("checkOut"),
    adultCount: Number(url.searchParams.get("adultCount") ?? 1),
    childCount: Number(url.searchParams.get("childCount") ?? 0),
    optionIds,
    utmCode: url.searchParams.get("utmCode"),
    utmCampaign: url.searchParams.get("utmCampaign")
  });

  return result.response;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const result = await calculateQuote(body);

  return result.response;
}
