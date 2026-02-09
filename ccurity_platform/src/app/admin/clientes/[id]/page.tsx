import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

async function getClientDetail(id: string) {
    const supabase = await createClient();

    const { data: client } = await supabase
        .from("clients")
        .select("*")
        .eq("id", id)
        .single();

    if (!client) return null;

    const { data: contracts } = await supabase
        .from("contracts")
        .select("id, title, amount, status, startDate, endDate")
        .eq("clientId", id)
        .order("createdAt", { ascending: false });

    const { data: services } = await supabase
        .from("services")
        .select("id, description, scheduledDate, type:service_types(name, color), state:service_states(name, color)")
        .eq("clientId", id)
        .order("createdAt", { ascending: false });

    const { data: quotations } = await supabase
        .from("quotations")
        .select("id, folio, status, total, created_at")
        .eq("client_id", id)
        .order("created_at", { ascending: false });

    return {
        client,
        contracts: contracts ?? [],
        services: services ?? [],
        quotations: quotations ?? [],
    };
}

const statusBadge: Record<string, string> = {
    active: "bg-green-500/20 text-green-400",
    completed: "bg-blue-500/20 text-blue-400",
    draft: "bg-gray-500/20 text-gray-300",
    cancelled: "bg-red-500/20 text-red-400",
    pending: "bg-yellow-500/20 text-yellow-400",
    sent: "bg-cyan-500/20 text-cyan-400",
    approved: "bg-green-500/20 text-green-400",
};

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const data = await getClientDetail(id);
    if (!data) notFound();

    const { client } = data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalContractValue = data.contracts.reduce((s: number, c: any) => s + Number(c.amount), 0);

    return (
        <>
            {/* Client info card */}
            <div className="glass-card p-5">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                        {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">{client.name}</h2>
                        {client.company && <p className="text-sm text-muted">{client.company}</p>}
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <p className="text-xs text-muted mb-1">Email</p>
                        <p className="font-mono">{client.email || "—"}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted mb-1">Teléfono</p>
                        <p>{client.phone || "—"}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted mb-1">RFC</p>
                        <p className="font-mono">{client.rfc || "—"}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted mb-1">Dirección</p>
                        <p>{client.address || "—"}</p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card p-4 text-center">
                    <p className="text-2xl font-bold">{data.contracts.length}</p>
                    <p className="text-xs text-muted">Contratos</p>
                </div>
                <div className="glass-card p-4 text-center">
                    <p className="text-2xl font-bold font-mono">${totalContractValue.toLocaleString("es-MX")}</p>
                    <p className="text-xs text-muted">Valor Total</p>
                </div>
                <div className="glass-card p-4 text-center">
                    <p className="text-2xl font-bold">{data.services.length}</p>
                    <p className="text-xs text-muted">Servicios</p>
                </div>
                <div className="glass-card p-4 text-center">
                    <p className="text-2xl font-bold">{data.quotations.length}</p>
                    <p className="text-xs text-muted">Cotizaciones</p>
                </div>
            </div>

            {/* Contracts */}
            <div className="glass-card overflow-hidden">
                <div className="px-5 py-3 border-b border-border">
                    <h2 className="font-semibold text-sm">📄 Contratos</h2>
                </div>
                <div className="divide-y divide-border/50">
                    {data.contracts.length === 0 && (
                        <div className="px-5 py-6 text-center text-muted text-sm">Sin contratos</div>
                    )}
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {data.contracts.map((c: any) => (
                        <Link key={c.id} href={`/admin/finanzas/${c.id}`} className="block px-5 py-3 hover:bg-surface-2/50 transition-colors">
                            <div className="flex items-center justify-between">
                                <p className="font-medium text-sm">{c.title}</p>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge[c.status]}`}>
                                    {c.status}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted mt-1">
                                <span className="font-mono">${Number(c.amount).toLocaleString("es-MX")}</span>
                                {c.endDate && <span>Vence: {new Date(c.endDate).toLocaleDateString("es-MX")}</span>}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Services and Quotations side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Services */}
                <div className="glass-card overflow-hidden">
                    <div className="px-5 py-3 border-b border-border">
                        <h2 className="font-semibold text-sm">🔧 Servicios</h2>
                    </div>
                    <div className="divide-y divide-border/50">
                        {data.services.length === 0 && (
                            <div className="px-5 py-6 text-center text-muted text-sm">Sin servicios</div>
                        )}
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {data.services.map((s: any) => (
                            <div key={s.id} className="px-5 py-3 flex items-center justify-between">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium truncate">{s.description || `#${s.id.slice(0, 8)}`}</p>
                                    {s.scheduledDate && (
                                        <p className="text-xs text-muted">📅 {new Date(s.scheduledDate).toLocaleDateString("es-MX")}</p>
                                    )}
                                </div>
                                {s.state && (
                                    <span className="px-2 py-0.5 rounded-full text-xs ml-2" style={{ backgroundColor: `${s.state.color}30`, color: s.state.color }}>
                                        {s.state.name}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quotations */}
                <div className="glass-card overflow-hidden">
                    <div className="px-5 py-3 border-b border-border">
                        <h2 className="font-semibold text-sm">📋 Cotizaciones</h2>
                    </div>
                    <div className="divide-y divide-border/50">
                        {data.quotations.length === 0 && (
                            <div className="px-5 py-6 text-center text-muted text-sm">Sin cotizaciones</div>
                        )}
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {data.quotations.map((q: any) => (
                            <div key={q.id} className="px-5 py-3 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-mono font-medium">{q.folio || `#${q.id.slice(0, 8)}`}</p>
                                    <p className="text-xs text-muted">
                                        {new Date(q.created_at).toLocaleDateString("es-MX")}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-mono text-sm">${Number(q.total || 0).toLocaleString("es-MX")}</p>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge[q.status]}`}>
                                        {q.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
