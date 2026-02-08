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
