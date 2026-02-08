import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Stripe Webhook Endpoint
 * POST /api/stripe/webhook
 *
 * Handles Stripe events to update quotation payment status.
 * Configure in Stripe Dashboard → Developers → Webhooks:
 *   URL: https://yourdomain.com/api/stripe/webhook
 *   Events: checkout.session.completed, payment_intent.succeeded, payment_intent.payment_failed
 */

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    // Verify webhook signature if secret is configured
    if (STRIPE_WEBHOOK_SECRET && sig) {
        const crypto = await import("crypto");
        const signedPayload = sig
            .split(",")
            .reduce(
                (acc, part) => {
                    const [key, value] = part.split("=");
                    if (key === "t") acc.timestamp = value;
                    if (key === "v1") acc.signature = value;
                    return acc;
                },
                { timestamp: "", signature: "" }
            );

        const expectedSignature = crypto
            .createHmac("sha256", STRIPE_WEBHOOK_SECRET)
            .update(`${signedPayload.timestamp}.${body}`)
            .digest("hex");

        if (expectedSignature !== signedPayload.signature) {
            console.error("Stripe webhook signature verification failed");
            return NextResponse.json(
                { error: "Invalid signature" },
                { status: 400 }
            );
        }
    }

    let event;
    try {
        event = JSON.parse(body);
    } catch {
        return NextResponse.json(
            { error: "Invalid JSON" },
            { status: 400 }
        );
    }

    const supabase = await createClient();

    switch (event.type) {
        case "checkout.session.completed": {
            // Payment successful via payment link
            const session = event.data.object;
            const paymentLinkId = session.payment_link;
            const paymentIntentId = session.payment_intent;

            if (paymentLinkId) {
                const { error } = await supabase
                    .from("quotations")
                    .update({
                        paymentStatus: "paid",
                        stripePaymentIntentId: paymentIntentId,
                    })
                    .eq("stripePaymentLinkId", paymentLinkId);

                if (error) {
                    console.error("Failed to update quotation payment status:", error);
                }
            }
            break;
        }

        case "payment_intent.succeeded": {
            const pi = event.data.object;
            const { error } = await supabase
                .from("quotations")
                .update({ paymentStatus: "paid" })
                .eq("stripePaymentIntentId", pi.id);

            if (error) {
                console.error("Failed to update PI succeeded:", error);
            }
            break;
        }

        case "payment_intent.payment_failed": {
            const pi = event.data.object;
            const { error } = await supabase
                .from("quotations")
                .update({ paymentStatus: "failed" })
                .eq("stripePaymentIntentId", pi.id);

            if (error) {
                console.error("Failed to update PI failed:", error);
            }
            break;
        }

        case "charge.refunded": {
            const charge = event.data.object;
            const paymentIntentId = charge.payment_intent;
            if (paymentIntentId) {
                const { error } = await supabase
                    .from("quotations")
                    .update({ paymentStatus: "refunded" })
                    .eq("stripePaymentIntentId", paymentIntentId);

                if (error) {
                    console.error("Failed to update refund status:", error);
                }
            }
            break;
        }

        default:
            // Unhandled event type, ignore
            break;
    }

    return NextResponse.json({ received: true });
}
