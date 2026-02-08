"use client";

import Link from "next/link";

export default function OfflinePage() {
    return (
        <div className="min-h-dvh bg-background flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
            </div>

            <div className="text-center space-y-6 max-w-md">
                {/* Offline icon */}
                <div className="w-20 h-20 mx-auto rounded-2xl bg-amber-500/20 flex items-center justify-center">
                    <svg className="w-10 h-10 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a5 5 0 01-1.414-2.22m-2.391.37A9.003 9.003 0 013 12c0-1.714.48-3.316 1.31-4.678" />
                    </svg>
                </div>

                <div>
                    <h1 className="text-2xl font-semibold mb-2">Sin conexión</h1>
                    <p className="text-muted text-sm leading-relaxed">
                        No se pudo conectar al servidor. Verifica tu conexión a internet
                        e intenta nuevamente.
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => window.location.reload()}
                        className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white font-medium text-sm hover:opacity-90 transition-opacity cursor-pointer"
                    >
                        Reintentar conexión
                    </button>
                    <Link
                        href="/"
                        className="text-sm text-muted hover:text-foreground transition-colors"
                    >
                        Ir al inicio
                    </Link>
                </div>

                <p className="text-xs text-muted/60">
                    Ccurity funciona mejor con conexión a internet.
                    Algunas funciones pueden no estar disponibles offline.
                </p>
            </div>
        </div>
    );
}
