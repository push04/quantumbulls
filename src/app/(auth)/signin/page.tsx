import { Suspense } from "react";
import Link from "next/link";
import SignInForm from "./SignInForm";

function SignInFormFallback() {
    return (
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
            <div className="space-y-6 animate-pulse">
                <div className="h-12 bg-gray-200 rounded-lg" />
                <div className="h-12 bg-gray-200 rounded-lg" />
                <div className="h-12 bg-gray-200 rounded-lg" />
            </div>
        </div>
    );
}

export default function SignInPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link href="/" className="flex justify-center">
                    <img src="/logo.svg" alt="Quantum Bull" className="h-16 w-auto" />
                </Link>
                <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
                    Welcome back
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Don&apos;t have an account?{" "}
                    <Link
                        href="/signup"
                        className="font-medium text-[#2EBD59] hover:text-[#26a34d]"
                    >
                        Sign up for free
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <Suspense fallback={<SignInFormFallback />}>
                    <SignInForm />
                </Suspense>
            </div>
        </div>
    );
}
