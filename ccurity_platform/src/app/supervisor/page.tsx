import Link from "next/link";
import { UserNav } from "@/components/user-nav";
import { createClient } from "@/lib/supabase/server";
import { FloatingChat } from "@/components/chat/FloatingChat";

async function getSupervisorData() {
    const supabase = await createClient();

    // Services grouped by state
    const { data: services } = await supabase
        .from("services")
        .select(`id, description, scheduledDate, type:service_types(name, color), state:service_states(name, color), client:clients(name), collaborators:service_collaborators(profile:profiles(full_name))`)
        .order("createdAt", { ascending: false })
        .limit(15);

    const { count: totalServices } = await supabase
        .from("services")
        .select("id", { count: "exact", head: true });

    // Collaborator count
    const { count: totalCollaborators } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "colaborador");

    // Chat stats
    const { count: totalConversations } = await supabase
        .from("conversations")
        .select("id", { count: "exact", head: true });

    const { count: totalMessages } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true });

    // Contract stats
    const { data: contracts } = await supabase
        .from("contracts")
        .select("id, status, amount");

    const activeContracts = (contracts ?? []).filter((c: any) => c.status === "active").length;
    const totalContractValue = (contracts ?? []).reduce((s: number, c: any) => s + Number(c.amount), 0);

    // Disputes (placeholder — future table)
    const disputes = 0;

    return {
        services: services ?? [],
        totalServices: totalServices ?? 0,
        totalCollaborators: totalCollaborators ?? 0,
        totalConversations: totalConversations ?? 0,
        totalMessages: totalMessages ?? 0,
        activeContracts,
        totalContractValue,
        disputes,
    };
}

export default async function SupervisorDashboard() {
    const data = await getSupervisorData();

    return (
        <div className="space-y-6">

            {/* KPI row */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[
                    { label: "Servicios", value: data.totalServices, icon: "🔄" },
                    { label: "Técnicos", value: data.totalCollaborators, icon: "👷" },
                    { label: "Contratos Activos", value: data.activeContracts, icon: "📄" },
                    { label: "Valor Contratos", value: `$${(data.totalContractValue / 1000).toFixed(0)}K`, icon: "💵" },
                    { label: "Conversaciones", value: data.totalConversations, icon: "💬" },
                    { label: "Mensajes", value: data.totalMessages, icon: "✉️" },
                ].map((kpi) => (
                    <div key={kpi.label} className="glass-card p-4 text-center">
                        <span className="text-xl block mb-1">{kpi.icon}</span>
                        <p className="text-xl font-bold font-mono">{kpi.value}</p>
                        <p className="text-xs text-muted">{kpi.label}</p>
                    </div>
                ))}
            </div>

            {/* Quick links */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Link href="/supervisor/chat" className="glass-card p-5 hover:glow transition-all group flex items-center gap-4">
                    <span className="text-3xl">💬</span>
                    <div>
                        <p className="font-semibold group-hover:text-primary-light transition-colors">Chats en Vivo</p>
                        <p className="text-xs text-muted">{data.totalConversations} conversaciones activas</p>
                    </div>
                </Link>
                <Link href="/supervisor/servicios" className="glass-card p-5 hover:glow transition-all group flex items-center gap-4">
                    <span className="text-3xl">📋</span>
                    <div>
                        <p className="font-semibold group-hover:text-primary-light transition-colors">Postulaciones</p>
                        <p className="text-xs text-muted">Gestionar asignaciones</p>
                    </div>
                </Link>
                <Link href="/admin/finanzas/reportes" className="glass-card p-5 hover:glow transition-all group flex items-center gap-4">
                    <span className="text-3xl">📊</span>
                    <div>
                        <p className="font-semibold group-hover:text-primary-light transition-colors">Reportes</p>
                        <p className="text-xs text-muted">Financieros y operativos</p>
                    </div>
                </Link>
                <div className="glass-card p-5 flex items-center gap-4 opacity-60 cursor-not-allowed">
                    <span className="text-3xl">⚠️</span>
                    <div>
                        <p className="font-semibold">Disputas</p>
                        <p className="text-xs text-muted">{data.disputes} abiertas · Próximamente</p>
                    </div>
                </div>
            </div>

            {/* Services table */}
            <div className="glass-card overflow-hidden">
                <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                    <h2 className="font-semibold text-sm">📋 Servicios Recientes</h2>
                    <Link href="/admin/servicios" className="text-xs text-primary-light hover:underline">Ver todos →</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border text-left text-xs text-muted">
                                <th className="px-4 py-2">Servicio</th>
                                <th className="px-4 py-2">Cliente</th>
                                <th className="px-4 py-2">Técnicos</th>
                                <th className="px-4 py-2">Tipo</th>
                                <th className="px-4 py-2">Estado</th>
                                <th className="px-4 py-2">Fecha</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.services.length === 0 && (
                                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted">Sin servicios registrados</td></tr>
                            )}
                            {data.services.map((s: any) => (
                                <tr key={s.id} className="border-b border-border/50 hover:bg-surface-2/50 transition-colors">
                                    <td className="px-4 py-2.5 font-medium max-w-[200px] truncate">
                                        {s.description || `#${s.id.slice(0, 8)}`}
                                    </td>
                                    <td className="px-4 py-2.5 text-muted">{s.client?.name ?? "—"}</td>
                                    <td className="px-4 py-2.5 text-muted text-xs">
                                        {s.collaborators?.length > 0
                                            ? s.collaborators.map((c: any) => c.profile?.full_name).filter(Boolean).join(", ") || "—"
                                            : "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {s.type ? (
                                            <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: `${s.type.color}30`, color: s.type.color }}>
                                                {s.type.name}
                                            </span>
                                        ) : "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {s.state ? (
                                            <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: `${s.state.color}30`, color: s.state.color }}>
                                                {s.state.name}
                                            </span>
                                        ) : "—"}
                                    </td>
                                    <td className="px-4 py-2.5 text-xs text-muted">
                                        {s.scheduledDate ? new Date(s.scheduledDate).toLocaleDateString("es-MX") : "—"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
