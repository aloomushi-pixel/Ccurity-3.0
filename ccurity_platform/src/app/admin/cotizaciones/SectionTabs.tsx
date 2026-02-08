"use client";

import { useState } from "react";
import ConceptSelector, { type ConceptOption, type SelectedItem } from "./ConceptSelector";

export type TabData = {
    id: string;
    label: string;
    items: SelectedItem[];
};

export type SectionType = "equipos" | "materiales" | "mano_de_obra";

const SECTION_CONFIG: Record<SectionType, { icon: string; title: string; color: string }> = {
    equipos: { icon: "📦", title: "Equipos", color: "from-blue-500/20 to-blue-600/10" },
    materiales: { icon: "🔧", title: "Materiales", color: "from-amber-500/20 to-amber-600/10" },
    mano_de_obra: { icon: "👷", title: "Mano de Obra", color: "from-green-500/20 to-green-600/10" },
};

const MAX_TABS = 5;

interface Props {
    section: SectionType;
    tabs: TabData[];
    concepts: ConceptOption[];
    onTabsChange: (tabs: TabData[]) => void;
}

export default function SectionTabs({ section, tabs, concepts, onTabsChange }: Props) {
    const [activeTabIdx, setActiveTabIdx] = useState(0);
    const [addingTab, setAddingTab] = useState(false);
    const [newTabLabel, setNewTabLabel] = useState("");
    const [editingTabIdx, setEditingTabIdx] = useState<number | null>(null);
    const [editLabel, setEditLabel] = useState("");
    const [collapsed, setCollapsed] = useState(false);

    const config = SECTION_CONFIG[section];
    const activeTab = tabs[activeTabIdx];

    const sectionSubtotal = tabs.reduce(
        (sum, tab) => sum + tab.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0),
        0
    );

    const addTab = () => {
        if (!newTabLabel.trim() || tabs.length >= MAX_TABS) return;
        const newTab: TabData = {
            id: `tab-${section}-${Date.now()}`,
            label: newTabLabel.trim(),
            items: [],
        };
        onTabsChange([...tabs, newTab]);
        setActiveTabIdx(tabs.length);
        setNewTabLabel("");
        setAddingTab(false);
    };

    const removeTab = (idx: number) => {
        if (tabs.length <= 1) return;
        const updated = tabs.filter((_, i) => i !== idx);
        onTabsChange(updated);
        if (activeTabIdx >= updated.length) setActiveTabIdx(Math.max(0, updated.length - 1));
        else if (activeTabIdx === idx) setActiveTabIdx(0);
    };

    const renameTab = (idx: number, newLabel: string) => {
        if (!newLabel.trim()) return;
        const updated = tabs.map((t, i) => (i === idx ? { ...t, label: newLabel.trim() } : t));
        onTabsChange(updated);
        setEditingTabIdx(null);
    };

    const addItem = (item: SelectedItem) => {
        if (!activeTab) return;
        // Check if same concept already in this tab
        const existingIdx = activeTab.items.findIndex(
            (i) => !i.isCustom && i.conceptId === item.conceptId && item.conceptId !== null
        );
        let updatedItems: SelectedItem[];
        if (existingIdx >= 0) {
            updatedItems = activeTab.items.map((i, idx) =>
                idx === existingIdx ? { ...i, quantity: i.quantity + 1 } : i
            );
        } else {
            updatedItems = [...activeTab.items, item];
        }
        const updated = tabs.map((t, i) =>
            i === activeTabIdx ? { ...t, items: updatedItems } : t
        );
        onTabsChange(updated);
    };

    const removeItem = (itemId: string) => {
        const updated = tabs.map((t, i) =>
            i === activeTabIdx
                ? { ...t, items: t.items.filter((it) => it.id !== itemId) }
                : t
        );
        onTabsChange(updated);
    };

    const updateItemQty = (itemId: string, qty: number) => {
        if (qty < 1) return;
        const updated = tabs.map((t, i) =>
            i === activeTabIdx
                ? { ...t, items: t.items.map((it) => (it.id === itemId ? { ...it, quantity: qty } : it)) }
                : t
        );
        onTabsChange(updated);
    };

    const updateItemPrice = (itemId: string, price: number) => {
        if (price < 0) return;
        const updated = tabs.map((t, i) =>
            i === activeTabIdx
                ? { ...t, items: t.items.map((it) => (it.id === itemId ? { ...it, unitPrice: price } : it)) }
                : t
        );
        onTabsChange(updated);
    };

    return (
        <div className="glass-card overflow-hidden">
            {/* Section header */}
            <button
                type="button"
                onClick={() => setCollapsed(!collapsed)}
                className={`w-full flex items-center justify-between px-5 py-3 bg-gradient-to-r ${config.color} cursor-pointer transition-colors hover:opacity-90`}
            >
                <div className="flex items-center gap-3">
                    <span className="text-xl">{config.icon}</span>
                    <h3 className="text-sm font-semibold uppercase tracking-wider">{config.title}</h3>
                    <span className="text-xs text-muted bg-surface-2/60 px-2 py-0.5 rounded-full">
                        {tabs.reduce((s, t) => s + t.items.length, 0)} items
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-mono font-medium">
                        ${sectionSubtotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </span>
                    <span className={`text-muted transition-transform ${collapsed ? "" : "rotate-180"}`}>▾</span>
                </div>
            </button>

            {!collapsed && (
                <div className="p-4 space-y-4">
                    {/* Tabs bar */}
                    <div className="flex items-center gap-1 border-b border-border pb-1 overflow-x-auto">
                        {tabs.map((tab, idx) => (
                            <div key={tab.id} className="flex items-center group shrink-0">
                                {editingTabIdx === idx ? (
                                    <input
                                        type="text"
                                        value={editLabel}
                                        onChange={(e) => setEditLabel(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") renameTab(idx, editLabel);
                                            if (e.key === "Escape") setEditingTabIdx(null);
                                        }}
                                        onBlur={() => renameTab(idx, editLabel)}
                                        autoFocus
                                        className="px-3 py-1.5 text-xs rounded bg-surface-2 border border-primary text-foreground focus:outline-none w-28"
                                    />
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setActiveTabIdx(idx)}
                                        onDoubleClick={() => {
                                            setEditingTabIdx(idx);
                                            setEditLabel(tab.label);
                                        }}
                                        className={`px-3 py-1.5 text-xs rounded-t-lg transition-colors cursor-pointer ${idx === activeTabIdx
                                                ? "bg-surface-2 text-foreground font-medium border-b-2 border-primary"
                                                : "text-muted hover:text-foreground hover:bg-surface-2/50"
                                            }`}
                                        title="Doble click para renombrar"
                                    >
                                        {tab.label}
                                        <span className="ml-1.5 text-[10px] text-muted">
                                            ({tab.items.length})
                                        </span>
                                    </button>
                                )}
                                {tabs.length > 1 && idx === activeTabIdx && (
                                    <button
                                        type="button"
                                        onClick={() => removeTab(idx)}
                                        className="ml-0.5 text-muted hover:text-red-400 transition-colors text-xs leading-none cursor-pointer opacity-0 group-hover:opacity-100"
                                        title="Eliminar pestaña"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}

                        {/* Add tab */}
                        {tabs.length < MAX_TABS && (
                            <div className="shrink-0">
                                {addingTab ? (
                                    <div className="flex items-center gap-1">
                                        <input
                                            type="text"
                                            value={newTabLabel}
                                            onChange={(e) => setNewTabLabel(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") addTab();
                                                if (e.key === "Escape") {
                                                    setAddingTab(false);
                                                    setNewTabLabel("");
                                                }
                                            }}
                                            autoFocus
                                            className="px-2 py-1 text-xs rounded bg-surface-2 border border-border text-foreground focus:outline-none focus:border-primary w-28"
                                            placeholder="Nombre pestaña"
                                        />
                                        <button
                                            type="button"
                                            onClick={addTab}
                                            className="text-primary text-xs font-medium cursor-pointer hover:text-primary-light"
                                        >
                                            ✓
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setAddingTab(true)}
                                        className="px-2 py-1.5 text-xs text-muted hover:text-primary transition-colors cursor-pointer"
                                        title="Agregar pestaña"
                                    >
                                        + Pestaña
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Concept selector for active tab */}
                    {activeTab && (
                        <>
                            <ConceptSelector concepts={concepts} onAdd={addItem} />

                            {/* Items table */}
                            {activeTab.items.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-border">
                                                <th className="text-left py-2 px-3 text-muted font-medium text-xs">#</th>
                                                <th className="text-left py-2 px-3 text-muted font-medium text-xs">Concepto</th>
                                                <th className="text-center py-2 px-3 text-muted font-medium text-xs w-20">Cant.</th>
                                                <th className="text-right py-2 px-3 text-muted font-medium text-xs w-32">P. Unit.</th>
                                                <th className="text-right py-2 px-3 text-muted font-medium text-xs w-32">Subtotal</th>
                                                <th className="w-8"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {activeTab.items.map((item, idx) => (
                                                <tr
                                                    key={item.id}
                                                    className="border-b border-border/30 hover:bg-surface-2/30 transition-colors"
                                                >
                                                    <td className="py-2 px-3 text-muted text-xs">{idx + 1}</td>
                                                    <td className="py-2 px-3">
                                                        <span className="font-medium text-sm">{item.title}</span>
                                                        {item.isCustom && (
                                                            <span className="ml-1.5 text-[10px] text-amber-400 bg-amber-500/10 px-1 py-0.5 rounded">
                                                                personalizado
                                                            </span>
                                                        )}
                                                        {item.format && (
                                                            <span className="text-xs text-muted ml-2">/ {item.format}</span>
                                                        )}
                                                    </td>
                                                    <td className="py-2 px-3">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={item.quantity}
                                                            onChange={(e) =>
                                                                updateItemQty(item.id, parseInt(e.target.value) || 1)
                                                            }
                                                            className="w-full text-center px-2 py-1 rounded bg-surface-2 border border-border text-foreground text-sm focus:outline-none focus:border-primary"
                                                        />
                                                    </td>
                                                    <td className="py-2 px-3">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={item.unitPrice}
                                                            onChange={(e) =>
                                                                updateItemPrice(item.id, parseFloat(e.target.value) || 0)
                                                            }
                                                            className="w-full text-right px-2 py-1 rounded bg-surface-2 border border-border text-foreground text-sm font-mono focus:outline-none focus:border-primary"
                                                        />
                                                    </td>
                                                    <td className="py-2 px-3 text-right font-mono font-medium text-sm">
                                                        ${(item.quantity * item.unitPrice).toLocaleString("es-MX", {
                                                            minimumFractionDigits: 2,
                                                        })}
                                                    </td>
                                                    <td className="py-2 px-3 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeItem(item.id)}
                                                            className="text-muted hover:text-red-400 transition-colors cursor-pointer text-lg leading-none"
                                                        >
                                                            ×
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {/* Tab subtotal */}
                                    <div className="flex justify-end px-3 py-2 text-sm">
                                        <span className="text-muted mr-4">Subtotal pestaña:</span>
                                        <span className="font-mono font-medium">
                                            ${activeTab.items
                                                .reduce((s, i) => s + i.quantity * i.unitPrice, 0)
                                                .toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6 text-muted text-sm">
                                    <div className="text-2xl mb-1">{config.icon}</div>
                                    Agrega conceptos a esta pestaña usando el buscador
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
