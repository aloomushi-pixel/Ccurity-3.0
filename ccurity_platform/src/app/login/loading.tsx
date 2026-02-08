export default function LoginLoading() {
    return (
        <div className="min-h-dvh bg-background flex items-center justify-center px-4 animate-pulse">
            <div className="glass-card p-8 w-full max-w-md space-y-6">
                {/* Logo placeholder */}
                <div className="text-center space-y-2">
                    <div className="h-8 w-32 bg-surface-2 rounded mx-auto" />
                    <div className="h-4 w-48 bg-surface-2 rounded mx-auto" />
                </div>

                {/* Form skeleton */}
                <div className="space-y-4">
                    <div>
                        <div className="h-3 w-16 bg-surface-2 rounded mb-2" />
                        <div className="h-10 bg-surface-2 rounded-xl" />
                    </div>
                    <div>
                        <div className="h-3 w-24 bg-surface-2 rounded mb-2" />
                        <div className="h-10 bg-surface-2 rounded-xl" />
                    </div>
                    <div className="h-10 bg-surface-2 rounded-xl" />
                </div>

                {/* Footer link */}
                <div className="h-3 w-40 bg-surface-2 rounded mx-auto" />
            </div>
        </div>
    );
}
