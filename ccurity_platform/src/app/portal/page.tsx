import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";


async function getPortalData() {
    const supabase = await createClient();

    // Services overview
    const { data: services } = await supabase
        .from("services")
        .select(`id, description, scheduledDate, type:service_types(name, color), state:service_states(name, color)`)
        .order("createdAt", { ascending: false })
        .limit(5);

    const { count: totalServices } = await supabase
        .from("services")
        .select("id", { count: "exact", head: true });

    // Active contracts
    const { data: contracts } = await supabase
        .from("contracts")
        .select("id, title, amount, status, startDate, endDate")
        .eq("status", "active")
        .order("createdAt", { ascending: false })
        .limit(5);

    // Recent invoices
    const { data: invoices } = await supabase
        .from("invoices")
        .select("id, folio, amount, status, issuedAt")
        .order("issuedAt", { ascending: false })
        .limit(5);

    // Recent payments
    const { data: payments } = await supabase
        .from("payments")
        .select("id, amount, method, status, createdAt")
        .order("createdAt", { ascending: false })
        .limit(5);

    return {
        services: services ?? [],
        totalServices: totalServices ?? 0,
        contracts: contracts ?? [],
        invoices: invoices ?? [],
        payments: payments ?? [],
    };
}

const statusBadge: Record<string, string> = {
    active: "bg-green-500/20 text-green-400",
    completed: "bg-blue-500/20 text-blue-400",
    paid: "bg-green-500/20 text-green-400",
    pending: "bg-yellow-500/20 text-yellow-400",
    overdue: "bg-red-500/20 text-red-400",
    cancelled: "bg-red-500/20 text-red-400",
    sent: "bg-cyan-500/20 text-cyan-400",
    draft: "bg-gray-500/20 text-gray-300",
};

const statusLabel: Record<string, string> = {
    active: "Activo",
    completed: "Completado",
    paid: "Pagado",
    pending: "Pendiente",
    overdue: "Vencido",
    cancelled: "Cancelado",
    sent: "Enviada",
    draft: "Borrador",
};


export const metadata: Metadata = {
  title: "Portal del Cliente — Ccurity",
  description: "Portal de autoservicio para clientes. Seguimiento de servicios, pagos y gestión.",
};

export default async function ClientPortal() {
    const data = await getPortalData();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalPaid = data.payments.filter((p: any) => p.status === "completed").reduce((s: number, p: any) => s + Number(p.amount), 0);

    return (
        <div className="space-y-6 max-w-7xl mx-auto px-6 py-8">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card p-4 text-center">
                    <p className="text-2xl font-bold">{data.totalServices}</p>
                    <p className="text-xs text-muted">Servicios</p>
                </div>
                <div className="glass-card p-4 text-center">
                    <p className="text-2xl font-bold">{data.contracts.length}</p>
                    <p className="text-xs text-muted">Contratos Activos</p>
                </div>
                <div className="glass-card p-4 text-center">
                    <p className="text-2xl font-bold">{data.invoices.length}</p>
                    <p className="text-xs text-muted">Facturas</p>
                </div>
                <div className="glass-card p-4 text-center">
                    <p className="text-2xl font-bold font-mono">${totalPaid.toLocaleString("es-MX")}</p>
                    <p className="text-xs text-muted">Pagado</p>
                </div>
            </div>

            {/* My Services */}
            <div className="glass-card overflow-hidden">
                <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                    <h2 className="font-semibold text-sm">📦 Mis Servicios</h2>
                    <span className="text-xs text-muted">{data.totalServices} total</span>
                </div>
                <div className="divide-y divide-border/50">
                    {data.services.length === 0 && (
                        <div className="px-5 py-8 text-center text-muted text-sm">No tienes servicios activos</div>
                    )}
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {data.services.map((s: any) => (
                        <div key={s.id} className="px-5 py-3 flex items-center justify-between gap-4">
                            <div className="min-w-0 flex-1">
                                <p className="font-medium text-sm truncate">{s.description || `Servicio #${s.id.slice(0, 8)}`}</p>
                                {s.scheduledDate && (
                                    <p className="text-xs text-muted">
                                        📅 {new Date(s.scheduledDate).toLocaleDateString("es-MX")}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                {s.type && (
                                    <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: `${s.type.color}30`, color: s.type.color }}>
                                        {s.type.name}
                                    </span>
                                )}
                                {s.state && (
                                    <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: `${s.state.color}30`, color: s.state.color }}>
                                        {s.state.name}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Two column: Contracts + Invoices */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contracts */}
                <div className="glass-card overflow-hidden">
                    <div className="px-5 py-3 border-b border-border">
                        <h2 className="font-semibold text-sm">📄 Mis Contratos</h2>
                    </div>
                    <div className="divide-y divide-border/50">
                        {data.contracts.length === 0 && (
                            <div className="px-5 py-6 text-center text-muted text-sm">Sin contratos activos</div>
                        )}
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {data.contracts.map((c: any) => (
                            <div key={c.id} className="px-5 py-3">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="font-medium text-sm">{c.title}</p>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge[c.status]}`}>
                                        {statusLabel[c.status] ?? c.status}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-muted">
                                    <span className="font-mono">${Number(c.amount).toLocaleString("es-MX")}</span>
                                    {c.endDate && (
                                        <span>Vence: {new Date(c.endDate).toLocaleDateString("es-MX")}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Invoices */}
                <div className="glass-card overflow-hidden">
                    <div className="px-5 py-3 border-b border-border">
                        <h2 className="font-semibold text-sm">🧾 Mis Facturas</h2>
                    </div>
                    <div className="divide-y divide-border/50">
                        {data.invoices.length === 0 && (
                            <div className="px-5 py-6 text-center text-muted text-sm">Sin facturas</div>
                        )}
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {data.invoices.map((inv: any) => (
                            <div key={inv.id} className="px-5 py-3 flex items-center justify-between">
                                <div>
                                    <p className="font-mono text-sm font-medium">{inv.folio}</p>
                                    <p className="text-xs text-muted">
                                        {new Date(inv.issuedAt).toLocaleDateString("es-MX")}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-mono text-sm">${Number(inv.amount).toLocaleString("es-MX")}</p>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge[inv.status]}`}>
                                        {statusLabel[inv.status] ?? inv.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link href="/admin/chat" className="glass-card p-5 text-center hover:glow transition-all group">
                    <span className="text-3xl block mb-2">💬</span>
                    <p className="font-semibold text-sm group-hover:text-primary-light transition-colors">Soporte</p>
                    <p className="text-xs text-muted">Chat con tu técnico</p>
                </Link>
                <div className="glass-card p-5 text-center opacity-60 cursor-not-allowed">
                    <span className="text-3xl block mb-2">🚩</span>
                    <p className="font-semibold text-sm">Disputas</p>
                    <p className="text-xs text-muted">Próximamente</p>
                </div>
                <div className="glass-card p-5 text-center opacity-60 cursor-not-allowed">
                    <span className="text-3xl block mb-2">🔔</span>
                    <p className="font-semibold text-sm">Notificaciones</p>
                    <p className="text-xs text-muted">Próximamente</p>
                </div>
            </div>
        </div>
    );
}
