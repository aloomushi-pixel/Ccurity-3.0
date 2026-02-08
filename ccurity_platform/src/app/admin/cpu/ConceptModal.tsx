"use client";

import { useState } from "react";
import type { Concept, PriceHistory } from "@/lib/data/concepts.types";
import { CONCEPT_FORMATS } from "@/lib/data/concepts.types";

interface Props {
    concept: Concept | null;
    priceHistory: PriceHistory[];
    quotationCount: number;
    categories: string[];
    onSave: (data: Partial<Concept>) => void;
    onClose: () => void;
}

export default function ConceptModal({
    concept,
    priceHistory,
    quotationCount,
    categories,
    onSave,
    onClose,
}: Props) {
    const [form, setForm] = useState({
        title: concept?.title || "",
        sat_code: concept?.sat_code || "",
        brand: concept?.brand || "",
        model: concept?.model || "",
        category: concept?.category || "",
        price: concept?.price?.toString() || "0",
        format: concept?.format || "",
        warranty_months: concept?.warranty_months?.toString() || "",
        execution_time: concept?.execution_time || "",
        description: concept?.description || "",
        imageUrl: concept?.imageUrl || "",
        specSheetUrl: concept?.specSheetUrl || "",
        isActive: concept?.isActive ?? true,
    });

    const set = (key: string, value: string | boolean) =>
        setForm((f) => ({ ...f, [key]: value }));

    const handleSave = () => {
        onSave({
            id: concept?.id,
            title: form.title,
            sat_code: form.sat_code || null,
            brand: form.brand || null,
            model: form.model || null,
            category: form.category || null,
            price: parseFloat(form.price) || 0,
            format: form.format || null,
            warranty_months: form.warranty_months ? parseInt(form.warranty_months) : null,
            execution_time: form.execution_time || null,
            description: form.description || null,
            imageUrl: form.imageUrl || null,
            specSheetUrl: form.specSheetUrl || null,
            isActive: form.isActive,
        } as Partial<Concept>);
    };

    const inputCls =
        "w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-foreground text-sm focus:outline-none focus:border-primary";

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-start justify-center overflow-y-auto py-8">
            <div className="glass-card w-full max-w-3xl mx-4 p-0 animate-in fade-in slide-in-from-bottom-4">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="text-lg font-semibold">
                        {concept ? "✏️ Editar Concepto" : "➕ Nuevo Concepto"}
                    </h2>
                    <div className="flex items-center gap-2">
                        {quotationCount > 0 && (
                            <span className="px-2 py-1 rounded-full text-xs bg-accent/10 text-accent border border-accent/20">
                                📊 Usado en {quotationCount} cotización{quotationCount !== 1 ? "es" : ""}
                            </span>
                        )}
                        <button
                            onClick={onClose}
                            className="text-muted hover:text-foreground text-xl transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
                    {/* Row 1: Title + Código SAT */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-xs text-muted mb-1">Título *</label>
                            <input
                                value={form.title}
                                onChange={(e) => set("title", e.target.value)}
                                className={inputCls}
                                placeholder="Ej: Cámara domo 4MP"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-muted mb-1">Código SAT</label>
                            <input
                                value={form.sat_code}
                                onChange={(e) => set("sat_code", e.target.value)}
                                className={inputCls}
                                placeholder="Ej: 46171600"
                            />
                        </div>
                    </div>

                    {/* Row 2: Brand + Model + Category */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs text-muted mb-1">Marca</label>
                            <input
                                value={form.brand}
                                onChange={(e) => set("brand", e.target.value)}
                                className={inputCls}
                                placeholder="Ej: Hikvision"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-muted mb-1">Modelo</label>
                            <input
                                value={form.model}
                                onChange={(e) => set("model", e.target.value)}
                                className={inputCls}
                                placeholder="DS-2CD1143G2-I"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-muted mb-1">Categoría</label>
                            <input
                                value={form.category}
                                onChange={(e) => set("category", e.target.value)}
                                className={inputCls}
                                placeholder="Videovigilancia"
                                list="modal-categories"
                            />
                            <datalist id="modal-categories">
                                {categories.map((c) => (
                                    <option key={c} value={c} />
                                ))}
                            </datalist>
                        </div>
                    </div>

                    {/* Row 3: Price + Format + Warranty + Execution Time */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs text-muted mb-1">Precio (MXN) *</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={form.price}
                                onChange={(e) => set("price", e.target.value)}
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-muted mb-1">Formato/Unidad</label>
                            <select
                                value={form.format}
                                onChange={(e) => set("format", e.target.value)}
                                className={inputCls}
                            >
                                <option value="">— Seleccionar —</option>
                                {CONCEPT_FORMATS.map((f) => (
                                    <option key={f} value={f}>{f}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-muted mb-1">Garantía (meses)</label>
                            <input
                                type="number"
                                min="0"
                                value={form.warranty_months}
                                onChange={(e) => set("warranty_months", e.target.value)}
                                className={inputCls}
                                placeholder="12"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-muted mb-1">Tiempo de Ejecución</label>
                            <input
                                value={form.execution_time}
                                onChange={(e) => set("execution_time", e.target.value)}
                                className={inputCls}
                                placeholder="Ej: 2 horas"
                            />
                        </div>
                    </div>

                    {/* Row 4: Image + Spec Sheet */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-muted mb-1">URL Imagen</label>
                            <input
                                value={form.imageUrl}
                                onChange={(e) => set("imageUrl", e.target.value)}
                                className={inputCls}
                                placeholder="https://..."
                            />
                            {form.imageUrl && (
                                <img
                                    src={form.imageUrl}
                                    alt="Preview"
                                    className="mt-2 w-20 h-20 rounded-lg object-cover border border-border"
                                />
                            )}
                        </div>
                        <div>
                            <label className="block text-xs text-muted mb-1">URL Ficha Técnica</label>
                            <input
                                value={form.specSheetUrl}
                                onChange={(e) => set("specSheetUrl", e.target.value)}
                                className={inputCls}
                                placeholder="https://..."
                            />
                            {form.specSheetUrl && (
                                <a
                                    href={form.specSheetUrl}
                                    target="_blank"
                                    rel="noopener"
                                    className="mt-2 inline-flex items-center gap-1 text-xs text-primary-light hover:underline"
                                >
                                    📄 Ver ficha técnica ↗
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Row 5: Description */}
                    <div>
                        <label className="block text-xs text-muted mb-1">Descripción</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => set("description", e.target.value)}
                            rows={3}
                            className={inputCls + " resize-none"}
                            placeholder="Descripción detallada del concepto..."
                        />
                    </div>

                    {/* Active toggle */}
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={form.isActive}
                            onChange={(e) => set("isActive", e.target.checked)}
                            className="accent-primary w-4 h-4"
                        />
                        <span className="text-sm">Concepto activo</span>
                    </label>

                    {/* Price History */}
                    {concept && priceHistory.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                                📈 Historial de Precios
                            </h4>
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                                {priceHistory.map((ph) => (
                                    <div
                                        key={ph.id}
                                        className="flex items-center gap-3 text-xs py-1.5 px-3 rounded bg-surface-2/50"
                                    >
                                        <span className="text-muted">
                                            {new Date(ph.changed_at).toLocaleDateString("es-MX", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </span>
                                        <span className="text-red-400 line-through font-mono">
                                            ${Number(ph.old_price).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                                        </span>
                                        <span className="text-muted">→</span>
                                        <span className="text-emerald-400 font-mono font-medium">
                                            ${Number(ph.new_price).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                                        </span>
                                        {Number(ph.new_price) > Number(ph.old_price) ? (
                                            <span className="text-red-400">↑</span>
                                        ) : (
                                            <span className="text-emerald-400">↓</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-surface-2 border border-border text-sm text-muted hover:text-foreground transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!form.title || !form.price}
                        className="px-5 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
                    >
                        {concept ? "Guardar Cambios" : "Crear Concepto"}
                    </button>
                </div>
            </div>
        </div>
    );
}
