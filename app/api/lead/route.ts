import { NextResponse } from "next/server";

/**
 * Lead intake. Forwards to LEAD_WEBHOOK_URL (CRM / Zapier / sheet) when configured,
 * otherwise logs and returns ok so the flow can be tested locally.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const phone = String(body.phone ?? "").replace(/\D/g, "");
  if (String(body.name ?? "").trim().length < 2 || phone.length !== 10 || body.consent !== true) {
    return NextResponse.json({ ok: false, error: "Missing name, phone or consent" }, { status: 422 });
  }

  const lead: Record<string, unknown> = { ...body, phone, receivedAt: new Date().toISOString() };
  const hook = process.env.LEAD_WEBHOOK_URL;

  if (hook) {
    const res = await fetch(hook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
    });
    if (!res.ok) return NextResponse.json({ ok: false, error: "Upstream failed" }, { status: 502 });
  } else {
    console.info("[lead] (no LEAD_WEBHOOK_URL set)", lead.intent ?? "visit", lead.source ?? "");
  }

  return NextResponse.json({ ok: true });
}
