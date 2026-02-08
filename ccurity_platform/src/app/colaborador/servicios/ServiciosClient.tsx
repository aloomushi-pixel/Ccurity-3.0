"use client";

import { useState } from "react";
import { applyToServiceAction } from "./actions";

type AvailableService = {
    id: string;
    description: string;
    scheduledDate: string | null;
    address: string | null;
    clientName: string;
    typeName: string;
    typeColor: string;
    alreadyApplied: boolean;
};

type MyApplication = {
    id: string;
    serviceId: string;
    status: "pending" | "accepted" | "rejected";
    serviceDescription: string;
    createdAt: string;
};

type Props = {
    availableServices: AvailableService[];
    myApplications: MyApplication[];
};

const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: "Pendiente", color: "bg-yellow-500/20 text-yellow-400" },
    accepted: { label: "Aceptada", color: "bg-green-500/20 text-green-400" },
    rejected: { label: "Rechazada", color: "bg-red-500/20 text-red-400" },
};

export function ServiciosClient({ availableServices, myApplications }: Props) {
    const [tab, setTab] = useState<"available" | "mine">("available");
    const [applying, setApplying] = useState<string | null>(null);
    const [message, setMessage] = useState("");
    const [appliedIds, setAppliedIds] = useState<Set<string>>(
        new Set(availableServices.filter((s) => s.alreadyApplied).map((s) => s.id))
    );

    async function handleApply(serviceId: string) {
        setApplying(serviceId);
        const fd = new FormData();
        fd.set("serviceId", serviceId);
        if (message) fd.set("message", message);
        const result = await applyToServiceAction(fd);
        if (result.success) {
            setAppliedIds((prev) => new Set(prev).add(serviceId));
            setMessage("");
        }
        setApplying(null);
    }

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex gap-1 bg-surface-2 rounded-lg p-1 w-fit">
                <button
                    onClick={() => setTab("available")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${tab === "available"
                            ? "bg-primary text-white"
                            : "text-muted hover:text-foreground"
                        }`}
                >
                    Disponibles ({availableServices.filter((s) => !appliedIds.has(s.id)).length})
                </button>
                <button
                    onClick={() => setTab("mine")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${tab === "mine"
                            ? "bg-primary text-white"
                            : "text-muted hover:text-foreground"
                        }`}
                >
                    Mis Postulaciones ({myApplications.length})
                </button>
            </div>

            {tab === "available" && (
                <div className="space-y-4">
                    {availableServices.filter((s) => !appliedIds.has(s.id)).length === 0 && (
                        <div className="bg-surface border border-border rounded-xl p-8 text-center text-muted">
                            No hay servicios disponibles para postulación en este momento
                        </div>
                    )}
                    {availableServices
                        .filter((s) => !appliedIds.has(s.id))
                        .map((s) => (
                            <div
                                key={s.id}
                                className="bg-surface border border-border rounded-xl p-5 space-y-3"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="font-semibold">
                                            {s.description}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-muted">
                                            <span>👤 {s.clientName}</span>
                                            {s.scheduledDate && (
                                                <span>
                                                    📅{" "}
                                                    {new Date(
                                                        s.scheduledDate
                                                    ).toLocaleDateString(
                                                        "es-MX"
                                                    )}
                                                </span>
                                            )}
                                            {s.address && (
                                                <span>📍 {s.address}</span>
                                            )}
                                        </div>
                                    </div>
                                    <span
                                        className="px-2 py-0.5 rounded-full text-xs whitespace-nowrap"
                                        style={{
                                            backgroundColor: `${s.typeColor}30`,
                                            color: s.typeColor,
                                        }}
                                    >
                                        {s.typeName}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Mensaje de postulación (opcional)..."
                                        value={applying === s.id ? message : ""}
                                        onChange={(e) => {
                                            setApplying(s.id);
                                            setMessage(e.target.value);
                                        }}
                                        className="flex-1 bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                    <button
                                        onClick={() => handleApply(s.id)}
                                        disabled={applying === s.id && !message && applying !== null}
                                        className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
                                    >
                                        {applying === s.id
                                            ? "Enviando..."
                                            : "Postularme"}
                                    </button>
                                </div>
                            </div>
                        ))}
                </div>
            )}

            {tab === "mine" && (
                <div className="bg-surface border border-border rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-surface-2/50">
                                <th className="text-left px-4 py-3 font-medium text-muted">
                                    Servicio
                                </th>
                                <th className="text-left px-4 py-3 font-medium text-muted">
                                    Fecha
                                </th>
                                <th className="text-center px-4 py-3 font-medium text-muted">
                                    Estado
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {myApplications.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={3}
                                        className="px-4 py-8 text-center text-muted"
                                    >
                                        No tienes postulaciones aún
                                    </td>
                                </tr>
                            )}
                            {myApplications.map((a) => {
                                const s = statusLabels[a.status];
                                return (
                                    <tr
                                        key={a.id}
                                        className="border-b border-border/50 hover:bg-surface-2/30 transition-colors"
                                    >
                                        <td className="px-4 py-3 font-medium">
                                            {a.serviceDescription ||
                                                `Servicio #${a.serviceId.slice(0, 8)}`}
                                        </td>
                                        <td className="px-4 py-3 text-muted">
                                            {new Date(
                                                a.createdAt
                                            ).toLocaleDateString("es-MX")}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-xs ${s.color}`}
                                            >
                                                {s.label}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
