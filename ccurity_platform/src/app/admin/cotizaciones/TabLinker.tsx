"use client";

import { useState } from "react";
import type { TabData, SectionType } from "./SectionTabs";

export type TabLink = {
    id: string;
    sourceTabId: string;
    targetTabId: string;
};

const SECTION_LABELS: Record<SectionType, string> = {
    equipos: "📦 Equipos",
    materiales: "🔧 Materiales",
    mano_de_obra: "👷 Mano de Obra",
};

interface Props {
    allTabs: Record<SectionType, TabData[]>;
    links: TabLink[];
    onLinksChange: (links: TabLink[]) => void;
}

export default function TabLinker({ allTabs, links, onLinksChange }: Props) {
    const [addingLink, setAddingLink] = useState(false);
    const [sourceTab, setSourceTab] = useState("");
    const [targetTabs, setTargetTabs] = useState<string[]>([]);

    // Flatten all tabs with section info
    const allTabsFlat = (Object.entries(allTabs) as [SectionType, TabData[]][]).flatMap(
        ([section, tabs]) =>
            tabs.map((t) => ({ ...t, section }))
    );

    const getTabLabel = (tabId: string) => {
        const tab = allTabsFlat.find((t) => t.id === tabId);
        if (!tab) return "—";
        return `${SECTION_LABELS[tab.section]} → ${tab.label}`;
    };

    const addLinks = () => {
        if (!sourceTab || targetTabs.length === 0) return;
        const newLinks = targetTabs
            .filter((t) => !links.some((l) => l.sourceTabId === sourceTab && l.targetTabId === t))
            .map((t) => ({
                id: `link-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
                sourceTabId: sourceTab,
                targetTabId: t,
            }));
        onLinksChange([...links, ...newLinks]);
        setSourceTab("");
        setTargetTabs([]);
        setAddingLink(false);
    };

    const removeLink = (linkId: string) => {
        onLinksChange(links.filter((l) => l.id !== linkId));
    };

    const toggleTarget = (tabId: string) => {
        setTargetTabs((prev) =>
            prev.includes(tabId) ? prev.filter((t) => t !== tabId) : [...prev, tabId]
        );
    };

    // Available targets: tabs from different sections than source
    const sourceTabData = allTabsFlat.find((t) => t.id === sourceTab);
    const availableTargets = sourceTabData
        ? allTabsFlat.filter((t) => t.section !== sourceTabData.section)
        : [];

    if (allTabsFlat.length < 2) return null; // Not enough tabs to link

    return (
        <div className="glass-card p-4 space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-lg">🔗</span>
                    <h3 className="text-sm font-semibold">Vinculaciones entre Pestañas</h3>
                    <span className="text-xs text-muted">
                        {links.length === 0 ? "Sin vinculaciones" : `${links.length} vinculación(es)`}
                    </span>
                </div>
                {!addingLink && (
                    <button
                        type="button"
                        onClick={() => setAddingLink(true)}
                        className="px-3 py-1.5 text-xs rounded-lg bg-surface-2 border border-border text-muted hover:text-foreground hover:border-primary transition-colors cursor-pointer"
                    >
                        + Agregar Vinculación
                    </button>
                )}
            </div>

            {/* Existing links */}
            {links.length > 0 && (
                <div className="space-y-1.5">
                    {links.map((link) => (
                        <div
                            key={link.id}
                            className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-surface-2/50 text-sm"
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="text-xs truncate font-medium">{getTabLabel(link.sourceTabId)}</span>
                                <span className="text-primary shrink-0">⟷</span>
                                <span className="text-xs truncate font-medium">{getTabLabel(link.targetTabId)}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeLink(link.id)}
                                className="text-muted hover:text-red-400 transition-colors cursor-pointer text-sm leading-none shrink-0"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Add link form */}
            {addingLink && (
                <div className="border border-primary/30 rounded-lg p-4 space-y-3 bg-primary/5">
                    <div className="text-xs text-primary-light font-medium uppercase tracking-wider">
                        Nueva Vinculación
                    </div>

                    {/* Source tab */}
                    <div>
                        <label className="block text-xs text-muted mb-1">Pestaña origen</label>
                        <select
                            value={sourceTab}
                            onChange={(e) => {
                                setSourceTab(e.target.value);
                                setTargetTabs([]);
                            }}
                            className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-foreground text-sm focus:outline-none focus:border-primary"
                        >
                            <option value="">Seleccionar...</option>
                            {(Object.entries(allTabs) as [SectionType, TabData[]][]).map(([section, tabs]) =>
                                tabs.map((tab) => (
                                    <option key={tab.id} value={tab.id}>
                                        {SECTION_LABELS[section]} → {tab.label}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>

                    {/* Target tabs (checkboxes) */}
                    {sourceTab && availableTargets.length > 0 && (
                        <div>
                            <label className="block text-xs text-muted mb-2">
                                Vincular con (puedes seleccionar varias)
                            </label>
                            <div className="space-y-1.5">
                                {availableTargets.map((tab) => (
                                    <label
                                        key={tab.id}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-2/50 hover:bg-surface-2 transition-colors cursor-pointer text-sm"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={targetTabs.includes(tab.id)}
                                            onChange={() => toggleTarget(tab.id)}
                                            className="accent-primary"
                                        />
                                        <span className="text-xs text-muted">{SECTION_LABELS[tab.section]} →</span>
                                        <span className="font-medium">{tab.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                            type="button"
                            onClick={() => {
                                setAddingLink(false);
                                setSourceTab("");
                                setTargetTabs([]);
                            }}
                            className="px-3 py-1.5 text-xs text-muted hover:text-foreground transition-colors cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={addLinks}
                            disabled={!sourceTab || targetTabs.length === 0}
                            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-primary to-accent text-white text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-40 cursor-pointer"
                        >
                            Vincular {targetTabs.length > 0 && `(${targetTabs.length})`}
                        </button>
                    </div>
                </div>
            )}

            {links.length === 0 && !addingLink && (
                <p className="text-xs text-muted">
                    Las vinculaciones permiten que al cliente ver la cotización, al hacer click en una pestaña
                    automáticamente se muestre la pestaña vinculada en otra categoría.
                </p>
            )}
        </div>
    );
}
