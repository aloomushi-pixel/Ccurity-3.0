import { createClient } from "@/lib/supabase/server";

/* ── Types ────────────────────────────────────────── */

export type Quotation = {
    id: string;
    clientId: string;
    title: string;
    status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED";
    validUntil: string | null;
    subtotal: number;
    tax: number;
    total: number;
    notes: string | null;
    version: number;
    parent_id: string | null;
    folio: string | null;
    serviceTypeId: string | null;
    templateId: string | null;
    publishedToken: string | null;
    publishedAt: string | null;
    termsContent: string | null;
    privacyNotice: string | null;
    /* Stripe */
    stripeProductId: string | null;
    stripePriceId: string | null;
    stripePaymentLinkId: string | null;
    stripePaymentLinkUrl: string | null;
    stripePaymentIntentId: string | null;
    paymentStatus: "pending" | "paid" | "failed" | "refunded" | null;
    createdAt: string;
    updatedAt: string;
};

export type QuotationTab = {
    id: string;
    quotationId: string;
    section: "equipos" | "materiales" | "mano_de_obra";
    label: string;
    position: number;
    createdAt: string;
};

export type QuotationTabLink = {
    id: string;
    quotationId: string;
    sourceTabId: string;
    targetTabId: string;
    createdAt: string;
};

export type QuotationItem = {
    id: string;
    quotationId: string;
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
    customPrice: number | null;
    concept?: { title: string; format: string | null; category: string | null } | null;
};

export type QuotationWithClient = Quotation & {
    client?: { name: string; email: string } | null;
    serviceType?: { id: string; name: string; color: string | null } | null;
};

export type QuotationFull = Quotation & {
    client?: { name: string; email: string; phone?: string; address?: string } | null;
    serviceType?: { id: string; name: string; color: string | null; termsContent?: string | null } | null;
    quotation_items: QuotationItem[];
    quotation_tabs: QuotationTab[];
    quotation_tab_links: QuotationTabLink[];
    template?: QuotationTemplate | null;
};

export type QuotationTemplate = {
    id: string;
    name: string;
    theme: "light" | "dark";
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        bg: string;
        text: string;
        surface?: string;
        border?: string;
    };
    font_family: string;
    logo_url: string | null;
    header_config: Record<string, unknown>;
    footer_config: Record<string, unknown>;
    css_overrides: Record<string, unknown>;
    is_default: boolean;
    createdAt: string;
};

export type CompanySettings = {
    id: string;
    name: string;
    legal_name: string | null;
    rfc: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    logo_url: string | null;
    website: string | null;
    privacy_notice: string | null;
    default_terms: string | null;
    createdAt: string;
    updatedAt: string;
};

/* ── Quotation Queries ─────────────────────────────── */

export async function getQuotations(): Promise<QuotationWithClient[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("quotations")
        .select(`*, client:users!quotations_clientId_fkey(name, email), serviceType:service_types(id, name, color)`)
        .order("createdAt", { ascending: false });

    if (error) throw error;
    return (data as unknown as QuotationWithClient[]) || [];
}

export async function getQuotationById(id: string): Promise<QuotationFull | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("quotations")
        .select(
            `*, 
             client:users!quotations_clientId_fkey(name, email, phone, address),
             serviceType:service_types(id, name, color, "termsContent"),
             quotation_items(*, concept:concepts(title, format, category)),
             quotation_tabs(*),
             quotation_tab_links(*),
             template:quotation_templates(*)`
        )
        .eq("id", id)
        .single();

    if (error) return null;
    return data as unknown as QuotationFull;
}

export async function getQuotationByToken(token: string): Promise<QuotationFull | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("quotations")
        .select(
            `*, 
             client:users!quotations_clientId_fkey(name, email, phone, address),
             serviceType:service_types(id, name, color, "termsContent"),
             quotation_items(*, concept:concepts(title, format, category)),
             quotation_tabs(*),
             quotation_tab_links(*),
             template:quotation_templates(*)`
        )
        .eq("publishedToken", token)
        .not("publishedAt", "is", null)
        .single();

    if (error) return null;
    return data as unknown as QuotationFull;
}

export async function getQuotationVersions(parentId: string): Promise<Quotation[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("quotations")
        .select("*")
        .or(`id.eq.${parentId},parent_id.eq.${parentId}`)
        .order("version", { ascending: true });

    if (error) return [];
    return (data as Quotation[]) || [];
}

export async function getQuotationStats() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("quotations")
        .select("status, total");

    if (error) return { total: 0, draft: 0, sent: 0, accepted: 0, totalValue: 0, published: 0 };

    const quotations = data || [];

    // Count published
    const { count: publishedCount } = await supabase
        .from("quotations")
        .select("id", { count: "exact", head: true })
        .not("publishedToken", "is", null);

    return {
        total: quotations.length,
        draft: quotations.filter((q) => q.status === "DRAFT").length,
        sent: quotations.filter((q) => q.status === "SENT").length,
        accepted: quotations.filter((q) => q.status === "ACCEPTED").length,
        totalValue: quotations
            .filter((q) => q.status === "ACCEPTED")
            .reduce((sum, q) => sum + Number(q.total), 0),
        published: publishedCount || 0,
    };
}

/* ── Templates ───────────────────────────────────── */

export async function getQuotationTemplates(): Promise<QuotationTemplate[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("quotation_templates")
        .select("*")
        .order("createdAt", { ascending: true });

    if (error) return [];
    return (data as QuotationTemplate[]) || [];
}

export async function getQuotationTemplateById(id: string): Promise<QuotationTemplate | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("quotation_templates")
        .select("*")
        .eq("id", id)
        .single();

    if (error) return null;
    return data as QuotationTemplate;
}

/* ── Company Settings ──────────────────────────────── */

export async function getCompanySettings(): Promise<CompanySettings | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("company_settings")
        .select("*")
        .limit(1)
        .single();

    if (error) return null;
    return data as CompanySettings;
}
