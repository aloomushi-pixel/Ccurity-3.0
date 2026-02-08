import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-dvh bg-background flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
            </div>

            <div className="text-center space-y-6 max-w-md">
                {/* 404 text */}
                <div className="relative">
                    <span className="text-[120px] sm:text-[160px] font-bold gradient-text leading-none opacity-80">
                        404
                    </span>
                </div>

                <div>
                    <h1 className="text-2xl font-semibold mb-2">Página no encontrada</h1>
                    <p className="text-muted text-sm leading-relaxed">
                        La página que buscas no existe o fue movida.
                        Verifica la URL o regresa al inicio.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/"
                        className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white font-medium text-sm hover:opacity-90 transition-opacity"
                    >
                        Ir al Inicio
                    </Link>
                    <Link
                        href="/admin"
                        className="py-2.5 px-6 rounded-xl glass-card text-sm font-medium hover:bg-surface-2 transition-colors"
                    >
                        Dashboard Admin
                    </Link>
                </div>
            </div>
        </div>
    );
}
