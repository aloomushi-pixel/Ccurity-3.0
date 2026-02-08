import Link from "next/link";
import { UserNav } from "@/components/user-nav";
import {
    getServices,
    getServiceStats,
    getServiceTypes,
    getServiceStates,
    getCollaborators,
} from "@/lib/data/services";
import { getClients } from "@/lib/data/clients";
import {
    createServiceAction,
    updateServiceStateAction,
    deleteServiceAction,
} from "./actions";

export default async function ServiciosPage() {
    const [services, stats, types, states, clients, collaborators] =
        await Promise.all([
            getServices(),
            getServiceStats(),
            getServiceTypes(),
            getServiceStates(),
            getClients(),
            getCollaborators(),
        ]);

    const stateEntries = Object.entries(stats.byState);

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
                        🔧 <span className="gradient-text">Servicios</span>
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/servicios/tipos"
                        className="text-xs text-muted hover:text-foreground transition-colors"
                    >
                        ⚙️ Tipos & Estados
                    </Link>
                    <UserNav />
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="glass-card p-4">
                        <div className="text-xl mb-1">📊</div>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <div className="text-xs text-muted mt-0.5">Total Servicios</div>
                    </div>
                    {stateEntries.map(([name, count]) => (
                        <div key={name} className="glass-card p-4">
                            <div className="text-xl mb-1">🏷️</div>
                            <div className="text-2xl font-bold">{count}</div>
                            <div className="text-xs text-muted mt-0.5">{name}</div>
                        </div>
                    ))}
                </div>

                {/* New service form */}
                <details className="glass-card">
                    <summary className="cursor-pointer px-6 py-4 font-semibold text-sm select-none">
                        ➕ Crear Nuevo Servicio
                    </summary>
                    <form action={createServiceAction} className="px-6 pb-6 space-y-4 border-t border-border pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-muted mb-1">Título *</label>
                                <input
                                    name="title"
                                    required
                                    className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm focus:outline-none focus:border-primary"
                                    placeholder="Nombre del servicio"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-muted mb-1">Cliente *</label>
                                <select
                                    name="clientId"
                                    required
                                    className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm focus:outline-none focus:border-primary"
                                >
                                    <option value="">Seleccionar…</option>
                                    {clients.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-muted mb-1">Tipo de Servicio</label>
                                <select
                                    name="serviceTypeId"
                                    className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm focus:outline-none focus:border-primary"
                                >
                                    <option value="">Sin tipo</option>
                                    {types.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-muted mb-1">Estado Inicial</label>
                                <select
                                    name="serviceStateId"
                                    className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm focus:outline-none focus:border-primary"
                                >
                                    <option value="">Sin estado</option>
                                    {states.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-muted mb-1">Colaborador</label>
                                <select
                                    name="collaboratorId"
                                    className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm focus:outline-none focus:border-primary"
                                >
                                    <option value="">Sin asignar</option>
                                    {collaborators.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} ({c.role})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-muted mb-1">Fecha Programada</label>
                                <input
                                    name="scheduledDate"
                                    type="datetime-local"
                                    className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm focus:outline-none focus:border-primary"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs text-muted mb-1">Dirección</label>
                                <input
                                    name="address"
                                    className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm focus:outline-none focus:border-primary"
                                    placeholder="Dirección del servicio"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs text-muted mb-1">Descripción</label>
                                <textarea
                                    name="description"
                                    rows={2}
                                    className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm focus:outline-none focus:border-primary resize-none"
                                    placeholder="Descripción del servicio…"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="px-6 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
                        >
                            Crear Servicio
                        </button>
                    </form>
                </details>

                {/* Services table */}
                <section>
                    <h3 className="text-lg font-semibold mb-4">
                        Listado de Servicios
                        <span className="text-sm text-muted font-normal ml-2">{services.length}</span>
                    </h3>

                    {services.length === 0 ? (
                        <div className="glass-card p-12 text-center">
                            <div className="text-4xl mb-3">🔧</div>
                            <p className="text-muted text-lg mb-1">Sin servicios registrados</p>
                            <p className="text-sm text-muted">Crea tu primer servicio usando el formulario de arriba.</p>
                        </div>
                    ) : (
                        <div className="glass-card overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="text-left py-3 px-4 text-muted font-medium">Servicio</th>
                                            <th className="text-left py-3 px-4 text-muted font-medium">Cliente</th>
                                            <th className="text-left py-3 px-4 text-muted font-medium">Tipo</th>
                                            <th className="text-left py-3 px-4 text-muted font-medium">Estado</th>
                                            <th className="text-left py-3 px-4 text-muted font-medium">Colaborador</th>
                                            <th className="text-left py-3 px-4 text-muted font-medium">Fecha Prog.</th>
                                            <th className="text-right py-3 px-4 text-muted font-medium">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {services.map((s) => (
                                            <tr
                                                key={s.id}
                                                className="border-b border-border/50 hover:bg-surface-2/50 transition-colors"
                                            >
                                                <td className="py-3 px-4 font-medium">
                                                    <Link
                                                        href={`/admin/servicios/${s.id}`}
                                                        className="hover:text-primary-light transition-colors"
                                                    >
                                                        {s.title}
                                                    </Link>
                                                </td>
                                                <td className="py-3 px-4 text-muted">
                                                    {s.client?.name || "—"}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {s.serviceType ? (
                                                        <span
                                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                                                            style={{
                                                                backgroundColor: `${s.serviceType.color}20`,
                                                                color: s.serviceType.color ?? undefined,
                                                                borderColor: `${s.serviceType.color}40`,
                                                            }}
                                                        >
                                                            {s.serviceType.name}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-muted">—</span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {s.serviceState ? (
                                                        <span
                                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                                                            style={{
                                                                backgroundColor: `${s.serviceState.color}20`,
                                                                color: s.serviceState.color,
                                                                borderColor: `${s.serviceState.color}40`,
                                                            }}
                                                        >
                                                            {s.serviceState.name}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-muted">—</span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-muted text-xs">
                                                    {s.collaborator?.name || s.technician?.name || "Sin asignar"}
                                                </td>
                                                <td className="py-3 px-4 text-muted text-xs">
                                                    {s.scheduledDate
                                                        ? new Date(s.scheduledDate).toLocaleDateString("es-MX", {
                                                            day: "2-digit",
                                                            month: "short",
                                                            year: "numeric",
                                                        })
                                                        : "—"}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            href={`/admin/servicios/${s.id}`}
                                                            className="text-xs text-muted hover:text-primary-light transition-colors"
                                                            title="Ver detalle"
                                                        >
                                                            👁️
                                                        </Link>

                                                        {/* State change dropdown */}
                                                        {states.length > 0 && (
                                                            <form className="inline">
                                                                <input type="hidden" name="id" value={s.id} />
                                                                <select
                                                                    name="serviceStateId"
                                                                    className="text-xs bg-surface-2 border border-border rounded px-1.5 py-0.5"
                                                                    defaultValue={s.serviceState?.id || ""}
                                                                >
                                                                    {states.map((st) => (
                                                                        <option key={st.id} value={st.id}>
                                                                            {st.name}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                <button
                                                                    formAction={updateServiceStateAction}
                                                                    className="text-xs text-muted hover:text-emerald-400 transition-colors cursor-pointer ml-1"
                                                                    title="Cambiar estado"
                                                                >
                                                                    ✅
                                                                </button>
                                                            </form>
                                                        )}

                                                        <form className="inline">
                                                            <input type="hidden" name="id" value={s.id} />
                                                            <button
                                                                formAction={deleteServiceAction}
                                                                className="text-xs text-muted hover:text-red-400 transition-colors cursor-pointer"
                                                                title="Eliminar"
                                                            >
                                                                🗑️
                                                            </button>
                                                        </form>
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
