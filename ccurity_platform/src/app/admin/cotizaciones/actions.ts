"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/* ═══════════════════════════════════════════════════
   CREATE QUOTATION (with tabs, items, links)
   ═══════════════════════════════════════════════════ */
export async function createQuotationAction(formData: FormData) {
    const supabase = await createClient();

    const title = formData.get("title") as string;
    const clientId = formData.get("clientId") as string;
    const serviceTypeId = (formData.get("serviceTypeId") as string) || null;
    const templateId = (formData.get("templateId") as string) || null;
    const notes = (formData.get("notes") as string) || null;
    const validDays = parseInt(formData.get("validDays") as string) || 30;
    const termsContent = (formData.get("termsContent") as string) || null;
    const privacyNotice = (formData.get("privacyNotice") as string) || null;
    const paymentType = (formData.get("paymentType") as string) || "one_time";
    const subtotal = parseFloat(formData.get("subtotal") as string) || 0;
    const tax = parseFloat(formData.get("tax") as string) || 0;
    const total = parseFloat(formData.get("total") as string) || 0;

    // Parse tabs, items, links
    type TabPayload = { section: string; label: string; tempId: string; position: number };
    type ItemPayload = {
        tempTabId: string;
        section: string;
        conceptId: string | null;
        quantity: number;
        unitPrice: number;
        isCustom: boolean;
        customTitle: string | null;
        customDescription: string | null;
        customFormat: string | null;
    };
    type LinkPayload = { sourceTempId: string; targetTempId: string };

    let tabs: TabPayload[] = [];
    let items: ItemPayload[] = [];
    let links: LinkPayload[] = [];

    try {
        tabs = JSON.parse(formData.get("tabs") as string);
        items = JSON.parse(formData.get("items") as string);
        links = JSON.parse(formData.get("links") as string);
    } catch {
        /* keep defaults */
    }

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validDays);

    // 1. Create quotation
    const { data: quotation, error: qError } = await supabase
        .from("quotations")
        .insert({
            clientId,
            title,
            status: "DRAFT",
            subtotal,
            tax,
            total,
            notes,
            validUntil: validUntil.toISOString(),
            serviceTypeId: serviceTypeId || null,
            templateId: templateId || null,
            termsContent,
            privacyNotice,
            paymentType,
        })
        .select("id")
        .single();

    if (qError) throw qError;
    const quotationId = quotation.id;

    // 2. Create tabs + build tempId→realId map
    const tempToReal: Record<string, string> = {};

    if (tabs.length > 0) {
        const tabInserts = tabs.map((t) => ({
            quotationId,
            section: t.section,
            label: t.label,
            position: t.position,
        }));

        const { data: createdTabs, error: tError } = await supabase
            .from("quotation_tabs")
            .insert(tabInserts)
            .select("id");

        if (tError) throw tError;

        // Map by insertion order (same as tabs array)
        if (createdTabs) {
            tabs.forEach((t, i) => {
                tempToReal[t.tempId] = createdTabs[i].id;
            });
        }
    }

    // 3. Create items
    if (items.length > 0) {
        const itemInserts = items.map((item) => ({
            quotationId,
            conceptId: item.isCustom ? null : item.conceptId,
            tabId: tempToReal[item.tempTabId] || null,
            section: item.section,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
            isCustom: item.isCustom,
            customTitle: item.customTitle,
            customDescription: item.customDescription,
            customFormat: item.customFormat,
        }));

        const { error: iError } = await supabase
            .from("quotation_items")
            .insert(itemInserts);

        if (iError) throw iError;
    }

    // 4. Create tab links
    if (links.length > 0) {
        const linkInserts = links
            .filter((l) => tempToReal[l.sourceTempId] && tempToReal[l.targetTempId])
            .map((l) => ({
                quotationId,
                sourceTabId: tempToReal[l.sourceTempId],
                targetTabId: tempToReal[l.targetTempId],
            }));

        if (linkInserts.length > 0) {
            const { error: lError } = await supabase
                .from("quotation_tab_links")
                .insert(linkInserts);

            if (lError) throw lError;
        }
    }

    revalidatePath("/admin/cotizaciones");
    redirect("/admin/cotizaciones");
}

/* ═══════════════════════════════════════════════════
   UPDATE STATUS
   ═══════════════════════════════════════════════════ */
export async function updateQuotationStatusAction(formData: FormData) {
    const supabase = await createClient();
    const id = formData.get("id") as string;
    const status = formData.get("status") as string;

    const { error } = await supabase
        .from("quotations")
        .update({ status })
        .eq("id", id);

    if (error) throw error;
    revalidatePath("/admin/cotizaciones");
}

/* ═══════════════════════════════════════════════════
   PUBLISH / UNPUBLISH (with Stripe payment link)
   ═══════════════════════════════════════════════════ */
export async function publishQuotationAction(id: string) {
    const supabase = await createClient();

    // 1. Fetch quotation with items to calculate total
    const { data: quotation, error: qErr } = await supabase
        .from("quotations")
        .select("*, quotation_items(*)")
        .eq("id", id)
        .single();

    if (qErr || !quotation) throw qErr || new Error("Cotización no encontrada");

    // 2. Calculate total (subtotal + 16% IVA)
    const subtotal = (quotation.quotation_items || []).reduce(
        (sum: number, item: { quantity: number; unit_price: number }) =>
            sum + item.quantity * item.unit_price,
        0
    );
    const iva = subtotal * 0.16;
    const total = subtotal + iva;
    const totalCents = Math.round(total * 100); // MXN cents

    // 3. Publish token
    const token = crypto.randomUUID();
    const { error: pubErr } = await supabase
        .from("quotations")
        .update({
            publishedToken: token,
            publishedAt: new Date().toISOString(),
        })
        .eq("id", id);

    if (pubErr) throw pubErr;

    // 4. Generate Stripe payment link if total > 0
    if (totalCents > 0) {
        try {
            const { generateStripePaymentLink } = await import(
                "@/lib/stripe/payments"
            );
            const baseUrl =
                process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
            const redirectUrl = `${baseUrl}/cotizacion/${token}?paid=1`;

            await generateStripePaymentLink(
                id,
                quotation.title || `COT-${id.slice(0, 6)}`,
                totalCents,
                redirectUrl,
                (quotation.paymentType as "one_time" | "recurring") || "one_time"
            );
        } catch (stripeErr) {
            // Don't block publishing if Stripe fails — log and continue
            console.error("Stripe payment link generation failed:", stripeErr);
        }
    }

    revalidatePath("/admin/cotizaciones");
}

export async function unpublishQuotationAction(id: string) {
    const supabase = await createClient();

    // 1. Fetch current Stripe IDs before clearing
    const { data: quotation } = await supabase
        .from("quotations")
        .select("stripePaymentLinkId, stripeProductId")
        .eq("id", id)
        .single();

    // 2. Deactivate in Stripe (payment link + product)
    if (quotation?.stripePaymentLinkId || quotation?.stripeProductId) {
        try {
            const { deactivateStripeQuotation } = await import(
                "@/lib/stripe/payments"
            );
            await deactivateStripeQuotation(
                quotation.stripePaymentLinkId,
                quotation.stripeProductId
            );
        } catch (stripeErr) {
            console.error("Stripe deactivation failed:", stripeErr);
        }
    }

    // 3. Clear all publish + Stripe data
    const { error } = await supabase
        .from("quotations")
        .update({
            publishedToken: null,
            publishedAt: null,
            stripePaymentLinkUrl: null,
            stripePaymentLinkId: null,
            stripeProductId: null,
            stripePriceId: null,
            paymentStatus: null,
        })
        .eq("id", id);

    if (error) throw error;
    revalidatePath("/admin/cotizaciones");
}

/* ═══════════════════════════════════════════════════
   DUPLICATE (with tabs and links)
   ═══════════════════════════════════════════════════ */
export async function duplicateQuotationAction(formData: FormData) {
    const supabase = await createClient();
    const sourceId = formData.get("id") as string;

    // Fetch original with tabs, items, links
    const { data: source, error: sErr } = await supabase
        .from("quotations")
        .select("*, quotation_items(*), quotation_tabs(*), quotation_tab_links(*)")
        .eq("id", sourceId)
        .single();

    if (sErr || !source) throw sErr || new Error("Cotización no encontrada");

    // Determine version
    const rootId = source.parent_id || source.id;
    const { data: versions } = await supabase
        .from("quotations")
        .select("version")
        .or(`id.eq.${rootId},parent_id.eq.${rootId}`)
        .order("version", { ascending: false })
        .limit(1);

    const nextVersion = (versions?.[0]?.version || source.version) + 1;
    const folio = `COT-${rootId.slice(0, 6).toUpperCase()}-V${nextVersion}`;

    // Create new quotation
    const { data: newQ, error: nErr } = await supabase
        .from("quotations")
        .insert({
            clientId: source.clientId,
            title: source.title,
            status: "DRAFT",
            subtotal: source.subtotal,
            tax: source.tax,
            total: source.total,
            notes: source.notes,
            validUntil: source.validUntil,
            version: nextVersion,
            parent_id: rootId,
            folio,
            serviceTypeId: source.serviceTypeId,
            templateId: source.templateId,
            termsContent: source.termsContent,
            privacyNotice: source.privacyNotice,
        })
        .select("id")
        .single();

    if (nErr) throw nErr;

    // Copy tabs + build ID map
    const sourceTabs = source.quotation_tabs || [];
    const oldToNewTabId: Record<string, string> = {};

    if (sourceTabs.length > 0 && newQ) {
        const tabInserts = sourceTabs.map(
            (t: { section: string; label: string; position: number }) => ({
                quotationId: newQ.id,
                section: t.section,
                label: t.label,
                position: t.position,
            })
        );
        const { data: newTabs } = await supabase
            .from("quotation_tabs")
            .insert(tabInserts)
            .select("id");

        if (newTabs) {
            sourceTabs.forEach((t: { id: string }, i: number) => {
                oldToNewTabId[t.id] = newTabs[i].id;
            });
        }
    }

    // Copy items
    const sourceItems = source.quotation_items || [];
    if (sourceItems.length > 0 && newQ) {
        const newItems = sourceItems.map(
            (item: {
                conceptId: string | null;
                tabId: string | null;
                section: string | null;
                quantity: number;
                unitPrice: number;
                total: number;
                notes: string | null;
                isCustom: boolean;
                customTitle: string | null;
                customDescription: string | null;
                customFormat: string | null;
            }) => ({
                quotationId: newQ.id,
                conceptId: item.conceptId,
                tabId: item.tabId ? oldToNewTabId[item.tabId] || null : null,
                section: item.section,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.total,
                notes: item.notes,
                isCustom: item.isCustom,
                customTitle: item.customTitle,
                customDescription: item.customDescription,
                customFormat: item.customFormat,
            })
        );

        await supabase.from("quotation_items").insert(newItems);
    }

    // Copy tab links
    const sourceLinks = source.quotation_tab_links || [];
    if (sourceLinks.length > 0 && newQ) {
        const newLinks = sourceLinks
            .filter(
                (l: { sourceTabId: string; targetTabId: string }) =>
                    oldToNewTabId[l.sourceTabId] && oldToNewTabId[l.targetTabId]
            )
            .map((l: { sourceTabId: string; targetTabId: string }) => ({
                quotationId: newQ.id,
                sourceTabId: oldToNewTabId[l.sourceTabId],
                targetTabId: oldToNewTabId[l.targetTabId],
            }));

        if (newLinks.length > 0) {
            await supabase.from("quotation_tab_links").insert(newLinks);
        }
    }

    revalidatePath("/admin/cotizaciones");
}

/* ═══════════════════════════════════════════════════
   INLINE CLIENT CREATION (from quotation builder)
   ═══════════════════════════════════════════════════ */
export async function createInlineClientAction(
    name: string,
    email: string,
    phone?: string
): Promise<{ id: string; name: string; email: string }> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("users")
        .insert({
            name,
            email,
            phone: phone || null,
            role: "CLIENT",
        })
        .select("id, name, email")
        .single();

    if (error) throw error;
    return data;
}
