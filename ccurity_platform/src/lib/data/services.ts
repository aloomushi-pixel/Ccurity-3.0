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

/* ── Levantamiento Workflow ──────────────────────── */

/**
 * Genera service_items a partir de la plantilla del tipo de servicio.
 * Usa los precios del admin (concept.price) como precio base.
 */
export async function generateLevantamientoItems(
    serviceId: string,
    serviceTypeId: string
) {
    const supabase = await createClient();

    // Obtener conceptos de la plantilla
    const { data: templateConcepts, error: tplErr } = await supabase
        .from("service_type_concepts")
        .select(`"conceptId", "defaultQuantity", concept:concepts!conceptId(price)`)
        .eq("serviceTypeId", serviceTypeId);

    if (tplErr) throw tplErr;
    if (!templateConcepts || templateConcepts.length === 0) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = templateConcepts.map((tc: any) => ({
        serviceId,
        conceptId: tc.conceptId,
        quantity: tc.defaultQuantity,
        price: tc.concept?.price ?? 0,
    }));

    const { error: insErr } = await supabase.from("service_items").insert(items);
    if (insErr) throw insErr;
}

/**
 * Calcula el costo total de un servicio para un colaborador específico.
 * Usa el precio personalizado del colaborador si existe, sino el precio admin.
 */
export async function calculateServiceCostForCollaborator(
    serviceId: string,
    collaboratorId: string
): Promise<{ total: number; complete: boolean; items: { conceptTitle: string; quantity: number; price: number; subtotal: number }[] }> {
    const supabase = await createClient();

    // Obtener items del servicio
    const { data: serviceItems, error: siErr } = await supabase
        .from("service_items")
        .select(`id, quantity, price, concept:concepts!conceptId(id, title)`)
        .eq("serviceId", serviceId);

    if (siErr) throw siErr;
    if (!serviceItems || serviceItems.length === 0) {
        return { total: 0, complete: true, items: [] };
    }

    // Obtener precios del colaborador
    const { data: collabPrices } = await supabase
        .from("collaborator_prices")
        .select(`"conceptId", "customPrice"`)
        .eq("collaboratorId", collaboratorId);

    const priceMap = new Map<string, number>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (collabPrices ?? []).forEach((cp: any) => {
        priceMap.set(cp.conceptId, Number(cp.customPrice));
    });

    let total = 0;
    let complete = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = serviceItems.map((si: any) => {
        const conceptId = si.concept?.id;
        const conceptTitle = si.concept?.title ?? "Sin concepto";
        const collabPrice = conceptId ? priceMap.get(conceptId) : undefined;
        const unitPrice = collabPrice ?? Number(si.price);

        // Si el colaborador no tiene precio y el precio admin es 0, es incompleto
        if (collabPrice === undefined && Number(si.price) === 0) {
            complete = false;
        }

        const subtotal = si.quantity * unitPrice;
        total += subtotal;

        return {
            conceptTitle,
            quantity: si.quantity,
            price: unitPrice,
            subtotal,
        };
    });

    return { total, complete, items };
}

/**
 * Completa el levantamiento: genera items desde plantilla, desasigna técnico,
 * y cambia el estado a "Postulando".
 */
export async function completeAndOpenForBidding(serviceId: string) {
    const supabase = await createClient();

    // Obtener el servicio actual
    const { data: service, error: sErr } = await supabase
        .from("services")
        .select("id, serviceTypeId, technicianId")
        .eq("id", serviceId)
        .single();

    if (sErr || !service) throw new Error("Servicio no encontrado");

    // Generar items del levantamiento si tiene tipo de servicio
    if (service.serviceTypeId) {
        await generateLevantamientoItems(serviceId, service.serviceTypeId);
    }

    // Buscar el estado "Postulando"
    const { data: postulandoState } = await supabase
        .from("service_states")
        .select("id")
        .eq("name", "Postulando")
        .single();

    if (!postulandoState) throw new Error("Estado 'Postulando' no encontrado en la configuración");

    // Actualizar servicio: desasignar técnico + cambiar estado
    const { error: updErr } = await supabase
        .from("services")
        .update({
            technicianId: null,
            serviceStateId: postulandoState.id,
            updatedAt: new Date().toISOString(),
        })
        .eq("id", serviceId);

    if (updErr) throw updErr;
}
