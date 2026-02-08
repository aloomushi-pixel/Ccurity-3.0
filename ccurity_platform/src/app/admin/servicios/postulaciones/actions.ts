"use server";

import { createClient } from "@/lib/supabase/server";
import { updateApplicationStatus } from "@/lib/data/service-applications";
import { revalidatePath } from "next/cache";

/**
 * Accept a collaborator's application – assigns them to the service,
 * updates the service state to "Asignado", and rejects other pending applications.
 */
export async function acceptApplicationAction(formData: FormData) {
    const applicationId = formData.get("applicationId") as string;
    const serviceId = formData.get("serviceId") as string;
    const collaboratorId = formData.get("collaboratorId") as string;

    if (!applicationId || !serviceId || !collaboratorId) {
        return { success: false, error: "Datos incompletos" };
    }

    try {
        const supabase = await createClient();

        // Find the "Asignado" state
        const { data: asignadoState } = await supabase
            .from("service_states")
            .select("id")
            .eq("name", "Asignado")
            .single();

        if (asignadoState) {
            // Update the service: assign collaborator + change state
            await supabase
                .from("services")
                .update({
                    collaboratorId,
                    serviceStateId: asignadoState.id,
                    updatedAt: new Date().toISOString(),
                })
                .eq("id", serviceId);
        }

        // Accept this application
        await updateApplicationStatus(applicationId, "accepted");

        // Reject all other pending applications for this service
        const { data: otherApps } = await supabase
            .from("service_applications")
            .select("id")
            .eq("serviceId", serviceId)
            .eq("status", "pending")
            .neq("id", applicationId);

        if (otherApps && otherApps.length > 0) {
            await Promise.all(
                otherApps.map((a) => updateApplicationStatus(a.id, "rejected"))
            );
        }

        revalidatePath("/admin/servicios/postulaciones");
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || "Error al aceptar" };
    }
}

/**
 * Reject a collaborator's application.
 */
export async function rejectApplicationAction(formData: FormData) {
    const applicationId = formData.get("applicationId") as string;

    if (!applicationId) {
        return { success: false, error: "ID requerido" };
    }

    try {
        await updateApplicationStatus(applicationId, "rejected");
        revalidatePath("/admin/servicios/postulaciones");
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || "Error al rechazar" };
    }
}
