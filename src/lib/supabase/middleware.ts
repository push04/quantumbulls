import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
    // Check if Supabase credentials are configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // If credentials are not configured or are placeholders, skip auth checks
    if (
        !supabaseUrl ||
        !supabaseKey ||
        supabaseUrl === "your-project-url-here" ||
        supabaseKey === "your-anon-key-here" ||
        !supabaseUrl.startsWith("https://")
    ) {
        // Allow the request to proceed without auth checks
        // This lets the app run for development before Supabase is set up
        return NextResponse.next({ request });
    }

    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value }) =>
                    request.cookies.set(name, value)
                );
                supabaseResponse = NextResponse.next({
                    request,
                });
                cookiesToSet.forEach(({ name, value, options }) =>
                    supabaseResponse.cookies.set(name, value, options)
                );
            },
        },
    });

    // Refresh session if expired
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Protected routes - redirect to login if not authenticated
    const protectedPaths = ["/dashboard"];
    const isProtectedPath = protectedPaths.some((path) =>
        request.nextUrl.pathname.startsWith(path)
    );

    if (isProtectedPath && !user) {
        const url = request.nextUrl.clone();
        url.pathname = "/signin";
        url.searchParams.set("redirect", request.nextUrl.pathname);
        return NextResponse.redirect(url);
    }

    // Redirect authenticated users away from auth pages
    const authPaths = ["/signin", "/signup"];
    const isAuthPath = authPaths.some((path) =>
        request.nextUrl.pathname.startsWith(path)
    );

    if (isAuthPath && user) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}
