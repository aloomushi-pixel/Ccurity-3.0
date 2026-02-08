"use client";

import { useState, useTransition, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import ConceptsTable from "./ConceptsTable";
import ConceptModal from "./ConceptModal";
import CategoryManager from "./CategoryManager";
import type { Concept, PriceHistory } from "@/lib/data/concepts.types";
import type { BulkAction } from "./ConceptsTable";
import {
    createConceptAction,
    updateConceptAction,
    deleteConceptAction,
    toggleConceptAction,
    duplicateConceptAction,
    exportConceptsCsvAction,
    importConceptsAction,
    bulkUpdateCategoryAction,
    bulkToggleActiveAction,
    bulkAdjustPriceAction,
    bulkDeleteAction,
    addCategoryAction,
    renameCategoryAction,
    deleteCategoryAction,
} from "./actions";

interface Props {
    concepts: Concept[];
    categories: string[];
    quotationCounts: Record<string, number>;
    stats: {
        total: number;
        active: number;
        categories: number;
        avgPrice: number;
        formats: number;
    };
}

export default function CpuCatalogClient({
    concepts,
    categories,
    quotationCounts,
    stats,
}: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [modalOpen, setModalOpen] = useState(false);
    const [editConcept, setEditConcept] = useState<Concept | null>(null);
    const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
    const [importOpen, setImportOpen] = useState(false);
    const [csvContent, setCsvContent] = useState("");
    const [showCategoryManager, setShowCategoryManager] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const refresh = () => startTransition(() => router.refresh());

    // Compute concept count per category for CategoryManager
    const conceptCountByCategory = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const c of concepts) {
            if (c.category) counts[c.category] = (counts[c.category] || 0) + 1;
        }
        return counts;
    }, [concepts]);

    // Open edit modal and fetch price history
    const handleEdit = async (id: string) => {
        const concept = concepts.find((c) => c.id === id);
        if (!concept) return;
        setEditConcept(concept);

        try {
            const res = await fetch(`/api/concepts/${id}/price-history`);
            if (res.ok) setPriceHistory(await res.json());
            else setPriceHistory([]);
        } catch {
            setPriceHistory([]);
        }

        setModalOpen(true);
    };

    const handleSave = async (data: Partial<Concept>) => {
        const fd = new FormData();
        for (const [key, val] of Object.entries(data)) {
            if (val !== null && val !== undefined) fd.set(key, String(val));
        }

        if (data.id) {
            await updateConceptAction(fd);
        } else {
            await createConceptAction(fd);
        }

        setModalOpen(false);
        setEditConcept(null);
        refresh();
    };

    const handleDelete = async (id: string) => {
        const fd = new FormData();
        fd.set("id", id);
        await deleteConceptAction(fd);
        refresh();
    };

    const handleToggle = async (id: string, isActive: boolean) => {
        const fd = new FormData();
        fd.set("id", id);
        fd.set("isActive", String(isActive));
        await toggleConceptAction(fd);
        refresh();
    };

    const handleDuplicate = async (id: string) => {
        const fd = new FormData();
        fd.set("id", id);
        await duplicateConceptAction(fd);
        refresh();
    };

    const handleExport = async () => {
        try {
            const csv = await exportConceptsCsvAction();
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `catalogo_cpu_${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
        }
    };

    const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            setCsvContent(ev.target?.result as string);
            setImportOpen(true);
        };
        reader.readAsText(file);
    };

    const handleImportSubmit = async () => {
        const fd = new FormData();
        fd.set("csvContent", csvContent);
        await importConceptsAction(fd);
        setImportOpen(false);
        setCsvContent("");
        refresh();
    };

    /* ─── Bulk Actions ──────────────────────────────── */
    const handleBulkAction = async (ids: string[], action: BulkAction) => {
        switch (action.type) {
            case "category":
                if (action.value) await bulkUpdateCategoryAction(ids, action.value);
                break;
            case "active":
                await bulkToggleActiveAction(ids, true);
                break;
            case "inactive":
                await bulkToggleActiveAction(ids, false);
                break;
            case "pricePercent":
                if (action.value) await bulkAdjustPriceAction(ids, Number(action.value));
                break;
            case "delete":
                await bulkDeleteAction(ids);
                break;
        }
        refresh();
    };

    /* ─── Category Management ───────────────────────── */
    const handleAddCategory = async (name: string) => {
        await addCategoryAction(name);
        refresh();
    };

    const handleRenameCategory = async (oldName: string, newName: string) => {
        await renameCategoryAction(oldName, newName);
        refresh();
    };

    const handleDeleteCategory = async (name: string) => {
        await deleteCategoryAction(name);
        refresh();
    };

    return (
        <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                    { label: "Total", value: stats.total, icon: "📋" },
                    { label: "Activos", value: stats.active, icon: "✅" },
                    { label: "Categorías", value: stats.categories, icon: "🏷️" },
                    { label: "Formatos", value: stats.formats, icon: "📐" },
                    {
                        label: "Precio Prom.",
                        value: `$${stats.avgPrice.toLocaleString("es-MX", { maximumFractionDigits: 0 })}`,
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

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
                <button
                    onClick={() => { setEditConcept(null); setPriceHistory([]); setModalOpen(true); }}
                    className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary to-accent text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                    <span className="text-lg">+</span> Nuevo Concepto
                </button>
                <button
                    onClick={() => setShowCategoryManager(!showCategoryManager)}
                    className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors flex items-center gap-2 ${showCategoryManager
                        ? "bg-primary/10 text-primary-light border-primary/40"
                        : "bg-surface-2 text-muted border-border hover:text-foreground hover:border-primary"
                        }`}
                >
                    🏷️ Gestionar Categorías
                </button>
            </div>

            {/* Category Manager (collapsible) */}
            {showCategoryManager && (
                <CategoryManager
                    categories={categories}
                    onAdd={handleAddCategory}
                    onRename={handleRenameCategory}
                    onDelete={handleDeleteCategory}
                    conceptCountByCategory={conceptCountByCategory}
                />
            )}

            {/* Interactive table */}
            <ConceptsTable
                initialConcepts={concepts}
                categories={categories}
                quotationCounts={quotationCounts}
                onEdit={handleEdit}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
                onToggle={handleToggle}
                onExport={handleExport}
                onImport={() => fileInputRef.current?.click()}
                onBulkAction={handleBulkAction}
            />

            {/* Hidden file input for CSV import */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleImportFile}
                className="hidden"
            />

            {/* Edit/Create Modal */}
            {modalOpen && (
                <ConceptModal
                    concept={editConcept}
                    priceHistory={priceHistory}
                    quotationCount={editConcept ? (quotationCounts[editConcept.id] || 0) : 0}
                    categories={categories}
                    onSave={handleSave}
                    onClose={() => { setModalOpen(false); setEditConcept(null); }}
                />
            )}

            {/* Import CSV confirmation Dialog */}
            {importOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center">
                    <div className="glass-card w-full max-w-md mx-4 p-6 space-y-4">
                        <h3 className="text-lg font-semibold">📤 Importar CSV</h3>
                        <p className="text-sm text-muted">
                            Se encontraron {csvContent.trim().split("\n").length - 1} registros en el archivo.
                            ¿Deseas importarlos?
                        </p>
                        <pre className="text-xs bg-surface-2 p-3 rounded-lg overflow-auto max-h-40 text-muted">
                            {csvContent.slice(0, 500)}
                            {csvContent.length > 500 && "..."}
                        </pre>
                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={() => { setImportOpen(false); setCsvContent(""); }}
                                className="px-4 py-2 rounded-lg bg-surface-2 border border-border text-sm text-muted hover:text-foreground transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleImportSubmit}
                                className="px-5 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white text-sm font-medium hover:opacity-90 transition-opacity"
                            >
                                Importar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading overlay */}
            {isPending && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-[200] flex items-center justify-center">
                    <div className="glass-card p-6 flex items-center gap-3">
                        <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
                        <span className="text-sm">Actualizando...</span>
                    </div>
                </div>
            )}
        </div>
    );
}
