import { Suspense } from "react";
import Link from "next/link";
import SignInForm from "./SignInForm";

function SignInFormFallback() {
    return (
        <div className="bg-white py-10 px-8 shadow-xl sm:rounded-2xl sm:px-10 border border-slate-100">
            <div className="space-y-6 animate-pulse">
                <div className="h-12 bg-slate-100 rounded-xl" />
                <div className="h-12 bg-slate-100 rounded-xl" />
                <div className="h-12 bg-slate-100 rounded-xl" />
            </div>
        </div>
    );
}

export default function SignInPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
            </div>
            
            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <Link href="/" className="flex justify-center">
                    <img src="/logo.svg" alt="Quantum Bull" className="h-14 w-auto" />
                </Link>
                <h2 className="mt-8 text-center text-2xl font-bold text-slate-900">
                    Welcome back
                </h2>
                <p className="mt-2 text-center text-sm text-slate-500">
                    Sign in to continue your trading journey
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <Suspense fallback={<SignInFormFallback />}>
                    <SignInForm />
                </Suspense>
                
                <p className="mt-6 text-center text-sm text-slate-500">
                    Don&apos;t have an account?{" "}
                    <Link
                        href="/signup"
                        className="font-semibold text-emerald-600 hover:text-emerald-700"
                    >
                        Sign up for free
                    </Link>
                </p>
            </div>
        </div>
    );
}
