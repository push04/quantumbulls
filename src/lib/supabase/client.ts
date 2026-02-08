import { createBrowserClient } from "@supabase/ssr";

// Check if Supabase is properly configured
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const isConfigured =
    supabaseUrl &&
    supabaseKey &&
    supabaseUrl !== "your-project-url-here" &&
    supabaseKey !== "your-anon-key-here" &&
    supabaseUrl.startsWith("https://");

export function createClient() {
    if (!isConfigured) {
        // Return a mock client that shows helpful errors
        console.warn(
            "⚠️ Supabase is not configured. Please add your credentials to .env.local"
        );
    }

    return createBrowserClient(
        supabaseUrl || "https://placeholder.supabase.co",
        supabaseKey || "placeholder-key"
    );
}

export { isConfigured };
