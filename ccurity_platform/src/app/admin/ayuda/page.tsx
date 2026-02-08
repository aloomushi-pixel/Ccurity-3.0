import Link from "next/link";
import { UserNav } from "@/components/user-nav";

const modules = [
    {
        title: "Dashboard Admin",
        icon: "🏠",
        href: "/admin",
        desc: "Panel principal con acceso rápido a todos los módulos. Muestra KPIs en tiempo real y tarjetas de navegación.",
    },
    {
        title: "CPU — Precios Unitarios",
        icon: "📦",
        href: "/admin/cpu",
        desc: "Catálogo de conceptos con unidad, precio y categoría. Base para generar cotizaciones consistentes.",
    },
    {
        title: "Cotizaciones",
        icon: "📋",
        href: "/admin/cotizaciones",
        desc: "Genera, versiona y envía cotizaciones profesionales. Incluye generador de PDF con branding Ccurity.",
    },
    {
        title: "Servicios",
        icon: "🔧",
        href: "/admin/servicios",
        desc: "Gestión operativa de servicios con motor de estados, tipos personalizables y evidencia fotográfica.",
    },
    {
        title: "Chat en Vivo",
        icon: "💬",
        href: "/admin/chat",
        desc: "Comunicación en tiempo real entre colaboradores y clientes. Supervisión de conversaciones activas.",
    },
    {
        title: "Finanzas",
        icon: "💵",
        href: "/admin/finanzas",
        desc: "Contratos digitales, pagos, facturas y reportes financieros. Control total de ingresos.",
    },
    {
        title: "Reportes",
        icon: "📊",
        href: "/admin/reportes",
        desc: "Dashboard analítico con KPIs globales, distribución de servicios, métricas financieras y tasas de conversión.",
    },
    {
        title: "Clientes",
        icon: "🏢",
        href: "/admin/clientes",
        desc: "Directorio completo de clientes con detalle de contratos, servicios y cotizaciones por cliente.",
    },
    {
        title: "Usuarios",
        icon: "👥",
        href: "/admin/usuarios",
        desc: "Gestión de usuarios por rol (admin, supervisor, colaborador, cliente) con distribución visual.",
    },
    {
        title: "Notificaciones",
        icon: "🔔",
        href: "/admin/notificaciones",
        desc: "Alertas automáticas: facturas vencidas, contratos próximos a expirar, servicios y pagos pendientes.",
    },
    {
        title: "Disputas",
        icon: "⚖️",
        href: "/admin/disputas",
        desc: "Centro de resolución de incidencias con monitoreo de mensajes y seguimiento de problemas activos.",
    },
    {
        title: "Calendario",
        icon: "📅",
        href: "/admin/calendario",
        desc: "Vista mensual de servicios programados y vencimientos de contratos con indicadores visuales.",
    },
    {
        title: "Configuración",
        icon: "⚙️",
        href: "/admin/config",
        desc: "Información del sistema, parámetros globales y acceso rápido a configuración de catálogos.",
    },
    {
        title: "Auditoría",
        icon: "📝",
        href: "/admin/audit",
        desc: "Línea de tiempo unificada de toda la actividad: usuarios, servicios, contratos y mensajes.",
    },
];

const roles = [
    {
        role: "Admin",
        color: "text-red-400",
        path: "/admin",
        features: ["Acceso a todos los módulos", "Configuración del sistema", "Gestión de usuarios", "Reportes globales"],
    },
    {
        role: "Supervisor",
        color: "text-yellow-400",
        path: "/supervisor",
        features: ["KPIs operativos", "Supervisión de chats", "Vista de servicios", "Monitoreo de técnicos"],
    },
    {
        role: "Colaborador",
        color: "text-blue-400",
        path: "/colaborador",
        features: ["Servicios asignados", "Contratos activos", "Pagos pendientes", "Chat con clientes"],
    },
    {
        role: "Cliente",
        color: "text-green-400",
        path: "/portal",
        features: ["Seguimiento de servicios", "Facturas y pagos", "Contratos", "Soporte y disputas"],
    },
];

export default function AyudaPage() {
    return (
        <div className="min-h-dvh bg-background">
            <header className="sticky top-0 z-50 glass-card rounded-none border-x-0 border-t-0 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/admin" className="text-muted hover:text-foreground transition-colors text-sm">
                        ← Admin
                    </Link>
                    <span className="text-border">|</span>
                    <h1 className="text-lg font-semibold">
                        ❓ <span className="gradient-text">Ayuda y Documentación</span>
                    </h1>
                </div>
                <UserNav />
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
                {/* Platform overview */}
                <div className="glass-card p-6">
                    <h2 className="text-xl font-bold gradient-text mb-2">Ccurity Platform</h2>
                    <p className="text-sm text-muted leading-relaxed">
                        Plataforma integral de gestión para empresas de seguridad electrónica.
                        Conecta ventas, operaciones técnicas y clientes en un solo ecosistema con
                        trazabilidad completa: Cotización → Venta → Servicio → Post-Venta.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                        <div className="bg-surface-2/50 rounded-lg p-3 text-center">
                            <p className="text-lg font-bold">14</p>
                            <p className="text-[10px] text-muted">Módulos</p>
                        </div>
                        <div className="bg-surface-2/50 rounded-lg p-3 text-center">
                            <p className="text-lg font-bold">4</p>
                            <p className="text-[10px] text-muted">Roles</p>
                        </div>
                        <div className="bg-surface-2/50 rounded-lg p-3 text-center">
                            <p className="text-lg font-bold">30+</p>
                            <p className="text-[10px] text-muted">Páginas</p>
                        </div>
                        <div className="bg-surface-2/50 rounded-lg p-3 text-center">
                            <p className="text-lg font-bold">PWA</p>
                            <p className="text-[10px] text-muted">Instalable</p>
                        </div>
                    </div>
                </div>

                {/* Roles */}
                <div className="glass-card p-5">
                    <h2 className="font-semibold text-sm mb-4">🎭 Roles y Accesos</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {roles.map(r => (
                            <Link key={r.role} href={r.path} className="bg-surface-2/50 rounded-lg p-4 hover:bg-surface-2/80 transition-colors group">
                                <h3 className={`font-bold text-sm ${r.color} group-hover:underline`}>{r.role}</h3>
                                <ul className="mt-2 space-y-1">
                                    {r.features.map(f => (
                                        <li key={f} className="text-xs text-muted flex items-center gap-1.5">
                                            <span className="text-[8px]">●</span> {f}
                                        </li>
                                    ))}
                                </ul>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Module Directory */}
                <div className="glass-card overflow-hidden">
                    <div className="px-5 py-3 border-b border-border">
                        <h2 className="font-semibold text-sm">📚 Directorio de Módulos</h2>
                    </div>
                    <div className="divide-y divide-border/50">
                        {modules.map(mod => (
                            <Link key={mod.title} href={mod.href} className="block px-5 py-3 hover:bg-surface-2/30 transition-colors group">
                                <div className="flex items-start gap-3">
                                    <span className="text-xl flex-shrink-0">{mod.icon}</span>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium group-hover:text-primary-light transition-colors">{mod.title}</p>
                                        <p className="text-xs text-muted mt-0.5">{mod.desc}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Tech Stack */}
                <div className="glass-card p-5">
                    <h2 className="font-semibold text-sm mb-3">🛠️ Stack Tecnológico</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {[
                            { tech: "Next.js 16", detail: "App Router + Turbopack" },
                            { tech: "TypeScript", detail: "Tipado estricto" },
                            { tech: "Tailwind CSS v4", detail: "Sistema de diseño" },
                            { tech: "Supabase", detail: "Auth, DB, Realtime, RLS" },
                            { tech: "PostgreSQL", detail: "Base de datos" },
                            { tech: "PWA Ready", detail: "Instalable en móvil" },
                        ].map(t => (
                            <div key={t.tech} className="bg-surface-2/50 rounded-lg p-3">
                                <p className="text-sm font-mono font-medium">{t.tech}</p>
                                <p className="text-[10px] text-muted">{t.detail}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Keyboard shortcuts / tips */}
                <div className="glass-card p-5">
                    <h2 className="font-semibold text-sm mb-3">💡 Tips</h2>
                    <ul className="space-y-2 text-sm text-muted">
                        <li className="flex items-start gap-2">
                            <span className="text-primary-light">▸</span>
                            <span>Usa el <strong>Dashboard Admin</strong> como punto de partida para navegar a cualquier módulo.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary-light">▸</span>
                            <span>Las <strong>Notificaciones</strong> se actualizan en tiempo real con alertas priorizadas por urgencia.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary-light">▸</span>
                            <span>Instala la app como <strong>PWA</strong> desde tu navegador para acceso rápido en móvil.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary-light">▸</span>
                            <span>El <strong>Calendario</strong> muestra servicios y vencimientos de contratos del mes actual.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary-light">▸</span>
                            <span>Cada <strong>Cliente</strong> tiene un perfil detallado con historial de contratos, servicios y cotizaciones.</span>
                        </li>
                    </ul>
                </div>
            </main>
        </div>
    );
}
