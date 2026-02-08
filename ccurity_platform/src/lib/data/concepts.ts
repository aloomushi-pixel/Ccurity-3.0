import { createClient } from "@/lib/supabase/server";

// Re-export shared types and constants so server-side callers can
// continue importing from this module.
export type { Concept, PriceHistory, ConceptFormat } from "./concepts.types";
export { CONCEPT_FORMATS } from "./concepts.types";
import type { Concept, PriceHistory } from "./concepts.types";

export type ConceptFilters = {
    search?: string;
    category?: string | null;
    isActive?: boolean | null;
    priceMin?: number;
    priceMax?: number;
    sortBy?: string;
    sortDir?: "asc" | "desc";
    page?: number;
    pageSize?: number;
};

// ─── READ ──────────────────────────────────────────────

export async function getConcepts(): Promise<Concept[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("concepts")
        .select("*")
        .order("category", { ascending: true })
        .order("title", { ascending: true });

    if (error) throw error;
    return (data as Concept[]) || [];
}

/** Lightweight fetch for the quotation builder concept selector */
export async function getActiveConceptsForQuotation() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("concepts")
        .select("id, title, description, category, format, price, brand, model, sat_code, execution_time")
        .eq("isActive", true)
        .order("title", { ascending: true });

    if (error) throw error;
    return data || [];
}

export async function getConceptsFiltered(filters: ConceptFilters = {}) {
    const supabase = await createClient();
    const {
        search,
        category,
        isActive,
        priceMin,
        priceMax,
        sortBy = "title",
        sortDir = "asc",
        page = 1,
        pageSize = 25,
    } = filters;

    let query = supabase.from("concepts").select("*", { count: "exact" });

    // Text search across title, description, sat_code, brand, model
    if (search) {
        query = query.or(
            `title.ilike.%${search}%,description.ilike.%${search}%,sat_code.ilike.%${search}%,brand.ilike.%${search}%,model.ilike.%${search}%`
        );
    }

    if (category) query = query.eq("category", category);
    if (isActive !== null && isActive !== undefined) query = query.eq("isActive", isActive);
    if (priceMin !== undefined) query = query.gte("price", priceMin);
    if (priceMax !== undefined) query = query.lte("price", priceMax);

    // Sorting
    query = query.order(sortBy, { ascending: sortDir === "asc" });

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
        concepts: (data as Concept[]) || [],
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
    };
}

export async function getConceptById(id: string): Promise<Concept | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("concepts")
        .select("*")
        .eq("id", id)
        .single();

    if (error) return null;
    return data as Concept;
}

// ─── STATS ─────────────────────────────────────────────

export async function getConceptStats() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("concepts")
        .select("category, isActive, price, format");

    if (error) return { total: 0, active: 0, categories: 0, avgPrice: 0, formats: 0 };

    const concepts = data || [];
    const total = concepts.length;
    const active = concepts.filter((c) => c.isActive).length;
    const categories = new Set(concepts.map((c) => c.category).filter(Boolean)).size;
    const formats = new Set(concepts.map((c) => c.format).filter(Boolean)).size;
    const avgPrice =
        total > 0
            ? concepts.reduce((sum, c) => sum + Number(c.price), 0) / total
            : 0;

    return { total, active, categories, avgPrice, formats };
}

export async function getCategories(): Promise<string[]> {
    const supabase = await createClient();

    // Merge from dedicated table + existing concepts for backward compat
    const [catTable, conceptCats] = await Promise.all([
        supabase.from("concept_categories").select("name").order("name"),
        supabase.from("concepts").select("category").not("category", "is", null).order("category"),
    ]);

    const names = new Set<string>();
    if (catTable.data) catTable.data.forEach((d) => names.add(d.name));
    if (conceptCats.data) conceptCats.data.forEach((d) => names.add(d.category as string));

    return Array.from(names).sort();
}

// ─── PRICE HISTORY ─────────────────────────────────────

export async function getPriceHistory(conceptId: string): Promise<PriceHistory[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("concept_price_history")
        .select("*")
        .eq("concept_id", conceptId)
        .order("changed_at", { ascending: false })
        .limit(20);

    if (error) return [];
    return data as PriceHistory[];
}

export async function logPriceChange(
    conceptId: string,
    oldPrice: number,
    newPrice: number,
    changedBy?: string
) {
    const supabase = await createClient();
    await supabase.from("concept_price_history").insert({
        concept_id: conceptId,
        old_price: oldPrice,
        new_price: newPrice,
        changed_by: changedBy || null,
    });
}

// ─── QUOTATION COUNT ───────────────────────────────────

export async function getConceptQuotationCounts(): Promise<Record<string, number>> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("quotation_items")
        .select("conceptId");

    if (error || !data) return {};

    const counts: Record<string, number> = {};
    for (const item of data) {
        const cid = item.conceptId as string;
        counts[cid] = (counts[cid] || 0) + 1;
    }
    return counts;
}

// ─── WRITE ─────────────────────────────────────────────

export async function createConcept(
    concept: Omit<Concept, "id" | "createdAt" | "updatedAt" | "quotation_count">
) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("concepts")
        .insert(concept)
        .select()
        .single();

    if (error) throw error;
    return data as Concept;
}

export async function updateConcept(
    id: string,
    updates: Partial<
        Omit<Concept, "id" | "createdAt" | "updatedAt" | "quotation_count">
    >
) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("concepts")
        .update({ ...updates, updatedAt: new Date().toISOString() })
        .eq("id", id);

    if (error) throw error;
}

export async function deleteConcept(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("concepts").delete().eq("id", id);
    if (error) throw error;
}

export async function duplicateConcept(id: string): Promise<Concept> {
    const original = await getConceptById(id);
    if (!original) throw new Error("Concept not found");

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, createdAt: _ca, updatedAt: _ua, quotation_count: _qc, ...rest } = original;
    return createConcept({
        ...rest,
        title: `${rest.title} (copia)`,
        sat_code: rest.sat_code ? `${rest.sat_code}-COPY` : null,
    });
}

// ─── CSV EXPORT/IMPORT ─────────────────────────────────

export async function exportConceptsCsv(): Promise<string> {
    const concepts = await getConcepts();
    const headers = [
        "Código SAT", "Título", "Categoría", "Marca", "Modelo", "Precio",
        "Formato", "Garantía (meses)", "Tiempo Ejecución",
        "Descripción", "Activo"
    ];

    const rows = concepts.map((c) => [
        c.sat_code || "", c.title, c.category || "", c.brand || "", c.model || "",
        c.price, c.format || "", c.warranty_months || "",
        c.execution_time || "", c.description || "", c.isActive ? "Sí" : "No"
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));

    return [headers.join(","), ...rows].join("\n");
}

export function parseConceptsCsv(csvContent: string): Partial<Concept>[] {
    const lines = csvContent.trim().split("\n");
    if (lines.length < 2) return [];

    return lines.slice(1).map((line) => {
        const cols = line.split(",").map((c) => c.replace(/^"|"$/g, "").replace(/""/g, '"'));
        return {
            sat_code: cols[0] || null,
            title: cols[1] || "Sin título",
            category: cols[2] || null,
            brand: cols[3] || null,
            model: cols[4] || null,
            price: parseFloat(cols[5]) || 0,
            format: cols[6] || null,
            warranty_months: parseInt(cols[7]) || null,
            execution_time: cols[8] || null,
            description: cols[9] || null,
            isActive: cols[10] !== "No",
            imageUrl: null,
            specSheetUrl: null,
        } as Partial<Concept>;
    });
}
