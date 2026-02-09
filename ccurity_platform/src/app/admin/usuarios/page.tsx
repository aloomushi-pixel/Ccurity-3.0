
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";


async function getUsersData() {
    const supabase = await createClient();

    const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, avatar_url, created_at")
        .order("created_at", { ascending: false });

    const all = profiles ?? [];
    const byRole: Record<string, number> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    all.forEach((p: any) => {
        const role = (p.role || "unknown").toLowerCase();
        byRole[role] = (byRole[role] || 0) + 1;
    });

    return { profiles: all, byRole };
}

const roleColors: Record<string, string> = {
    admin: "bg-red-500/20 text-red-400",
    supervisor: "bg-purple-500/20 text-purple-400",
    colaborador: "bg-blue-500/20 text-blue-400",
    cliente: "bg-green-500/20 text-green-400",
};

const roleLabels: Record<string, string> = {
    admin: "Admin",
    supervisor: "Supervisor",
    colaborador: "Colaborador",
    cliente: "Cliente",
};


export const metadata: Metadata = {
    title: "Usuarios — Ccurity Admin",
    description: "Gestión de usuarios, roles y permisos del sistema.",
};

export default async function AdminUsuariosPage() {
    const data = await getUsersData();

    return (
        <>
            {/* Stats by role */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="glass-card p-4 text-center">
                    <p className="text-2xl font-bold">{data.profiles.length}</p>
                    <p className="text-xs text-muted">Total</p>
                </div>
                {Object.entries(roleLabels).map(([key, label]) => (
                    <div key={key} className="glass-card p-4 text-center">
                        <p className="text-2xl font-bold">{data.byRole[key] ?? 0}</p>
                        <p className="text-xs text-muted">{label}</p>
                    </div>
                ))}
            </div>

            {/* Users Table */}
            <div className="glass-card overflow-hidden">
                <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                    <h2 className="font-semibold text-sm">👥 Usuarios Registrados</h2>
                    <span className="text-xs text-muted">{data.profiles.length} total</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border text-left text-xs text-muted">
                                <th className="px-4 py-2">Usuario</th>
                                <th className="px-4 py-2">Email</th>
                                <th className="px-4 py-2">Rol</th>
                                <th className="px-4 py-2">Registro</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.profiles.length === 0 && (
                                <tr><td colSpan={4} className="px-4 py-8 text-center text-muted">Sin usuarios registrados</td></tr>
                            )}
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {data.profiles.map((p: any) => (
                                <tr key={p.id} className="border-b border-border/50 hover:bg-surface-2/50 transition-colors">
                                    <td className="px-4 py-2.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                {(p.full_name || p.email || "U").charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium">{p.full_name || "Sin nombre"}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2.5 text-muted text-xs font-mono">{p.email}</td>
                                    <td className="px-4 py-2.5">
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${roleColors[p.role] || "bg-gray-500/20 text-gray-300"}`}>
                                            {roleLabels[p.role] ?? p.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2.5 text-xs text-muted">
                                        {new Date(p.created_at).toLocaleDateString("es-MX")}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Role distribution */}
            <div className="glass-card p-5">
                <h2 className="font-semibold text-sm mb-4">📊 Distribución por Rol</h2>
                <div className="space-y-3">
                    {Object.entries(roleLabels).map(([key, label]) => {
                        const count = data.byRole[key] ?? 0;
                        const pct = data.profiles.length > 0 ? (count / data.profiles.length) * 100 : 0;
                        return (
                            <div key={key}>
                                <div className="flex items-center justify-between text-xs mb-1">
                                    <span>{label}</span>
                                    <span className="text-muted">{count} ({pct.toFixed(0)}%)</span>
                                </div>
                                <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-primary to-primary-light transition-all duration-500"
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
