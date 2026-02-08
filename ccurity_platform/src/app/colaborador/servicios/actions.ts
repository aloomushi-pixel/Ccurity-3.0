"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { applyToService } from "@/lib/data/service-applications";

async function getCurrentUserId() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");
    return user.id;
}

export async function applyToServiceAction(formData: FormData) {
    const userId = await getCurrentUserId();
    const serviceId = formData.get("serviceId") as string;
    const message = (formData.get("message") as string) || undefined;

    if (!serviceId) return { error: "Servicio inválido" };

    try {
        await applyToService(serviceId, userId, message);
        revalidatePath("/colaborador/servicios");
        return { success: true };
    } catch (e: any) {
        // Handle unique constraint (already applied)
        if (e?.code === "23505") {
            return { error: "Ya te postulaste a este servicio" };
        }
        return { error: "Error al postularse" };
    }
}
