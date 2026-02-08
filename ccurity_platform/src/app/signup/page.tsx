import Link from "next/link";
import { signup } from "@/app/auth/actions";

const roles = [
    {
        value: "ADMIN",
        label: "Administrador",
        desc: "Configuración global y gestión senior",
        icon: "🛡️",
    },
    {
        value: "SUPER",
        label: "Supervisor",
        desc: "Auditoría y monitoreo de equipos",
        icon: "📊",
    },
    {
        value: "COLAB",
        label: "Colaborador",
        desc: "Técnico de campo / operaciones",
        icon: "🔧",
    },
    {
        value: "CLIENT",
        label: "Cliente",
        desc: "Seguimiento de servicios y pagos",
        icon: "👤",
    },
];

export default async function SignupPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>;
}) {
    const params = await searchParams;

    return (
        <main className="min-h-dvh flex items-center justify-center px-4 py-12 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-primary/8 rounded-full blur-3xl" />
                <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-accent/8 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block">
                        <h1 className="text-4xl font-bold gradient-text">Ccurity</h1>
                    </Link>
                    <p className="text-muted text-sm mt-2">Crea tu cuenta en la plataforma</p>
                </div>

                {/* Card */}
                <div className="glass-card p-8">
                    <h2 className="text-xl font-semibold mb-6">Registro</h2>

                    {/* Error */}
                    {params.error && (
                        <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/20 text-sm text-danger">
                            {params.error}
                        </div>
                    )}

                    <form className="space-y-4">
                        <div>
                            <label
                                htmlFor="full_name"
                                className="block text-sm font-medium text-muted mb-1.5"
                            >
                                Nombre completo
                            </label>
                            <input
                                id="full_name"
                                name="full_name"
                                type="text"
                                required
                                placeholder="Juan Pérez"
                                className="w-full px-4 py-2.5 rounded-lg bg-surface-2 border border-border text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-muted mb-1.5"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                placeholder="tu@empresa.com"
                                className="w-full px-4 py-2.5 rounded-lg bg-surface-2 border border-border text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-muted mb-1.5"
                            >
                                Contraseña
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                minLength={6}
                                placeholder="Mínimo 6 caracteres"
                                className="w-full px-4 py-2.5 rounded-lg bg-surface-2 border border-border text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            />
                        </div>

                        {/* Role selector */}
                        <div>
                            <label className="block text-sm font-medium text-muted mb-2">
                                Tipo de cuenta
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {roles.map((role) => (
                                    <label
                                        key={role.value}
                                        className="relative cursor-pointer"
                                    >
                                        <input
                                            type="radio"
                                            name="role"
                                            value={role.value}
                                            defaultChecked={role.value === "CLIENT"}
                                            className="peer sr-only"
                                        />
                                        <div className="p-3 rounded-lg border border-border bg-surface-2 peer-checked:border-primary peer-checked:bg-primary/10 transition-all hover:border-muted">
                                            <div className="text-lg mb-0.5">{role.icon}</div>
                                            <div className="text-sm font-medium">{role.label}</div>
                                            <div className="text-xs text-muted leading-tight mt-0.5">
                                                {role.desc}
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button
                            formAction={signup}
                            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-primary to-accent text-white font-medium hover:opacity-90 transition-opacity cursor-pointer"
                        >
                            Crear Cuenta
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-muted">
                        ¿Ya tienes cuenta?{" "}
                        <Link
                            href="/login"
                            className="text-primary hover:text-primary-light transition-colors font-medium"
                        >
                            Inicia sesión
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
