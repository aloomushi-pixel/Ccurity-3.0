import { createClient } from "@/lib/supabase/server";

/* ── Types ──────────────────────────────────────── */

export type ServiceTypeConcept = {
    id: string;
    serviceTypeId: string;
    conceptId: string;
    defaultQuantity: number;
    createdAt: string;
    // joined
    conceptTitle?: string;
    conceptCategory?: string;
    conceptFormat?: string;
    conceptPrice?: number;
};

/* ── Queries ─────────────────────────────────────── */

export async function getTemplateConceptsByServiceType(
    serviceTypeId: string
): Promise<ServiceTypeConcept[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("service_type_concepts")
        .select(
            `
            id,
            "serviceTypeId",
            "conceptId",
            "defaultQuantity",
            "createdAt",
            concept:concepts!conceptId (
                title,
                category,
                format,
                price
            )
        `
        )
        .eq("serviceTypeId", serviceTypeId)
        .order("createdAt", { ascending: true });

    if (error) throw error;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data ?? []).map((row: any) => ({
        id: row.id,
        serviceTypeId: row.serviceTypeId,
        conceptId: row.conceptId,
        defaultQuantity: row.defaultQuantity,
        createdAt: row.createdAt,
        conceptTitle: row.concept?.title ?? "",
        conceptCategory: row.concept?.category ?? "",
        conceptFormat: row.concept?.format ?? "",
        conceptPrice: row.concept?.price ? Number(row.concept.price) : 0,
    }));
}

/* ── Mutations ───────────────────────────────────── */

export async function addTemplateConcept(
    serviceTypeId: string,
    conceptId: string,
    defaultQuantity: number = 1
) {
    const supabase = await createClient();
    const { error } = await supabase.from("service_type_concepts").insert({
        serviceTypeId,
        conceptId,
        defaultQuantity,
    });
    if (error) throw error;
}

export async function updateTemplateConceptQuantity(
    id: string,
    defaultQuantity: number
) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("service_type_concepts")
        .update({ defaultQuantity })
        .eq("id", id);
    if (error) throw error;
}

export async function removeTemplateConcept(id: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("service_type_concepts")
        .delete()
        .eq("id", id);
    if (error) throw error;
}
