"use client";

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="min-h-dvh bg-background flex items-center justify-center px-4">
            <div className="glass-card p-8 max-w-md w-full text-center space-y-6">
                {/* Error icon */}
                <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-2">Algo salió mal</h2>
                    <p className="text-sm text-muted">
                        Ocurrió un error inesperado. Intenta recargar la página.
                    </p>
                    {error.digest && (
                        <p className="text-xs text-muted mt-2 font-mono">
                            Código: {error.digest}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={reset}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white font-medium text-sm hover:opacity-90 transition-opacity"
                    >
                        Reintentar
                    </button>
                    <a
                        href="/admin"
                        className="text-sm text-muted hover:text-foreground transition-colors"
                    >
                        Volver al Dashboard
                    </a>
                </div>
            </div>
        </div>
    );
}
