// src/app/api/webhook/route.ts
// Paystack calls this URL directly to confirm payments server-to-server.
// Set it in: Paystack Dashboard → Settings → API Keys & Webhooks
// URL: https://your-domain.com/api/webhook

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY ?? "";
  const body = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";

  // Verify the request is genuinely from Paystack
  const hash = crypto
    .createHmac("sha512", secretKey)
    .update(body)
    .digest("hex");

  if (hash !== signature) {
    console.warn("⚠️ Webhook: invalid signature — ignoring");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body);
  console.log("📬 Webhook event:", event.event);

  if (event.event === "charge.success") {
    const { reference, amount, customer } = event.data;
    console.log(`💰 Charge success: ${reference} — GHS ${amount / 100} from ${customer.email}`);

    // 👉 Save to database here
    // await db.donations.upsert({ reference, amount: amount / 100, email: customer.email, status: 'confirmed' })
  }

  return NextResponse.json({ received: true });
}
