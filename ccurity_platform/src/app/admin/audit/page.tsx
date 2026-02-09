
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";


async function getAuditData() {
    const supabase = await createClient();

    // Recent auth events from Supabase (profiles + auth changes)
    const { data: recentProfiles } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, created_at")
        .order("created_at", { ascending: false })
        .limit(10);

    // Recent services created
    const { data: recentServices } = await supabase
        .from("services")
        .select("id, description, createdAt, client:clients(name)")
        .order("createdAt", { ascending: false })
        .limit(10);

    // Recent contracts
    const { data: recentContracts } = await supabase
        .from("contracts")
        .select("id, title, status, createdAt, client:clients(name)")
        .order("createdAt", { ascending: false })
        .limit(10);

    // Recent messages
    const { data: recentMessages } = await supabase
        .from("messages")
        .select("id, content, created_at, sender:profiles(full_name)")
        .order("created_at", { ascending: false })
        .limit(10);

    // Build unified timeline
    const timeline: { type: string; icon: string; title: string; detail: string; time: string }[] = [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (recentProfiles ?? []).forEach((p: any) => {
        timeline.push({
            type: "user",
            icon: "👤",
            title: `Usuario registrado: ${p.full_name || p.email}`,
            detail: `Rol: ${p.role}`,
            time: p.created_at,
        });
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (recentServices ?? []).forEach((s: any) => {
        timeline.push({
            type: "service",
            icon: "🔧",
            title: `Servicio creado: ${s.description || `#${s.id.slice(0, 8)}`}`,
            detail: `Cliente: ${s.client?.name ?? "—"}`,
            time: s.createdAt,
        });
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (recentContracts ?? []).forEach((c: any) => {
        timeline.push({
            type: "contract",
            icon: "📄",
            title: `Contrato: ${c.title}`,
            detail: `Estado: ${c.status} · Cliente: ${c.client?.name ?? "—"}`,
            time: c.createdAt,
        });
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (recentMessages ?? []).forEach((m: any) => {
        timeline.push({
            type: "message",
            icon: "💬",
            title: `Mensaje: ${(m.content || "").slice(0, 60)}${(m.content || "").length > 60 ? "..." : ""}`,
            detail: `De: ${m.sender?.full_name ?? "Sistema"}`,
            time: m.created_at,
        });
    });

    // Sort by time descending
    timeline.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return {
        timeline: timeline.slice(0, 30),
        counts: {
            users: recentProfiles?.length ?? 0,
            services: recentServices?.length ?? 0,
            contracts: recentContracts?.length ?? 0,
            messages: recentMessages?.length ?? 0,
        },
    };
}

const typeColors: Record<string, string> = {
    user: "bg-blue-500/20 text-blue-400",
    service: "bg-green-500/20 text-green-400",
    contract: "bg-purple-500/20 text-purple-400",
    message: "bg-cyan-500/20 text-cyan-400",
};

const typeLabels: Record<string, string> = {
    user: "Usuario",
    service: "Servicio",
    contract: "Contrato",
    message: "Mensaje",
};


export const metadata: Metadata = {
    title: "Auditoría — Ccurity Admin",
    description: "Registro de auditoría y trazabilidad de acciones del sistema.",
};

export default async function AuditPage() {
    const data = await getAuditData();

    return (
        <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Usuarios", value: data.counts.users, icon: "👤", color: "text-blue-400" },
                    { label: "Servicios", value: data.counts.services, icon: "🔧", color: "text-green-400" },
                    { label: "Contratos", value: data.counts.contracts, icon: "📄", color: "text-purple-400" },
                    { label: "Mensajes", value: data.counts.messages, icon: "💬", color: "text-cyan-400" },
                ].map((s) => (
                    <div key={s.label} className="glass-card p-4 text-center">
                        <span className="text-xl block mb-1">{s.icon}</span>
                        <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-xs text-muted">Recientes</p>
                    </div>
                ))}
            </div>

            {/* Timeline */}
            <div className="glass-card overflow-hidden">
                <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                    <h2 className="font-semibold text-sm">🕐 Timeline de Actividad</h2>
                    <span className="text-xs text-muted">{data.timeline.length} eventos</span>
                </div>

                <div className="divide-y divide-border/50">
                    {data.timeline.length === 0 && (
                        <div className="px-5 py-8 text-center text-muted text-sm">Sin actividad registrada</div>
                    )}
                    {data.timeline.map((event, idx) => (
                        <div key={idx} className="px-5 py-3 flex items-start gap-4 hover:bg-surface-2/50 transition-colors">
                            <span className="text-xl flex-shrink-0 mt-0.5">{event.icon}</span>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[event.type]}`}>
                                        {typeLabels[event.type]}
                                    </span>
                                    <span className="text-xs text-muted">
                                        {new Date(event.time).toLocaleString("es-MX", {
                                            day: "2-digit",
                                            month: "short",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                </div>
                                <p className="text-sm font-medium truncate">{event.title}</p>
                                <p className="text-xs text-muted">{event.detail}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
