import Link from "next/link";
import Image from "next/image";

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
            </div>
            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <Link href="/" className="flex justify-center">
                    <Image src="/logo.svg" alt="Quantum Bull" width={160} height={56} className="h-14 w-auto" priority />
                </Link>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="bg-white py-10 px-8 shadow-xl sm:rounded-2xl sm:px-10 border border-slate-100 text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[#2EBD59]/10 mb-6">
                        <svg
                            className="h-8 w-8 text-[#2EBD59]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                        </svg>
                    </div>

                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                        Check your email
                    </h2>

                    <p className="text-slate-500 mb-6">
                        We&apos;ve sent you a verification link. Please check your inbox and
                        click the link to verify your email address.
                    </p>

                    <div className="bg-slate-50 rounded-xl p-4 mb-6">
                        <p className="text-sm text-slate-500">
                            Didn&apos;t receive the email? Check your spam folder or{" "}
                            <Link
                                href="/signup"
                                className="text-emerald-600 hover:text-emerald-700 font-semibold"
                            >
                                try signing up again
                            </Link>
                        </p>
                    </div>

                    <Link
                        href="/signin"
                        className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-semibold"
                    >
                        <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>
                        Back to sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}
