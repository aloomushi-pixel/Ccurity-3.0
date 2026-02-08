"use server";

/**
 * Stripe ↔ Ccurity Integration
 * 
 * Creates Stripe products, prices, and payment links for published quotations.
 * Uses MCP-bridged Stripe API for all Stripe operations.
 */

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/* ══════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════ */

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded" | null;

export type QuotationPaymentInfo = {
    id: string;
    title: string;
    total: number;
    paymentStatus: PaymentStatus;
    stripePaymentLinkUrl: string | null;
    stripePaymentIntentId: string | null;
    stripeProductId: string | null;
    stripePriceId: string | null;
    stripePaymentLinkId: string | null;
    publishedToken: string | null;
};

/* ══════════════════════════════════════════════════════════
   GENERATE PAYMENT LINK (called after publishing)
   ══════════════════════════════════════════════════════════ */

/**
 * Creates a Stripe product + price + payment link for a quotation.
 * Stores all Stripe IDs back in the quotation row.
 *
 * @param quotationId - UUID of the quotation
 * @param title - Quotation title (used as Stripe product name)
 * @param totalCents - Total amount in centavos (MXN cents)
 * @param redirectUrl - URL to redirect after payment (published quotation URL)
 */
export async function generateStripePaymentLink(
    quotationId: string,
    title: string,
    totalCents: number,
    redirectUrl?: string,
    paymentType: "one_time" | "recurring" = "one_time"
): Promise<{
    paymentLinkUrl: string;
    productId: string;
    priceId: string;
    paymentLinkId: string;
}> {
    const isRecurring = paymentType === "recurring";

    // 1. Create a Stripe product for this quotation
    const productRes = await stripeCreateProduct(
        `${isRecurring ? "Póliza" : "Cotización"}: ${title}`,
        `${isRecurring ? "Pago mensual — " : "Pago de cotización — "}${title}`
    );

    // 2. Create price (one-time or recurring)
    const priceRes = await stripeCreatePrice(
        productRes.id,
        totalCents,
        "mxn",
        isRecurring ? "month" : undefined
    );

    // 3. Create a payment link (payment or subscription mode)
    const linkRes = await stripeCreatePaymentLink(
        priceRes.id,
        1,
        redirectUrl,
        isRecurring ? "subscription" : "payment"
    );

    // 4. Store Stripe IDs in the quotation row
    const supabase = await createClient();
    const { error } = await supabase
        .from("quotations")
        .update({
            stripeProductId: productRes.id,
            stripePriceId: priceRes.id,
            stripePaymentLinkId: linkRes.id,
            stripePaymentLinkUrl: linkRes.url,
            paymentStatus: "pending",
        })
        .eq("id", quotationId);

    if (error) throw error;

    revalidatePath("/admin/cotizaciones");

    return {
        paymentLinkUrl: linkRes.url,
        productId: productRes.id,
        priceId: priceRes.id,
        paymentLinkId: linkRes.id,
    };
}

/* ══════════════════════════════════════════════════════════
   UPDATE PAYMENT STATUS (called by webhook or manually)
   ══════════════════════════════════════════════════════════ */

export async function updatePaymentStatus(
    quotationId: string,
    status: PaymentStatus,
    paymentIntentId?: string
) {
    const supabase = await createClient();
    const update: Record<string, unknown> = { paymentStatus: status };
    if (paymentIntentId) update.stripePaymentIntentId = paymentIntentId;

    const { error } = await supabase
        .from("quotations")
        .update(update)
        .eq("id", quotationId);

    if (error) throw error;
    revalidatePath("/admin/cotizaciones");
}

/* ══════════════════════════════════════════════════════════
   MARK AS PAID (admin action)
   ══════════════════════════════════════════════════════════ */

export async function markQuotationPaidAction(quotationId: string) {
    await updatePaymentStatus(quotationId, "paid");
}

/* ══════════════════════════════════════════════════════════
   STRIPE API BRIDGE (server-only)
   These functions call the Stripe API via fetch.
   In production you'd use the Stripe SDK; here we use 
   the REST API with the API key from env.
   ══════════════════════════════════════════════════════════ */

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;
const STRIPE_API = "https://api.stripe.com/v1";

async function stripeRequest(
    endpoint: string,
    body: Record<string, string>
): Promise<Record<string, unknown>> {
    const params = new URLSearchParams(body);
    const res = await fetch(`${STRIPE_API}${endpoint}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(
            `Stripe ${endpoint} error: ${JSON.stringify(err)}`
        );
    }
    return res.json();
}

async function stripeCreateProduct(
    name: string,
    description: string
): Promise<{ id: string }> {
    const data = await stripeRequest("/products", {
        name,
        description,
    });
    return { id: data.id as string };
}

async function stripeCreatePrice(
    productId: string,
    unitAmount: number,
    currency: string,
    recurringInterval?: "month" | "year"
): Promise<{ id: string }> {
    const body: Record<string, string> = {
        product: productId,
        unit_amount: unitAmount.toString(),
        currency,
    };
    if (recurringInterval) {
        body["recurring[interval]"] = recurringInterval;
    }
    const data = await stripeRequest("/prices", body);
    return { id: data.id as string };
}

async function stripeCreatePaymentLink(
    priceId: string,
    quantity: number,
    redirectUrl?: string,
    mode?: "payment" | "subscription"
): Promise<{ id: string; url: string }> {
    const body: Record<string, string> = {
        "line_items[0][price]": priceId,
        "line_items[0][quantity]": quantity.toString(),
    };
    if (redirectUrl) {
        body["after_completion[type]"] = "redirect";
        body["after_completion[redirect][url]"] = redirectUrl;
    }
    // Payment links auto-detect mode from price type, but we can be explicit
    // Note: Stripe payment links don't have a 'mode' param — they infer from price
    const data = await stripeRequest("/payment_links", body);
    return { id: data.id as string, url: data.url as string };
}

/* ══════════════════════════════════════════════════════════
   DEACTIVATE (called when unpublishing)
   ══════════════════════════════════════════════════════════ */

/**
 * Deactivates Stripe entities when a quotation is unpublished.
 * - Payment link → set active=false (prevents new checkouts)
 * - Product → set active=false (archives it in Stripe dashboard)
 * Prices cannot be deactivated when attached to a payment link,
 * but deactivating the link is sufficient to block payments.
 */
export async function deactivateStripeQuotation(
    paymentLinkId: string | null,
    productId: string | null
) {
    const errors: string[] = [];

    // 1. Deactivate payment link
    if (paymentLinkId) {
        try {
            await stripeUpdate(`/payment_links/${paymentLinkId}`, {
                active: "false",
            });
        } catch (e) {
            errors.push(`Payment link: ${e}`);
        }
    }

    // 2. Archive product
    if (productId) {
        try {
            await stripeUpdate(`/products/${productId}`, {
                active: "false",
            });
        } catch (e) {
            errors.push(`Product: ${e}`);
        }
    }

    if (errors.length > 0) {
        console.error("Stripe deactivation warnings:", errors);
    }
}

/** Helper for Stripe POST updates (same as create but for existing resources) */
async function stripeUpdate(
    endpoint: string,
    body: Record<string, string>
): Promise<Record<string, unknown>> {
    const params = new URLSearchParams(body);
    const res = await fetch(`${STRIPE_API}${endpoint}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(
            `Stripe ${endpoint} error: ${JSON.stringify(err)}`
        );
    }
    return res.json();
}
