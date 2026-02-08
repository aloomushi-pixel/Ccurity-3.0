"use client";

import { useState, useMemo, useRef, useEffect } from "react";

export type ConceptOption = {
    id: string;
    title: string;
    description: string | null;
    category: string | null;
    format: string | null;
    price: number;
    brand: string | null;
    model: string | null;
    sat_code: string | null;
};

export type SelectedItem = {
    id: string; // unique row id (conceptId or generated)
    conceptId: string | null;
    title: string;
    description: string | null;
    format: string | null;
    quantity: number;
    unitPrice: number;
    isCustom: boolean;
};

interface Props {
    concepts: ConceptOption[];
    onAdd: (item: SelectedItem) => void;
}

export default function ConceptSelector({ concepts, onAdd }: Props) {
    const [search, setSearch] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [showCustomForm, setShowCustomForm] = useState(false);
    const [customTitle, setCustomTitle] = useState("");
    const [customDesc, setCustomDesc] = useState("");
    const [customFormat, setCustomFormat] = useState("");
    const [customPrice, setCustomPrice] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const filtered = useMemo(() => {
        if (!search) return concepts.slice(0, 20);
        const q = search.toLowerCase();
        return concepts
            .filter(
                (c) =>
                    c.title.toLowerCase().includes(q) ||
                    (c.category && c.category.toLowerCase().includes(q)) ||
                    (c.sat_code && c.sat_code.toLowerCase().includes(q)) ||
                    (c.brand && c.brand.toLowerCase().includes(q)) ||
                    (c.model && c.model.toLowerCase().includes(q))
            )
            .slice(0, 20);
    }, [search, concepts]);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
                inputRef.current && !inputRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const addFromCatalog = (concept: ConceptOption) => {
        onAdd({
            id: concept.id,
            conceptId: concept.id,
            title: concept.title,
            description: concept.description,
            format: concept.format,
            quantity: 1,
            unitPrice: Number(concept.price),
            isCustom: false,
        });
        setSearch("");
        setShowDropdown(false);
    };

    const addCustom = () => {
        if (!customTitle.trim()) return;
        onAdd({
            id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            conceptId: null,
            title: customTitle.trim(),
            description: customDesc.trim() || null,
            format: customFormat.trim() || null,
            quantity: 1,
            unitPrice: Number(customPrice) || 0,
            isCustom: true,
        });
        setCustomTitle("");
        setCustomDesc("");
        setCustomFormat("");
        setCustomPrice("");
        setShowCustomForm(false);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                {/* Search input */}
                <div className="relative flex-1">
                    <input
                        ref={inputRef}
                        type="text"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setShowDropdown(true);
                        }}
                        onFocus={() => setShowDropdown(true)}
                        className="w-full px-4 py-2.5 rounded-lg bg-surface-2 border border-border text-foreground text-sm focus:outline-none focus:border-primary pl-9"
                        placeholder="Buscar concepto por nombre, código SAT, marca..."
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">🔍</span>

                    {showDropdown && (
                        <div
                            ref={dropdownRef}
                            className="absolute z-50 top-full left-0 right-0 mt-1 max-h-72 overflow-y-auto glass-card p-0 border border-border shadow-xl rounded-lg"
                        >
                            {filtered.length === 0 ? (
                                <div className="px-4 py-3 text-sm text-muted">
                                    Sin resultados — usa &quot;Concepto Personalizado&quot; →
                                </div>
                            ) : (
                                filtered.map((c) => (
                                    <button
                                        type="button"
                                        key={c.id}
                                        onClick={() => addFromCatalog(c)}
                                        className="w-full text-left px-4 py-2.5 hover:bg-surface-2 transition-colors flex items-center justify-between gap-4 border-b border-border/30 last:border-0 cursor-pointer"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium truncate">{c.title}</span>
                                                {c.sat_code && (
                                                    <span className="text-[10px] text-muted font-mono bg-surface-2 px-1.5 py-0.5 rounded shrink-0">
                                                        {c.sat_code}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                {c.category && (
                                                    <span className="text-[10px] text-primary-light bg-primary/10 px-1.5 py-0.5 rounded">
                                                        {c.category}
                                                    </span>
                                                )}
                                                {c.brand && (
                                                    <span className="text-[10px] text-muted">{c.brand}</span>
                                                )}
                                                {c.model && (
                                                    <span className="text-[10px] text-muted">· {c.model}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className="text-sm font-mono font-medium">
                                                ${Number(c.price).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                                            </span>
                                            {c.format && (
                                                <span className="text-[10px] text-muted ml-1">/{c.format}</span>
                                            )}
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Custom concept button */}
                <button
                    type="button"
                    onClick={() => setShowCustomForm(!showCustomForm)}
                    className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors flex items-center gap-2 shrink-0 cursor-pointer ${showCustomForm
                        ? "bg-primary/10 text-primary-light border-primary/40"
                        : "bg-surface-2 text-muted border-border hover:text-foreground hover:border-primary"
                        }`}
                >
                    ✏️ Personalizado
                </button>
            </div>

            {/* Custom concept inline form */}
            {showCustomForm && (
                <div className="glass-card p-4 space-y-3 border-primary/30">
                    <div className="text-xs text-primary-light font-medium uppercase tracking-wider">
                        Concepto Personalizado
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="sm:col-span-2">
                            <input
                                type="text"
                                value={customTitle}
                                onChange={(e) => setCustomTitle(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-foreground text-sm focus:outline-none focus:border-primary"
                                placeholder="Título del concepto *"
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                value={customFormat}
                                onChange={(e) => setCustomFormat(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-foreground text-sm focus:outline-none focus:border-primary"
                                placeholder="Unidad (PZA, ML, etc.)"
                            />
                        </div>
                        <div>
                            <input
                                type="number"
                                value={customPrice}
                                onChange={(e) => setCustomPrice(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-foreground text-sm focus:outline-none focus:border-primary"
                                placeholder="Precio unitario"
                                step="0.01"
                                min="0"
                            />
                        </div>
                    </div>
                    <div>
                        <input
                            type="text"
                            value={customDesc}
                            onChange={(e) => setCustomDesc(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-foreground text-sm focus:outline-none focus:border-primary"
                            placeholder="Descripción (opcional)"
                        />
                    </div>
                    <div className="flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setShowCustomForm(false)}
                            className="px-3 py-1.5 text-sm text-muted hover:text-foreground transition-colors cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={addCustom}
                            disabled={!customTitle.trim()}
                            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-primary to-accent text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 cursor-pointer"
                        >
                            + Agregar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
