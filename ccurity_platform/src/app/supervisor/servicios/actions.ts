"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { updateApplicationStatus } from "@/lib/data/service-applications";

export async function acceptApplicationAction(formData: FormData) {
    const applicationId = formData.get("applicationId") as string;
    const serviceId = formData.get("serviceId") as string;
    const collaboratorId = formData.get("collaboratorId") as string;

    if (!applicationId) return { error: "ID inválido" };

    const supabase = await createClient();

    try {
        // Accept the application
        await updateApplicationStatus(applicationId, "accepted");

        // Assign the collaborator to the service and move state to "Asignado"
        const { data: asignadoState } = await supabase
            .from("service_states")
            .select("id")
            .eq("name", "Asignado")
            .single();

        if (asignadoState && serviceId && collaboratorId) {
            await supabase
                .from("services")
                .update({
                    collaboratorId,
                    serviceStateId: asignadoState.id,
                    updatedAt: new Date().toISOString(),
                })
                .eq("id", serviceId);
        }

        // Reject all other pending applications for this service
        if (serviceId) {
            const { data: otherApps } = await supabase
                .from("service_applications")
                .select("id")
                .eq("serviceId", serviceId)
                .eq("status", "pending")
                .neq("id", applicationId);

            if (otherApps && otherApps.length > 0) {
                await supabase
                    .from("service_applications")
                    .update({ status: "rejected", updatedAt: new Date().toISOString() })
                    .in(
                        "id",
                        otherApps.map((a) => a.id)
                    );
            }
        }

        revalidatePath("/supervisor/servicios");
        return { success: true };
    } catch {
        return { error: "Error al aceptar postulación" };
    }
}

export async function rejectApplicationAction(formData: FormData) {
    const applicationId = formData.get("applicationId") as string;

    if (!applicationId) return { error: "ID inválido" };

    try {
        await updateApplicationStatus(applicationId, "rejected");
        revalidatePath("/supervisor/servicios");
        return { success: true };
    } catch {
        return { error: "Error al rechazar postulación" };
    }
}
