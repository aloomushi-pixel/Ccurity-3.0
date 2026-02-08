"use server";

import { revalidatePath } from "next/cache";
import {
    upsertCollaboratorPrice,
    deleteCollaboratorPrice,
} from "@/lib/data/collaborator-prices";
import { createClient } from "@/lib/supabase/server";

async function getCurrentUserId() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");
    return user.id;
}

export async function upsertPriceAction(formData: FormData) {
    const userId = await getCurrentUserId();
    const conceptId = formData.get("conceptId") as string;
    const customPrice = Number(formData.get("customPrice"));

    if (!conceptId || isNaN(customPrice) || customPrice < 0) {
        return { error: "Datos inválidos" };
    }

    try {
        await upsertCollaboratorPrice(userId, conceptId, customPrice);
        revalidatePath("/colaborador/precios");
        return { success: true };
    } catch {
        return { error: "Error al guardar el precio" };
    }
}

export async function deletePriceAction(priceId: string) {
    try {
        await deleteCollaboratorPrice(priceId);
        revalidatePath("/colaborador/precios");
        return { success: true };
    } catch {
        return { error: "Error al eliminar el precio" };
    }
}
