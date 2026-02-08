"use server";

import { revalidatePath } from "next/cache";
import {
    createConcept,
    updateConcept,
    deleteConcept,
    duplicateConcept,
    logPriceChange,
    getConceptById,
    exportConceptsCsv,
    parseConceptsCsv,
} from "@/lib/data/concepts";
import { createClient } from "@/lib/supabase/server";

export async function createConceptAction(formData: FormData) {
    const title = formData.get("title") as string;
    const description = (formData.get("description") as string) || null;
    const format = (formData.get("format") as string) || null;
    const category = (formData.get("category") as string) || null;
    const price = parseFloat(formData.get("price") as string) || 0;
    const sat_code = (formData.get("sat_code") as string) || null;
    const brand = (formData.get("brand") as string) || null;
    const model = (formData.get("model") as string) || null;
    const warranty_months = formData.get("warranty_months")
        ? parseInt(formData.get("warranty_months") as string)
        : null;
    const execution_time = (formData.get("execution_time") as string) || null;
    const isActive = formData.get("isActive") !== "false";

    await createConcept({
        title,
        description,
        format,
        category,
        price,
        sat_code,
        brand,
        model,
        warranty_months,
        execution_time,
        imageUrl: (formData.get("imageUrl") as string) || null,
        specSheetUrl: (formData.get("specSheetUrl") as string) || null,
        isActive,
    });

    revalidatePath("/admin/cpu");
}

export async function updateConceptAction(formData: FormData) {
    const id = formData.get("id") as string;

    // Get old concept to detect price change
    const old = await getConceptById(id);
    const newPrice = parseFloat(formData.get("price") as string) || 0;

    const updates = {
        title: formData.get("title") as string,
        description: (formData.get("description") as string) || null,
        format: (formData.get("format") as string) || null,
        category: (formData.get("category") as string) || null,
        price: newPrice,
        sat_code: (formData.get("sat_code") as string) || null,
        brand: (formData.get("brand") as string) || null,
        model: (formData.get("model") as string) || null,
        warranty_months: formData.get("warranty_months")
            ? parseInt(formData.get("warranty_months") as string)
            : null,
        execution_time: (formData.get("execution_time") as string) || null,
        imageUrl: (formData.get("imageUrl") as string) || null,
        specSheetUrl: (formData.get("specSheetUrl") as string) || null,
        isActive: formData.get("isActive") === "true",
    };

    await updateConcept(id, updates);

    // Log price change if price actually changed
    if (old && Number(old.price) !== newPrice) {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();
        await logPriceChange(id, Number(old.price), newPrice, user?.id);
    }

    revalidatePath("/admin/cpu");
}

export async function deleteConceptAction(formData: FormData) {
    const id = formData.get("id") as string;
    await deleteConcept(id);
    revalidatePath("/admin/cpu");
}

export async function toggleConceptAction(formData: FormData) {
    const id = formData.get("id") as string;
    const isActive = formData.get("isActive") === "true";
    await updateConcept(id, { isActive: !isActive });
    revalidatePath("/admin/cpu");
}

export async function duplicateConceptAction(formData: FormData) {
    const id = formData.get("id") as string;
    await duplicateConcept(id);
    revalidatePath("/admin/cpu");
}

export async function exportConceptsCsvAction(): Promise<string> {
    return await exportConceptsCsv();
}

export async function importConceptsAction(formData: FormData) {
    const csvContent = formData.get("csvContent") as string;
    if (!csvContent) return;

    const rows = parseConceptsCsv(csvContent);
    for (const row of rows) {
        if (row.title) {
            await createConcept({
                title: row.title || "Sin título",
                description: row.description || null,
                format: row.format || null,
                category: row.category || null,
                price: row.price || 0,
                sat_code: row.sat_code || null,
                brand: row.brand || null,
                model: row.model || null,
                warranty_months: row.warranty_months || null,
                execution_time: row.execution_time || null,
                imageUrl: row.imageUrl || null,
                specSheetUrl: row.specSheetUrl || null,
                isActive: row.isActive ?? true,
            });
        }
    }

    revalidatePath("/admin/cpu");
}

/* ─── Bulk Actions ──────────────────────────────── */

export async function bulkUpdateCategoryAction(ids: string[], category: string) {
    const supabase = await createClient();
    await supabase.from("concepts").update({ category }).in("id", ids);
    revalidatePath("/admin/cpu");
}

export async function bulkToggleActiveAction(ids: string[], isActive: boolean) {
    const supabase = await createClient();
    await supabase.from("concepts").update({ isActive }).in("id", ids);
    revalidatePath("/admin/cpu");
}

export async function bulkAdjustPriceAction(ids: string[], percent: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch current prices
    const { data: current } = await supabase
        .from("concepts")
        .select("id, price")
        .in("id", ids);

    if (!current) return;

    const multiplier = 1 + percent / 100;
    for (const c of current) {
        const oldPrice = Number(c.price);
        const newPrice = Math.round(oldPrice * multiplier * 100) / 100;
        await supabase
            .from("concepts")
            .update({ price: newPrice })
            .eq("id", c.id);
        if (oldPrice !== newPrice) {
            await logPriceChange(c.id, oldPrice, newPrice, user?.id);
        }
    }

    revalidatePath("/admin/cpu");
}

export async function bulkDeleteAction(ids: string[]) {
    const supabase = await createClient();
    await supabase.from("concepts").delete().in("id", ids);
    revalidatePath("/admin/cpu");
}

/* ─── Category Management ───────────────────────── */

export async function addCategoryAction(name: string) {
    const supabase = await createClient();
    await supabase
        .from("concept_categories")
        .upsert({ name }, { onConflict: "name" });
    revalidatePath("/admin/cpu");
}

export async function renameCategoryAction(oldName: string, newName: string) {
    const supabase = await createClient();
    // Update concepts
    await supabase
        .from("concepts")
        .update({ category: newName })
        .eq("category", oldName);
    // Update categories table
    await supabase
        .from("concept_categories")
        .update({ name: newName })
        .eq("name", oldName);
    revalidatePath("/admin/cpu");
}

export async function deleteCategoryAction(name: string) {
    const supabase = await createClient();
    // Remove category from concepts
    await supabase
        .from("concepts")
        .update({ category: null })
        .eq("category", name);
    // Remove from categories table
    await supabase
        .from("concept_categories")
        .delete()
        .eq("name", name);
    revalidatePath("/admin/cpu");
}
