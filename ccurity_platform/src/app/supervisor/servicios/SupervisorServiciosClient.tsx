"use client";

import { useState } from "react";
import { acceptApplicationAction, rejectApplicationAction } from "./actions";

type Application = {
    id: string;
    collaboratorId: string;
    collaboratorName: string;
    collaboratorEmail: string;
    message: string | null;
    createdAt: string;
};

type ServiceWithApplications = {
    id: string;
    description: string;
    clientName: string;
    typeName: string;
    typeColor: string;
    scheduledDate: string | null;
    applications: Application[];
};

type Props = {
    services: ServiceWithApplications[];
};

export function SupervisorServiciosClient({ services: initialServices }: Props) {
    const [services, setServices] = useState(initialServices);
    const [processing, setProcessing] = useState<string | null>(null);

    async function handleAccept(serviceId: string, app: Application) {
        setProcessing(app.id);
        const fd = new FormData();
        fd.set("applicationId", app.id);
        fd.set("serviceId", serviceId);
        fd.set("collaboratorId", app.collaboratorId);
        const result = await acceptApplicationAction(fd);
        if (result.success) {
            // Remove the service from the list (it's now assigned)
            setServices((prev) => prev.filter((s) => s.id !== serviceId));
        }
        setProcessing(null);
    }

    async function handleReject(serviceId: string, appId: string) {
        setProcessing(appId);
        const fd = new FormData();
        fd.set("applicationId", appId);
        const result = await rejectApplicationAction(fd);
        if (result.success) {
            // Remove the application from the service
            setServices((prev) =>
                prev.map((s) =>
                    s.id === serviceId
                        ? {
                            ...s,
                            applications: s.applications.filter(
                                (a) => a.id !== appId
                            ),
                        }
                        : s
                )
            );
        }
        setProcessing(null);
    }

    const totalApplications = services.reduce(
        (sum, s) => sum + s.applications.length,
        0
    );

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface border border-border rounded-xl p-4">
                    <p className="text-xs text-muted">Servicios con Postulaciones</p>
                    <p className="text-2xl font-bold">{services.length}</p>
                </div>
                <div className="bg-surface border border-border rounded-xl p-4">
                    <p className="text-xs text-muted">Postulaciones Pendientes</p>
                    <p className="text-2xl font-bold text-primary">
                        {totalApplications}
                    </p>
                </div>
            </div>

            {/* Service cards */}
            {services.length === 0 && (
                <div className="bg-surface border border-border rounded-xl p-8 text-center text-muted">
                    No hay servicios con postulaciones pendientes
                </div>
            )}

            {services.map((service) => (
                <div
                    key={service.id}
                    className="bg-surface border border-border rounded-xl overflow-hidden"
                >
                    {/* Service header */}
                    <div className="px-5 py-4 border-b border-border bg-surface-2/30 flex items-start justify-between gap-4">
                        <div>
                            <h3 className="font-semibold">{service.description}</h3>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted">
                                <span>👤 {service.clientName}</span>
                                {service.scheduledDate && (
                                    <span>
                                        📅{" "}
                                        {new Date(
                                            service.scheduledDate
                                        ).toLocaleDateString("es-MX")}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span
                                className="px-2 py-0.5 rounded-full text-xs"
                                style={{
                                    backgroundColor: `${service.typeColor}30`,
                                    color: service.typeColor,
                                }}
                            >
                                {service.typeName}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-500/20 text-yellow-400">
                                {service.applications.length} postulación(es)
                            </span>
                        </div>
                    </div>

                    {/* Applications */}
                    <div className="divide-y divide-border/50">
                        {service.applications.map((app) => (
                            <div
                                key={app.id}
                                className="px-5 py-4 flex items-center justify-between gap-4"
                            >
                                <div>
                                    <p className="font-medium text-sm">
                                        {app.collaboratorName}
                                    </p>
                                    <p className="text-xs text-muted">
                                        {app.collaboratorEmail}
                                    </p>
                                    {app.message && (
                                        <p className="text-xs text-muted mt-1 italic">
                                            &ldquo;{app.message}&rdquo;
                                        </p>
                                    )}
                                    <p className="text-[10px] text-muted mt-1">
                                        {new Date(app.createdAt).toLocaleString(
                                            "es-MX"
                                        )}
                                    </p>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                    <button
                                        onClick={() =>
                                            handleAccept(service.id, app)
                                        }
                                        disabled={processing === app.id}
                                        className="px-3 py-1.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
                                    >
                                        ✓ Aceptar
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleReject(service.id, app.id)
                                        }
                                        disabled={processing === app.id}
                                        className="px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
                                    >
                                        ✕ Rechazar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
