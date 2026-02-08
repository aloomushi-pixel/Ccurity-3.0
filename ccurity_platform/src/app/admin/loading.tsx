export default function AdminLoading() {
    return (
        <div className="min-h-dvh bg-background animate-pulse">
            {/* Header skeleton */}
            <header className="sticky top-0 z-50 glass-card rounded-none border-x-0 border-t-0 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-4 w-16 bg-surface-2 rounded" />
                    <div className="h-6 w-48 bg-surface-2 rounded" />
                </div>
                <div className="h-8 w-8 bg-surface-2 rounded-full" />
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
                {/* Stats grid skeleton */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="glass-card p-5">
                            <div className="h-3 w-20 bg-surface-2 rounded mb-3" />
                            <div className="h-7 w-16 bg-surface-2 rounded" />
                        </div>
                    ))}
                </div>

                {/* Table skeleton */}
                <div className="glass-card overflow-hidden">
                    <div className="px-5 py-3 border-b border-border">
                        <div className="h-4 w-40 bg-surface-2 rounded" />
                    </div>
                    <div className="divide-y divide-border/50">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="px-5 py-3 flex items-center gap-4">
                                <div className="h-8 w-8 bg-surface-2 rounded-full flex-shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 w-32 bg-surface-2 rounded" />
                                    <div className="h-2 w-48 bg-surface-2 rounded" />
                                </div>
                                <div className="h-5 w-16 bg-surface-2 rounded-full" />
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
