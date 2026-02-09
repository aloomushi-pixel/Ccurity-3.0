"use server";

import { revalidatePath } from "next/cache";
import {
    updateProfile,
    deleteProfile,
    toggleActiveProfile,
    inviteUser,
    exportProfilesCsv,
} from "@/lib/data/profiles";
import type { Profile } from "@/lib/data/profiles";
import { createClient } from "@/lib/supabase/server";

/* ─── Single-user actions ───────────────────────── */

export async function updateUserAction(formData: FormData) {
    const id = formData.get("id") as string;
    if (!id) return { error: "ID requerido" };

    const updates: Partial<Pick<Profile, "full_name" | "phone" | "company" | "role">> = {};

    const fullName = formData.get("full_name") as string;
    if (fullName !== null) updates.full_name = fullName;

    const phone = formData.get("phone") as string;
    if (phone !== undefined) updates.phone = phone || null;

    const company = formData.get("company") as string;
    if (company !== undefined) updates.company = company || null;

    const role = formData.get("role") as Profile["role"];
    if (role) updates.role = role;

    try {
        await updateProfile(id, updates);
        revalidatePath("/admin/usuarios");
        return { success: true };
    } catch {
        return { error: "Error al actualizar usuario" };
    }
}

export async function toggleUserActiveAction(formData: FormData) {
    const id = formData.get("id") as string;
    const isActive = formData.get("is_active") === "true";
    if (!id) return { error: "ID requerido" };

    try {
        await toggleActiveProfile(id, !isActive);
        revalidatePath("/admin/usuarios");
        return { success: true };
    } catch {
        return { error: "Error al cambiar estado" };
    }
}

export async function deleteUserAction(formData: FormData) {
    const id = formData.get("id") as string;
    if (!id) return { error: "ID requerido" };

    // Prevent deleting yourself
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id === id) return { error: "No puedes eliminarte a ti mismo" };

    try {
        await deleteProfile(id);
        revalidatePath("/admin/usuarios");
        return { success: true };
    } catch {
        return { error: "Error al eliminar usuario" };
    }
}

export async function inviteUserAction(formData: FormData) {
    const email = formData.get("email") as string;
    const fullName = formData.get("full_name") as string;
    const role = (formData.get("role") as Profile["role"]) || "CLIENT";

    if (!email) return { error: "Email requerido" };
    if (!fullName) return { error: "Nombre requerido" };

    try {
        await inviteUser(email, role, fullName);
        revalidatePath("/admin/usuarios");
        return { success: true };
    } catch (err) {
        const msg = err instanceof Error ? err.message : "Error al invitar usuario";
        return { error: msg };
    }
}

export async function exportUsersCsvAction(): Promise<string> {
    return await exportProfilesCsv();
}

/* ─── Bulk Actions ──────────────────────────────── */

export async function bulkChangeRoleAction(ids: string[], role: Profile["role"]) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("profiles")
        .update({ role })
        .in("id", ids);

    if (error) return { error: "Error al cambiar roles" };
    revalidatePath("/admin/usuarios");
    return { success: true };
}

export async function bulkToggleActiveAction(ids: string[], isActive: boolean) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("profiles")
        .update({ is_active: isActive })
        .in("id", ids);

    if (error) return { error: "Error al cambiar estado" };
    revalidatePath("/admin/usuarios");
    return { success: true };
}

export async function bulkDeleteAction(ids: string[]) {
    // Prevent deleting yourself
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const safeIds = ids.filter((id) => id !== user?.id);

    if (safeIds.length === 0) return { error: "No puedes eliminarte a ti mismo" };

    for (const id of safeIds) {
        try {
            await deleteProfile(id);
        } catch {
            // Continue with remaining deletions
        }
    }

    revalidatePath("/admin/usuarios");
    return { success: true };
}
