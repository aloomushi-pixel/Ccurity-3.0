"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/* ── Contracts ─────────────────────────────────── */

export async function createContractAction(formData: FormData) {
    const supabase = await createClient();

    const userId = formData.get("clientId") as string; // form uses clientId, DB uses userId
    const contractTypeId = (formData.get("contractTypeId") as string) || null;
    const counterpartRole = (formData.get("counterpartRole") as string) || "CLIENT";
    const title = formData.get("title") as string;
    const description = (formData.get("description") as string) || null;
    const startDate = formData.get("startDate") as string;
    const endDate = (formData.get("endDate") as string) || null;

    const { error } = await supabase.from("contracts").insert({
        userId,
        contractTypeId,
        counterpartRole,
        title,
        description,
        startDate,
        endDate,
    });

    if (error) throw error;
    revalidatePath("/admin/finanzas");
}

export async function updateContractStatusAction(formData: FormData) {
    const supabase = await createClient();
    const id = formData.get("id") as string;
    const status = formData.get("status") as string;

    // If sending for signature, generate tokens
    if (status === "PENDING_SIGNATURE") {
        // Get the contract to know the userId and counterpartRole
        const { data: contract } = await supabase
            .from("contracts")
            .select("userId, counterpartRole")
            .eq("id", id)
            .single();

        if (!contract) throw new Error("Contract not found");

        // Get admin user (the company side)
        const { data: adminUsers } = await supabase
            .from("users")
            .select("id")
            .eq("role", "ADMIN")
            .limit(1);

        const adminId = adminUsers?.[0]?.id;

        // Generate two unique tokens
        const crypto = await import("crypto");
        const clientToken = crypto.randomBytes(16).toString("hex");
        const providerToken = crypto.randomBytes(16).toString("hex");

        // Determine who is CLIENT and who is PROVIDER
        // If counterpartRole is CLIENT: contract.userId is the client, admin is provider
        // If counterpartRole is PROVIDER: contract.userId is the provider (collaborator), admin is client
        const isClientContract = contract.counterpartRole === "CLIENT";

        const tokens = [
            {
                contractId: id,
                token: clientToken,
                role: "CLIENT",
                userId: isClientContract ? contract.userId : (adminId ?? contract.userId),
            },
            {
                contractId: id,
                token: providerToken,
                role: "PROVIDER",
                userId: isClientContract ? (adminId ?? contract.userId) : contract.userId,
            },
        ];

        const { error: tokenErr } = await supabase.from("contract_tokens").insert(tokens);
        if (tokenErr) throw tokenErr;

        // Log the SEND action
        await supabase.from("contract_history").insert({
            contractId: id,
            action: "SEND",
            metadata: { clientToken, providerToken },
        });
    }

    const { error } = await supabase
        .from("contracts")
        .update({ status, updatedAt: new Date().toISOString() })
        .eq("id", id);

    if (error) throw error;
    revalidatePath("/admin/finanzas");
    revalidatePath(`/admin/finanzas/${id}`);
}

export async function deleteContractAction(formData: FormData) {
    const supabase = await createClient();
    const id = formData.get("id") as string;

    const { error } = await supabase.from("contracts").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/admin/finanzas");
}

/* ── Payments ──────────────────────────────────── */

export async function registerPaymentAction(formData: FormData) {
    const supabase = await createClient();

    const invoiceId = formData.get("invoiceId") as string;
    const amount = parseFloat(formData.get("amount") as string) || 0;
    const method = formData.get("method") as string;
    const reference = (formData.get("reference") as string) || null;

    const { error } = await supabase.from("payments").insert({
        invoiceId,
        amount,
        method,
        reference,
    });

    if (error) throw error;

    // Get the invoice to find the contract context for revalidation
    const contractId = formData.get("contractId") as string;
    if (contractId) {
        revalidatePath(`/admin/finanzas/${contractId}`);
    }
    revalidatePath("/admin/finanzas");
}

/* ── Invoices ──────────────────────────────────── */

export async function createInvoiceAction(formData: FormData) {
    const supabase = await createClient();

    const serviceId = (formData.get("serviceId") as string) || null;
    const userId = (formData.get("userId") as string) || null;
    const subtotal = parseFloat(formData.get("subtotal") as string) || 0;
    const tax = parseFloat(formData.get("tax") as string) || 0;
    const total = subtotal + tax;
    const dueDate = formData.get("dueDate") as string;

    // Auto-generate invoice number: FAC-YYYY-NNN
    const year = new Date().getFullYear();
    const { count } = await supabase
        .from("invoices")
        .select("id", { count: "exact", head: true });

    const number = `FAC-${year}-${String((count ?? 0) + 1).padStart(3, "0")}`;

    const { error } = await supabase.from("invoices").insert({
        serviceId,
        userId,
        number,
        subtotal,
        tax,
        total,
        dueDate,
    });

    if (error) throw error;

    const contractId = formData.get("contractId") as string;
    if (contractId) {
        revalidatePath(`/admin/finanzas/${contractId}`);
    }
    revalidatePath("/admin/finanzas");
}
