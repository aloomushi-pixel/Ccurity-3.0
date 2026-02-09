import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";


async function getConfigData() {
    const supabase = await createClient();

    const { count: totalProfiles } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true });

    const { count: totalClients } = await supabase
        .from("clients")
        .select("id", { count: "exact", head: true });

    const { data: serviceTypes } = await supabase
        .from("service_types")
        .select("id, name, color")
        .order("name");

    const { data: serviceStates } = await supabase
        .from("service_states")
        .select("id, name, color")
        .order("name");

    return {
        totalProfiles: totalProfiles ?? 0,
        totalClients: totalClients ?? 0,
        serviceTypes: serviceTypes ?? [],
        serviceStates: serviceStates ?? [],
    };
}


export const metadata: Metadata = {
    title: "Configuración — Ccurity Admin",
    description: "Configuración general del sistema y parámetros de la plataforma.",
};

export default async function AdminConfigPage() {
    const data = await getConfigData();

    const platformSettings = [
        { key: "Nombre de la Plataforma", value: "Ccurity 3.0", editable: false },
        { key: "Versión", value: "3.0.0-beta", editable: false },
        { key: "Framework", value: "Next.js 16 + Turbopack", editable: false },
        { key: "Base de Datos", value: "Supabase (PostgreSQL)", editable: false },
        { key: "Autenticación", value: "Supabase Auth + RLS", editable: false },
        { key: "Moneda", value: "MXN (Peso Mexicano)", editable: false },
        { key: "Zona Horaria", value: "America/Mexico_City", editable: false },
    ];

    return (
        <>
            {/* Platform stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card p-4 text-center">
                    <p className="text-2xl font-bold">{data.totalProfiles}</p>
                    <p className="text-xs text-muted">Usuarios</p>
                </div>
                <div className="glass-card p-4 text-center">
                    <p className="text-2xl font-bold">{data.totalClients}</p>
                    <p className="text-xs text-muted">Clientes</p>
                </div>
                <div className="glass-card p-4 text-center">
                    <p className="text-2xl font-bold">{data.serviceTypes.length}</p>
                    <p className="text-xs text-muted">Tipos de Servicio</p>
                </div>
                <div className="glass-card p-4 text-center">
                    <p className="text-2xl font-bold">{data.serviceStates.length}</p>
                    <p className="text-xs text-muted">Estados de Servicio</p>
                </div>
            </div>

            {/* Platform info */}
            <div className="glass-card overflow-hidden">
                <div className="px-5 py-3 border-b border-border">
                    <h2 className="font-semibold text-sm">🏢 Información de la Plataforma</h2>
                </div>
                <div className="divide-y divide-border/50">
                    {platformSettings.map((s) => (
                        <div key={s.key} className="px-5 py-3 flex items-center justify-between">
                            <span className="text-sm font-medium">{s.key}</span>
                            <span className="text-sm text-muted font-mono">{s.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Service types and states */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card overflow-hidden">
                    <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                        <h2 className="font-semibold text-sm">📂 Tipos de Servicio</h2>
                        <Link href="/admin/servicios/tipos" className="text-xs text-primary-light hover:underline">Gestionar →</Link>
                    </div>
                    <div className="divide-y divide-border/50">
                        {data.serviceTypes.length === 0 && (
                            <div className="px-5 py-6 text-center text-muted text-sm">Sin tipos configurados</div>
                        )}
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {data.serviceTypes.map((t: any) => (
                            <div key={t.id} className="px-5 py-2.5 flex items-center gap-3">
                                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
                                <span className="text-sm">{t.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-card overflow-hidden">
                    <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                        <h2 className="font-semibold text-sm">🔄 Estados de Servicio</h2>
                        <Link href="/admin/servicios/tipos" className="text-xs text-primary-light hover:underline">Gestionar →</Link>
                    </div>
                    <div className="divide-y divide-border/50">
                        {data.serviceStates.length === 0 && (
                            <div className="px-5 py-6 text-center text-muted text-sm">Sin estados configurados</div>
                        )}
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {data.serviceStates.map((s: any) => (
                            <div key={s.id} className="px-5 py-2.5 flex items-center gap-3">
                                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                                <span className="text-sm">{s.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick links */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link href="/admin/usuarios" className="glass-card p-5 text-center hover:glow transition-all group">
                    <span className="text-3xl block mb-2">👥</span>
                    <p className="font-semibold text-sm group-hover:text-primary-light transition-colors">Gestión de Usuarios</p>
                    <p className="text-xs text-muted">{data.totalProfiles} registrados</p>
                </Link>
                <Link href="/admin/servicios/tipos" className="glass-card p-5 text-center hover:glow transition-all group">
                    <span className="text-3xl block mb-2">🏷️</span>
                    <p className="font-semibold text-sm group-hover:text-primary-light transition-colors">Tipos y Estados</p>
                    <p className="text-xs text-muted">Configurar catálogos</p>
                </Link>
                <Link href="/admin/audit" className="glass-card p-5 text-center hover:glow transition-all group">
                    <span className="text-3xl block mb-2">📝</span>
                    <p className="font-semibold text-sm group-hover:text-primary-light transition-colors">Auditoría</p>
                    <p className="text-xs text-muted">Registro de actividad</p>
                </Link>
            </div>
        </>
    );
}
