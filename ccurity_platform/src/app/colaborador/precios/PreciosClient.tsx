"use client";

import { useState, useMemo } from "react";
import type { CollaboratorPrice } from "@/lib/data/collaborator-prices";
import { upsertPriceAction, deletePriceAction } from "./actions";

type ConceptOption = {
    id: string;
    title: string;
    category: string;
    format: string;
    price: number;
};

type Props = {
    prices: CollaboratorPrice[];
    concepts: ConceptOption[];
};

export function PreciosClient({ prices: initialPrices, concepts }: Props) {
    const [prices, setPrices] = useState(initialPrices);
    const [search, setSearch] = useState("");
    const [editing, setEditing] = useState<Record<string, string>>({});
    const [showAdd, setShowAdd] = useState(false);
    const [newConceptId, setNewConceptId] = useState("");
    const [newPrice, setNewPrice] = useState("");
    const [saving, setSaving] = useState(false);

    // Concepts that haven't been priced yet
    const unpricedConcepts = useMemo(
        () =>
            concepts.filter(
                (c) => !prices.some((p) => p.conceptId === c.id)
            ),
        [concepts, prices]
    );

    const filteredPrices = useMemo(() => {
        if (!search) return prices;
        const q = search.toLowerCase();
        return prices.filter(
            (p) =>
                p.conceptTitle?.toLowerCase().includes(q) ||
                p.conceptCategory?.toLowerCase().includes(q)
        );
    }, [prices, search]);

    async function handleUpsert(conceptId: string, customPrice: string) {
        setSaving(true);
        const fd = new FormData();
        fd.set("conceptId", conceptId);
        fd.set("customPrice", customPrice);
        const result = await upsertPriceAction(fd);
        if (result.success) {
            // Optimistic: update local state
            const numPrice = Number(customPrice);
            const concept = concepts.find((c) => c.id === conceptId);
            setPrices((prev) => {
                const existing = prev.findIndex((p) => p.conceptId === conceptId);
                if (existing >= 0) {
                    const updated = [...prev];
                    updated[existing] = { ...updated[existing], customPrice: numPrice };
                    return updated;
                }
                return [
                    {
                        id: crypto.randomUUID(),
                        collaboratorId: "",
                        conceptId,
                        customPrice: numPrice,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        conceptTitle: concept?.title,
                        conceptCategory: concept?.category,
                        conceptFormat: concept?.format,
                        conceptDefaultPrice: concept?.price,
                    },
                    ...prev,
                ];
            });
        }
        setSaving(false);
        return result;
    }

    async function handleDelete(priceId: string) {
        setSaving(true);
        const result = await deletePriceAction(priceId);
        if (result.success) {
            setPrices((prev) => prev.filter((p) => p.id !== priceId));
        }
        setSaving(false);
    }

    async function handleAddNew() {
        if (!newConceptId || !newPrice) return;
        const result = await handleUpsert(newConceptId, newPrice);
        if (result.success) {
            setShowAdd(false);
            setNewConceptId("");
            setNewPrice("");
        }
    }

    function startEdit(priceId: string, currentValue: number) {
        setEditing((prev) => ({ ...prev, [priceId]: String(currentValue) }));
    }

    async function confirmEdit(price: CollaboratorPrice) {
        const val = editing[price.id];
        if (val === undefined) return;
        await handleUpsert(price.conceptId, val);
        setEditing((prev) => {
            const next = { ...prev };
            delete next[price.id];
            return next;
        });
    }

    function cancelEdit(priceId: string) {
        setEditing((prev) => {
            const next = { ...prev };
            delete next[priceId];
            return next;
        });
    }

    return (
        <div className="space-y-6">
            {/* Stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-surface border border-border rounded-xl p-4">
                    <p className="text-xs text-muted">
                        Total Conceptos
                    </p>
                    <p className="text-2xl font-bold">{concepts.length}</p>
                </div>
                <div className="bg-surface border border-border rounded-xl p-4">
                    <p className="text-xs text-muted">
                        Precios Personalizados
                    </p>
                    <p className="text-2xl font-bold text-primary">
                        {prices.length}
                    </p>
                </div>
                <div className="bg-surface border border-border rounded-xl p-4">
                    <p className="text-xs text-muted">
                        Sin Personalizar
                    </p>
                    <p className="text-2xl font-bold text-muted">
                        {unpricedConcepts.length}
                    </p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3">
                <input
                    type="text"
                    placeholder="Buscar concepto..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                    onClick={() => setShowAdd(!showAdd)}
                    className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
                >
                    + Agregar Precio
                </button>
            </div>

            {/* Add new price form */}
            {showAdd && (
                <div className="bg-surface border border-primary/30 rounded-xl p-4 space-y-3">
                    <p className="text-sm font-medium">Nuevo Precio Personalizado</p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <select
                            value={newConceptId}
                            onChange={(e) => setNewConceptId(e.target.value)}
                            className="flex-1 bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm"
                        >
                            <option value="">Seleccionar concepto...</option>
                            {unpricedConcepts.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.title} — ${c.price.toLocaleString()} (default)
                                </option>
                            ))}
                        </select>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Precio"
                            value={newPrice}
                            onChange={(e) => setNewPrice(e.target.value)}
                            className="w-36 bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm"
                        />
                        <button
                            onClick={handleAddNew}
                            disabled={saving || !newConceptId || !newPrice}
                            className="px-4 py-2 bg-success hover:bg-success/90 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors cursor-pointer"
                        >
                            Guardar
                        </button>
                        <button
                            onClick={() => {
                                setShowAdd(false);
                                setNewConceptId("");
                                setNewPrice("");
                            }}
                            className="px-4 py-2 bg-surface-2 hover:bg-surface-2/80 rounded-lg text-sm transition-colors cursor-pointer"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* Price table */}
            <div className="bg-surface border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-surface-2/50">
                                <th className="text-left px-4 py-3 font-medium text-muted">
                                    Concepto
                                </th>
                                <th className="text-left px-4 py-3 font-medium text-muted">
                                    Categoría
                                </th>
                                <th className="text-left px-4 py-3 font-medium text-muted">
                                    Formato
                                </th>
                                <th className="text-right px-4 py-3 font-medium text-muted">
                                    Precio Admin
                                </th>
                                <th className="text-right px-4 py-3 font-medium text-muted">
                                    Mi Precio
                                </th>
                                <th className="text-right px-4 py-3 font-medium text-muted">
                                    Diferencia
                                </th>
                                <th className="text-center px-4 py-3 font-medium text-muted">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPrices.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-4 py-8 text-center text-muted"
                                    >
                                        {search
                                            ? "Sin resultados para la búsqueda"
                                            : "No tienes precios personalizados. ¡Agrega uno!"}
                                    </td>
                                </tr>
                            )}
                            {filteredPrices.map((p) => {
                                const isEditing = editing[p.id] !== undefined;
                                const diff =
                                    p.customPrice -
                                    (p.conceptDefaultPrice || 0);
                                const diffPercent =
                                    p.conceptDefaultPrice
                                        ? (
                                            (diff /
                                                p.conceptDefaultPrice) *
                                            100
                                        ).toFixed(1)
                                        : "—";

                                return (
                                    <tr
                                        key={p.id}
                                        className="border-b border-border/50 hover:bg-surface-2/30 transition-colors"
                                    >
                                        <td className="px-4 py-3 font-medium">
                                            {p.conceptTitle}
                                        </td>
                                        <td className="px-4 py-3 text-muted">
                                            {p.conceptCategory || "—"}
                                        </td>
                                        <td className="px-4 py-3 text-muted">
                                            {p.conceptFormat || "—"}
                                        </td>
                                        <td className="px-4 py-3 text-right text-muted">
                                            $
                                            {(
                                                p.conceptDefaultPrice || 0
                                            ).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={editing[p.id]}
                                                    onChange={(e) =>
                                                        setEditing(
                                                            (prev) => ({
                                                                ...prev,
                                                                [p.id]:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        )
                                                    }
                                                    className="w-28 bg-surface-2 border border-primary rounded px-2 py-1 text-sm text-right"
                                                    autoFocus
                                                />
                                            ) : (
                                                <span className="font-semibold text-primary">
                                                    $
                                                    {p.customPrice.toLocaleString(
                                                        "es-MX",
                                                        { minimumFractionDigits: 2 }
                                                    )}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span
                                                className={
                                                    diff > 0
                                                        ? "text-success"
                                                        : diff < 0
                                                            ? "text-danger"
                                                            : "text-muted"
                                                }
                                            >
                                                {diff > 0 ? "+" : ""}
                                                {diffPercent}%
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {isEditing ? (
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={() =>
                                                            confirmEdit(p)
                                                        }
                                                        disabled={saving}
                                                        className="px-2 py-1 bg-success/20 text-success rounded text-xs hover:bg-success/30 cursor-pointer"
                                                    >
                                                        ✓
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            cancelEdit(p.id)
                                                        }
                                                        className="px-2 py-1 bg-surface-2 rounded text-xs hover:bg-surface-2/80 cursor-pointer"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={() =>
                                                            startEdit(
                                                                p.id,
                                                                p.customPrice
                                                            )
                                                        }
                                                        className="px-2 py-1 bg-primary/20 text-primary rounded text-xs hover:bg-primary/30 cursor-pointer"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                p.id
                                                            )
                                                        }
                                                        disabled={saving}
                                                        className="px-2 py-1 bg-danger/20 text-danger rounded text-xs hover:bg-danger/30 cursor-pointer"
                                                    >
                                                        🗑
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
