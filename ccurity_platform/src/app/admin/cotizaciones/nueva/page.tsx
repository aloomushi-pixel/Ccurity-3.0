import Link from "next/link";
import { getActiveConceptsForQuotation } from "@/lib/data/concepts";
import { getQuotationTemplates, getCompanySettings } from "@/lib/data/quotations";
import { getServiceTypes } from "@/lib/data/services";
import { createClient } from "@/lib/supabase/server";
import { QuotationBuilder } from "../builder";
import { createQuotationAction } from "../actions";

export default async function NuevaQuotationPage() {
    const supabase = await createClient();

    // Parallel data fetches
    const [concepts, templates, companySettings, serviceTypes, clientsResult] = await Promise.all([
        getActiveConceptsForQuotation(),
        getQuotationTemplates(),
        getCompanySettings(),
        getServiceTypes(),
        supabase
            .from("users")
            .select("id, name, email")
            .eq("role", "CLIENT")
            .order("name"),
    ]);

    const clients = (clientsResult.data || []).map((c) => ({
        id: c.id,
        name: c.name || "Sin nombre",
        email: c.email || "",
    }));

    const conceptOptions = concepts.map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        category: c.category,
        format: c.format,
        price: c.price,
        brand: c.brand,
        model: c.model,
        sat_code: c.sat_code,
    }));

    const serviceTypeOptions = serviceTypes.map((st) => ({
        id: st.id,
        name: st.name,
        color: st.color,
        termsContent: (st as Record<string, unknown>).termsContent as string | null ?? null,
    }));

    const templateOptions = templates.map((t) => ({
        id: t.id,
        name: t.name,
        theme: t.theme,
    }));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/cotizaciones"
                        className="text-muted hover:text-foreground transition-colors text-sm"
                    >
                        ← Cotizaciones
                    </Link>
                    <h1 className="text-2xl font-bold gradient-text">Nueva Cotización</h1>
                </div>
            </div>

            <QuotationBuilder
                concepts={conceptOptions}
                clients={clients}
                serviceTypes={serviceTypeOptions}
                templates={templateOptions}
                defaultTerms={companySettings?.default_terms || ""}
                defaultPrivacy={companySettings?.privacy_notice || ""}
                action={createQuotationAction}
            />
        </div>
    );
}
