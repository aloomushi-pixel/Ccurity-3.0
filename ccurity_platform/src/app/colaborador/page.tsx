import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";


async function getColaboradorData() {
    const supabase = await createClient();

    // Get services (all, since we don't have auth-scoped collaborator yet)
    const { data: services } = await supabase
        .from("services")
        .select(`*, type:service_types(name, color), state:service_states(name, color), client:clients(name)`)
        .order("createdAt", { ascending: false })
        .limit(10);

    const { count: totalServices } = await supabase
        .from("services")
        .select("id", { count: "exact", head: true });

    const { data: contracts } = await supabase
        .from("contracts")
        .select("id, title, amount, status, startDate, client:clients(name)")
        .in("status", ["active", "draft"])
        .order("createdAt", { ascending: false })
        .limit(5);

    const { data: pendingPayments } = await supabase
        .from("payments")
        .select("id, amount, method, status, createdAt")
        .eq("status", "pending")
        .limit(5);

    return {
        services: services ?? [],
        totalServices: totalServices ?? 0,
        contracts: contracts ?? [],
        pendingPayments: pendingPayments ?? [],
    };
}

const stateColors: Record<string, string> = {
    draft: "bg-gray-500/20 text-gray-300",
    active: "bg-green-500-20 text-green-400",
    completed: "bg-blue-500/20 text-blue-400",
    cancelled: "bg-red-500/20 text-red-400",
};


export const metadata: Metadata = {
  title: "Dashboard — Ccurity Colaborador",
  description: "App operativa para técnicos en campo. Gestión de servicios asignados.",
};

export default async function ColaboradorDashboard() {
    const data = await getColaboradorData();

    return (
        <div className="space-y-6 max-w-7xl mx-auto px-6 py-8">
            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="glass-card p-4 text-center">
                    <p className="text-2xl font-bold">{data.totalServices}</p>
                    <p className="text-xs text-muted">Servicios</p>
                </div>
                <div className="glass-card p-4 text-center">
                    <p className="text-2xl font-bold">{data.contracts.length}</p>
                    <p className="text-xs text-muted">Contratos Activos</p>
                </div>
                <div className="glass-card p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-400">{data.pendingPayments.length}</p>
                    <p className="text-xs text-muted">Pagos Pendientes</p>
                </div>
                <Link href="/colaborador/precios" className="glass-card p-4 text-center hover:glow transition-all">
                    <p className="text-2xl">💰</p>
                    <p className="text-xs text-muted">Mis Precios</p>
                </Link>
                <Link href="/colaborador/servicios" className="glass-card p-4 text-center hover:glow transition-all">
                    <p className="text-2xl">🔧</p>
                    <p className="text-xs text-muted">Postulaciones</p>
                </Link>
                <Link href="/admin/chat" className="glass-card p-4 text-center hover:glow transition-all">
                    <p className="text-2xl">💬</p>
                    <p className="text-xs text-muted">Chat</p>
                </Link>
            </div>

            {/* Assigned services */}
            <div className="glass-card overflow-hidden">
                <div className="px-5 py-3 border-b border-border">
                    <h2 className="font-semibold text-sm">📋 Servicios Asignados</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border text-left text-xs text-muted">
                                <th className="px-4 py-2">Servicio</th>
                                <th className="px-4 py-2">Cliente</th>
                                <th className="px-4 py-2">Tipo</th>
                                <th className="px-4 py-2">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.services.length === 0 && (
                                <tr><td colSpan={4} className="px-4 py-8 text-center text-muted">Sin servicios asignados</td></tr>
                            )}
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {data.services.map((s: any) => (
                                <tr key={s.id} className="border-b border-border/50 hover:bg-surface-2/50 transition-colors">
                                    <td className="px-4 py-2.5 font-medium">{s.description || `Servicio #${s.id.slice(0, 8)}`}</td>
                                    <td className="px-4 py-2.5 text-muted">{s.client?.name ?? "—"}</td>
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
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Two column: Contracts + Payments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contracts */}
                <div className="glass-card overflow-hidden">
                    <div className="px-5 py-3 border-b border-border">
                        <h2 className="font-semibold text-sm">📄 Mis Contratos</h2>
                    </div>
                    <div className="divide-y divide-border/50">
                        {data.contracts.length === 0 && (
                            <div className="px-5 py-6 text-center text-muted text-sm">Sin contratos</div>
                        )}
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {data.contracts.map((c: any) => (
                            <div key={c.id} className="px-5 py-3 flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-sm">{c.title}</p>
                                    <p className="text-xs text-muted">{c.client?.name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-mono text-sm">${Number(c.amount).toLocaleString("es-MX")}</p>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${stateColors[c.status]}`}>
                                        {c.status === "active" ? "Activo" : "Borrador"}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pending payments */}
                <div className="glass-card overflow-hidden">
                    <div className="px-5 py-3 border-b border-border">
                        <h2 className="font-semibold text-sm">💰 Pagos Pendientes</h2>
                    </div>
                    <div className="divide-y divide-border/50">
                        {data.pendingPayments.length === 0 && (
                            <div className="px-5 py-6 text-center text-muted text-sm">Sin pagos pendientes</div>
                        )}
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {data.pendingPayments.map((p: any) => (
                            <div key={p.id} className="px-5 py-3 flex items-center justify-between">
                                <div>
                                    <p className="font-mono text-sm font-medium">${Number(p.amount).toLocaleString("es-MX")}</p>
                                    <p className="text-xs text-muted capitalize">{p.method}</p>
                                </div>
                                <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-500/20 text-yellow-400">
                                    Pendiente
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
