import Link from "next/link";
import { UserNav } from "@/components/user-nav";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";


async function getCalendarData() {
    const supabase = await createClient();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const { data: services } = await supabase
        .from("services")
        .select("id, description, scheduledDate, client:clients(name), type:service_types(name, color), state:service_states(name, color)")
        .gte("scheduledDate", startOfMonth.toISOString())
        .lte("scheduledDate", endOfMonth.toISOString())
        .order("scheduledDate", { ascending: true });

    // Also get contracts expiring this month
    const { data: expiringContracts } = await supabase
        .from("contracts")
        .select("id, title, endDate, client:clients(name)")
        .eq("status", "active")
        .gte("endDate", startOfMonth.toISOString())
        .lte("endDate", endOfMonth.toISOString())
        .order("endDate", { ascending: true });

    // Upcoming services (next 7 days from today)
    const next7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const { data: upcomingServices } = await supabase
        .from("services")
        .select("id, description, scheduledDate, client:clients(name), type:service_types(name, color), state:service_states(name, color)")
        .gte("scheduledDate", now.toISOString())
        .lte("scheduledDate", next7.toISOString())
        .order("scheduledDate", { ascending: true });

    return {
        services: services ?? [],
        expiringContracts: expiringContracts ?? [],
        upcomingServices: upcomingServices ?? [],
        currentMonth: now.toLocaleDateString("es-MX", { month: "long", year: "numeric" }),
        daysInMonth: endOfMonth.getDate(),
        firstDayOfWeek: startOfMonth.getDay(),
        today: now.getDate(),
    };
}


export const metadata: Metadata = {
  title: "Calendario — Ccurity Admin",
  description: "Calendario de servicios, instalaciones y mantenimientos programados.",
};

export default async function CalendarioPage() {
    const d = await getCalendarData();

    // Group services by day
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const servicesByDay: Record<number, any[]> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    d.services.forEach((s: any) => {
        if (s.scheduledDate) {
            const day = new Date(s.scheduledDate).getDate();
            if (!servicesByDay[day]) servicesByDay[day] = [];
            servicesByDay[day].push(s);
        }
    });

    // Group expiring contracts by day
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contractsByDay: Record<number, any[]> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    d.expiringContracts.forEach((c: any) => {
        if (c.endDate) {
            const day = new Date(c.endDate).getDate();
            if (!contractsByDay[day]) contractsByDay[day] = [];
            contractsByDay[day].push(c);
        }
    });

    const days = Array.from({ length: d.daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: d.firstDayOfWeek }, (_, i) => i);

    return (
        <div className="min-h-dvh bg-background">
            <header className="sticky top-0 z-50 glass-card rounded-none border-x-0 border-t-0 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/admin" className="text-muted hover:text-foreground transition-colors text-sm">
                        ← Admin
                    </Link>
                    <span className="text-border">|</span>
                    <h1 className="text-lg font-semibold">
                        📅 <span className="gradient-text">Calendario — {d.currentMonth}</span>
                    </h1>
                </div>
                <UserNav />
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="glass-card p-4 text-center">
                        <p className="text-2xl font-bold">{d.services.length}</p>
                        <p className="text-xs text-muted">Servicios Este Mes</p>
                    </div>
                    <div className="glass-card p-4 text-center">
                        <p className="text-2xl font-bold text-yellow-400">{d.expiringContracts.length}</p>
                        <p className="text-xs text-muted">Contratos por Vencer</p>
                    </div>
                    <div className="glass-card p-4 text-center">
                        <p className="text-2xl font-bold text-primary-light">{d.upcomingServices.length}</p>
                        <p className="text-xs text-muted">Próximos 7 Días</p>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="glass-card overflow-hidden">
                    <div className="px-5 py-3 border-b border-border">
                        <h2 className="font-semibold text-sm capitalize">📅 {d.currentMonth}</h2>
                    </div>
                    <div className="p-3">
                        {/* Day headers */}
                        <div className="grid grid-cols-7 gap-1 mb-1">
                            {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map(day => (
                                <div key={day} className="text-center text-[10px] text-muted py-1 font-medium">{day}</div>
                            ))}
                        </div>
                        {/* Calendar cells */}
                        <div className="grid grid-cols-7 gap-1">
                            {blanks.map(b => (
                                <div key={`blank-${b}`} className="aspect-square"></div>
                            ))}
                            {days.map(day => {
                                const hasServices = servicesByDay[day]?.length > 0;
                                const hasContracts = contractsByDay[day]?.length > 0;
                                const isToday = day === d.today;
                                return (
                                    <div key={day} className={`aspect-square rounded-lg p-1 flex flex-col items-center justify-start relative transition-colors ${isToday ? "bg-primary/20 border border-primary/50" : "bg-surface-2/30 hover:bg-surface-2/50"
                                        }`}>
                                        <span className={`text-xs font-mono ${isToday ? "font-bold text-primary-light" : "text-muted"}`}>{day}</span>
                                        <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                            {hasServices && servicesByDay[day].slice(0, 3).map((s: any, i: number) => (
                                                <span key={i} className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.type?.color || "#6366f1" }}></span>
                                            ))}
                                            {hasContracts && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0"></span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    {/* Legend */}
                    <div className="px-5 py-2 border-t border-border flex items-center gap-4 text-[10px] text-muted">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary"></span> Hoy</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-400"></span> Servicio</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400"></span> Contrato vence</span>
                    </div>
                </div>

                {/* Upcoming Services List */}
                <div className="glass-card overflow-hidden">
                    <div className="px-5 py-3 border-b border-border">
                        <h2 className="font-semibold text-sm">🔜 Próximos 7 Días</h2>
                    </div>
                    <div className="divide-y divide-border/50">
                        {d.upcomingServices.length === 0 && (
                            <div className="px-5 py-6 text-center text-muted text-sm">Sin servicios programados esta semana</div>
                        )}
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {d.upcomingServices.map((s: any) => (
                            <div key={s.id} className="px-5 py-3 flex items-center justify-between">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium truncate">{s.description || `Servicio #${s.id.slice(0, 8)}`}</p>
                                    <p className="text-xs text-muted">{s.client?.name} · {s.type?.name}</p>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    {s.state && (
                                        <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: `${s.state.color}30`, color: s.state.color }}>
                                            {s.state.name}
                                        </span>
                                    )}
                                    <span className="text-xs text-muted font-mono">
                                        {new Date(s.scheduledDate).toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
