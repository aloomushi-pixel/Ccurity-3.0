import Link from "next/link";
import { getProfiles, getProfileStats } from "@/lib/data/profiles";
import { StatsCards, UsersTable } from "./components";
import { Card, CardContent } from "@/components/ui/card";
import type { Metadata } from "next";



export const metadata: Metadata = {
  title: "Dashboard — Ccurity Admin",
  description: "Panel administrativo de Ccurity. Gestión integral de usuarios, servicios, finanzas y operaciones.",
};

export default async function AdminDashboard() {
    const [profiles, stats] = await Promise.all([
        getProfiles(),
        getProfileStats(),
    ]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Welcome */}
            <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                    Panel de Administración
                </h2>
                <p className="text-muted-foreground text-lg">
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
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold tracking-tight">Usuarios Registrados</h3>
                    <span className="text-sm text-muted-foreground bg-surface-2 px-3 py-1 rounded-full">
                        {profiles.length} {profiles.length === 1 ? "usuario" : "usuarios"}
                    </span>
                </div>
                <div className="glass-card overflow-hidden">
                    <UsersTable profiles={profiles} />
                </div>
            </section>

            {/* Quick links */}
            <section>
                <h3 className="text-xl font-semibold mb-6 tracking-tight">Acceso Rápido</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
                            desc: "Revisar y asignar postulaciones",
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
                        <Link key={card.title} href={card.href} className="group block h-full outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl">
                            <Card className="h-full hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 border-border/50 bg-surface-1/40 dark:bg-surface-2/40 backdrop-blur-sm transition-all duration-300">
                                <CardContent className="flex flex-col items-start p-6 h-full">
                                    <span className="text-3xl mb-4 block transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 filter drop-shadow-sm">{card.icon}</span>
                                    <h4 className="font-bold text-lg group-hover:text-primary transition-colors tracking-tight">
                                        {card.title}
                                    </h4>
                                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed line-clamp-2">
                                        {card.desc}
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
