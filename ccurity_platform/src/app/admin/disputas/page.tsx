import Link from "next/link";
import { UserNav } from "@/components/user-nav";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function getDisputasData() {
    const supabase = await createClient();

    // Get services with disputes (we'll track disputes via a 'disputed' concept)
    // For now, we simulate disputes from services and their related data
    const { data: services } = await supabase
        .from("services")
        .select("id, description, scheduledDate, createdAt, client:clients(id, name), state:service_states(name, color), type:service_types(name)")
        .order("createdAt", { ascending: false });

    // Messages that might contain dispute keywords
    const { data: recentMessages } = await supabase
        .from("messages")
        .select("id, content, created_at, sender:profiles(full_name, role), conversation:conversations(id)")
        .order("created_at", { ascending: false })
        .limit(20);

    // Contracts with issues
    const { data: contracts } = await supabase
        .from("contracts")
        .select("id, title, status, amount, client:clients(name)")
        .in("status", ["cancelled", "draft"])
        .order("createdAt", { ascending: false })
        .limit(10);

    // Overdue invoices as potential disputes
    const now = new Date();
    const { data: overdueInvoices } = await supabase
        .from("invoices")
        .select("id, folio, amount, dueDate, status, contract:contracts(title, client:clients(name))")
        .eq("status", "sent")
        .lt("dueDate", now.toISOString())
        .order("dueDate", { ascending: true })
        .limit(10);

    return {
        services: services ?? [],
        recentMessages: recentMessages ?? [],
        problemContracts: contracts ?? [],
        overdueInvoices: overdueInvoices ?? [],
    };
}

const priorityColors: Record<string, string> = {
    alta: "bg-red-500/20 text-red-400 border-red-500/30",
    media: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    baja: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

export default async function DisputasPage() {
    const data = await getDisputasData();

    const totalIssues = data.problemContracts.length + data.overdueInvoices.length;

    return (
        <div className="min-h-dvh bg-background">
            <header className="sticky top-0 z-50 glass-card rounded-none border-x-0 border-t-0 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/admin" className="text-muted hover:text-foreground transition-colors text-sm">
                        ← Admin
                    </Link>
                    <span className="text-border">|</span>
                    <h1 className="text-lg font-semibold">
                        ⚖️ <span className="gradient-text">Disputas y Resoluciones</span>
                    </h1>
                </div>
                <UserNav />
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="glass-card p-4 text-center">
                        <p className="text-2xl font-bold text-red-400">{totalIssues}</p>
                        <p className="text-xs text-muted">Incidencias Activas</p>
                    </div>
                    <div className="glass-card p-4 text-center">
                        <p className="text-2xl font-bold text-orange-400">{data.overdueInvoices.length}</p>
                        <p className="text-xs text-muted">Facturas Vencidas</p>
                    </div>
                    <div className="glass-card p-4 text-center">
                        <p className="text-2xl font-bold text-yellow-400">{data.problemContracts.length}</p>
                        <p className="text-xs text-muted">Contratos Problemáticos</p>
                    </div>
                    <div className="glass-card p-4 text-center">
                        <p className="text-2xl font-bold">{data.services.length}</p>
                        <p className="text-xs text-muted">Servicios Totales</p>
                    </div>
                </div>

                {/* Overdue Invoices as disputes */}
                {data.overdueInvoices.length > 0 && (
                    <div className="glass-card overflow-hidden border-red-500/20">
                        <div className="px-5 py-3 border-b border-border bg-red-500/5 flex items-center justify-between">
                            <h2 className="font-semibold text-sm text-red-400">🚨 Disputas por Cobro — Facturas Vencidas</h2>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors.alta}`}>Alta Prioridad</span>
                        </div>
                        <div className="divide-y divide-border/50">
                            {data.overdueInvoices.map((inv: any) => {
                                const daysOverdue = Math.floor((Date.now() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24));
                                return (
                                    <div key={inv.id} className="px-5 py-3 flex items-center justify-between hover:bg-surface-2/30 transition-colors">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-mono font-medium">{inv.folio}</p>
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">
                                                    {daysOverdue} días vencida
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted mt-0.5">{inv.contract?.title} · {inv.contract?.client?.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-mono text-sm font-bold text-red-400">${Number(inv.amount).toLocaleString("es-MX")}</p>
                                            <p className="text-xs text-muted">Venció: {new Date(inv.dueDate).toLocaleDateString("es-MX")}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Problem contracts */}
                {data.problemContracts.length > 0 && (
                    <div className="glass-card overflow-hidden border-yellow-500/20">
                        <div className="px-5 py-3 border-b border-border bg-yellow-500/5 flex items-center justify-between">
                            <h2 className="font-semibold text-sm text-yellow-400">⚠️ Contratos con Incidencias</h2>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors.media}`}>Media Prioridad</span>
                        </div>
                        <div className="divide-y divide-border/50">
                            {data.problemContracts.map((c: any) => (
                                <Link key={c.id} href={`/admin/finanzas/${c.id}`} className="block px-5 py-3 hover:bg-surface-2/30 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium">{c.title}</p>
                                            <p className="text-xs text-muted">{c.client?.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-mono text-sm">${Number(c.amount).toLocaleString("es-MX")}</p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === "cancelled" ? "bg-red-500/20 text-red-400" : "bg-gray-500/20 text-gray-400"
                                                }`}>{c.status}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recent Messages Feed */}
                <div className="glass-card overflow-hidden">
                    <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                        <h2 className="font-semibold text-sm">💬 Últimos Mensajes (Monitoreo)</h2>
                        <Link href="/admin/chat" className="text-xs text-primary-light hover:underline">Ir al Chat →</Link>
                    </div>
                    <div className="divide-y divide-border/50 max-h-80 overflow-y-auto">
                        {data.recentMessages.length === 0 && (
                            <div className="px-5 py-6 text-center text-muted text-sm">Sin mensajes recientes</div>
                        )}
                        {data.recentMessages.map((m: any) => (
                            <div key={m.id} className="px-5 py-2.5 hover:bg-surface-2/30 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${m.sender?.role === "admin" ? "bg-red-500/20 text-red-400" :
                                                m.sender?.role === "supervisor" ? "bg-yellow-500/20 text-yellow-400" :
                                                    m.sender?.role === "colaborador" ? "bg-blue-500/20 text-blue-400" :
                                                        "bg-green-500/20 text-green-400"
                                            }`}>{m.sender?.role || "—"}</span>
                                        <span className="text-xs font-medium truncate">{m.sender?.full_name || "Anon"}</span>
                                    </div>
                                    <span className="text-[10px] text-muted flex-shrink-0 ml-2">{new Date(m.created_at).toLocaleString("es-MX", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}</span>
                                </div>
                                <p className="text-xs text-muted mt-1 truncate">{m.content}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { label: "Chat en Vivo", href: "/admin/chat", icon: "💬" },
                        { label: "Notificaciones", href: "/admin/notificaciones", icon: "🔔" },
                        { label: "Clientes", href: "/admin/clientes", icon: "🏢" },
                        { label: "Finanzas", href: "/admin/finanzas", icon: "💵" },
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
