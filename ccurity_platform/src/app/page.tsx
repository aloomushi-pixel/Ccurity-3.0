import Link from "next/link";

const pillars = [
  {
    title: "Admin",
    description: "Configuración global, usuarios y gestión senior.",
    href: "/admin",
    icon: "🛡️",
    gradient: "from-sky-500 to-blue-600",
  },
  {
    title: "Supervisor",
    description: "Auditoría de servicios y monitoreo de operaciones.",
    href: "/supervisor",
    icon: "📊",
    gradient: "from-cyan-500 to-teal-600",
  },
  {
    title: "Colaborador",
    description: "App operativa para técnicos en campo.",
    href: "/colaborador",
    icon: "🔧",
    gradient: "from-emerald-500 to-green-600",
  },
  {
    title: "Portal Cliente",
    description: "Autoservicio: seguimiento, pagos y gestión.",
    href: "/portal",
    icon: "👤",
    gradient: "from-violet-500 to-purple-600",
  },
];

export default function Home() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Hero */}
      <div className="text-center mb-16 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-2 border border-border text-sm text-muted mb-6">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          Plataforma v3.0
        </div>
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-4">
          <span className="gradient-text">Ccurity</span>
        </h1>
        <p className="text-lg sm:text-xl text-muted max-w-2xl mx-auto leading-relaxed">
          Plataforma integral de gestión para empresas de seguridad electrónica.
          Conecta ventas, operaciones y clientes en un solo ecosistema.
        </p>
      </div>

      {/* Pillar Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full">
        {pillars.map((pillar) => (
          <Link
            key={pillar.href}
            href={pillar.href}
            className="group glass-card p-6 transition-all duration-300 hover:scale-[1.03] hover:glow"
          >
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${pillar.gradient} flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform`}
            >
              {pillar.icon}
            </div>
            <h2 className="text-xl font-semibold mb-2 group-hover:text-primary-light transition-colors">
              {pillar.title}
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              {pillar.description}
            </p>
            <div className="mt-4 flex items-center gap-1 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              Acceder
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <footer className="mt-20 text-center text-sm text-muted">
        <p>Ccurity Platform &copy; {new Date().getFullYear()}</p>
      </footer>
    </main>
  );
}
