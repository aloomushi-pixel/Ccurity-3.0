import Link from "next/link";
import { getContracts, getFinanceStats } from "@/lib/data/contracts";

export default async function ReportesPage() {
    const [contracts, stats] = await Promise.all([
        getContracts(),
        getFinanceStats(),
    ]);

    // Aggregate by status
    const byStatus = contracts.reduce<Record<string, { count: number }>>((acc, c) => {
        if (!acc[c.status]) acc[c.status] = { count: 0 };
        acc[c.status].count++;
        return acc;
    }, {});

    // Top clients by contract count
    const clientTotalMap = new Map<string, { name: string; count: number }>();
    for (const c of contracts) {
        const name = (c as any).client?.name ?? "Sin cliente";
        const entry = clientTotalMap.get(name) ?? { name, count: 0 };
        entry.count++;
        clientTotalMap.set(name, entry);
    }
    const topClients = [...clientTotalMap.values()]
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    const statusLabels: Record<string, string> = {
        draft: "Borrador", active: "Activo", completed: "Completado", cancelled: "Cancelado",
    };

    const statusColors: Record<string, string> = {
        draft: "bg-gray-500", active: "bg-green-500", completed: "bg-blue-500", cancelled: "bg-red-500",
    };

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border px-6 py-4 flex items-center gap-4">
                <Link href="/admin/finanzas" className="text-muted hover:text-foreground transition-colors">
                    ← Finanzas
                </Link>
                <h1 className="text-xl font-bold">📊 Reportes Financieros</h1>
            </header>

            <div className="max-w-6xl mx-auto p-6 space-y-6">
                {/* KPI row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="glass-card p-5 text-center">
                        <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            ${stats.totalRevenue.toLocaleString("es-MX")}
                        </p>
                        <p className="text-sm text-muted mt-1">Ingresos Confirmados</p>
                    </div>
                    <div className="glass-card p-5 text-center">
                        <p className="text-3xl font-bold text-yellow-400">
                            ${stats.pendingAmount.toLocaleString("es-MX")}
                        </p>
                        <p className="text-sm text-muted mt-1">Pagos Pendientes</p>
                    </div>
                    <div className="glass-card p-5 text-center">
                        <p className="text-3xl font-bold">{stats.totalContracts}</p>
                        <p className="text-sm text-muted mt-1">Contratos Totales</p>
                    </div>
                    <div className="glass-card p-5 text-center">
                        <p className="text-3xl font-bold">{stats.totalInvoices}</p>
                        <p className="text-sm text-muted mt-1">Facturas Emitidas</p>
                    </div>
                </div>

                {/* Contracts by Status */}
                <div className="glass-card p-5">
                    <h2 className="font-semibold mb-4">📋 Contratos por Estado</h2>
                    <div className="space-y-3">
                        {Object.entries(byStatus).map(([status, info]) => {
                            const maxCount = Math.max(...Object.values(byStatus).map(v => v.count), 1);
                            const pct = Math.round((info.count / maxCount) * 100);
                            return (
                                <div key={status}>
                                    <div className="flex items-center justify-between text-sm mb-1">
                                        <span>{statusLabels[status] ?? status}</span>
                                        <span className="font-mono">{info.count} contratos</span>
                                    </div>
                                    <div className="h-3 rounded-full bg-surface-2 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${statusColors[status] ?? "bg-primary"} transition-all`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        {Object.keys(byStatus).length === 0 && (
                            <p className="text-muted text-sm">Sin datos para mostrar</p>
                        )}
                    </div>
                </div>

                {/* Top Clients */}
                <div className="glass-card overflow-hidden">
                    <div className="px-5 py-3 border-b border-border">
                        <h2 className="font-semibold text-sm">🏆 Top Clientes por Valor de Contratos</h2>
                    </div>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border text-left text-xs text-muted">
                                <th className="px-4 py-2">#</th>
                                <th className="px-4 py-2">Cliente</th>
                                <th className="px-4 py-2">Contratos</th>
                                <th className="px-4 py-2 text-right">Contratos</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topClients.length === 0 && (
                                <tr><td colSpan={4} className="px-4 py-6 text-center text-muted text-xs">Sin datos</td></tr>
                            )}
                            {topClients.map((c, i) => (
                                <tr key={c.name} className="border-b border-border/50">
                                    <td className="px-4 py-2 text-muted">{i + 1}</td>
                                    <td className="px-4 py-2 font-medium">{c.name}</td>
                                    <td className="px-4 py-2">{c.count}</td>
                                    <td className="px-4 py-2 text-right font-mono">{c.count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
