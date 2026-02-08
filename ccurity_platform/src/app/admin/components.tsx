import type { Profile } from "@/lib/data/profiles";

const roleLabels: Record<string, string> = {
    ADMIN: "Admin",
    SUPER: "Supervisor",
    COLAB: "Colaborador",
    CLIENT: "Cliente",
};

const roleColors: Record<string, string> = {
    ADMIN: "bg-sky-500/20 text-sky-400 border-sky-500/30",
    SUPER: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    COLAB: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    CLIENT: "bg-violet-500/20 text-violet-400 border-violet-500/30",
};

export function StatsCards({
    total,
    active,
    byRole,
}: {
    total: number;
    active: number;
    byRole: Record<string, number>;
}) {
    const cards = [
        {
            label: "Total Usuarios",
            value: total,
            icon: "👥",
            color: "from-sky-500/20 to-blue-600/20",
        },
        {
            label: "Activos",
            value: active,
            icon: "✅",
            color: "from-emerald-500/20 to-green-600/20",
        },
        {
            label: "Admins",
            value: byRole["ADMIN"] || 0,
            icon: "🛡️",
            color: "from-sky-500/20 to-sky-600/20",
        },
        {
            label: "Supervisores",
            value: byRole["SUPER"] || 0,
            icon: "📊",
            color: "from-cyan-500/20 to-teal-600/20",
        },
        {
            label: "Colaboradores",
            value: byRole["COLAB"] || 0,
            icon: "🔧",
            color: "from-emerald-500/20 to-emerald-600/20",
        },
        {
            label: "Clientes",
            value: byRole["CLIENT"] || 0,
            icon: "👤",
            color: "from-violet-500/20 to-purple-600/20",
        },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {cards.map((card) => (
                <div
                    key={card.label}
                    className={`glass-card p-4 bg-gradient-to-br ${card.color}`}
                >
                    <div className="text-2xl mb-2">{card.icon}</div>
                    <div className="text-2xl font-bold">{card.value}</div>
                    <div className="text-xs text-muted mt-1">{card.label}</div>
                </div>
            ))}
        </div>
    );
}

export function UsersTable({ profiles }: { profiles: Profile[] }) {
    if (profiles.length === 0) {
        return (
            <div className="glass-card p-12 text-center">
                <div className="text-4xl mb-3">👥</div>
                <p className="text-muted text-lg mb-1">Sin usuarios registrados</p>
                <p className="text-sm text-muted">
                    Los usuarios aparecerán aquí cuando se registren en la plataforma.
                </p>
            </div>
        );
    }

    return (
        <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 text-muted font-medium">
                                Usuario
                            </th>
                            <th className="text-left py-3 px-4 text-muted font-medium">
                                Email
                            </th>
                            <th className="text-left py-3 px-4 text-muted font-medium">
                                Rol
                            </th>
                            <th className="text-left py-3 px-4 text-muted font-medium">
                                Empresa
                            </th>
                            <th className="text-left py-3 px-4 text-muted font-medium">
                                Estado
                            </th>
                            <th className="text-left py-3 px-4 text-muted font-medium">
                                Registro
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {profiles.map((profile) => (
                            <tr
                                key={profile.id}
                                className="border-b border-border/50 hover:bg-surface-2/50 transition-colors"
                            >
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                            {(profile.full_name || profile.email)[0].toUpperCase()}
                                        </div>
                                        <span className="font-medium truncate max-w-[150px]">
                                            {profile.full_name || "Sin nombre"}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-muted truncate max-w-[200px]">
                                    {profile.email}
                                </td>
                                <td className="py-3 px-4">
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${roleColors[profile.role]
                                            }`}
                                    >
                                        {roleLabels[profile.role]}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-muted">
                                    {profile.company || "—"}
                                </td>
                                <td className="py-3 px-4">
                                    <span
                                        className={`inline-flex items-center gap-1.5 text-xs ${profile.is_active
                                                ? "text-emerald-400"
                                                : "text-red-400"
                                            }`}
                                    >
                                        <span
                                            className={`w-1.5 h-1.5 rounded-full ${profile.is_active ? "bg-emerald-400" : "bg-red-400"
                                                }`}
                                        />
                                        {profile.is_active ? "Activo" : "Inactivo"}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-muted text-xs">
                                    {new Date(profile.created_at).toLocaleDateString("es-MX", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                    })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
