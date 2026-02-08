import { createClient } from "@/lib/supabase/server";

/* ── Types ─────────────────────────────────────── */

export type ServiceType = {
    id: string;
    name: string;
    description: string | null;
    color: string | null;
    icon: string | null;
    isActive: boolean;
    order: number;
};

export type ServiceState = {
    id: string;
    name: string;
    description: string | null;
    color: string;
    isFinal: boolean;
    isActive: boolean;
};

export type Service = {
    id: string;
    title: string;
    description: string | null;
    scheduledDate: string | null;
    completedDate: string | null;
    address: string | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
    client: { id: string; name: string; email: string } | null;
    collaborator: { id: string; name: string } | null;
    technician: { id: string; name: string } | null;
    serviceType: ServiceType | null;
    serviceState: ServiceState | null;
};

export type ServiceEvidence = {
    id: string;
    serviceId: string;
    photoUrl: string;
    caption: string | null;
    uploadedBy: string | null;
    createdAt: string;
};

export type ServiceReport = {
    id: string;
    serviceId: string;
    workPerformed: string;
    materialsUsed: string | null;
    photoUrls: string[] | null;
    notes: string | null;
    createdAt: string;
};

export type ServiceItem = {
    id: string;
    serviceId: string;
    quantity: number;
    price: number;
    notes: string | null;
    concept: { id: string; title: string; category: string | null; format: string | null } | null;
};

export type ServiceFull = Service & {
    items: ServiceItem[];
    reports: ServiceReport[];
    evidence: ServiceEvidence[];
};

/* ── Queries ───────────────────────────────────── */

export async function getServices() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("services")
        .select(
            `id, title, description, scheduledDate, completedDate, address, notes, createdAt, updatedAt,
             client:users!services_clientId_fkey(id, name, email),
             collaborator:users!services_collaboratorId_fkey(id, name),
             technician:users!services_technicianId_fkey(id, name),
             serviceType:service_types(id, name, description, color, icon, isActive, "order"),
             serviceState:service_states(id, name, description, color, isFinal, isActive)`
        )
        .order("createdAt", { ascending: false });

    if (error) throw error;
    return (data ?? []) as unknown as Service[];
}

export async function getServiceById(id: string): Promise<ServiceFull | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("services")
        .select(
            `id, title, description, scheduledDate, completedDate, address, notes, createdAt, updatedAt,
             client:users!services_clientId_fkey(id, name, email),
             collaborator:users!services_collaboratorId_fkey(id, name),
             technician:users!services_technicianId_fkey(id, name),
             serviceType:service_types(id, name, description, color, icon, isActive, "order"),
             serviceState:service_states(id, name, description, color, isFinal, isActive),
             items:service_items(id, serviceId, quantity, price, notes, concept:concepts(id, title, category, format)),
             reports:service_reports(id, serviceId, workPerformed, materialsUsed, photoUrls, notes, createdAt),
             evidence:service_evidence(id, serviceId, photoUrl, caption, uploadedBy, createdAt)`
        )
        .eq("id", id)
        .single();

    if (error) return null;
    return data as unknown as ServiceFull;
}

export async function getServiceStats() {
    const supabase = await createClient();

    const { data: services } = await supabase
        .from("services")
        .select("id, serviceState:service_states(name)");

    const all = (services ?? []) as unknown as { id: string; serviceState: { name: string } | null }[];

    const byState: Record<string, number> = {};
    for (const s of all) {
        const key = s.serviceState?.name || "Sin estado";
        byState[key] = (byState[key] || 0) + 1;
    }

    return { total: all.length, byState };
}

export async function getServiceTypes() {
    const supabase = await createClient();
    const { data } = await supabase.from("service_types").select("*").order("order");
    return (data ?? []) as ServiceType[];
}

export async function getServiceStates() {
    const supabase = await createClient();
    const { data } = await supabase.from("service_states").select("*").order("createdAt");
    return (data ?? []) as ServiceState[];
}

export async function getCollaborators() {
    const supabase = await createClient();
    const { data } = await supabase
        .from("users")
        .select("id, name, email, role")
        .in("role", ["COLLABORATOR", "TECHNICIAN"])
        .eq("isActive", true)
        .order("name");
    return (data ?? []) as { id: string; name: string; email: string; role: string }[];
}

/** Get services filtered by state name (e.g. "Postulando", "Asignado") */
export async function getServicesByStateName(stateName: string) {
    const supabase = await createClient();

    // First get the state ID
    const { data: state } = await supabase
        .from("service_states")
        .select("id")
        .eq("name", stateName)
        .single();

    if (!state) return [];

    const { data, error } = await supabase
        .from("services")
        .select(
            `id, title, description, scheduledDate, completedDate, address, notes, createdAt, updatedAt,
             client:users!services_clientId_fkey(id, name, email),
             collaborator:users!services_collaboratorId_fkey(id, name),
             technician:users!services_technicianId_fkey(id, name),
             serviceType:service_types(id, name, description, color, icon, isActive, "order"),
             serviceState:service_states(id, name, description, color, isFinal, isActive)`
        )
        .eq("serviceStateId", state.id)
        .order("createdAt", { ascending: false });

    if (error) throw error;
    return (data ?? []) as unknown as Service[];
}
