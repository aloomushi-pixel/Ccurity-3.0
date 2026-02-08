import { createClient } from "@/lib/supabase/server";
import { signout } from "@/app/auth/actions";
import Link from "next/link";

export async function UserNav() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return (
            <div className="flex items-center gap-3">
                <Link
                    href="/login"
                    className="text-sm text-muted hover:text-foreground transition-colors"
                >
                    Iniciar Sesión
                </Link>
                <Link
                    href="/signup"
                    className="text-sm px-4 py-1.5 rounded-lg bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 transition-opacity"
                >
                    Registro
                </Link>
            </div>
        );
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single();

    const roleLabels: Record<string, string> = {
        ADMIN: "Admin",
        SUPER: "Supervisor",
        COLAB: "Colaborador",
        CLIENT: "Cliente",
    };

    const roleColors: Record<string, string> = {
        ADMIN: "bg-primary/10 text-primary border-primary/20 border",
        SUPER: "bg-accent/10 text-accent border-accent/20 border",
        COLAB: "bg-success/10 text-success border-success/20 border",
        CLIENT: "bg-warning/10 text-warning border-warning/20 border",
    };

    return (
        <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{profile?.full_name || user.email}</p>
                <span
                    className={`inline-block text-xs px-2 py-0.5 rounded-full ${roleColors[profile?.role || "CLIENT"]
                        }`}
                >
                    {roleLabels[profile?.role || "CLIENT"]}
                </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold">
                {(profile?.full_name || user.email || "U")[0].toUpperCase()}
            </div>
            <form>
                <button
                    formAction={signout}
                    className="text-xs text-muted hover:text-danger transition-colors cursor-pointer"
                >
                    Salir
                </button>
            </form>
        </div>
    );
}
