// src/app/api/verify-payment/route.ts
// This runs SERVER-SIDE only. Your secret key never reaches the browser.

import { NextRequest, NextResponse } from "next/server";
import type { VerifyResponse } from "@/lib/paystack";

export async function POST(req: NextRequest) {
  const { reference } = await req.json();

  if (!reference) {
    return NextResponse.json(
      { success: false, message: "No payment reference provided." },
      { status: 400 }
    );
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey || secretKey.includes("xxxxxxx")) {
    console.error("❌ PAYSTACK_SECRET_KEY not set in .env.local");
    return NextResponse.json(
      { success: false, message: "Payment verification not configured." },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    const json = await res.json();
    const data = json.data;

    if (data?.status === "success") {
      console.log(`✅ Verified: ${reference} — GHS ${data.amount / 100} from ${data.customer.email}`);

      // 👉 Add your database save here, e.g.:
      // await db.donations.create({ reference, amount: data.amount / 100, email: data.customer.email })

      const result: VerifyResponse = {
        success: true,
        amount: data.amount / 100,
        currency: data.currency,
        email: data.customer.email,
        reference: data.reference,
        paidAt: data.paid_at,
      };
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { success: false, message: `Payment status: ${data?.status ?? "unknown"}` },
      { status: 400 }
    );
  } catch (err) {
    console.error("Paystack verify error:", err);
    return NextResponse.json(
      { success: false, message: "Verification request failed." },
      { status: 500 }
    );
  }
}
