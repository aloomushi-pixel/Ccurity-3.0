"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createContractTypeAction(formData: FormData) {
    const supabase = await createClient();

    const serviceTypeId = formData.get("serviceTypeId") as string;
    const name = formData.get("name") as string;
    const description = (formData.get("description") as string) || null;

    const { error } = await supabase.from("contract_types").insert({
        serviceTypeId,
        name,
        description,
    });

    if (error) throw error;
    revalidatePath("/admin/finanzas/tipos");
}

export async function updateContractTypeAction(formData: FormData) {
    const supabase = await createClient();

    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const description = (formData.get("description") as string) || null;
    const serviceTypeId = formData.get("serviceTypeId") as string;

    const { error } = await supabase
        .from("contract_types")
        .update({ name, description, serviceTypeId })
        .eq("id", id);

    if (error) throw error;
    revalidatePath("/admin/finanzas/tipos");
}

export async function deleteContractTypeAction(formData: FormData) {
    const supabase = await createClient();
    const id = formData.get("id") as string;

    const { error } = await supabase.from("contract_types").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/admin/finanzas/tipos");
}

export async function toggleContractTypeAction(formData: FormData) {
    const supabase = await createClient();
    const id = formData.get("id") as string;
    const isActive = formData.get("isActive") === "true";

    const { error } = await supabase
        .from("contract_types")
        .update({ isActive: !isActive })
        .eq("id", id);

    if (error) throw error;
    revalidatePath("/admin/finanzas/tipos");
}
