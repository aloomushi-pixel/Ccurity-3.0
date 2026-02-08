import { createClient } from "@/lib/supabase/server";

/* ── Types ─────────────────────────────────────── */

export type Contract = {
    id: string;
    userId: string;
    contractTypeId: string | null;
    counterpartRole: "CLIENT" | "PROVIDER";
    title: string;
    description: string | null;
    status: "DRAFT" | "PENDING_SIGNATURE" | "ACTIVE" | "COMPLETED" | "CANCELLED";
    startDate: string;
    endDate: string | null;
    fileUrl: string | null;
    signedUrl: string | null;
    createdAt: string;
    updatedAt: string;
    client?: { id: string; name: string; email: string };
    contractType?: { id: string; name: string; serviceType?: { id: string; name: string; color: string } };
};

export type Payment = {
    id: string;
    invoiceId: string;
    amount: number;
    method: string;
    reference: string | null;
    paidAt: string | null;
};

export type Invoice = {
    id: string;
    serviceId: string | null;
    userId: string | null;
    number: string;
    subtotal: number;
    tax: number;
    total: number;
    status: string;
    dueDate: string;
    paidDate: string | null;
    fileUrl: string | null;
    facturaPdfUrl: string | null;
    facturaXmlUrl: string | null;
    createdAt: string;
};

export type ContractFull = Contract & {
    payments: Payment[];
    invoices: Invoice[];
};

/* ── Queries ───────────────────────────────────── */

export async function getContracts(): Promise<Contract[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("contracts")
        .select(
            `*, client:users!contracts_userId_fkey(id, name, email), contractType:contract_types(id, name, serviceType:service_types(id, name, color))`
        )
        .order("createdAt", { ascending: false });

    if (error) throw error;
    return (data ?? []) as unknown as Contract[];
}

export async function getContractById(id: string): Promise<ContractFull | null> {
    const supabase = await createClient();

    const { data: contract, error } = await supabase
        .from("contracts")
        .select(
            `*, client:users!contracts_userId_fkey(id, name, email), contractType:contract_types(id, name, serviceType:service_types(id, name, color))`
        )
        .eq("id", id)
        .single();

    if (error || !contract) return null;

    // Payments are linked via invoices, not directly to contracts
    // For now, return empty arrays — the detail page can be revisited later
    const { data: invoices } = await supabase
        .from("invoices")
        .select("*")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .eq("userId", (contract as any).userId)
        .order("createdAt", { ascending: false });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const invoiceIds = (invoices ?? []).map((inv: any) => inv.id);

    let payments: Payment[] = [];
    if (invoiceIds.length > 0) {
        const { data: paymentData } = await supabase
            .from("payments")
            .select("*")
            .in("invoiceId", invoiceIds);
        payments = (paymentData ?? []) as unknown as Payment[];
    }

    return {
        ...(contract as unknown as Contract),
        payments,
        invoices: (invoices ?? []) as unknown as Invoice[],
    };
}

export async function getFinanceStats() {
    const supabase = await createClient();

    const { count: totalContracts } = await supabase
        .from("contracts")
        .select("id", { count: "exact", head: true });

    const { count: activeContracts } = await supabase
        .from("contracts")
        .select("id", { count: "exact", head: true })
        .eq("status", "active");

    // Revenue comes from payments (no status column, so all payments are confirmed)
    const { data: allPayments } = await supabase
        .from("payments")
        .select("amount");

    const totalRevenue = (allPayments ?? []).reduce(
        (sum, p) => sum + Number(p.amount),
        0
    );

    // Pending = invoices that are not paid
    const { data: pendingInvoices } = await supabase
        .from("invoices")
        .select("total")
        .neq("status", "paid");

    const pendingAmount = (pendingInvoices ?? []).reduce(
        (sum, inv) => sum + Number(inv.total),
        0
    );

    const { count: totalInvoices } = await supabase
        .from("invoices")
        .select("id", { count: "exact", head: true });

    return {
        totalContracts: totalContracts ?? 0,
        activeContracts: activeContracts ?? 0,
        totalRevenue,
        pendingAmount,
        totalInvoices: totalInvoices ?? 0,
    };
}
