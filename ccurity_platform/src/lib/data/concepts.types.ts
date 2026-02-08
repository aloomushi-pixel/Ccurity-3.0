// Shared types and constants for CPU concepts
// This file is safe to import from both server and client components.

export type Concept = {
    id: string;
    title: string;
    description: string | null;
    format: string | null;
    category: string | null;
    price: number;
    sat_code: string | null;
    brand: string | null;
    model: string | null;
    warranty_months: number | null;
    execution_time: string | null;
    imageUrl: string | null;
    specSheetUrl: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    // Virtual fields (populated separately)
    quotation_count?: number;
};

export const CONCEPT_FORMATS = ["ml", "pza", "m2", "unidad"] as const;
export type ConceptFormat = (typeof CONCEPT_FORMATS)[number];

export type PriceHistory = {
    id: string;
    concept_id: string;
    old_price: number;
    new_price: number;
    changed_at: string;
    changed_by: string | null;
};
