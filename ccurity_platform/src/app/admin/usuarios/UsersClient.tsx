"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Profile } from "@/lib/data/profiles";
import {
    updateUserAction,
    toggleUserActiveAction,
    deleteUserAction,
    inviteUserAction,
    exportUsersCsvAction,
    bulkChangeRoleAction,
    bulkToggleActiveAction,
    bulkDeleteAction,
} from "./actions";

/* ─── Types ─────────────────────────────────────── */

type Props = {
    profiles: Profile[];
    currentUserId: string;
    stats: { total: number; active: number; byRole: Record<string, number> };
};

const roleLabels: Record<string, string> = {
    ADMIN: "Admin",
    SUPER: "Supervisor",
    COLAB: "Colaborador",
    CLIENT: "Cliente",
};

const roleColors: Record<string, string> = {
    ADMIN: "bg-red-500/20 text-red-500 border-red-500/30",
    SUPER: "bg-purple-500/20 text-purple-500 border-purple-500/30",
    COLAB: "bg-blue-500/20 text-blue-500 border-blue-500/30",
    CLIENT: "bg-green-500/20 text-green-500 border-green-500/30",
};

const allRoles: Profile["role"][] = ["ADMIN", "SUPER", "COLAB", "CLIENT"];

/* ─── Main Component ────────────────────────────── */

export default function UsersClient({ profiles, currentUserId, stats }: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Filters
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    // Selection
    const [selected, setSelected] = useState<Set<string>>(new Set());

    // Modals
    const [editUser, setEditUser] = useState<Profile | null>(null);
    const [showInvite, setShowInvite] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<Profile | null>(null);
    const [actionMenu, setActionMenu] = useState<string | null>(null);
    const [bulkRoleTarget, setBulkRoleTarget] = useState<string | null>(null);

    // Messages
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const showMsg = (type: "success" | "error", text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    };

    // Filtered profiles
    const filtered = useMemo(() => {
        return profiles.filter((p) => {
            const matchSearch =
                !search ||
                (p.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
                p.email.toLowerCase().includes(search.toLowerCase()) ||
                (p.company || "").toLowerCase().includes(search.toLowerCase());
            const matchRole = roleFilter === "all" || p.role === roleFilter;
            const matchStatus =
                statusFilter === "all" ||
                (statusFilter === "active" && p.is_active) ||
                (statusFilter === "inactive" && !p.is_active);
            return matchSearch && matchRole && matchStatus;
        });
    }, [profiles, search, roleFilter, statusFilter]);

    const allSelected = filtered.length > 0 && filtered.every((p) => selected.has(p.id));
    const someSelected = selected.size > 0;

    function toggleAll() {
        if (allSelected) {
            setSelected(new Set());
        } else {
            setSelected(new Set(filtered.map((p) => p.id)));
        }
    }

    function toggleOne(id: string) {
        const next = new Set(selected);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelected(next);
    }

    /* ─── Handlers ────────────────────────────── */

    function handleExport() {
        startTransition(async () => {
            const csv = await exportUsersCsvAction();
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `usuarios_${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            showMsg("success", "CSV descargado");
        });
    }

    function handleBulkRole(role: string) {
        const ids = Array.from(selected);
        startTransition(async () => {
            const res = await bulkChangeRoleAction(ids, role as Profile["role"]);
            if ("error" in res) showMsg("error", res.error!);
            else { showMsg("success", `Rol cambiado a ${roleLabels[role]} para ${ids.length} usuarios`); setSelected(new Set()); }
            setBulkRoleTarget(null);
            router.refresh();
        });
    }

    function handleBulkToggle(activate: boolean) {
        const ids = Array.from(selected);
        startTransition(async () => {
            const res = await bulkToggleActiveAction(ids, activate);
            if ("error" in res) showMsg("error", res.error!);
            else { showMsg("success", `${ids.length} usuarios ${activate ? "activados" : "desactivados"}`); setSelected(new Set()); }
            router.refresh();
        });
    }

    function handleBulkDelete() {
        const ids = Array.from(selected);
        if (!confirm(`¿Eliminar ${ids.length} usuario(s)? Esta acción no se puede deshacer.`)) return;
        startTransition(async () => {
            const res = await bulkDeleteAction(ids);
            if ("error" in res) showMsg("error", res.error!);
            else { showMsg("success", `${ids.length} usuario(s) eliminado(s)`); setSelected(new Set()); }
            router.refresh();
        });
    }

    return (
        <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <StatCard label="Total" value={stats.total} />
                <StatCard label="Activos" value={stats.active} color="text-success" />
                {allRoles.map((r) => (
                    <StatCard key={r} label={roleLabels[r]} value={stats.byRole[r] ?? 0} />
                ))}
            </div>

            {/* Toast */}
            {message && (
                <div className={`fixed top-6 right-6 z-[999] px-4 py-3 rounded-xl text-sm font-medium shadow-lg animate-in slide-in-from-top-2 duration-200 ${message.type === "success" ? "bg-success/20 text-success border border-success/30" : "bg-danger/20 text-danger border border-danger/30"}`}>
                    {message.text}
                </div>
            )}

            {/* Toolbar */}
            <div className="glass-card px-4 py-3 flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="flex-1 min-w-[200px]">
                    <input
                        type="text"
                        placeholder="Buscar por nombre, email o empresa…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                </div>

                {/* Role filter */}
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm focus:outline-none focus:border-primary cursor-pointer"
                >
                    <option value="all">Todos los roles</option>
                    {allRoles.map((r) => (
                        <option key={r} value={r}>{roleLabels[r]}</option>
                    ))}
                </select>

                {/* Status filter */}
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm focus:outline-none focus:border-primary cursor-pointer"
                >
                    <option value="all">Todos</option>
                    <option value="active">Activos</option>
                    <option value="inactive">Inactivos</option>
                </select>

                {/* Actions */}
                <button
                    onClick={() => setShowInvite(true)}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
                >
                    + Invitar Usuario
                </button>
                <button
                    onClick={handleExport}
                    disabled={isPending}
                    className="px-4 py-2 rounded-lg bg-surface-2 border border-border text-sm hover:bg-surface-3 transition-colors cursor-pointer disabled:opacity-50"
                >
                    📥 Exportar CSV
                </button>
            </div>

            {/* Bulk actions bar */}
            {someSelected && (
                <div className="glass-card px-4 py-3 flex items-center gap-3 border-primary/30 animate-in slide-in-from-top-1 duration-150">
                    <span className="text-sm font-medium">{selected.size} seleccionado(s)</span>
                    <div className="h-4 w-px bg-border" />

                    {/* Bulk role change */}
                    <div className="relative">
                        <button
                            onClick={() => setBulkRoleTarget(bulkRoleTarget ? null : "open")}
                            className="px-3 py-1.5 rounded-lg bg-surface-2 border border-border text-xs hover:bg-surface-3 transition-colors cursor-pointer"
                        >
                            Cambiar Rol ▾
                        </button>
                        {bulkRoleTarget && (
                            <div className="absolute top-full left-0 mt-1 bg-surface-1 border border-border rounded-lg shadow-xl py-1 z-50 min-w-[140px]">
                                {allRoles.map((r) => (
                                    <button
                                        key={r}
                                        onClick={() => handleBulkRole(r)}
                                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-surface-2 transition-colors cursor-pointer"
                                    >
                                        {roleLabels[r]}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => handleBulkToggle(true)}
                        className="px-3 py-1.5 rounded-lg bg-success/10 text-success border border-success/20 text-xs hover:bg-success/20 transition-colors cursor-pointer"
                    >
                        Activar
                    </button>
                    <button
                        onClick={() => handleBulkToggle(false)}
                        className="px-3 py-1.5 rounded-lg bg-warning/10 text-warning border border-warning/20 text-xs hover:bg-warning/20 transition-colors cursor-pointer"
                    >
                        Desactivar
                    </button>
                    <button
                        onClick={handleBulkDelete}
                        className="px-3 py-1.5 rounded-lg bg-danger/10 text-danger border border-danger/20 text-xs hover:bg-danger/20 transition-colors cursor-pointer"
                    >
                        Eliminar
                    </button>
                    <button
                        onClick={() => setSelected(new Set())}
                        className="ml-auto px-3 py-1.5 rounded-lg text-xs text-muted hover:text-foreground transition-colors cursor-pointer"
                    >
                        ✕ Deseleccionar
                    </button>
                </div>
            )}

            {/* Table */}
            <div className="glass-card overflow-hidden">
                <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                    <h2 className="font-semibold text-sm">👥 Usuarios Registrados</h2>
                    <span className="text-xs text-muted">
                        {filtered.length}{filtered.length !== profiles.length ? ` de ${profiles.length}` : ""} usuarios
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border text-left text-xs text-muted">
                                <th className="px-4 py-2 w-10">
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        onChange={toggleAll}
                                        className="rounded cursor-pointer accent-primary"
                                    />
                                </th>
                                <th className="px-4 py-2">Usuario</th>
                                <th className="px-4 py-2">Email</th>
                                <th className="px-4 py-2">Rol</th>
                                <th className="px-4 py-2">Empresa</th>
                                <th className="px-4 py-2">Estado</th>
                                <th className="px-4 py-2">Registro</th>
                                <th className="px-4 py-2 w-12"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-muted">
                                        {search || roleFilter !== "all" || statusFilter !== "all"
                                            ? "Sin resultados para los filtros aplicados"
                                            : "Sin usuarios registrados"}
                                    </td>
                                </tr>
                            )}
                            {filtered.map((p) => (
                                <tr
                                    key={p.id}
                                    className={`border-b border-border/50 hover:bg-surface-2/50 transition-colors ${selected.has(p.id) ? "bg-primary/5" : ""}`}
                                >
                                    <td className="px-4 py-2.5">
                                        <input
                                            type="checkbox"
                                            checked={selected.has(p.id)}
                                            onChange={() => toggleOne(p.id)}
                                            className="rounded cursor-pointer accent-primary"
                                        />
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                {(p.full_name || p.email || "U").charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <span className="font-medium">{p.full_name || "Sin nombre"}</span>
                                                {p.phone && (
                                                    <p className="text-[10px] text-muted">{p.phone}</p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2.5 text-muted text-xs font-mono">{p.email}</td>
                                    <td className="px-4 py-2.5">
                                        <span className={`text-xs px-2 py-0.5 rounded-full border ${roleColors[p.role] || "bg-gray-500/20 text-gray-400"}`}>
                                            {roleLabels[p.role] ?? p.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2.5 text-xs text-muted">{p.company || "—"}</td>
                                    <td className="px-4 py-2.5">
                                        <span className={`inline-flex items-center gap-1 text-xs ${p.is_active ? "text-success" : "text-muted"}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${p.is_active ? "bg-success" : "bg-muted"}`} />
                                            {p.is_active ? "Activo" : "Inactivo"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2.5 text-xs text-muted">
                                        {new Date(p.created_at).toLocaleDateString("es-MX")}
                                    </td>
                                    <td className="px-4 py-2.5 relative">
                                        <button
                                            onClick={() => setActionMenu(actionMenu === p.id ? null : p.id)}
                                            className="p-1 rounded hover:bg-surface-2 transition-colors cursor-pointer text-muted hover:text-foreground"
                                        >
                                            ⋮
                                        </button>
                                        {actionMenu === p.id && (
                                            <ActionMenu
                                                user={p}
                                                isCurrentUser={p.id === currentUserId}
                                                onEdit={() => { setEditUser(p); setActionMenu(null); }}
                                                onToggle={() => {
                                                    setActionMenu(null);
                                                    const fd = new FormData();
                                                    fd.set("id", p.id);
                                                    fd.set("is_active", String(p.is_active));
                                                    startTransition(async () => {
                                                        const res = await toggleUserActiveAction(fd);
                                                        if ("error" in res) showMsg("error", res.error!);
                                                        else showMsg("success", p.is_active ? "Usuario desactivado" : "Usuario activado");
                                                        router.refresh();
                                                    });
                                                }}
                                                onDelete={() => { setDeleteConfirm(p); setActionMenu(null); }}
                                                onClose={() => setActionMenu(null)}
                                            />
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Role distribution */}
            <div className="glass-card p-5">
                <h2 className="font-semibold text-sm mb-4">📊 Distribución por Rol</h2>
                <div className="space-y-3">
                    {allRoles.map((key) => {
                        const count = stats.byRole[key] ?? 0;
                        const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                        return (
                            <div key={key}>
                                <div className="flex items-center justify-between text-xs mb-1">
                                    <span>{roleLabels[key]}</span>
                                    <span className="text-muted">{count} ({pct.toFixed(0)}%)</span>
                                </div>
                                <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-primary to-primary-light transition-all duration-500"
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Edit Modal */}
            {editUser && (
                <EditModal
                    user={editUser}
                    onClose={() => setEditUser(null)}
                    onSave={(fd) => {
                        startTransition(async () => {
                            const res = await updateUserAction(fd);
                            if ("error" in res) showMsg("error", res.error!);
                            else { showMsg("success", "Usuario actualizado"); setEditUser(null); }
                            router.refresh();
                        });
                    }}
                    isPending={isPending}
                />
            )}

            {/* Invite Modal */}
            {showInvite && (
                <InviteModal
                    onClose={() => setShowInvite(false)}
                    onInvite={(fd) => {
                        startTransition(async () => {
                            const res = await inviteUserAction(fd);
                            if ("error" in res) showMsg("error", res.error!);
                            else { showMsg("success", "Invitación enviada"); setShowInvite(false); }
                            router.refresh();
                        });
                    }}
                    isPending={isPending}
                />
            )}

            {/* Delete Confirmation */}
            {deleteConfirm && (
                <DeleteConfirmModal
                    user={deleteConfirm}
                    isCurrentUser={deleteConfirm.id === currentUserId}
                    onClose={() => setDeleteConfirm(null)}
                    onDelete={() => {
                        const fd = new FormData();
                        fd.set("id", deleteConfirm.id);
                        startTransition(async () => {
                            const res = await deleteUserAction(fd);
                            if ("error" in res) showMsg("error", res.error!);
                            else { showMsg("success", "Usuario eliminado"); setDeleteConfirm(null); }
                            router.refresh();
                        });
                    }}
                    isPending={isPending}
                />
            )}

            {/* Overlay to close action menus */}
            {(actionMenu || bulkRoleTarget) && (
                <div className="fixed inset-0 z-40" onClick={() => { setActionMenu(null); setBulkRoleTarget(null); }} />
            )}
        </>
    );
}

/* ─── Sub-components ────────────────────────────── */

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
    return (
        <div className="glass-card p-4 text-center">
            <p className={`text-2xl font-bold ${color || ""}`}>{value}</p>
            <p className="text-xs text-muted">{label}</p>
        </div>
    );
}

function ActionMenu({
    user,
    isCurrentUser,
    onEdit,
    onToggle,
    onDelete,
    onClose,
}: {
    user: Profile;
    isCurrentUser: boolean;
    onEdit: () => void;
    onToggle: () => void;
    onDelete: () => void;
    onClose: () => void;
}) {
    return (
        <div
            className="absolute right-0 top-full mt-1 bg-surface-1 border border-border rounded-xl shadow-xl py-1 z-50 min-w-[160px] animate-in fade-in duration-100"
            onClick={(e) => e.stopPropagation()}
        >
            <button onClick={onEdit} className="w-full text-left px-4 py-2 text-xs hover:bg-surface-2 transition-colors cursor-pointer">
                ✏️ Editar
            </button>
            <button onClick={onToggle} className="w-full text-left px-4 py-2 text-xs hover:bg-surface-2 transition-colors cursor-pointer">
                {user.is_active ? "⏸️ Desactivar" : "▶️ Activar"}
            </button>
            <div className="border-t border-border my-1" />
            <button
                onClick={isCurrentUser ? onClose : onDelete}
                disabled={isCurrentUser}
                className={`w-full text-left px-4 py-2 text-xs transition-colors cursor-pointer ${isCurrentUser ? "text-muted cursor-not-allowed" : "text-danger hover:bg-danger/10"}`}
            >
                🗑️ Eliminar {isCurrentUser && "(tú)"}
            </button>
        </div>
    );
}

function EditModal({
    user,
    onClose,
    onSave,
    isPending,
}: {
    user: Profile;
    onClose: () => void;
    onSave: (fd: FormData) => void;
    isPending: boolean;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md mx-4 bg-surface-1 border border-border rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
                <h3 className="text-lg font-semibold mb-4">Editar Usuario</h3>
                <form
                    action={(fd) => onSave(fd)}
                    className="space-y-4"
                >
                    <input type="hidden" name="id" value={user.id} />

                    <div>
                        <label className="text-xs text-muted mb-1 block">Nombre completo</label>
                        <input
                            name="full_name"
                            defaultValue={user.full_name || ""}
                            className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm focus:outline-none focus:border-primary"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-muted mb-1 block">Rol</label>
                        <select
                            name="role"
                            defaultValue={user.role}
                            className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm focus:outline-none focus:border-primary cursor-pointer"
                        >
                            {allRoles.map((r) => (
                                <option key={r} value={r}>{roleLabels[r]}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs text-muted mb-1 block">Teléfono</label>
                        <input
                            name="phone"
                            defaultValue={user.phone || ""}
                            className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm focus:outline-none focus:border-primary"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-muted mb-1 block">Empresa</label>
                        <input
                            name="company"
                            defaultValue={user.company || ""}
                            className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm focus:outline-none focus:border-primary"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-sm text-muted hover:text-foreground transition-colors cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                        >
                            {isPending ? "Guardando…" : "Guardar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function InviteModal({
    onClose,
    onInvite,
    isPending,
}: {
    onClose: () => void;
    onInvite: (fd: FormData) => void;
    isPending: boolean;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md mx-4 bg-surface-1 border border-border rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
                <h3 className="text-lg font-semibold mb-4">Invitar Nuevo Usuario</h3>
                <p className="text-xs text-muted mb-4">
                    Se enviará un email de invitación al usuario para que complete su registro.
                </p>
                <form
                    action={(fd) => onInvite(fd)}
                    className="space-y-4"
                >
                    <div>
                        <label className="text-xs text-muted mb-1 block">Nombre completo *</label>
                        <input
                            name="full_name"
                            required
                            placeholder="Juan Pérez"
                            className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm focus:outline-none focus:border-primary"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-muted mb-1 block">Email *</label>
                        <input
                            name="email"
                            type="email"
                            required
                            placeholder="correo@ejemplo.com"
                            className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm focus:outline-none focus:border-primary"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-muted mb-1 block">Rol</label>
                        <select
                            name="role"
                            defaultValue="CLIENT"
                            className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm focus:outline-none focus:border-primary cursor-pointer"
                        >
                            {allRoles.map((r) => (
                                <option key={r} value={r}>{roleLabels[r]}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-sm text-muted hover:text-foreground transition-colors cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                        >
                            {isPending ? "Enviando…" : "Enviar Invitación"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function DeleteConfirmModal({
    user,
    isCurrentUser,
    onClose,
    onDelete,
    isPending,
}: {
    user: Profile;
    isCurrentUser: boolean;
    onClose: () => void;
    onDelete: () => void;
    isPending: boolean;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-sm mx-4 bg-surface-1 border border-border rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
                <h3 className="text-lg font-semibold mb-2">⚠️ Eliminar Usuario</h3>
                <p className="text-sm text-muted mb-4">
                    ¿Estás seguro de eliminar a <strong>{user.full_name || user.email}</strong>?
                    Esta acción eliminará su perfil y cuenta de acceso permanentemente.
                </p>
                {isCurrentUser && (
                    <p className="text-xs text-danger bg-danger/10 px-3 py-2 rounded-lg mb-4">
                        No puedes eliminarte a ti mismo.
                    </p>
                )}
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm text-muted hover:text-foreground transition-colors cursor-pointer"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onDelete}
                        disabled={isPending || isCurrentUser}
                        className="px-4 py-2 rounded-lg bg-danger text-white text-sm font-medium hover:bg-danger/90 transition-colors cursor-pointer disabled:opacity-50"
                    >
                        {isPending ? "Eliminando…" : "Eliminar"}
                    </button>
                </div>
            </div>
        </div>
    );
}
