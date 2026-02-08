"use client";

import { useState, useMemo } from "react";
import type { Concept } from "@/lib/data/concepts.types";

type SortKey = "title" | "category" | "price" | "brand" | "sat_code" | "format" | "isActive";
type SortDir = "asc" | "desc";

export interface BulkAction {
    type: "category" | "active" | "inactive" | "pricePercent" | "delete";
    value?: string;
}

interface Props {
    initialConcepts: Concept[];
    categories: string[];
    quotationCounts: Record<string, number>;
    onEdit: (id: string) => void;
    onDuplicate: (id: string) => void;
    onDelete: (id: string) => void;
    onToggle: (id: string, isActive: boolean) => void;
    onExport: () => void;
    onImport: () => void;
    onBulkAction: (ids: string[], action: BulkAction) => void;
}

export default function ConceptsTable({
    initialConcepts,
    categories,
    quotationCounts,
    onEdit,
    onDuplicate,
    onDelete,
    onToggle,
    onExport,
    onImport,
    onBulkAction,
}: Props) {
    const [search, setSearch] = useState("");
    const [catFilter, setCatFilter] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<boolean | null>(null);
    const [priceMin, setPriceMin] = useState("");
    const [priceMax, setPriceMax] = useState("");
    const [sortKey, setSortKey] = useState<SortKey>("title");
    const [sortDir, setSortDir] = useState<SortDir>("asc");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    // Bulk selection
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [bulkCat, setBulkCat] = useState("");
    const [bulkPricePercent, setBulkPricePercent] = useState("");
    const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

    // Filter + sort client-side for instant UX
    const filtered = useMemo(() => {
        let list = [...initialConcepts];

        if (search) {
            const q = search.toLowerCase();
            list = list.filter(
                (c) =>
                    c.title.toLowerCase().includes(q) ||
                    c.description?.toLowerCase().includes(q) ||
                    c.sat_code?.toLowerCase().includes(q) ||
                    c.brand?.toLowerCase().includes(q) ||
                    c.model?.toLowerCase().includes(q) ||
                    c.sat_code?.toLowerCase().includes(q)
            );
        }

        if (catFilter) list = list.filter((c) => c.category === catFilter);
        if (activeFilter !== null) list = list.filter((c) => c.isActive === activeFilter);
        if (priceMin) list = list.filter((c) => Number(c.price) >= Number(priceMin));
        if (priceMax) list = list.filter((c) => Number(c.price) <= Number(priceMax));

        list.sort((a, b) => {
            const va = a[sortKey] ?? "";
            const vb = b[sortKey] ?? "";
            const cmp = typeof va === "number" && typeof vb === "number"
                ? va - vb
                : String(va).localeCompare(String(vb), "es");
            return sortDir === "asc" ? cmp : -cmp;
        });

        return list;
    }, [initialConcepts, search, catFilter, activeFilter, priceMin, priceMax, sortKey, sortDir]);

    const totalPages = Math.ceil(filtered.length / pageSize);
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

    const toggleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else { setSortKey(key); setSortDir("asc"); }
        setPage(1);
    };

    const SortIcon = ({ col }: { col: SortKey }) => (
        <span className="ml-1 text-[10px] opacity-50">
            {sortKey === col ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}
        </span>
    );

    // Placeholder — margin removed

    // Selection helpers
    const allPageSelected = paginated.length > 0 && paginated.every((c) => selected.has(c.id));
    const someSelected = selected.size > 0;

    const toggleAll = () => {
        if (allPageSelected) {
            const next = new Set(selected);
            paginated.forEach((c) => next.delete(c.id));
            setSelected(next);
        } else {
            const next = new Set(selected);
            paginated.forEach((c) => next.add(c.id));
            setSelected(next);
        }
    };

    const toggleOne = (id: string) => {
        const next = new Set(selected);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelected(next);
    };

    const selectAllFiltered = () => {
        setSelected(new Set(filtered.map((c) => c.id)));
    };

    const clearSelection = () => {
        setSelected(new Set());
        setBulkDeleteConfirm(false);
    };

    const selectedIds = Array.from(selected);

    return (
        <div className="space-y-4">
            {/* Search & Filters Bar */}
            <div className="glass-card p-4 space-y-3">
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="relative flex-1 min-w-[200px]">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">🔍</span>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Buscar por título, código SAT, marca, modelo..."
                            className="w-full pl-9 pr-3 py-2 rounded-lg bg-surface-2 border border-border text-foreground text-sm focus:outline-none focus:border-primary"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            placeholder="$ Min"
                            value={priceMin}
                            onChange={(e) => { setPriceMin(e.target.value); setPage(1); }}
                            className="w-20 px-2 py-2 rounded-lg bg-surface-2 border border-border text-sm text-foreground focus:outline-none focus:border-primary"
                        />
                        <span className="text-muted text-xs">—</span>
                        <input
                            type="number"
                            placeholder="$ Max"
                            value={priceMax}
                            onChange={(e) => { setPriceMax(e.target.value); setPage(1); }}
                            className="w-20 px-2 py-2 rounded-lg bg-surface-2 border border-border text-sm text-foreground focus:outline-none focus:border-primary"
                        />
                    </div>

                    <button
                        onClick={onExport}
                        className="px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm text-muted hover:text-foreground hover:border-primary transition-colors"
                    >
                        📥 Exportar CSV
                    </button>
                    <button
                        onClick={onImport}
                        className="px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm text-muted hover:text-foreground hover:border-primary transition-colors"
                    >
                        📤 Importar CSV
                    </button>
                </div>

                {/* Category filter chips */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => { setCatFilter(null); setPage(1); }}
                        className={`px-3 py-1 rounded-full text-xs border transition-colors ${catFilter === null
                            ? "bg-primary/20 text-primary-light border-primary/40"
                            : "bg-surface-2 text-muted border-border hover:border-primary/40"
                            }`}
                    >
                        Todas
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => { setCatFilter(catFilter === cat ? null : cat); setPage(1); }}
                            className={`px-3 py-1 rounded-full text-xs border transition-colors ${catFilter === cat
                                ? "bg-primary/20 text-primary-light border-primary/40"
                                : "bg-surface-2 text-muted border-border hover:border-primary/40"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                    <span className="text-border">|</span>
                    {[
                        { label: "Todos", val: null },
                        { label: "Activos", val: true },
                        { label: "Inactivos", val: false },
                    ].map(({ label, val }) => (
                        <button
                            key={label}
                            onClick={() => { setActiveFilter(val); setPage(1); }}
                            className={`px-3 py-1 rounded-full text-xs border transition-colors ${activeFilter === val
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                                : "bg-surface-2 text-muted border-border hover:border-emerald-500/40"
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {someSelected && (
                <div className="glass-card p-3 border-primary/30 bg-primary/5 flex flex-wrap items-center gap-3 animate-in slide-in-from-top-2">
                    <span className="text-sm font-medium text-primary-light">
                        ☑ {selected.size} seleccionado{selected.size !== 1 ? "s" : ""}
                    </span>

                    {selected.size < filtered.length && (
                        <button
                            onClick={selectAllFiltered}
                            className="text-xs text-primary-light hover:underline"
                        >
                            Seleccionar todos ({filtered.length})
                        </button>
                    )}

                    <span className="text-border">|</span>

                    {/* Bulk: Change Category */}
                    <div className="flex items-center gap-1">
                        <select
                            value={bulkCat}
                            onChange={(e) => setBulkCat(e.target.value)}
                            className="px-2 py-1.5 rounded-lg bg-surface-2 border border-border text-sm text-foreground focus:outline-none focus:border-primary"
                        >
                            <option value="">Mover a categoría...</option>
                            {categories.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                        {bulkCat && (
                            <button
                                onClick={() => {
                                    onBulkAction(selectedIds, { type: "category", value: bulkCat });
                                    setBulkCat("");
                                    clearSelection();
                                }}
                                className="px-2 py-1.5 rounded-lg bg-primary/20 text-primary-light text-xs font-medium hover:bg-primary/30"
                            >
                                Aplicar
                            </button>
                        )}
                    </div>

                    {/* Bulk: Toggle active/inactive */}
                    <button
                        onClick={() => { onBulkAction(selectedIds, { type: "active" }); clearSelection(); }}
                        className="px-2 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs hover:bg-emerald-500/20 transition-colors"
                    >
                        ✅ Activar
                    </button>
                    <button
                        onClick={() => { onBulkAction(selectedIds, { type: "inactive" }); clearSelection(); }}
                        className="px-2 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20 transition-colors"
                    >
                        ⛔ Desactivar
                    </button>

                    {/* Bulk: Adjust price % */}
                    <div className="flex items-center gap-1">
                        <input
                            type="number"
                            placeholder="±%"
                            value={bulkPricePercent}
                            onChange={(e) => setBulkPricePercent(e.target.value)}
                            className="w-16 px-2 py-1.5 rounded-lg bg-surface-2 border border-border text-sm text-foreground focus:outline-none focus:border-primary"
                        />
                        {bulkPricePercent && (
                            <button
                                onClick={() => {
                                    onBulkAction(selectedIds, { type: "pricePercent", value: bulkPricePercent });
                                    setBulkPricePercent("");
                                    clearSelection();
                                }}
                                className="px-2 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 text-xs hover:bg-amber-500/20"
                            >
                                💰 {Number(bulkPricePercent) >= 0 ? "+" : ""}{bulkPricePercent}% precio
                            </button>
                        )}
                    </div>

                    <span className="text-border">|</span>

                    {/* Bulk: Delete */}
                    {bulkDeleteConfirm ? (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-red-400">¿Eliminar {selected.size}?</span>
                            <button
                                onClick={() => { onBulkAction(selectedIds, { type: "delete" }); clearSelection(); }}
                                className="text-xs text-red-400 hover:text-red-300 font-bold"
                            >
                                Sí, eliminar
                            </button>
                            <button
                                onClick={() => setBulkDeleteConfirm(false)}
                                className="text-xs text-muted hover:text-foreground"
                            >
                                No
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setBulkDeleteConfirm(true)}
                            className="px-2 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20 transition-colors"
                        >
                            🗑️ Eliminar
                        </button>
                    )}

                    <div className="flex-1" />
                    <button
                        onClick={clearSelection}
                        className="text-xs text-muted hover:text-foreground"
                    >
                        ✕ Deseleccionar
                    </button>
                </div>
            )}

            {/* Results count */}
            <div className="flex items-center justify-between text-sm text-muted px-1">
                <span>{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</span>
                <div className="flex items-center gap-2">
                    <span>Mostrar:</span>
                    {[10, 25, 50, 100].map((s) => (
                        <button
                            key={s}
                            onClick={() => { setPageSize(s); setPage(1); }}
                            className={`px-2 py-0.5 rounded text-xs ${pageSize === s ? "bg-primary/20 text-primary-light" : "hover:text-foreground"
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            {paginated.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <div className="text-4xl mb-3">📋</div>
                    <p className="text-muted text-lg mb-1">Sin resultados</p>
                    <p className="text-sm text-muted">
                        {search || catFilter ? "Prueba con otros filtros" : "Agrega conceptos usando el botón de arriba."}
                    </p>
                </div>
            ) : (
                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="py-3 px-2 w-8">
                                        <input
                                            type="checkbox"
                                            checked={allPageSelected}
                                            onChange={toggleAll}
                                            className="accent-primary w-4 h-4 cursor-pointer"
                                        />
                                    </th>
                                    {([
                                        ["Cód. SAT", "sat_code"],
                                        ["Concepto", "title"],
                                        ["Categoría", "category"],
                                        ["Marca", "brand"],
                                        ["Precio", "price"],
                                        ["Formato", "format"],
                                    ] as [string, SortKey][]).map(([label, key]) => (
                                        <th
                                            key={key}
                                            onClick={() => toggleSort(key)}
                                            className={`py-3 px-3 text-muted font-medium cursor-pointer hover:text-foreground transition-colors select-none ${key === "price" ? "text-right" : "text-left"
                                                }`}
                                        >
                                            {label}<SortIcon col={key} />
                                        </th>
                                    ))}
                                    <th className="py-3 px-3 text-left text-muted font-medium">T. Ejecución</th>
                                    <th className="py-3 px-3 text-center text-muted font-medium">Cotiz.</th>
                                    <th className="py-3 px-3 text-center text-muted font-medium">Estado</th>
                                    <th className="py-3 px-3 text-right text-muted font-medium">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map((c) => {
                                    const qCount = quotationCounts[c.id] || 0;
                                    const isSelected = selected.has(c.id);
                                    return (
                                        <tr
                                            key={c.id}
                                            className={`border-b border-border/50 hover:bg-surface-2/50 transition-colors group ${isSelected ? "bg-primary/5" : ""
                                                }`}
                                        >
                                            <td className="py-3 px-2">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleOne(c.id)}
                                                    className="accent-primary w-4 h-4 cursor-pointer"
                                                />
                                            </td>
                                            <td className="py-3 px-3 text-muted font-mono text-xs">
                                                {c.sat_code || "—"}
                                            </td>
                                            <td className="py-3 px-3">
                                                <div className="flex items-center gap-2">
                                                    {c.imageUrl && (
                                                        <img
                                                            src={c.imageUrl}
                                                            alt=""
                                                            className="w-8 h-8 rounded object-cover border border-border"
                                                        />
                                                    )}
                                                    <div>
                                                        <span className="font-medium">{c.title}</span>
                                                        {c.model && (
                                                            <span className="text-xs text-muted ml-1">({c.model})</span>
                                                        )}
                                                        {c.description && (
                                                            <p className="text-xs text-muted mt-0.5 truncate max-w-[220px]">
                                                                {c.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-3">
                                                {c.category ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary-light border border-primary/20">
                                                        {c.category}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted">—</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-3 text-muted text-xs">{c.brand || "—"}</td>
                                            <td className="py-3 px-3 text-right font-mono font-medium">
                                                ${Number(c.price).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-3 px-3 text-xs text-muted">
                                                {c.format ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-2 border border-border">
                                                        {c.format}
                                                    </span>
                                                ) : "—"}
                                            </td>
                                            <td className="py-3 px-3 text-xs text-muted">
                                                {c.execution_time || "—"}
                                            </td>
                                            <td className="py-3 px-3 text-center">
                                                {qCount > 0 ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-accent/10 text-accent border border-accent/20">
                                                        {qCount}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted text-xs">0</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-3 text-center">
                                                <button
                                                    onClick={() => onToggle(c.id, c.isActive)}
                                                    className={`inline-flex items-center gap-1.5 text-xs cursor-pointer ${c.isActive
                                                        ? "text-emerald-400 hover:text-red-400"
                                                        : "text-red-400 hover:text-emerald-400"
                                                        } transition-colors`}
                                                >
                                                    <span className={`w-1.5 h-1.5 rounded-full ${c.isActive ? "bg-emerald-400" : "bg-red-400"
                                                        }`} />
                                                    {c.isActive ? "Activo" : "Inactivo"}
                                                </button>
                                            </td>
                                            <td className="py-3 px-3 text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => onEdit(c.id)}
                                                        className="p-1.5 rounded hover:bg-primary/10 text-muted hover:text-primary-light transition-colors"
                                                        title="Editar"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        onClick={() => onDuplicate(c.id)}
                                                        className="p-1.5 rounded hover:bg-primary/10 text-muted hover:text-primary-light transition-colors"
                                                        title="Duplicar"
                                                    >
                                                        📋
                                                    </button>
                                                    {c.specSheetUrl && (
                                                        <a
                                                            href={c.specSheetUrl}
                                                            target="_blank"
                                                            rel="noopener"
                                                            className="p-1.5 rounded hover:bg-primary/10 text-muted hover:text-primary-light transition-colors"
                                                            title="Ficha técnica"
                                                        >
                                                            📄
                                                        </a>
                                                    )}
                                                    {deleteConfirm === c.id ? (
                                                        <span className="flex items-center gap-1">
                                                            <button
                                                                onClick={() => { onDelete(c.id); setDeleteConfirm(null); }}
                                                                className="text-xs text-red-400 hover:text-red-300 font-medium"
                                                            >
                                                                Sí
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteConfirm(null)}
                                                                className="text-xs text-muted hover:text-foreground"
                                                            >
                                                                No
                                                            </button>
                                                        </span>
                                                    ) : (
                                                        <button
                                                            onClick={() => setDeleteConfirm(c.id)}
                                                            className="p-1.5 rounded hover:bg-red-500/10 text-muted hover:text-red-400 transition-colors"
                                                            title="Eliminar"
                                                        >
                                                            🗑️
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1.5 rounded-lg bg-surface-2 border border-border text-sm disabled:opacity-30 hover:border-primary transition-colors"
                    >
                        ← Anterior
                    </button>
                    <span className="text-sm text-muted">
                        Página {page} de {totalPages}
                    </span>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-3 py-1.5 rounded-lg bg-surface-2 border border-border text-sm disabled:opacity-30 hover:border-primary transition-colors"
                    >
                        Siguiente →
                    </button>
                </div>
            )}
        </div>
    );
}
