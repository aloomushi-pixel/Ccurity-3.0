import Link from "next/link";

import { getServiceTypes } from "@/lib/data/services";
import { getTemplateConceptsByServiceType } from "@/lib/data/service-type-concepts";
import { getConcepts } from "@/lib/data/concepts";
import {
    addTemplateConceptAction,
    removeTemplateConceptAction,
} from "./actions";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Plantillas de Levantamiento — Ccurity Admin",
    description: "Configura qué conceptos incluye cada tipo de servicio.",
};

export default async function PlantillasPage({
    searchParams,
}: {
    searchParams: Promise<{ tipo?: string }>;
}) {
    const { tipo: selectedTypeId } = await searchParams;
    const [types, allConcepts] = await Promise.all([
        getServiceTypes(),
        getConcepts(),
    ]);

    // Obtener plantilla del tipo seleccionado
    const templateConcepts = selectedTypeId
        ? await getTemplateConceptsByServiceType(selectedTypeId)
        : [];

    const selectedType = types.find((t) => t.id === selectedTypeId);

    // Conceptos que aún no están en la plantilla
    const templateConceptIds = new Set(templateConcepts.map((tc) => tc.conceptId));
    const availableConcepts = allConcepts.filter(
        (c) => c.isActive && !templateConceptIds.has(c.id)
    );

    return (
        <>
            {/* Selector de tipo */}
            <div className="glass-card p-5">
                <h2 className="text-sm font-semibold mb-3">Seleccionar Tipo de Servicio</h2>
                <div className="flex flex-wrap gap-2">
                    {types.map((t) => (
                        <Link
                            key={t.id}
                            href={`/admin/servicios/tipos/plantillas?tipo=${t.id}`}
                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${selectedTypeId === t.id
                                ? "ring-2 ring-offset-2 ring-offset-background opacity-100"
                                : "opacity-60 hover:opacity-100"
                                }`}
                            style={{
                                backgroundColor: `${t.color}20`,
                                color: t.color ?? undefined,
                                borderColor: `${t.color}40`,
                                ...(selectedTypeId === t.id
                                    ? { ringColor: t.color ?? undefined }
                                    : {}),
                            }}
                        >
                            {t.name}
                        </Link>
                    ))}
                </div>
                {types.length === 0 && (
                    <p className="text-sm text-muted mt-2">
                        No hay tipos de servicio.{" "}
                        <Link href="/admin/servicios/tipos" className="text-primary-light hover:underline">
                            Crear uno →
                        </Link>
                    </p>
                )}
            </div>

            {selectedType && (
                <>
                    {/* Agregar concepto a plantilla */}
                    <div className="glass-card p-5 space-y-3">
                        <h2 className="text-sm font-semibold">
                            Agregar Concepto a{" "}
                            <span style={{ color: selectedType.color ?? undefined }}>
                                {selectedType.name}
                            </span>
                        </h2>
                        <form
                            action={addTemplateConceptAction}
                            className="flex flex-col sm:flex-row gap-3"
                        >
                            <input type="hidden" name="serviceTypeId" value={selectedType.id} />
                            <select
                                name="conceptId"
                                required
                                className="flex-1 px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm focus:outline-none focus:border-primary"
                            >
                                <option value="">Seleccionar concepto…</option>
                                {availableConcepts.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.title} — {c.category || "Sin categoría"} (${c.price.toLocaleString("es-MX")})
                                    </option>
                                ))}
                            </select>
                            <input
                                name="defaultQuantity"
                                type="number"
                                min="1"
                                defaultValue="1"
                                className="w-24 px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm text-center focus:outline-none focus:border-primary"
                                placeholder="Cant."
                            />
                            <button
                                type="submit"
                                className="px-6 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
                            >
                                + Agregar
                            </button>
                        </form>
                        {availableConcepts.length === 0 && (
                            <p className="text-xs text-muted">
                                Todos los conceptos activos ya están en esta plantilla.
                            </p>
                        )}
                    </div>

                    {/* Lista de conceptos en plantilla */}
                    <div className="glass-card overflow-hidden">
                        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                            <h3 className="text-sm font-semibold">
                                📦 Conceptos en Plantilla
                                <span className="text-muted font-normal ml-2">
                                    ({templateConcepts.length})
                                </span>
                            </h3>
                        </div>

                        {templateConcepts.length === 0 ? (
                            <div className="p-8 text-center text-muted text-sm">
                                Esta plantilla no tiene conceptos aún. Agrega conceptos arriba.
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left py-2 px-4 text-muted font-medium text-xs">
                                            Concepto
                                        </th>
                                        <th className="text-left py-2 px-4 text-muted font-medium text-xs">
                                            Categoría
                                        </th>
                                        <th className="text-left py-2 px-4 text-muted font-medium text-xs">
                                            Formato
                                        </th>
                                        <th className="text-right py-2 px-4 text-muted font-medium text-xs">
                                            Precio Admin
                                        </th>
                                        <th className="text-center py-2 px-4 text-muted font-medium text-xs">
                                            Cant. Default
                                        </th>
                                        <th className="text-right py-2 px-4 text-muted font-medium text-xs">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {templateConcepts.map((tc) => (
                                        <tr
                                            key={tc.id}
                                            className="border-b border-border/30 hover:bg-surface-2/30 transition-colors"
                                        >
                                            <td className="py-2 px-4 font-medium">
                                                {tc.conceptTitle}
                                            </td>
                                            <td className="py-2 px-4 text-muted text-xs">
                                                {tc.conceptCategory || "—"}
                                            </td>
                                            <td className="py-2 px-4 text-muted text-xs">
                                                {tc.conceptFormat || "—"}
                                            </td>
                                            <td className="py-2 px-4 text-right font-mono">
                                                ${(tc.conceptPrice ?? 0).toLocaleString("es-MX", {
                                                    minimumFractionDigits: 2,
                                                })}
                                            </td>
                                            <td className="py-2 px-4 text-center">
                                                <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs font-medium">
                                                    {tc.defaultQuantity}
                                                </span>
                                            </td>
                                            <td className="py-2 px-4 text-right">
                                                <form className="inline">
                                                    <input type="hidden" name="id" value={tc.id} />
                                                    <button
                                                        formAction={removeTemplateConceptAction}
                                                        className="text-xs text-muted hover:text-red-400 transition-colors cursor-pointer"
                                                        title="Eliminar de plantilla"
                                                    >
                                                        🗑️
                                                    </button>
                                                </form>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Info */}
                    <div className="glass-card p-5 text-sm text-muted space-y-2">
                        <p>
                            💡 Los conceptos configurados aquí se usarán como plantilla cuando se
                            complete el levantamiento de un servicio de tipo{" "}
                            <strong style={{ color: selectedType.color ?? undefined }}>
                                {selectedType.name}
                            </strong>.
                        </p>
                        <p>
                            Los precios que se aplican al servicio serán los{" "}
                            <strong>precios personalizados del colaborador</strong> asignado, o el
                            precio admin como fallback.
                        </p>
                    </div>
                </>
            )}
        </>
    );
}
