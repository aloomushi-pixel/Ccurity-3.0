import Link from "next/link";
import { UserNav } from "@/components/user-nav";
import { getContractTypes } from "@/lib/data/contract-types";
import { getServiceTypes } from "@/lib/data/services";
import {
    createContractTypeAction,
    deleteContractTypeAction,
    toggleContractTypeAction,
} from "./actions";

export default async function ContractTypesPage() {
    const [contractTypes, serviceTypes] = await Promise.all([
        getContractTypes(),
        getServiceTypes(),
    ]);

    // Group contract types by service type
    const grouped = serviceTypes.map((st) => ({
        serviceType: st,
        types: contractTypes.filter((ct) => ct.serviceTypeId === st.id),
    }));

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/finanzas" className="text-muted hover:text-foreground transition-colors">
                        ← Finanzas
                    </Link>
                    <h1 className="text-xl font-bold">📋 Tipos de Contrato</h1>
                </div>
                <UserNav />
            </header>

            <div className="max-w-5xl mx-auto p-6 space-y-6">
                {/* Info */}
                <div className="glass-card p-4 border-l-4 border-primary">
                    <p className="text-sm text-muted">
                        Los tipos de contrato se agrupan por <strong>tipo de servicio</strong>. Cada tipo de servicio puede tener uno o más tipos de contrato.
                    </p>
                </div>

                {/* Grouped sections */}
                {grouped.map(({ serviceType, types }) => (
                    <div key={serviceType.id} className="glass-card overflow-hidden">
                        {/* Service type header */}
                        <div className="px-5 py-3 border-b border-border flex items-center gap-3">
                            <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: serviceType.color ?? "#6B7280" }}
                            />
                            <h2 className="font-semibold text-sm flex-1">{serviceType.name}</h2>
                            <span className="text-xs text-muted">{types.length} tipo{types.length !== 1 ? "s" : ""}</span>
                        </div>

                        {/* Contract types list */}
                        {types.length > 0 && (
                            <div className="divide-y divide-border/50">
                                {types.map((ct) => (
                                    <div key={ct.id} className="px-5 py-3 flex items-center gap-3 group hover:bg-surface-2/50 transition-colors">
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium ${!ct.isActive ? "line-through text-muted" : ""}`}>
                                                {ct.name}
                                            </p>
                                            {ct.description && (
                                                <p className="text-xs text-muted mt-0.5 truncate">{ct.description}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <form action={toggleContractTypeAction} className="inline">
                                                <input type="hidden" name="id" value={ct.id} />
                                                <input type="hidden" name="isActive" value={String(ct.isActive)} />
                                                <button
                                                    type="submit"
                                                    className={`px-2 py-1 text-xs rounded transition-colors cursor-pointer ${ct.isActive
                                                            ? "hover:bg-yellow-500/20 text-yellow-400"
                                                            : "hover:bg-green-500/20 text-green-400"
                                                        }`}
                                                >
                                                    {ct.isActive ? "Desactivar" : "Activar"}
                                                </button>
                                            </form>
                                            <form action={deleteContractTypeAction} className="inline">
                                                <input type="hidden" name="id" value={ct.id} />
                                                <button type="submit" className="px-2 py-1 text-xs rounded text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer">
                                                    🗑
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add new contract type */}
                        <details className="border-t border-border">
                            <summary className="px-5 py-2 text-xs text-primary cursor-pointer hover:underline list-none">
                                + Agregar tipo de contrato
                            </summary>
                            <form action={createContractTypeAction} className="px-5 pb-4 grid grid-cols-1 md:grid-cols-3 gap-3 pt-3">
                                <input type="hidden" name="serviceTypeId" value={serviceType.id} />
                                <div>
                                    <label className="block text-xs font-medium mb-1">Nombre *</label>
                                    <input
                                        name="name"
                                        required
                                        placeholder="Ej: Contrato de implementación"
                                        className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1">Descripción</label>
                                    <input
                                        name="description"
                                        placeholder="Opcional"
                                        className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button
                                        type="submit"
                                        className="px-5 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
                                    >
                                        Agregar
                                    </button>
                                </div>
                            </form>
                        </details>
                    </div>
                ))}

                {serviceTypes.length === 0 && (
                    <div className="glass-card p-8 text-center text-muted">
                        <p className="text-sm">No hay tipos de servicio configurados.</p>
                        <Link href="/admin/servicios/tipos" className="text-primary text-xs mt-2 inline-block hover:underline">
                            Ir a configurar tipos de servicio →
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
