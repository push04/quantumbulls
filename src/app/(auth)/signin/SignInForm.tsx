"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { v4 as uuidv4 } from "uuid";

export default function SignInForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        rememberMe: false,
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Check for error messages from redirects
    const errorParam = searchParams.get("error");
    const sessionError =
        errorParam === "session_conflict"
            ? "You've been logged out because you logged in from another device."
            : errorParam === "session_expired"
                ? "Your session has expired. Please sign in again."
                : null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
        setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const { data, error: signInError } =
                await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password,
                });

            if (signInError) {
                setError(signInError.message);
                return;
            }

            if (data.user) {
                const sessionId = uuidv4();
                localStorage.setItem("session_id", sessionId);

                const { error: updateError } = await supabase
                    .from("profiles")
                    .update({
                        active_session_id: sessionId,
                        session_updated_at: new Date().toISOString(),
                    })
                    .eq("id", data.user.id);

                if (updateError) {
                    console.error("Failed to update session:", updateError);
                }

                const redirectTo = searchParams.get("redirect") || "/dashboard";
                router.push(redirectTo);
                router.refresh();
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
            <form className="space-y-6" onSubmit={handleSubmit}>
                {(error || sessionError) && (
                    <div
                        className={`${sessionError
                                ? "bg-amber-50 border-amber-200 text-amber-700"
                                : "bg-red-50 border-red-200 text-red-600"
                            } border px-4 py-3 rounded-lg text-sm`}
                    >
                        {error || sessionError}
                    </div>
                )}

                <div>
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Email address
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2EBD59] focus:border-transparent transition-all"
                        placeholder="you@example.com"
                    />
                </div>

                <div>
                    <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Password
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2EBD59] focus:border-transparent transition-all"
                        placeholder="••••••••"
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input
                            id="rememberMe"
                            name="rememberMe"
                            type="checkbox"
                            checked={formData.rememberMe}
                            onChange={handleChange}
                            className="h-4 w-4 text-[#2EBD59] focus:ring-[#2EBD59] border-gray-300 rounded"
                        />
                        <label
                            htmlFor="rememberMe"
                            className="ml-2 block text-sm text-gray-700"
                        >
                            Remember me
                        </label>
                    </div>

                    <Link
                        href="/forgot-password"
                        className="text-sm font-medium text-[#2EBD59] hover:text-[#26a34d]"
                    >
                        Forgot password?
                    </Link>
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-[#2EBD59] hover:bg-[#26a34d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2EBD59] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {loading ? (
                            <svg
                                className="animate-spin h-5 w-5 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
