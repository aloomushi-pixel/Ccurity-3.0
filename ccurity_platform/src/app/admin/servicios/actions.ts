"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createServiceAction(formData: FormData) {
    const supabase = await createClient();

    const title = formData.get("title") as string;
    const clientId = formData.get("clientId") as string;
    const collaboratorId = (formData.get("collaboratorId") as string) || null;
    const technicianId = (formData.get("technicianId") as string) || null;
    const serviceTypeId = (formData.get("serviceTypeId") as string) || null;
    const serviceStateId = (formData.get("serviceStateId") as string) || null;
    const description = (formData.get("description") as string) || null;
    const address = (formData.get("address") as string) || null;
    const scheduledDate = (formData.get("scheduledDate") as string) || null;
    const notes = (formData.get("notes") as string) || null;

    const { error } = await supabase.from("services").insert({
        title,
        clientId,
        collaboratorId,
        technicianId,
        serviceTypeId,
        serviceStateId,
        description,
        address,
        scheduledDate: scheduledDate || null,
        notes,
    });

    if (error) throw error;
    revalidatePath("/admin/servicios");
}

export async function updateServiceStateAction(formData: FormData) {
    const supabase = await createClient();
    const id = formData.get("id") as string;
    const serviceStateId = formData.get("serviceStateId") as string;

    const { error } = await supabase
        .from("services")
        .update({ serviceStateId, updatedAt: new Date().toISOString() })
        .eq("id", id);

    if (error) throw error;
    revalidatePath("/admin/servicios");
}

export async function assignCollaboratorAction(formData: FormData) {
    const supabase = await createClient();
    const id = formData.get("id") as string;
    const collaboratorId = (formData.get("collaboratorId") as string) || null;
    const technicianId = (formData.get("technicianId") as string) || null;

    const update: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (collaboratorId !== null) update.collaboratorId = collaboratorId;
    if (technicianId !== null) update.technicianId = technicianId;

    const { error } = await supabase.from("services").update(update).eq("id", id);
    if (error) throw error;
    revalidatePath("/admin/servicios");
}

export async function deleteServiceAction(formData: FormData) {
    const supabase = await createClient();
    const id = formData.get("id") as string;

    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/admin/servicios");
}

/* ── Service Types / States CRUD ────── */

export async function createServiceTypeAction(formData: FormData) {
    const supabase = await createClient();
    const name = formData.get("name") as string;
    const description = (formData.get("description") as string) || null;
    const color = (formData.get("color") as string) || "#6B7280";

    const { error } = await supabase
        .from("service_types")
        .insert({ name, description, color });
    if (error) throw error;
    revalidatePath("/admin/servicios/tipos");
}

export async function deleteServiceTypeAction(formData: FormData) {
    const supabase = await createClient();
    const id = formData.get("id") as string;
    const { error } = await supabase.from("service_types").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/admin/servicios/tipos");
}

export async function createServiceStateAction(formData: FormData) {
    const supabase = await createClient();
    const name = formData.get("name") as string;
    const description = (formData.get("description") as string) || "";
    const color = (formData.get("color") as string) || "#6B7280";
    const isFinal = formData.get("isFinal") === "true";

    const { error } = await supabase
        .from("service_states")
        .insert({ name, description, color, isFinal });
    if (error) throw error;
    revalidatePath("/admin/servicios/tipos");
}

export async function deleteServiceStateAction(formData: FormData) {
    const supabase = await createClient();
    const id = formData.get("id") as string;
    const { error } = await supabase.from("service_states").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/admin/servicios/tipos");
}

/* ── Levantamiento Workflow ────── */

export async function completeLevantamientoAction(formData: FormData) {
    const { completeAndOpenForBidding } = await import("@/lib/data/services");
    const id = formData.get("id") as string;

    if (!id) throw new Error("ID de servicio requerido");

    await completeAndOpenForBidding(id);
    revalidatePath("/admin/servicios");
    revalidatePath(`/admin/servicios/${id}`);
    revalidatePath("/colaborador/servicios");
}
