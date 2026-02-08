
import {
    LayoutDashboard,
    Users,
    Briefcase,
    FileText,
    MessageSquare,
    Settings,
    CreditCard,
    BarChart3,
    Calendar,
    ShieldCheck,
    UserCircle,
    Bell,
    HelpCircle,
    FileCheck,
} from "lucide-react";

export type NavItem = {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
};

export const navConfig = {
    admin: [
        { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { title: "Usuarios", href: "/admin/usuarios", icon: Users },
        { title: "Servicios", href: "/admin/servicios", icon: Briefcase },
        { title: "Postulaciones", href: "/admin/servicios/postulaciones", icon: FileCheck },
        { title: "Cotizaciones", href: "/admin/cotizaciones", icon: FileText },
        { title: "Finanzas", href: "/admin/finanzas", icon: CreditCard },
        { title: "Chat", href: "/admin/chat", icon: MessageSquare },
        { title: "Reportes", href: "/admin/reportes", icon: BarChart3 },
        { title: "Configuración", href: "/admin/config", icon: Settings },
    ],
    supervisor: [
        { title: "Dashboard", href: "/supervisor", icon: LayoutDashboard },
        { title: "Servicios", href: "/supervisor/servicios", icon: Briefcase },
        { title: "Colaboradores", href: "/supervisor/colaboradores", icon: Users },
        { title: "Calendario", href: "/supervisor/calendario", icon: Calendar },
        { title: "Chat", href: "/admin/chat", icon: MessageSquare }, // Shared chat route? Or supervisor specific? Reusing admin chat for now as per previous implementation
    ],
    colaborador: [
        { title: "Dashboard", href: "/colaborador", icon: LayoutDashboard },
        { title: "Mis Servicios", href: "/colaborador/servicios", icon: Briefcase },
        { title: "Mis Precios", href: "/colaborador/precios", icon: CreditCard },
        { title: "Entregables", href: "/colaborador/entregables", icon: FileText },
        { title: "Chat", href: "/admin/chat", icon: MessageSquare },
    ],
    portal: [ // Client portal
        { title: "Inicio", href: "/portal", icon: LayoutDashboard },
        { title: "Mis Servicios", href: "/portal/servicios", icon: Briefcase },
        { title: "Facturación", href: "/portal/facturacion", icon: CreditCard },
        { title: "Soporte", href: "/portal/soporte", icon: HelpCircle },
        { title: "Chat", href: "/admin/chat", icon: MessageSquare },
    ],
};
