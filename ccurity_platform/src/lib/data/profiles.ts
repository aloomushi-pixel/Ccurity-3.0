import { createClient } from "@/lib/supabase/server";

export type Profile = {
    id: string;
    email: string;
    full_name: string;
    avatar_url: string | null;
    role: "ADMIN" | "SUPER" | "COLAB" | "CLIENT";
    phone: string | null;
    company: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export async function getProfiles(): Promise<Profile[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw error;
    return (data as Profile[]) || [];
}

export async function getProfileById(id: string): Promise<Profile | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

    if (error) return null;
    return data as Profile;
}

export async function getProfileStats() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("profiles")
        .select("role, is_active");

    if (error) return { total: 0, active: 0, byRole: {} as Record<string, number> };

    const profiles = data || [];
    const total = profiles.length;
    const active = profiles.filter((p) => p.is_active).length;
    const byRole: Record<string, number> = {};

    profiles.forEach((p) => {
        byRole[p.role] = (byRole[p.role] || 0) + 1;
    });

    return { total, active, byRole };
}

export async function updateProfile(
    id: string,
    updates: Partial<Pick<Profile, "full_name" | "phone" | "company" | "role" | "is_active">>
) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", id);

    if (error) throw error;
}

export async function toggleActiveProfile(id: string, isActive: boolean) {
    return updateProfile(id, { is_active: isActive });
}

export async function deleteProfile(id: string) {
    const supabase = await createClient();

    // Delete from profiles table first
    const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", id);

    if (profileError) throw profileError;

    // Then delete from Supabase Auth (admin API)
    const { error: authError } = await supabase.auth.admin.deleteUser(id);
    if (authError) {
        console.error("Error deleting auth user (profile already removed):", authError);
    }
}

export async function inviteUser(
    email: string,
    role: Profile["role"],
    fullName: string
) {
    const supabase = await createClient();

    // Invite via Supabase Auth
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
        data: { full_name: fullName, role },
    });

    if (error) throw error;

    // Upsert profile with the new user id
    if (data.user) {
        const { error: profileError } = await supabase.from("profiles").upsert({
            id: data.user.id,
            email,
            full_name: fullName,
            role,
            is_active: true,
        }, { onConflict: "id" });

        if (profileError) throw profileError;
    }

    return data;
}

export async function exportProfilesCsv(): Promise<string> {
    const profiles = await getProfiles();

    const roleLabels: Record<string, string> = {
        ADMIN: "Administrador",
        SUPER: "Supervisor",
        COLAB: "Colaborador",
        CLIENT: "Cliente",
    };

    const header = "Nombre,Email,Rol,Teléfono,Empresa,Estado,Fecha de Registro";
    const rows = profiles.map((p) => {
        const cols = [
            `"${(p.full_name || "").replace(/"/g, '""')}"`,
            p.email,
            roleLabels[p.role] || p.role,
            p.phone || "",
            `"${(p.company || "").replace(/"/g, '""')}"`,
            p.is_active ? "Activo" : "Inactivo",
            new Date(p.created_at).toLocaleDateString("es-MX"),
        ];
        return cols.join(",");
    });

    return [header, ...rows].join("\n");
}
