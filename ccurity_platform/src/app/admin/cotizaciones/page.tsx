import Link from "next/link";
import { UserNav } from "@/components/user-nav";
import { getQuotations, getQuotationStats } from "@/lib/data/quotations";
import {
    updateQuotationStatusAction,
    duplicateQuotationAction,
} from "./actions";
import type { Metadata } from "next";

const statusLabels: Record<string, string> = {
    DRAFT: "Borrador",
    SENT: "Enviada",
    ACCEPTED: "Aceptada",
    REJECTED: "Rechazada",
    EXPIRED: "Expirada",
};

const statusColors: Record<string, string> = {
    DRAFT: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    SENT: "bg-sky-500/20 text-sky-400 border-sky-500/30",
    ACCEPTED: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    REJECTED: "bg-red-500/20 text-red-400 border-red-500/30",
    EXPIRED: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

const nextStatus: Record<string, string> = {
    DRAFT: "SENT",
    SENT: "ACCEPTED",
};


export const metadata: Metadata = {
    title: "Cotizaciones — Ccurity Admin",
    description: "Creación y seguimiento de cotizaciones.",
};

export default async function CotizacionesPage() {
    const [quotations, stats] = await Promise.all([
        getQuotations(),
        getQuotationStats(),
    ]);

    return (
        <div className="min-h-dvh bg-background">
            <header className="sticky top-0 z-50 glass-card rounded-none border-x-0 border-t-0 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin"
                        className="text-muted hover:text-foreground transition-colors text-sm"
                    >
                        ← Admin
                    </Link>
                    <span className="text-border">|</span>
                    <h1 className="text-lg font-semibold">
                        💰 <span className="gradient-text">Cotizaciones</span>
                    </h1>
                </div>
                <UserNav />
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    {[
                        { label: "Total", value: stats.total, icon: "📄" },
                        { label: "Borradores", value: stats.draft, icon: "✏️" },
                        { label: "Enviadas", value: stats.sent, icon: "📤" },
                        { label: "Aceptadas", value: stats.accepted, icon: "✅" },
                        {
                            label: "Valor Aceptado",
                            value: `$${stats.totalValue.toLocaleString("es-MX", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}`,
                            icon: "💰",
                        },
                    ].map((card) => (
                        <div key={card.label} className="glass-card p-4">
                            <div className="text-xl mb-1">{card.icon}</div>
                            <div className="text-xl font-bold">{card.value}</div>
                            <div className="text-xs text-muted mt-0.5">{card.label}</div>
                        </div>
                    ))}
                </div>

                {/* Quotations table */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Listado de Cotizaciones</h3>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted">
                                {quotations.length} cotizaciones
                            </span>
                            <Link
                                href="/admin/cotizaciones/nueva"
                                className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white text-sm font-medium hover:opacity-90 transition-opacity"
                            >
                                + Nueva Cotización
                            </Link>
                        </div>
                    </div>

                    {quotations.length === 0 ? (
                        <div className="glass-card p-12 text-center">
                            <div className="text-4xl mb-3">💰</div>
                            <p className="text-muted text-lg mb-1">
                                Sin cotizaciones registradas
                            </p>
                            <p className="text-sm text-muted">
                                Crea tu primera cotización a partir del catálogo CPU.
                            </p>
                            <Link
                                href="/admin/cotizaciones/nueva"
                                className="inline-block mt-4 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white text-sm hover:opacity-90 transition-opacity"
                            >
                                + Nueva Cotización
                            </Link>
                        </div>
                    ) : (
                        <div className="glass-card overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="text-left py-3 px-4 text-muted font-medium">
                                                Título
                                            </th>
                                            <th className="text-left py-3 px-4 text-muted font-medium">
                                                Cliente
                                            </th>
                                            <th className="text-left py-3 px-4 text-muted font-medium">
                                                Estado
                                            </th>
                                            <th className="text-center py-3 px-4 text-muted font-medium">
                                                Ver.
                                            </th>
                                            <th className="text-right py-3 px-4 text-muted font-medium">
                                                Total
                                            </th>
                                            <th className="text-left py-3 px-4 text-muted font-medium">
                                                Fecha
                                            </th>
                                            <th className="text-right py-3 px-4 text-muted font-medium">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {quotations.map((q) => (
                                            <tr
                                                key={q.id}
                                                className="border-b border-border/50 hover:bg-surface-2/50 transition-colors"
                                            >
                                                <td className="py-3 px-4">
                                                    <span className="font-medium">{q.title}</span>
                                                    {q.folio && (
                                                        <p className="text-xs text-muted mt-0.5">{q.folio}</p>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-muted">
                                                    {q.client?.name || "Sin asignar"}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[q.status]}`}
                                                    >
                                                        {statusLabels[q.status]}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className="text-xs bg-surface-2 px-2 py-0.5 rounded-full text-muted">
                                                        v{q.version}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-right font-mono font-medium">
                                                    $
                                                    {Number(q.total).toLocaleString("es-MX", {
                                                        minimumFractionDigits: 2,
                                                    })}
                                                </td>
                                                <td className="py-3 px-4 text-muted text-xs">
                                                    {new Date(q.createdAt).toLocaleDateString("es-MX", {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric",
                                                    })}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {/* PDF / Print */}
                                                        <Link
                                                            href={`/admin/cotizaciones/${q.id}/print`}
                                                            target="_blank"
                                                            className="text-xs text-muted hover:text-primary-light transition-colors"
                                                            title="Ver PDF"
                                                        >
                                                            🖨️
                                                        </Link>

                                                        {/* Duplicate as new version */}
                                                        <form className="inline">
                                                            <input type="hidden" name="id" value={q.id} />
                                                            <button
                                                                formAction={duplicateQuotationAction}
                                                                className="text-xs text-muted hover:text-accent transition-colors cursor-pointer"
                                                                title="Crear nueva versión"
                                                            >
                                                                📋
                                                            </button>
                                                        </form>

                                                        {/* Advance status */}
                                                        {nextStatus[q.status] && (
                                                            <form className="inline">
                                                                <input type="hidden" name="id" value={q.id} />
                                                                <input
                                                                    type="hidden"
                                                                    name="status"
                                                                    value={nextStatus[q.status]}
                                                                />
                                                                <button
                                                                    formAction={updateQuotationStatusAction}
                                                                    className="text-xs text-muted hover:text-emerald-400 transition-colors cursor-pointer"
                                                                    title={`Cambiar a ${statusLabels[nextStatus[q.status]]}`}
                                                                >
                                                                    ✅
                                                                </button>
                                                            </form>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
