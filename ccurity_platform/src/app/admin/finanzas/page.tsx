import Link from "next/link";
import { UserNav } from "@/components/user-nav";
import { getContracts, getFinanceStats } from "@/lib/data/contracts";
import { getContractTypes } from "@/lib/data/contract-types";
import { createContractAction, updateContractStatusAction, deleteContractAction } from "./actions";
import { createClient } from "@/lib/supabase/server";

const statusColors: Record<string, string> = {
    DRAFT: "bg-gray-500/20 text-gray-300",
    PENDING_SIGNATURE: "bg-yellow-500/20 text-yellow-400",
    ACTIVE: "bg-green-500/20 text-green-400",
    COMPLETED: "bg-blue-500/20 text-blue-400",
    CANCELLED: "bg-red-500/20 text-red-400",
};

const statusLabels: Record<string, string> = {
    DRAFT: "Borrador",
    PENDING_SIGNATURE: "Pendiente firma",
    ACTIVE: "Activo",
    COMPLETED: "Completado",
    CANCELLED: "Cancelado",
};

async function getUsers() {
    const supabase = await createClient();
    const { data } = await supabase.from("users").select("id, name, email, role").order("name");
    return data ?? [];
}

export default async function FinanzasPage() {
    const [contracts, stats, users, contractTypes] = await Promise.all([
        getContracts(),
        getFinanceStats(),
        getUsers(),
        getContractTypes(),
    ]);

    // Separate clients and collaborators
    const clients = users.filter((u: any) => u.role === "CLIENT");
    const collaborators = users.filter((u: any) => u.role === "COLLABORATOR" || u.role === "COLAB");

    // Group contract types by service type for the form selector
    const typesByService = contractTypes.reduce<Record<string, { serviceName: string; serviceColor: string; types: typeof contractTypes }>>((acc, ct) => {
        const key = ct.serviceType?.name ?? "Sin tipo";
        if (!acc[key]) {
            acc[key] = {
                serviceName: key,
                serviceColor: ct.serviceType?.color ?? "#6B7280",
                types: [],
            };
        }
        acc[key].types.push(ct);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="text-muted hover:text-foreground transition-colors">
                        ← Regresar
                    </Link>
                    <h1 className="text-xl font-bold">💵 Finanzas y Contratos</h1>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/finanzas/tipos"
                        className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-surface-2 transition-colors"
                    >
                        📋 Tipos de contrato
                    </Link>
                    <Link
                        href="/admin/finanzas/reportes"
                        className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-surface-2 transition-colors"
                    >
                        📊 Reportes
                    </Link>
                    <UserNav />
                </div>
            </header>

            <div className="max-w-7xl mx-auto p-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                        { label: "Contratos", value: stats.totalContracts, icon: "📄" },
                        { label: "Activos", value: stats.activeContracts, icon: "✅" },
                        { label: "Ingresos", value: `$${stats.totalRevenue.toLocaleString("es-MX")}`, icon: "💰" },
                        { label: "Pendiente", value: `$${stats.pendingAmount.toLocaleString("es-MX")}`, icon: "⏳" },
                        { label: "Facturas", value: stats.totalInvoices, icon: "🧾" },
                    ].map((s) => (
                        <div key={s.label} className="glass-card p-4 text-center">
                            <span className="text-2xl">{s.icon}</span>
                            <p className="text-lg font-bold mt-1">{s.value}</p>
                            <p className="text-xs text-muted">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Create form */}
                <details className="glass-card">
                    <summary className="px-5 py-3 cursor-pointer font-medium text-sm hover:text-primary-light transition-colors list-none flex items-center gap-2">
                        <span>＋</span> Nuevo contrato
                    </summary>
                    <form action={createContractAction} className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border pt-4">
                        {/* Contract type selector */}
                        <div>
                            <label className="block text-xs font-medium mb-1">Tipo de contrato *</label>
                            <select name="contractTypeId" required className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm">
                                <option value="">Seleccionar tipo…</option>
                                {Object.values(typesByService).map((group) => (
                                    <optgroup key={group.serviceName} label={`🔹 ${group.serviceName}`}>
                                        {group.types.filter(t => t.isActive).map((ct) => (
                                            <option key={ct.id} value={ct.id}>{ct.name}</option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                        </div>

                        {/* Counterpart role */}
                        <div>
                            <label className="block text-xs font-medium mb-1">Tipo de contraparte *</label>
                            <select name="counterpartRole" required className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm">
                                <option value="CLIENT">Cliente (nosotros somos proveedor)</option>
                                <option value="PROVIDER">Colaborador (nosotros somos cliente)</option>
                            </select>
                        </div>

                        {/* Client / Collaborator selector */}
                        <div>
                            <label className="block text-xs font-medium mb-1">Cliente *</label>
                            <select name="clientId" required className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm">
                                <option value="">Seleccionar…</option>
                                {clients.length > 0 && (
                                    <optgroup label="👤 Clientes">
                                        {clients.map((c: any) => (
                                            <option key={c.id} value={c.id}>{c.name} — {c.email}</option>
                                        ))}
                                    </optgroup>
                                )}
                                {collaborators.length > 0 && (
                                    <optgroup label="🤝 Colaboradores">
                                        {collaborators.map((c: any) => (
                                            <option key={c.id} value={c.id}>{c.name} — {c.email}</option>
                                        ))}
                                    </optgroup>
                                )}
                            </select>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-xs font-medium mb-1">Título *</label>
                            <input name="title" required className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm" />
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-medium mb-1">Descripción</label>
                            <textarea name="description" rows={2} className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm" />
                        </div>

                        {/* Dates */}
                        <div>
                            <label className="block text-xs font-medium mb-1">Fecha de inicio</label>
                            <input name="startDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1">Fecha de fin</label>
                            <input name="endDate" type="date" className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm" />
                        </div>

                        {/* Submit */}
                        <div className="flex items-end">
                            <button type="submit" className="px-6 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer">
                                Crear contrato
                            </button>
                        </div>
                    </form>
                </details>

                {/* Contracts table */}
                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border text-left text-xs text-muted">
                                    <th className="px-4 py-3 font-medium">Título</th>
                                    <th className="px-4 py-3 font-medium">Tipo</th>
                                    <th className="px-4 py-3 font-medium">Cliente</th>
                                    <th className="px-4 py-3 font-medium">Inicio</th>
                                    <th className="px-4 py-3 font-medium">Estado</th>
                                    <th className="px-4 py-3 font-medium text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contracts.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-muted">
                                            Sin contratos. Crea el primero arriba.
                                        </td>
                                    </tr>
                                )}
                                {contracts.map((c) => (
                                    <tr key={c.id} className="border-b border-border/50 hover:bg-surface-2/50 transition-colors">
                                        <td className="px-4 py-3 font-medium">
                                            <Link href={`/admin/finanzas/${c.id}`} className="hover:text-primary-light transition-colors">
                                                {c.title}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3">
                                            {c.contractType ? (
                                                <span
                                                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                                                    style={{
                                                        backgroundColor: `${c.contractType.serviceType?.color ?? "#6B7280"}20`,
                                                        color: c.contractType.serviceType?.color ?? "#6B7280",
                                                    }}
                                                >
                                                    {c.contractType.name}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-muted">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-muted">{c.client?.name ?? "—"}</td>
                                        <td className="px-4 py-3 text-muted">{c.startDate ? new Date(c.startDate).toLocaleDateString("es-MX") : "—"}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[c.status] ?? ""}`}>
                                                {statusLabels[c.status] ?? c.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link href={`/admin/finanzas/${c.id}`} className="px-2 py-1 text-xs rounded hover:bg-surface-2 transition-colors">
                                                    👁
                                                </Link>
                                                {c.status === "DRAFT" && (
                                                    <form action={updateContractStatusAction} className="inline">
                                                        <input type="hidden" name="id" value={c.id} />
                                                        <input type="hidden" name="status" value="PENDING_SIGNATURE" />
                                                        <button type="submit" className="px-2 py-1 text-xs rounded hover:bg-yellow-500/20 text-yellow-400 transition-colors cursor-pointer">
                                                            Enviar a firma
                                                        </button>
                                                    </form>
                                                )}
                                                <form action={deleteContractAction} className="inline">
                                                    <input type="hidden" name="id" value={c.id} />
                                                    <button type="submit" className="px-2 py-1 text-xs rounded hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer">
                                                        🗑
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
            </div>
        </div>
    );
}
