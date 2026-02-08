import { createClient } from "@/lib/supabase/server";

/* ── Types ──────────────────────────────────────── */

export type ServiceApplication = {
    id: string;
    serviceId: string;
    collaboratorId: string;
    status: "pending" | "accepted" | "rejected";
    message: string | null;
    createdAt: string;
    updatedAt: string;
    // joined fields
    collaboratorName?: string;
    collaboratorEmail?: string;
    serviceDescription?: string;
    serviceName?: string;
};

/* ── Queries ─────────────────────────────────────── */

/** Get applications for a specific service */
export async function getApplicationsByService(
    serviceId: string
): Promise<ServiceApplication[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("service_applications")
        .select(
            `
            id,
            "serviceId",
            "collaboratorId",
            status,
            message,
            "createdAt",
            "updatedAt",
            collaborator:users!service_applications_collaboratorId_fkey(name, email)
        `
        )
        .eq("serviceId", serviceId)
        .order("createdAt", { ascending: false });

    if (error) throw error;

    return (data ?? []).map((row: any) => ({
        id: row.id,
        serviceId: row.serviceId,
        collaboratorId: row.collaboratorId,
        status: row.status,
        message: row.message,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        collaboratorName: row.collaborator?.name ?? "",
        collaboratorEmail: row.collaborator?.email ?? "",
    }));
}

/** Get applications by a specific collaborator */
export async function getApplicationsByCollaborator(
    collaboratorId: string
): Promise<ServiceApplication[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("service_applications")
        .select(
            `
            id,
            "serviceId",
            "collaboratorId",
            status,
            message,
            "createdAt",
            "updatedAt",
            service:services!service_applications_serviceId_fkey(description)
        `
        )
        .eq("collaboratorId", collaboratorId)
        .order("createdAt", { ascending: false });

    if (error) throw error;

    return (data ?? []).map((row: any) => ({
        id: row.id,
        serviceId: row.serviceId,
        collaboratorId: row.collaboratorId,
        status: row.status,
        message: row.message,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        serviceDescription: row.service?.description ?? "",
    }));
}

/* ── Mutations ───────────────────────────────────── */

/** Collaborator applies for a service */
export async function applyToService(
    serviceId: string,
    collaboratorId: string,
    message?: string
) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("service_applications")
        .insert({
            serviceId,
            collaboratorId,
            message: message || null,
        });
    if (error) throw error;
}

/** Supervisor accepts or rejects an application */
export async function updateApplicationStatus(
    applicationId: string,
    status: "accepted" | "rejected"
) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("service_applications")
        .update({
            status,
            updatedAt: new Date().toISOString(),
        })
        .eq("id", applicationId);
    if (error) throw error;
}

/** Get count of pending applications for a service */
export async function getPendingApplicationCount(
    serviceId: string
): Promise<number> {
    const supabase = await createClient();
    const { count, error } = await supabase
        .from("service_applications")
        .select("id", { count: "exact", head: true })
        .eq("serviceId", serviceId)
        .eq("status", "pending");

    if (error) return 0;
    return count ?? 0;
}
