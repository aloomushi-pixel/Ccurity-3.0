"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
    const supabase = await createClient();

    const data = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
    };

    let authError: string | null = null;

    try {
        const { error } = await supabase.auth.signInWithPassword(data);
        if (error) {
            authError = error.message;
        }
    } catch (e: any) {
        authError = e?.message || "Error de conexión. Verifica tu red e intenta de nuevo.";
    }

    if (authError) {
        redirect("/login?error=" + encodeURIComponent(authError));
    }

    // Get the user's role to redirect appropriately
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        console.log("[LOGIN] User from getUser:", user?.id, user?.email);

        if (user) {
            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single();

            console.log("[LOGIN] Profile query result:", JSON.stringify(profile), "Error:", profileError?.message);

            const roleRoutes: Record<string, string> = {
                ADMIN: "/admin",
                SUPER: "/supervisor",
                COLAB: "/colaborador",
                CLIENT: "/portal",
            };

            const destination = roleRoutes[profile?.role || "CLIENT"] || "/portal";
            console.log("[LOGIN] Redirecting to:", destination, "Role:", profile?.role);
            revalidatePath("/", "layout");
            redirect(destination);
        }
    } catch (e: any) {
        // Re-throw redirect errors (Next.js uses them internally)
        if (e?.digest?.startsWith("NEXT_REDIRECT")) throw e;
        console.error("[LOGIN] Error:", e?.message);
        redirect("/login?error=" + encodeURIComponent("Error obteniendo perfil: " + (e?.message || "desconocido")));
    }

    revalidatePath("/", "layout");
    redirect("/");
}

export async function signup(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("full_name") as string;
    const role = (formData.get("role") as string) || "CLIENT";

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                role: role,
            },
        },
    });

    if (error) {
        redirect("/signup?error=" + encodeURIComponent(error.message));
    }

    revalidatePath("/", "layout");
    redirect("/login?message=" + encodeURIComponent("Revisa tu email para confirmar tu cuenta."));
}

export async function signout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath("/", "layout");
    redirect("/login");
}
