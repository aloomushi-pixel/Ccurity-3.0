import Link from "next/link";
import { UserNav } from "@/components/user-nav";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";


async function getReportsData() {
    const supabase = await createClient();

    // Users by role
    const { data: profiles } = await supabase.from("profiles").select("role");
    const roleCounts: Record<string, number> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (profiles ?? []).forEach((p: any) => { roleCounts[p.role] = (roleCounts[p.role] || 0) + 1; });

    // Services by type and state
    const { data: services } = await supabase
        .from("services")
        .select("typeId, stateId, scheduledDate, type:service_types(name, color), state:service_states(name, color)");



    const typeStats: Record<string, { name: string; color: string; count: number }> = {};
    const stateStats: Record<string, { name: string; color: string; count: number }> = {};
    const monthlyServices: Record<string, number> = {};

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (services ?? []).forEach((s: any) => {
        if (s.type) {
            if (!typeStats[s.type.name]) typeStats[s.type.name] = { name: s.type.name, color: s.type.color, count: 0 };
            typeStats[s.type.name].count++;
        }
        if (s.state) {
            if (!stateStats[s.state.name]) stateStats[s.state.name] = { name: s.state.name, color: s.state.color, count: 0 };
            stateStats[s.state.name].count++;
        }
        if (s.scheduledDate) {
            const month = new Date(s.scheduledDate).toLocaleDateString("es-MX", { year: "numeric", month: "short" });
            monthlyServices[month] = (monthlyServices[month] || 0) + 1;
        }
    });

    // Financial data
    const { data: contracts } = await supabase.from("contracts").select("amount, status");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalContractValue = (contracts ?? []).reduce((s: number, c: any) => s + Number(c.amount), 0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activeContracts = (contracts ?? []).filter((c: any) => c.status === "active").length;

    const { data: payments } = await supabase.from("payments").select("amount, status, method");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalPaid = (payments ?? []).filter((p: any) => p.status === "completed").reduce((s: number, p: any) => s + Number(p.amount), 0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalPending = (payments ?? []).filter((p: any) => p.status === "pending").reduce((s: number, p: any) => s + Number(p.amount), 0);

    const methodStats: Record<string, number> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (payments ?? []).forEach((p: any) => {
        if (p.method) methodStats[p.method] = (methodStats[p.method] || 0) + 1;
    });

    const { data: invoices } = await supabase.from("invoices").select("amount, status");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalInvoiced = (invoices ?? []).reduce((s: number, i: any) => s + Number(i.amount), 0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const overdue = (invoices ?? []).filter((i: any) => i.status === "overdue").length;

    // Clients
    const { count: totalClients } = await supabase.from("clients").select("id", { count: "exact", head: true });
    const { count: totalQuotations } = await supabase.from("quotations").select("id", { count: "exact", head: true });
    const { data: quotations } = await supabase.from("quotations").select("total, status");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalQuotationValue = (quotations ?? []).reduce((s: number, q: any) => s + Number(q.total || 0), 0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const approvedQuotations = (quotations ?? []).filter((q: any) => q.status === "approved").length;

    // Messages
    const { count: totalMessages } = await supabase.from("messages").select("id", { count: "exact", head: true });

    return {
        roleCounts,
        totalUsers: (profiles ?? []).length,
        serviceCount: (services ?? []).length,
        typeStats: Object.values(typeStats).sort((a, b) => b.count - a.count),
        stateStats: Object.values(stateStats).sort((a, b) => b.count - a.count),
        monthlyServices,
        totalContractValue,
        activeContracts,
        totalContracts: (contracts ?? []).length,
        totalPaid,
        totalPending,
        methodStats,
        totalInvoiced,
        overdueInvoices: overdue,
        totalClients: totalClients ?? 0,
        totalQuotations: totalQuotations ?? 0,
        totalQuotationValue,
        approvedQuotations,
        totalMessages: totalMessages ?? 0,
    };
}


export const metadata: Metadata = {
  title: "Reportes — Ccurity Admin",
  description: "Reportes y analytics de la operación del negocio.",
};

export default async function ReportesPage() {
    const d = await getReportsData();
    const maxTypeCount = Math.max(...d.typeStats.map(t => t.count), 1);
    const maxStateCount = Math.max(...d.stateStats.map(t => t.count), 1);

    return (
        <div className="min-h-dvh bg-background">
            <header className="sticky top-0 z-50 glass-card rounded-none border-x-0 border-t-0 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/admin" className="text-muted hover:text-foreground transition-colors text-sm">
                        ← Admin
                    </Link>
                    <span className="text-border">|</span>
                    <h1 className="text-lg font-semibold">
                        📊 <span className="gradient-text">Reportes y Analytics</span>
                    </h1>
                </div>
                <UserNav />
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
                {/* KPI Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {[
                        { label: "Usuarios", value: d.totalUsers, icon: "👤" },
                        { label: "Clientes", value: d.totalClients, icon: "🏢" },
                        { label: "Servicios", value: d.serviceCount, icon: "🔧" },
                        { label: "Contratos", value: d.totalContracts, icon: "📄" },
                        { label: "Cotizaciones", value: d.totalQuotations, icon: "📋" },
                        { label: "Mensajes", value: d.totalMessages, icon: "💬" },
                    ].map(kpi => (
                        <div key={kpi.label} className="glass-card p-3 text-center">
                            <span className="text-lg">{kpi.icon}</span>
                            <p className="text-xl font-bold mt-1">{kpi.value}</p>
                            <p className="text-[10px] text-muted">{kpi.label}</p>
                        </div>
                    ))}
                </div>

                {/* Financial Overview */}
                <div className="glass-card p-5">
                    <h2 className="font-semibold text-sm mb-4">💰 Resumen Financiero</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-surface-2/50 rounded-lg p-3 text-center">
                            <p className="text-xs text-muted mb-1">Contratos (valor)</p>
                            <p className="text-lg font-bold font-mono gradient-text">${d.totalContractValue.toLocaleString("es-MX")}</p>
                        </div>
                        <div className="bg-surface-2/50 rounded-lg p-3 text-center">
                            <p className="text-xs text-muted mb-1">Cobrado</p>
                            <p className="text-lg font-bold font-mono text-green-400">${d.totalPaid.toLocaleString("es-MX")}</p>
                        </div>
                        <div className="bg-surface-2/50 rounded-lg p-3 text-center">
                            <p className="text-xs text-muted mb-1">Por Cobrar</p>
                            <p className="text-lg font-bold font-mono text-yellow-400">${d.totalPending.toLocaleString("es-MX")}</p>
                        </div>
                        <div className="bg-surface-2/50 rounded-lg p-3 text-center">
                            <p className="text-xs text-muted mb-1">Facturado</p>
                            <p className="text-lg font-bold font-mono text-cyan-400">${d.totalInvoiced.toLocaleString("es-MX")}</p>
                        </div>
                    </div>

                    {/* Conversion rates */}
                    <div className="grid grid-cols-3 gap-3 mt-4">
                        <div className="bg-surface-2/30 rounded-lg p-3">
                            <p className="text-xs text-muted">Contratos Activos</p>
                            <p className="text-lg font-bold">{d.activeContracts} <span className="text-xs text-muted font-normal">/ {d.totalContracts}</span></p>
                        </div>
                        <div className="bg-surface-2/30 rounded-lg p-3">
                            <p className="text-xs text-muted">Cotiz. Aprobadas</p>
                            <p className="text-lg font-bold">{d.approvedQuotations} <span className="text-xs text-muted font-normal">/ {d.totalQuotations}</span></p>
                        </div>
                        <div className="bg-surface-2/30 rounded-lg p-3">
                            <p className="text-xs text-muted">Facturas Vencidas</p>
                            <p className="text-lg font-bold text-red-400">{d.overdueInvoices}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Services by Type */}
                    <div className="glass-card p-5">
                        <h2 className="font-semibold text-sm mb-3">🔧 Servicios por Tipo</h2>
                        <div className="space-y-2">
                            {d.typeStats.length === 0 && <p className="text-sm text-muted">Sin datos</p>}
                            {d.typeStats.map(t => (
                                <div key={t.name}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }}></span>
                                            {t.name}
                                        </span>
                                        <span className="font-mono text-muted">{t.count}</span>
                                    </div>
                                    <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all" style={{ width: `${(t.count / maxTypeCount) * 100}%`, backgroundColor: t.color }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Services by State */}
                    <div className="glass-card p-5">
                        <h2 className="font-semibold text-sm mb-3">📊 Servicios por Estado</h2>
                        <div className="space-y-2">
                            {d.stateStats.length === 0 && <p className="text-sm text-muted">Sin datos</p>}
                            {d.stateStats.map(t => (
                                <div key={t.name}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }}></span>
                                            {t.name}
                                        </span>
                                        <span className="font-mono text-muted">{t.count}</span>
                                    </div>
                                    <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all" style={{ width: `${(t.count / maxStateCount) * 100}%`, backgroundColor: t.color }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Users by Role */}
                    <div className="glass-card p-5">
                        <h2 className="font-semibold text-sm mb-3">👥 Usuarios por Rol</h2>
                        <div className="space-y-3">
                            {Object.entries(d.roleCounts).map(([role, count]) => {
                                const colors: Record<string, string> = {
                                    admin: "#ef4444", supervisor: "#f59e0b", colaborador: "#3b82f6", cliente: "#10b981"
                                };
                                return (
                                    <div key={role}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="capitalize">{role}</span>
                                            <span className="font-mono text-muted">{count}</span>
                                        </div>
                                        <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full" style={{ width: `${(count / d.totalUsers) * 100}%`, backgroundColor: colors[role] || "#6366f1" }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="glass-card p-5">
                        <h2 className="font-semibold text-sm mb-3">💳 Métodos de Pago</h2>
                        <div className="space-y-3">
                            {Object.keys(d.methodStats).length === 0 && <p className="text-sm text-muted">Sin datos de pagos</p>}
                            {Object.entries(d.methodStats).map(([method, count]) => {
                                const icons: Record<string, string> = {
                                    transfer: "🏦", cash: "💵", card: "💳", check: "📝"
                                };
                                const total = Object.values(d.methodStats).reduce((s, v) => s + v, 0);
                                return (
                                    <div key={method} className="flex items-center justify-between bg-surface-2/50 rounded-lg p-3">
                                        <span className="text-sm flex items-center gap-2">
                                            <span>{icons[method] || "💰"}</span>
                                            <span className="capitalize">{method}</span>
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-mono font-bold">{count}</span>
                                            <span className="text-xs text-muted">({Math.round((count / total) * 100)}%)</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Quotation conversion */}
                <div className="glass-card p-5">
                    <h2 className="font-semibold text-sm mb-3">📋 Rendimiento de Cotizaciones</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-surface-2/50 rounded-lg p-3 text-center">
                            <p className="text-xs text-muted mb-1">Total</p>
                            <p className="text-xl font-bold">{d.totalQuotations}</p>
                        </div>
                        <div className="bg-surface-2/50 rounded-lg p-3 text-center">
                            <p className="text-xs text-muted mb-1">Aprobadas</p>
                            <p className="text-xl font-bold text-green-400">{d.approvedQuotations}</p>
                        </div>
                        <div className="bg-surface-2/50 rounded-lg p-3 text-center">
                            <p className="text-xs text-muted mb-1">Tasa de Conversión</p>
                            <p className="text-xl font-bold gradient-text">
                                {d.totalQuotations > 0 ? Math.round((d.approvedQuotations / d.totalQuotations) * 100) : 0}%
                            </p>
                        </div>
                        <div className="bg-surface-2/50 rounded-lg p-3 text-center">
                            <p className="text-xs text-muted mb-1">Valor Total</p>
                            <p className="text-lg font-bold font-mono">${d.totalQuotationValue.toLocaleString("es-MX")}</p>
                        </div>
                    </div>
                </div>

                {/* Quick links */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { label: "Finanzas", href: "/admin/finanzas/reportes", icon: "💵" },
                        { label: "Servicios", href: "/admin/servicios", icon: "🔧" },
                        { label: "Clientes", href: "/admin/clientes", icon: "🏢" },
                        { label: "Notificaciones", href: "/admin/notificaciones", icon: "🔔" },
                    ].map(link => (
                        <Link key={link.label} href={link.href} className="glass-card p-3 text-center group hover:glow transition-all">
                            <span className="text-xl">{link.icon}</span>
                            <p className="text-xs mt-1 group-hover:text-primary-light transition-colors">{link.label}</p>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
}
