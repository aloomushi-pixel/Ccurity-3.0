import Link from "next/link";
import { UserNav } from "@/components/user-nav";
import { createClient } from "@/lib/supabase/server";

async function getNotificationsData() {
    const supabase = await createClient();

    // Upcoming services (scheduled in the next 7 days)
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const { data: upcomingServices } = await supabase
        .from("services")
        .select("id, description, scheduledDate, client:clients(name), state:service_states(name, color)")
        .gte("scheduledDate", now.toISOString())
        .lte("scheduledDate", nextWeek.toISOString())
        .order("scheduledDate", { ascending: true })
        .limit(10);

    // Contracts about to expire (next 30 days)
    const next30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const { data: expiringContracts } = await supabase
        .from("contracts")
        .select("id, title, endDate, amount, client:clients(name)")
        .eq("status", "active")
        .gte("endDate", now.toISOString())
        .lte("endDate", next30.toISOString())
        .order("endDate", { ascending: true })
        .limit(10);

    // Overdue invoices
    const { data: overdueInvoices } = await supabase
        .from("invoices")
        .select("id, folio, amount, dueDate, contract:contracts(title, client:clients(name))")
        .eq("status", "sent")
        .lt("dueDate", now.toISOString())
        .order("dueDate", { ascending: true })
        .limit(10);

    // Pending payments
    const { data: pendingPayments } = await supabase
        .from("payments")
        .select("id, amount, method, status, contract:contracts(title, client:clients(name))")
        .eq("status", "pending")
        .order("createdAt", { ascending: false })
        .limit(10);

    return {
        upcomingServices: upcomingServices ?? [],
        expiringContracts: expiringContracts ?? [],
        overdueInvoices: overdueInvoices ?? [],
        pendingPayments: pendingPayments ?? [],
    };
}

export default async function NotificacionesPage() {
    const data = await getNotificationsData();

    const totalAlerts = data.overdueInvoices.length + data.expiringContracts.length;
    const totalReminders = data.upcomingServices.length + data.pendingPayments.length;

    return (
        <div className="min-h-dvh bg-background">
            <header className="sticky top-0 z-50 glass-card rounded-none border-x-0 border-t-0 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/admin" className="text-muted hover:text-foreground transition-colors text-sm">
                        ← Admin
                    </Link>
                    <span className="text-border">|</span>
                    <h1 className="text-lg font-semibold">
                        🔔 <span className="gradient-text">Notificaciones y Recordatorios</span>
                    </h1>
                </div>
                <UserNav />
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="glass-card p-4 text-center">
                        <p className="text-2xl font-bold text-red-400">{totalAlerts}</p>
                        <p className="text-xs text-muted">Alertas</p>
                    </div>
                    <div className="glass-card p-4 text-center">
                        <p className="text-2xl font-bold text-yellow-400">{totalReminders}</p>
                        <p className="text-xs text-muted">Recordatorios</p>
                    </div>
                    <div className="glass-card p-4 text-center">
                        <p className="text-2xl font-bold">{data.upcomingServices.length}</p>
                        <p className="text-xs text-muted">Servicios Próximos</p>
                    </div>
                    <div className="glass-card p-4 text-center">
                        <p className="text-2xl font-bold">{data.overdueInvoices.length}</p>
                        <p className="text-xs text-muted">Facturas Vencidas</p>
                    </div>
                </div>

                {/* Overdue invoices — critical */}
                {data.overdueInvoices.length > 0 && (
                    <div className="glass-card overflow-hidden border-red-500/30">
                        <div className="px-5 py-3 border-b border-border bg-red-500/10">
                            <h2 className="font-semibold text-sm text-red-400">🚨 Facturas Vencidas</h2>
                        </div>
                        <div className="divide-y divide-border/50">
                            {data.overdueInvoices.map((inv: any) => (
                                <div key={inv.id} className="px-5 py-3 flex items-center justify-between">
                                    <div>
                                        <p className="font-mono text-sm font-medium">{inv.folio}</p>
                                        <p className="text-xs text-muted">{inv.contract?.title} · {inv.contract?.client?.name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-mono text-sm text-red-400">${Number(inv.amount).toLocaleString("es-MX")}</p>
                                        <p className="text-xs text-muted">Venció: {new Date(inv.dueDate).toLocaleDateString("es-MX")}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Expiring contracts */}
                {data.expiringContracts.length > 0 && (
                    <div className="glass-card overflow-hidden border-orange-500/30">
                        <div className="px-5 py-3 border-b border-border bg-orange-500/10">
                            <h2 className="font-semibold text-sm text-orange-400">⚠️ Contratos por Vencer (30 días)</h2>
                        </div>
                        <div className="divide-y divide-border/50">
                            {data.expiringContracts.map((c: any) => (
                                <Link key={c.id} href={`/admin/finanzas/${c.id}`} className="block px-5 py-3 hover:bg-surface-2/50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium">{c.title}</p>
                                            <p className="text-xs text-muted">{c.client?.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-mono text-sm">${Number(c.amount).toLocaleString("es-MX")}</p>
                                            <p className="text-xs text-orange-400">Vence: {new Date(c.endDate).toLocaleDateString("es-MX")}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Upcoming services */}
                <div className="glass-card overflow-hidden">
                    <div className="px-5 py-3 border-b border-border">
                        <h2 className="font-semibold text-sm">📅 Servicios Próximos (7 días)</h2>
                    </div>
                    <div className="divide-y divide-border/50">
                        {data.upcomingServices.length === 0 && (
                            <div className="px-5 py-6 text-center text-muted text-sm">Sin servicios programados esta semana</div>
                        )}
                        {data.upcomingServices.map((s: any) => (
                            <div key={s.id} className="px-5 py-3 flex items-center justify-between">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium truncate">{s.description || `#${s.id.slice(0, 8)}`}</p>
                                    <p className="text-xs text-muted">{s.client?.name}</p>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    {s.state && (
                                        <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: `${s.state.color}30`, color: s.state.color }}>
                                            {s.state.name}
                                        </span>
                                    )}
                                    <span className="text-xs text-muted font-mono">
                                        {new Date(s.scheduledDate).toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pending payments */}
                <div className="glass-card overflow-hidden">
                    <div className="px-5 py-3 border-b border-border">
                        <h2 className="font-semibold text-sm">💰 Pagos Pendientes por Confirmar</h2>
                    </div>
                    <div className="divide-y divide-border/50">
                        {data.pendingPayments.length === 0 && (
                            <div className="px-5 py-6 text-center text-muted text-sm">Sin pagos pendientes</div>
                        )}
                        {data.pendingPayments.map((p: any) => (
                            <div key={p.id} className="px-5 py-3 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium">{p.contract?.title || "Contrato"}</p>
                                    <p className="text-xs text-muted">{p.contract?.client?.name} · {p.method}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-mono text-sm font-medium">${Number(p.amount).toLocaleString("es-MX")}</p>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">Pendiente</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
