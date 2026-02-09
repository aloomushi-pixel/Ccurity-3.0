import Link from "next/link";

import { getServiceTypes, getServiceStates } from "@/lib/data/services";
import {
    createServiceTypeAction,
    deleteServiceTypeAction,
    createServiceStateAction,
    deleteServiceStateAction,
} from "../actions";

export default async function ServiceTypesPage() {
    const [types, states] = await Promise.all([getServiceTypes(), getServiceStates()]);

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Service Types */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">🏷️ Tipos de Servicio</h2>
                        <Link
                            href="/admin/servicios/tipos/plantillas"
                            className="text-xs text-primary-light hover:underline"
                        >
                            📋 Plantillas de Levantamiento →
                        </Link>
                    </div>

                    <form action={createServiceTypeAction} className="glass-card p-4 space-y-3">
                        <div className="grid grid-cols-3 gap-3">
                            <input
                                name="name"
                                required
                                placeholder="Nombre"
                                className="col-span-2 px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm focus:outline-none focus:border-primary"
                            />
                            <input
                                name="color"
                                type="color"
                                defaultValue="#6B7280"
                                className="w-full h-[38px] rounded-lg bg-surface-2 border border-border cursor-pointer"
                            />
                        </div>
                        <input
                            name="description"
                            placeholder="Descripción (opcional)"
                            className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm focus:outline-none focus:border-primary"
                        />
                        <button
                            type="submit"
                            className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
                        >
                            + Agregar Tipo
                        </button>
                    </form>

                    <div className="space-y-2">
                        {types.map((t) => (
                            <div
                                key={t.id}
                                className="glass-card p-4 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-4 h-4 rounded-full border-2"
                                        style={{
                                            backgroundColor: t.color || "#6B7280",
                                            borderColor: `${t.color || "#6B7280"}80`,
                                        }}
                                    />
                                    <div>
                                        <p className="font-medium text-sm">{t.name}</p>
                                        {t.description && (
                                            <p className="text-xs text-muted mt-0.5">{t.description}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/admin/servicios/tipos/plantillas?tipo=${t.id}`}
                                        className="text-xs text-muted hover:text-primary-light transition-colors"
                                        title="Configurar plantilla"
                                    >
                                        📋
                                    </Link>
                                    <form className="inline">
                                        <input type="hidden" name="id" value={t.id} />
                                        <button
                                            formAction={deleteServiceTypeAction}
                                            className="text-xs text-muted hover:text-red-400 transition-colors cursor-pointer"
                                            title="Eliminar"
                                        >
                                            🗑️
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ))}
                        {types.length === 0 && (
                            <p className="text-sm text-muted text-center py-4">Sin tipos registrados</p>
                        )}
                    </div>
                </section>

                {/* Service States */}
                <section className="space-y-4">
                    <h2 className="text-lg font-semibold">🔄 Estados de Servicio</h2>

                    <form action={createServiceStateAction} className="glass-card p-4 space-y-3">
                        <div className="grid grid-cols-3 gap-3">
                            <input
                                name="name"
                                required
                                placeholder="Nombre del estado"
                                className="col-span-2 px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm focus:outline-none focus:border-primary"
                            />
                            <input
                                name="color"
                                type="color"
                                defaultValue="#6B7280"
                                className="w-full h-[38px] rounded-lg bg-surface-2 border border-border cursor-pointer"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                name="description"
                                placeholder="Descripción (opcional)"
                                className="flex-1 px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm focus:outline-none focus:border-primary"
                            />
                            <label className="flex items-center gap-1.5 text-xs text-muted whitespace-nowrap cursor-pointer">
                                <input name="isFinal" type="checkbox" value="true" className="rounded" />
                                Es Final
                            </label>
                        </div>
                        <button
                            type="submit"
                            className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
                        >
                            + Agregar Estado
                        </button>
                    </form>

                    <div className="space-y-2">
                        {states.map((s) => (
                            <div
                                key={s.id}
                                className="glass-card p-4 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-4 h-4 rounded-full border-2"
                                        style={{
                                            backgroundColor: s.color,
                                            borderColor: `${s.color}80`,
                                        }}
                                    />
                                    <div>
                                        <p className="font-medium text-sm">
                                            {s.name}
                                            {s.isFinal && (
                                                <span className="ml-2 text-xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">
                                                    Final
                                                </span>
                                            )}
                                        </p>
                                        {s.description && (
                                            <p className="text-xs text-muted mt-0.5">{s.description}</p>
                                        )}
                                    </div>
                                </div>
                                <form className="inline">
                                    <input type="hidden" name="id" value={s.id} />
                                    <button
                                        formAction={deleteServiceStateAction}
                                        className="text-xs text-muted hover:text-red-400 transition-colors cursor-pointer"
                                        title="Eliminar"
                                    >
                                        🗑️
                                    </button>
                                </form>
                            </div>
                        ))}
                        {states.length === 0 && (
                            <p className="text-sm text-muted text-center py-4">Sin estados registrados</p>
                        )}
                    </div>
                </section>
            </div>
        </>
    );
}
