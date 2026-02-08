"use client";

import { useState, useMemo } from "react";
import { createInlineClientAction } from "./actions";
import SectionTabs, { type TabData, type SectionType } from "./SectionTabs";
import TabLinker, { type TabLink } from "./TabLinker";
import type { ConceptOption } from "./ConceptSelector";

type Client = {
    id: string;
    name: string;
    email: string;
};

type ServiceTypeOption = {
    id: string;
    name: string;
    color: string | null;
    termsContent: string | null;
};

type TemplateOption = {
    id: string;
    name: string;
    theme: "light" | "dark";
};

interface Props {
    concepts: ConceptOption[];
    clients: Client[];
    serviceTypes: ServiceTypeOption[];
    templates: TemplateOption[];
    defaultTerms: string;
    defaultPrivacy: string;
    action: (formData: FormData) => Promise<void>;
}

const INITIAL_TABS: Record<SectionType, TabData[]> = {
    equipos: [{ id: `tab-equipos-init`, label: "General", items: [] }],
    materiales: [{ id: `tab-materiales-init`, label: "General", items: [] }],
    mano_de_obra: [{ id: `tab-mano_de_obra-init`, label: "General", items: [] }],
};

export function QuotationBuilder({
    concepts,
    clients,
    serviceTypes,
    templates,
    defaultTerms,
    defaultPrivacy,
    action,
}: Props) {
    // Header state
    const [title, setTitle] = useState("");
    const [clientId, setClientId] = useState("");
    const [serviceTypeId, setServiceTypeId] = useState("");
    const [templateId, setTemplateId] = useState(templates.find((t) => t.theme === "dark")?.id || templates[0]?.id || "");
    const [validDays, setValidDays] = useState(30);
    const [notes, setNotes] = useState("");
    const [paymentType, setPaymentType] = useState<"one_time" | "recurring">("one_time");

    // Inline client creation
    const [clientList, setClientList] = useState(clients);
    const [showNewClient, setShowNewClient] = useState(false);
    const [newClientName, setNewClientName] = useState("");
    const [newClientEmail, setNewClientEmail] = useState("");
    const [newClientPhone, setNewClientPhone] = useState("");
    const [creatingClient, setCreatingClient] = useState(false);

    // Sections state
    const [sectionTabs, setSectionTabs] = useState<Record<SectionType, TabData[]>>(INITIAL_TABS);

    // Links state
    const [tabLinks, setTabLinks] = useState<TabLink[]>([]);

    // Terms state
    const selectedServiceType = serviceTypes.find((st) => st.id === serviceTypeId);
    const termsContent = selectedServiceType?.termsContent || defaultTerms;
    const [customTerms, setCustomTerms] = useState("");
    const [showTermsEditor, setShowTermsEditor] = useState(false);

    // Computed totals
    const totals = useMemo(() => {
        const sections: Record<SectionType, number> = {
            equipos: 0,
            materiales: 0,
            mano_de_obra: 0,
        };
        for (const [section, tabs] of Object.entries(sectionTabs) as [SectionType, TabData[]][]) {
            for (const tab of tabs) {
                for (const item of tab.items) {
                    sections[section] += item.quantity * item.unitPrice;
                }
            }
        }
        const subtotal = sections.equipos + sections.materiales + sections.mano_de_obra;
        const tax = subtotal * 0.16;
        const total = subtotal + tax;
        const itemCount = Object.values(sectionTabs).reduce(
            (s, tabs) => s + tabs.reduce((s2, t) => s2 + t.items.length, 0),
            0
        );
        return { sections, subtotal, tax, total, itemCount };
    }, [sectionTabs]);

    const handleSubmit = () => {
        const fd = new FormData();
        fd.set("title", title);
        fd.set("clientId", clientId);
        fd.set("serviceTypeId", serviceTypeId);
        fd.set("templateId", templateId);
        fd.set("validDays", String(validDays));
        fd.set("notes", notes);
        fd.set("termsContent", customTerms || termsContent);
        fd.set("privacyNotice", defaultPrivacy);
        fd.set("paymentType", paymentType);

        // Serialize tabs
        const tabsPayload: { section: SectionType; label: string; tempId: string; position: number }[] = [];
        const itemsPayload: {
            tempTabId: string;
            section: string;
            conceptId: string | null;
            quantity: number;
            unitPrice: number;
            isCustom: boolean;
            customTitle: string | null;
            customDescription: string | null;
            customFormat: string | null;
        }[] = [];

        for (const [section, tabs] of Object.entries(sectionTabs) as [SectionType, TabData[]][]) {
            tabs.forEach((tab, pos) => {
                tabsPayload.push({ section, label: tab.label, tempId: tab.id, position: pos });
                for (const item of tab.items) {
                    itemsPayload.push({
                        tempTabId: tab.id,
                        section,
                        conceptId: item.conceptId,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        isCustom: item.isCustom,
                        customTitle: item.isCustom ? item.title : null,
                        customDescription: item.isCustom ? item.description : null,
                        customFormat: item.isCustom ? item.format : null,
                    });
                }
            });
        }

        fd.set("tabs", JSON.stringify(tabsPayload));
        fd.set("items", JSON.stringify(itemsPayload));
        fd.set("links", JSON.stringify(tabLinks.map((l) => ({
            sourceTempId: l.sourceTabId,
            targetTempId: l.targetTabId,
        }))));

        fd.set("subtotal", String(totals.subtotal));
        fd.set("tax", String(totals.tax));
        fd.set("total", String(totals.total));

        action(fd);
    };

    return (
        <div className="space-y-6">
            {/* ─── Header Fields ─────────────────────── */}
            <div className="glass-card p-5 space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted flex items-center gap-2">
                    📋 Información General
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="sm:col-span-2">
                        <label className="block text-xs text-muted mb-1">Título de Cotización *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-lg bg-surface-2 border border-border text-foreground text-sm focus:outline-none focus:border-primary"
                            placeholder="Ej: Proyecto Videovigilancia — Oficinas Centro"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-muted mb-1">Cliente *</label>
                        <div className="flex gap-2">
                            <select
                                value={clientId}
                                onChange={(e) => setClientId(e.target.value)}
                                className="flex-1 px-3 py-2.5 rounded-lg bg-surface-2 border border-border text-foreground text-sm focus:outline-none focus:border-primary"
                            >
                                <option value="">Seleccionar cliente</option>
                                {clientList.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} — {c.email}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={() => setShowNewClient(!showNewClient)}
                                className="px-3 py-2.5 rounded-lg bg-primary/20 text-primary text-sm font-medium hover:bg-primary/30 transition-colors whitespace-nowrap"
                                title="Nuevo cliente"
                            >
                                {showNewClient ? "✕" : "+ Nuevo"}
                            </button>
                        </div>
                        {showNewClient && (
                            <div className="mt-3 p-3 rounded-lg bg-surface-2 border border-border space-y-2">
                                <p className="text-xs font-semibold text-muted uppercase tracking-wider">Crear cliente rápido</p>
                                <input
                                    type="text"
                                    placeholder="Nombre *"
                                    value={newClientName}
                                    onChange={(e) => setNewClientName(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary"
                                />
                                <input
                                    type="email"
                                    placeholder="Email *"
                                    value={newClientEmail}
                                    onChange={(e) => setNewClientEmail(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary"
                                />
                                <input
                                    type="tel"
                                    placeholder="Teléfono (opcional)"
                                    value={newClientPhone}
                                    onChange={(e) => setNewClientPhone(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary"
                                />
                                <button
                                    type="button"
                                    disabled={creatingClient || !newClientName.trim() || !newClientEmail.trim()}
                                    onClick={async () => {
                                        setCreatingClient(true);
                                        try {
                                            const newClient = await createInlineClientAction(
                                                newClientName.trim(),
                                                newClientEmail.trim(),
                                                newClientPhone.trim() || undefined
                                            );
                                            setClientList((prev) => [...prev, newClient]);
                                            setClientId(newClient.id);
                                            setShowNewClient(false);
                                            setNewClientName("");
                                            setNewClientEmail("");
                                            setNewClientPhone("");
                                        } catch (err) {
                                            alert("Error al crear cliente: " + (err instanceof Error ? err.message : "Desconocido"));
                                        } finally {
                                            setCreatingClient(false);
                                        }
                                    }}
                                    className="w-full px-3 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                                >
                                    {creatingClient ? "Creando..." : "✓ Crear y seleccionar"}
                                </button>
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-xs text-muted mb-1">Vigencia (días)</label>
                        <input
                            type="number"
                            min="1"
                            value={validDays}
                            onChange={(e) => setValidDays(parseInt(e.target.value) || 30)}
                            className="w-full px-3 py-2.5 rounded-lg bg-surface-2 border border-border text-foreground text-sm focus:outline-none focus:border-primary"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-muted mb-1">Tipo de Servicio</label>
                        <select
                            value={serviceTypeId}
                            onChange={(e) => setServiceTypeId(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-lg bg-surface-2 border border-border text-foreground text-sm focus:outline-none focus:border-primary"
                        >
                            <option value="">Sin tipo de servicio</option>
                            {serviceTypes.map((st) => (
                                <option key={st.id} value={st.id}>
                                    {st.name}
                                </option>
                            ))}
                        </select>
                        {selectedServiceType?.termsContent && (
                            <p className="text-[10px] text-green-400 mt-1">
                                ✓ T&amp;C cargados automáticamente desde &quot;{selectedServiceType.name}&quot;
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="block text-xs text-muted mb-1">Plantilla de Diseño</label>
                        <select
                            value={templateId}
                            onChange={(e) => setTemplateId(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-lg bg-surface-2 border border-border text-foreground text-sm focus:outline-none focus:border-primary"
                        >
                            {templates.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name} ({t.theme === "dark" ? "🌙" : "☀️"} {t.theme})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Payment Type Toggle */}
                    <div>
                        <label className="block text-xs text-muted mb-1">Tipo de Pago</label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setPaymentType("one_time")}
                                className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${paymentType === "one_time"
                                        ? "bg-primary text-white shadow-lg shadow-primary/25"
                                        : "bg-surface-2 border border-border text-muted hover:text-foreground"
                                    }`}
                            >
                                💰 Pago único
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentType("recurring")}
                                className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${paymentType === "recurring"
                                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25"
                                        : "bg-surface-2 border border-border text-muted hover:text-foreground"
                                    }`}
                            >
                                🔄 Recurrente
                            </button>
                        </div>
                        <p className="text-[10px] text-muted mt-1">
                            {paymentType === "one_time"
                                ? "El cliente paga una sola vez el total de la cotización."
                                : "Se genera una suscripción mensual en Stripe por el total."
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* ─── Three Sections ────────────────────── */}
            {(["equipos", "materiales", "mano_de_obra"] as SectionType[]).map((section) => (
                <SectionTabs
                    key={section}
                    section={section}
                    tabs={sectionTabs[section]}
                    concepts={concepts}
                    onTabsChange={(tabs) =>
                        setSectionTabs((prev) => ({ ...prev, [section]: tabs }))
                    }
                />
            ))}

            {/* ─── Tab Linking ───────────────────────── */}
            <TabLinker
                allTabs={sectionTabs}
                links={tabLinks}
                onLinksChange={setTabLinks}
            />

            {/* ─── Price Summary ─────────────────────── */}
            <div className="glass-card p-5 space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted flex items-center gap-2">
                    📊 Resumen de Precios
                </h2>

                <div className="space-y-2">
                    {([
                        { key: "equipos" as SectionType, icon: "📦", label: "Equipos" },
                        { key: "materiales" as SectionType, icon: "🔧", label: "Materiales" },
                        { key: "mano_de_obra" as SectionType, icon: "👷", label: "Mano de Obra" },
                    ]).map(({ key, icon, label }) => (
                        <div key={key} className="flex items-center justify-between text-sm">
                            <span className="text-muted flex items-center gap-2">
                                <span>{icon}</span> {label}
                            </span>
                            <span className="font-mono">
                                ${totals.sections[key].toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    ))}

                    <div className="border-t border-border pt-2 mt-2 space-y-1">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted">Subtotal</span>
                            <span className="font-mono">
                                ${totals.subtotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted">IVA (16%)</span>
                            <span className="font-mono">
                                ${totals.tax.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-base font-bold pt-1 border-t border-border/50">
                            <span>Total</span>
                            <span className="font-mono gradient-text">
                                ${totals.total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Terms & Conditions ────────────────── */}
            <div className="glass-card p-5 space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-muted flex items-center gap-2">
                        📝 Términos y Condiciones
                    </h2>
                    <button
                        type="button"
                        onClick={() => setShowTermsEditor(!showTermsEditor)}
                        className="text-xs text-primary hover:text-primary-light transition-colors cursor-pointer"
                    >
                        {showTermsEditor ? "Ocultar editor" : "✏️ Personalizar"}
                    </button>
                </div>

                {selectedServiceType?.termsContent && !showTermsEditor && (
                    <div className="text-xs text-muted bg-surface-2 rounded-lg p-3 max-h-32 overflow-y-auto whitespace-pre-wrap">
                        {termsContent}
                    </div>
                )}

                {showTermsEditor && (
                    <textarea
                        value={customTerms || termsContent}
                        onChange={(e) => setCustomTerms(e.target.value)}
                        rows={5}
                        className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-foreground text-sm focus:outline-none focus:border-primary resize-none"
                        placeholder="Escribir o editar los términos y condiciones..."
                    />
                )}

                {!selectedServiceType?.termsContent && !showTermsEditor && (
                    <p className="text-xs text-muted">
                        {serviceTypeId
                            ? "Este tipo de servicio no tiene T&C configurados. Usa \"Personalizar\" para agregar."
                            : "Selecciona un tipo de servicio para cargar T&C automáticamente, o personaliza."}
                    </p>
                )}
            </div>

            {/* ─── Notes ─────────────────────────────── */}
            <div className="glass-card p-5 space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted flex items-center gap-2">
                    💬 Notas Adicionales
                </h2>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-foreground text-sm focus:outline-none focus:border-primary resize-none"
                    placeholder="Notas adicionales, condiciones especiales, observaciones..."
                />
            </div>

            {/* ─── Submit ────────────────────────────── */}
            <div className="flex items-center justify-between glass-card p-4">
                <p className="text-xs text-muted">
                    {totals.itemCount} {totals.itemCount === 1 ? "concepto" : "conceptos"} ·{" "}
                    {Object.values(sectionTabs).reduce((s, tabs) => s + tabs.length, 0)} pestañas ·{" "}
                    {tabLinks.length} vinculaciones · Total:{" "}
                    <span className="font-semibold text-foreground">
                        ${totals.total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </span>
                </p>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!title.trim() || !clientId || totals.itemCount === 0}
                    className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-primary to-accent text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                    Crear Cotización
                </button>
            </div>
        </div>
    );
}
