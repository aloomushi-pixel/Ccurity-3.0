import Link from "next/link";
import { notFound } from "next/navigation";
import { UserNav } from "@/components/user-nav";
import { getServiceById, getServiceStates, getCollaborators } from "@/lib/data/services";
import { updateServiceStateAction, assignCollaboratorAction, completeLevantamientoAction } from "../actions";

export default async function ServiceDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const [service, states, collaborators] = await Promise.all([
        getServiceById(id),
        getServiceStates(),
        getCollaborators(),
    ]);

    if (!service) notFound();

    return (
        <div className="min-h-dvh bg-background">
            <header className="sticky top-0 z-50 glass-card rounded-none border-x-0 border-t-0 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/servicios"
                        className="text-muted hover:text-foreground transition-colors text-sm"
                    >
                        ← Servicios
                    </Link>
                    <span className="text-border">|</span>
                    <h1 className="text-lg font-semibold truncate max-w-md">
                        {service.title}
                    </h1>
                    {service.serviceType && (
                        <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                            style={{
                                backgroundColor: `${service.serviceType.color}20`,
                                color: service.serviceType.color ?? undefined,
                                borderColor: `${service.serviceType.color}40`,
                            }}
                        >
                            {service.serviceType.name}
                        </span>
                    )}
                    {service.serviceState && (
                        <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                            style={{
                                backgroundColor: `${service.serviceState.color}20`,
                                color: service.serviceState.color,
                                borderColor: `${service.serviceState.color}40`,
                            }}
                        >
                            {service.serviceState.name}
                        </span>
                    )}
                </div>
                <UserNav />
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
                {/* Top cards row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Client card */}
                    <div className="glass-card p-5">
                        <h3 className="text-xs text-muted uppercase tracking-wide mb-3">👤 Cliente</h3>
                        <p className="font-medium">{service.client?.name || "Sin asignar"}</p>
                        {service.client?.email && (
                            <p className="text-xs text-muted mt-0.5">{service.client.email}</p>
                        )}
                    </div>

                    {/* Collaborator / Technician */}
                    <div className="glass-card p-5">
                        <h3 className="text-xs text-muted uppercase tracking-wide mb-3">🤝 Equipo</h3>
                        <p className="text-sm">
                            <span className="text-muted">Colaborador:</span>{" "}
                            {service.collaborator?.name || "—"}
                        </p>
                        <p className="text-sm mt-1">
                            <span className="text-muted">Técnico:</span>{" "}
                            {service.technician?.name || "—"}
                        </p>
                        <form className="mt-3 flex items-center gap-2">
                            <input type="hidden" name="id" value={service.id} />
                            <select
                                name="collaboratorId"
                                className="text-xs bg-surface-2 border border-border rounded-lg px-2 py-1 flex-1"
                                defaultValue={service.collaborator?.id || ""}
                            >
                                <option value="">Sin asignar</option>
                                {collaborators.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                            <button
                                formAction={assignCollaboratorAction}
                                className="text-xs px-3 py-1 rounded-lg bg-surface-2 border border-border hover:border-primary transition-colors cursor-pointer"
                            >
                                Asignar
                            </button>
                        </form>
                    </div>

                    {/* Timeline */}
                    <div className="glass-card p-5">
                        <h3 className="text-xs text-muted uppercase tracking-wide mb-3">📅 Calendario</h3>
                        <div className="space-y-2 text-sm">
                            <p>
                                <span className="text-muted">Creado:</span>{" "}
                                {new Date(service.createdAt).toLocaleDateString("es-MX", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                })}
                            </p>
                            <p>
                                <span className="text-muted">Programado:</span>{" "}
                                {service.scheduledDate
                                    ? new Date(service.scheduledDate).toLocaleDateString("es-MX", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })
                                    : "—"}
                            </p>
                            <p>
                                <span className="text-muted">Completado:</span>{" "}
                                {service.completedDate
                                    ? new Date(service.completedDate).toLocaleDateString("es-MX", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                    })
                                    : "—"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Completar Levantamiento Button */}
                {service.serviceState?.name === "Levantamiento" && (
                    <div className="glass-card p-5 border-l-4 border-l-accent">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-semibold mb-1">📋 Levantamiento en Progreso</h3>
                                <p className="text-xs text-muted">
                                    Al completar, se generarán los conceptos a partir de la plantilla del tipo de servicio
                                    y el servicio se abrirá para postulación.
                                </p>
                            </div>
                            <form>
                                <input type="hidden" name="id" value={service.id} />
                                <button
                                    formAction={completeLevantamientoAction}
                                    className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-accent to-primary text-white text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap"
                                >
                                    ✅ Completar Levantamiento
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* State transition */}
                {states.length > 0 && (
                    <div className="glass-card p-5">
                        <h3 className="text-xs text-muted uppercase tracking-wide mb-3">🔄 Transición de Estado</h3>
                        <div className="flex flex-wrap gap-2">
                            {states.map((st) => {
                                const isActive = st.id === service.serviceState?.id;
                                return (
                                    <form key={st.id} className="inline">
                                        <input type="hidden" name="id" value={service.id} />
                                        <input type="hidden" name="serviceStateId" value={st.id} />
                                        <button
                                            formAction={updateServiceStateAction}
                                            disabled={isActive}
                                            className={`px-4 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${isActive
                                                ? "opacity-100 ring-2 ring-offset-2 ring-offset-background"
                                                : "opacity-60 hover:opacity-100"
                                                }`}
                                            style={{
                                                backgroundColor: `${st.color}20`,
                                                color: st.color,
                                                borderColor: `${st.color}40`,
                                                ...(isActive ? { ringColor: st.color } : {}),
                                            }}
                                        >
                                            {st.name}
                                            {st.isFinal && " (Final)"}
                                        </button>
                                    </form>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Description & Address */}
                {(service.description || service.address) && (
                    <div className="glass-card p-5">
                        <h3 className="text-xs text-muted uppercase tracking-wide mb-3">📝 Detalles</h3>
                        {service.description && <p className="text-sm mb-2">{service.description}</p>}
                        {service.address && (
                            <p className="text-sm text-muted">📍 {service.address}</p>
                        )}
                        {service.notes && (
                            <p className="text-sm text-muted mt-2 italic">{service.notes}</p>
                        )}
                    </div>
                )}

                {/* Service Items */}
                {service.items.length > 0 && (
                    <div className="glass-card overflow-hidden">
                        <div className="px-5 py-4 border-b border-border">
                            <h3 className="text-sm font-semibold">📦 Conceptos del Servicio</h3>
                        </div>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-2 px-4 text-muted font-medium text-xs">Concepto</th>
                                    <th className="text-left py-2 px-4 text-muted font-medium text-xs">Categoría</th>
                                    <th className="text-right py-2 px-4 text-muted font-medium text-xs">Cant.</th>
                                    <th className="text-right py-2 px-4 text-muted font-medium text-xs">Precio</th>
                                    <th className="text-right py-2 px-4 text-muted font-medium text-xs">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {service.items.map((item) => (
                                    <tr key={item.id} className="border-b border-border/30">
                                        <td className="py-2 px-4">{item.concept?.title || "—"}</td>
                                        <td className="py-2 px-4 text-muted text-xs">{item.concept?.category || "—"}</td>
                                        <td className="py-2 px-4 text-right">{item.quantity}</td>
                                        <td className="py-2 px-4 text-right font-mono">
                                            ${Number(item.price).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="py-2 px-4 text-right font-mono font-medium">
                                            ${(item.quantity * Number(item.price)).toLocaleString("es-MX", {
                                                minimumFractionDigits: 2,
                                            })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Reports */}
                {service.reports.length > 0 && (
                    <div className="glass-card p-5">
                        <h3 className="text-xs text-muted uppercase tracking-wide mb-3">
                            📋 Reportes ({service.reports.length})
                        </h3>
                        <div className="space-y-4">
                            {service.reports.map((r) => (
                                <div key={r.id} className="bg-surface-2/50 rounded-lg p-4 border border-border/50">
                                    <p className="text-sm font-medium mb-1">{r.workPerformed}</p>
                                    {r.materialsUsed && (
                                        <p className="text-xs text-muted">
                                            Materiales: {r.materialsUsed}
                                        </p>
                                    )}
                                    {r.notes && <p className="text-xs text-muted mt-1 italic">{r.notes}</p>}
                                    {r.photoUrls && r.photoUrls.length > 0 && (
                                        <div className="flex gap-2 mt-2">
                                            {r.photoUrls.map((url, i) => (
                                                <a
                                                    key={i}
                                                    href={url}
                                                    target="_blank"
                                                    className="text-xs text-primary-light hover:underline"
                                                >
                                                    📷 Foto {i + 1}
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                    <p className="text-xs text-muted mt-2">
                                        {new Date(r.createdAt).toLocaleDateString("es-MX", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Evidence photos */}
                {service.evidence.length > 0 && (
                    <div className="glass-card p-5">
                        <h3 className="text-xs text-muted uppercase tracking-wide mb-3">
                            📸 Evidencias Fotográficas ({service.evidence.length})
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {service.evidence.map((e) => (
                                <a
                                    key={e.id}
                                    href={e.photoUrl}
                                    target="_blank"
                                    className="block bg-surface-2/50 rounded-lg border border-border/50 overflow-hidden hover:border-primary/50 transition-colors"
                                >
                                    <div className="aspect-square bg-surface-2 flex items-center justify-center text-2xl">
                                        📷
                                    </div>
                                    {e.caption && (
                                        <p className="text-xs text-muted p-2 truncate">{e.caption}</p>
                                    )}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
