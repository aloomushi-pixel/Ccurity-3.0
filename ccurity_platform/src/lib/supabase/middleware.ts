import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    // Public routes that don't require authentication
    const publicRoutes = ["/", "/login", "/signup", "/auth/callback", "/offline"];
    const publicPrefixes = ["/auth/", "/contrato/", "/cotizacion/"];
    const isPublicRoute =
        publicRoutes.includes(pathname) ||
        publicPrefixes.some((prefix) => pathname.startsWith(prefix));

    // If not authenticated and trying to access protected route, redirect to login
    if (!user && !isPublicRoute) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("redirect", pathname);
        return NextResponse.redirect(url);
    }

    // If authenticated, check role-based access
    if (user && !isPublicRoute) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        const role = profile?.role || "CLIENT";

        // Role -> allowed route prefixes
        const roleAccess: Record<string, string[]> = {
            ADMIN: ["/admin", "/supervisor", "/colaborador", "/portal"],
            SUPER: ["/supervisor", "/colaborador"],
            COLAB: ["/colaborador"],
            CLIENT: ["/portal"],
        };

        const allowedPrefixes = roleAccess[role] || ["/portal"];
        const hasAccess = allowedPrefixes.some((prefix) =>
            pathname.startsWith(prefix)
        );

        if (!hasAccess) {
            // Redirect to the user's default dashboard
            const defaultRoute: Record<string, string> = {
                ADMIN: "/admin",
                SUPER: "/supervisor",
                COLAB: "/colaborador",
                CLIENT: "/portal",
            };
            const url = request.nextUrl.clone();
            url.pathname = defaultRoute[role] || "/portal";
            return NextResponse.redirect(url);
        }
    }

    return supabaseResponse;
}
