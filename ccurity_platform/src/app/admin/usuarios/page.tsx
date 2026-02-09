
import { createClient } from "@/lib/supabase/server";
import { getProfiles, getProfileStats } from "@/lib/data/profiles";
import type { Metadata } from "next";
import UsersClient from "./UsersClient";

export const metadata: Metadata = {
    title: "Usuarios — Ccurity Admin",
    description: "Gestión de usuarios, roles y permisos del sistema.",
};

export default async function AdminUsuariosPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const [profiles, stats] = await Promise.all([
        getProfiles(),
        getProfileStats(),
    ]);

    return (
        <UsersClient
            profiles={profiles}
            currentUserId={user?.id ?? ""}
            stats={stats}
        />
    );
}
