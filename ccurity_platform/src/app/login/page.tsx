import Link from "next/link";
import { login } from "@/app/auth/actions";

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string; message?: string }>;
}) {
    const params = await searchParams;

    return (
        <main className="min-h-dvh flex items-center justify-center px-4 relative overflow-hidden">
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
                    <p className="text-muted text-sm mt-2">Accede a tu panel de gestión</p>
                </div>

                {/* Card */}
                <div className="glass-card p-8">
                    <h2 className="text-xl font-semibold mb-6">Iniciar Sesión</h2>

                    {/* Error message */}
                    {params.error && (
                        <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/20 text-sm text-danger">
                            {params.error}
                        </div>
                    )}

                    {/* Success message */}
                    {params.message && (
                        <div className="mb-4 p-3 rounded-lg bg-success/10 border border-success/20 text-sm text-success">
                            {params.message}
                        </div>
                    )}

                    <form className="space-y-4">
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
                                placeholder="••••••••"
                                className="w-full px-4 py-2.5 rounded-lg bg-surface-2 border border-border text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            />
                        </div>

                        <button
                            formAction={login}
                            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-primary to-accent text-white font-medium hover:opacity-90 transition-opacity cursor-pointer"
                        >
                            Entrar
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-muted">
                        ¿No tienes cuenta?{" "}
                        <Link
                            href="/signup"
                            className="text-primary hover:text-primary-light transition-colors font-medium"
                        >
                            Regístrate
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
