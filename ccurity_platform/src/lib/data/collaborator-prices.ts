import { createClient } from "@/lib/supabase/server";

/* ── Types ──────────────────────────────────────── */

export type CollaboratorPrice = {
    id: string;
    collaboratorId: string;
    conceptId: string;
    customPrice: number;
    createdAt: string;
    updatedAt: string;
    // joined from concepts
    conceptTitle?: string;
    conceptCategory?: string;
    conceptFormat?: string;
    conceptDefaultPrice?: number;
};

/* ── Queries ─────────────────────────────────────── */

export async function getCollaboratorPrices(
    collaboratorId: string
): Promise<CollaboratorPrice[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("collaborator_prices")
        .select(
            `
            id,
            "collaboratorId",
            "conceptId",
            "customPrice",
            "createdAt",
            "updatedAt",
            concepts:conceptId (
                title,
                category,
                format,
                price
            )
        `
        )
        .eq("collaboratorId", collaboratorId)
        .order("updatedAt", { ascending: false });

    if (error) throw error;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data ?? []).map((row: any) => ({
        id: row.id,
        collaboratorId: row.collaboratorId,
        conceptId: row.conceptId,
        customPrice: Number(row.customPrice),
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        conceptTitle: row.concepts?.title ?? "",
        conceptCategory: row.concepts?.category ?? "",
        conceptFormat: row.concepts?.format ?? "",
        conceptDefaultPrice: row.concepts?.price ? Number(row.concepts.price) : 0,
    }));
}

/* ── Mutations ───────────────────────────────────── */

export async function upsertCollaboratorPrice(
    collaboratorId: string,
    conceptId: string,
    customPrice: number
) {
    const supabase = await createClient();

    // Check if a record already exists
    const { data: existing } = await supabase
        .from("collaborator_prices")
        .select("id")
        .eq("collaboratorId", collaboratorId)
        .eq("conceptId", conceptId)
        .maybeSingle();

    if (existing) {
        const { error } = await supabase
            .from("collaborator_prices")
            .update({ customPrice, updatedAt: new Date().toISOString() })
            .eq("id", existing.id);
        if (error) throw error;
    } else {
        const { error } = await supabase
            .from("collaborator_prices")
            .insert({ collaboratorId, conceptId, customPrice });
        if (error) throw error;
    }
}

export async function deleteCollaboratorPrice(id: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("collaborator_prices")
        .delete()
        .eq("id", id);
    if (error) throw error;
}
