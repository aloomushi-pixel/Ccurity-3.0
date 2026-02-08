import Link from "next/link";
import { getProfiles, getProfileStats } from "@/lib/data/profiles";
import { StatsCards, UsersTable } from "./components";

export default async function AdminDashboard() {
    const [profiles, stats] = await Promise.all([
        getProfiles(),
        getProfileStats(),
    ]);

    return (
        <div className="space-y-8">

            {/* Welcome */}
            <div>
                <h2 className="text-2xl font-bold mb-1">Panel de Administración</h2>
                <p className="text-muted">
                    Vista general del sistema y gestión de usuarios.
                </p>
            </div>

            {/* Stats */}
            <StatsCards
                total={stats.total}
                active={stats.active}
                byRole={stats.byRole}
            />

            {/* Users section */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Usuarios Registrados</h3>
                    <span className="text-sm text-muted">
                        {profiles.length} {profiles.length === 1 ? "usuario" : "usuarios"}
                    </span>
                </div>
                <UsersTable profiles={profiles} />
            </section>

            {/* Quick links */}
            <section>
                <h3 className="text-lg font-semibold mb-4">Acceso Rápido</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                        {
                            title: "Catálogo CPU",
                            desc: "Conceptos de Precios Unitarios",
                            icon: "📋",
                            href: "/admin/cpu",
                        },
                        {
                            title: "Cotizaciones",
                            desc: "Gestión de cotizaciones y ventas",
                            icon: "💰",
                            href: "/admin/cotizaciones",
                        },
                        {
                            title: "Servicios",
                            desc: "Gestión de servicios y órdenes de trabajo",
                            icon: "🔧",
                            href: "/admin/servicios",
                        },
                        {
                            title: "Postulaciones",
                            desc: "Revisar y asignar postulaciones de colaboradores",
                            icon: "📋",
                            href: "/admin/servicios/postulaciones",
                        },
                        {
                            title: "Chat",
                            desc: "Mensajería en tiempo real",
                            icon: "💬",
                            href: "/admin/chat",
                        },
                        {
                            title: "Finanzas",
                            desc: "Contratos, pagos y reportes",
                            icon: "💵",
                            href: "/admin/finanzas",
                        },
                        {
                            title: "Reportes",
                            desc: "Analytics y métricas globales",
                            icon: "📊",
                            href: "/admin/reportes",
                        },
                        {
                            title: "Usuarios",
                            desc: "Gestión de roles y perfiles",
                            icon: "👥",
                            href: "/admin/usuarios",
                        },
                        {
                            title: "Clientes",
                            desc: "Directorio y gestión de clientes",
                            icon: "🏢",
                            href: "/admin/clientes",
                        },
                        {
                            title: "Notificaciones",
                            desc: "Alertas y recordatorios",
                            icon: "🔔",
                            href: "/admin/notificaciones",
                        },
                        {
                            title: "Configuración",
                            desc: "Parámetros generales del sistema",
                            icon: "⚙️",
                            href: "/admin/config",
                        },
                        {
                            title: "Disputas",
                            desc: "Resolución de incidencias",
                            icon: "⚖️",
                            href: "/admin/disputas",
                        },
                        {
                            title: "Calendario",
                            desc: "Agenda de servicios y contratos",
                            icon: "📅",
                            href: "/admin/calendario",
                        },
                        {
                            title: "Auditoría",
                            desc: "Log de actividad del sistema",
                            icon: "📝",
                            href: "/admin/audit",
                        },
                        {
                            title: "Ayuda",
                            desc: "Documentación y guías",
                            icon: "❓",
                            href: "/admin/ayuda",
                        },
                    ].map((card) => (
                        <Link
                            key={card.title}
                            href={card.href}
                            className="glass-card p-5 group hover:glow transition-all duration-300"
                        >
                            <span className="text-2xl">{card.icon}</span>
                            <h4 className="font-semibold mt-3 group-hover:text-primary-light transition-colors">
                                {card.title}
                            </h4>
                            <p className="text-sm text-muted mt-1">{card.desc}</p>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
