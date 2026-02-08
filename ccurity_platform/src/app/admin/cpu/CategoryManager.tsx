"use client";

import { useState } from "react";

interface Props {
    categories: string[];
    onAdd: (name: string) => void;
    onRename: (oldName: string, newName: string) => void;
    onDelete: (name: string) => void;
    conceptCountByCategory: Record<string, number>;
}

export default function CategoryManager({
    categories,
    onAdd,
    onRename,
    onDelete,
    conceptCountByCategory,
}: Props) {
    const [newCat, setNewCat] = useState("");
    const [editing, setEditing] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    const handleAdd = () => {
        const name = newCat.trim();
        if (!name || categories.includes(name)) return;
        onAdd(name);
        setNewCat("");
    };

    const handleRenameStart = (cat: string) => {
        setEditing(cat);
        setEditValue(cat);
    };

    const handleRenameConfirm = () => {
        const name = editValue.trim();
        if (!name || !editing || name === editing) {
            setEditing(null);
            return;
        }
        onRename(editing, name);
        setEditing(null);
        setEditValue("");
    };

    const handleDelete = (cat: string) => {
        onDelete(cat);
        setConfirmDelete(null);
    };

    // Generate a consistent color from category name
    const catColor = (name: string) => {
        let hash = 0;
        for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
        const hue = Math.abs(hash) % 360;
        return { bg: `hsl(${hue}, 60%, 15%)`, border: `hsl(${hue}, 60%, 35%)`, text: `hsl(${hue}, 70%, 70%)` };
    };

    return (
        <div className="glass-card p-5 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                    🏷️ Gestión de Categorías
                </h3>
                <span className="text-xs text-muted">{categories.length} categorías</span>
            </div>

            {/* Add new category */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    placeholder="Nueva categoría..."
                    className="flex-1 px-3 py-2 rounded-lg bg-surface-2 border border-border text-foreground text-sm focus:outline-none focus:border-primary"
                />
                <button
                    onClick={handleAdd}
                    disabled={!newCat.trim()}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                    + Agregar
                </button>
            </div>

            {/* Category list */}
            {categories.length === 0 ? (
                <p className="text-sm text-muted text-center py-4">
                    No hay categorías. Agrega una usando el campo arriba.
                </p>
            ) : (
                <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                    {categories.map((cat) => {
                        const color = catColor(cat);
                        const count = conceptCountByCategory[cat] || 0;
                        const isEditing = editing === cat;
                        const isDeleting = confirmDelete === cat;

                        return (
                            <div
                                key={cat}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-2/50 transition-colors group"
                            >
                                {/* Color dot */}
                                <span
                                    className="w-3 h-3 rounded-full shrink-0"
                                    style={{ backgroundColor: color.border }}
                                />

                                {/* Name or edit input */}
                                {isEditing ? (
                                    <input
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") handleRenameConfirm();
                                            if (e.key === "Escape") setEditing(null);
                                        }}
                                        autoFocus
                                        className="flex-1 px-2 py-1 rounded bg-surface-2 border border-primary text-foreground text-sm focus:outline-none"
                                    />
                                ) : (
                                    <span
                                        className="flex-1 text-sm font-medium truncate"
                                        style={{ color: color.text }}
                                    >
                                        {cat}
                                    </span>
                                )}

                                {/* Concept count badge */}
                                <span className="text-xs text-muted shrink-0">
                                    {count} concepto{count !== 1 ? "s" : ""}
                                </span>

                                {/* Actions */}
                                {isEditing ? (
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            onClick={handleRenameConfirm}
                                            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                                        >
                                            ✓
                                        </button>
                                        <button
                                            onClick={() => setEditing(null)}
                                            className="text-xs text-muted hover:text-foreground"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : isDeleting ? (
                                    <div className="flex items-center gap-1 shrink-0">
                                        <span className="text-xs text-muted">¿Eliminar?</span>
                                        <button
                                            onClick={() => handleDelete(cat)}
                                            className="text-xs text-red-400 hover:text-red-300 font-medium"
                                        >
                                            Sí
                                        </button>
                                        <button
                                            onClick={() => setConfirmDelete(null)}
                                            className="text-xs text-muted hover:text-foreground"
                                        >
                                            No
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                        <button
                                            onClick={() => handleRenameStart(cat)}
                                            className="p-1 rounded hover:bg-primary/10 text-muted hover:text-primary-light transition-colors text-xs"
                                            title="Renombrar"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => setConfirmDelete(cat)}
                                            className="p-1 rounded hover:bg-red-500/10 text-muted hover:text-red-400 transition-colors text-xs"
                                            title="Eliminar"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
