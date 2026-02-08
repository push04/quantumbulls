import Link from "next/link";

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link href="/" className="flex justify-center">
                    <img src="/logo.png" alt="Quantum Bull" className="h-16 w-auto" />
                </Link>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-10 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100 text-center">
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

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Check your email
                    </h2>

                    <p className="text-gray-600 mb-6">
                        We&apos;ve sent you a verification link. Please check your inbox and
                        click the link to verify your email address.
                    </p>

                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <p className="text-sm text-gray-500">
                            Didn&apos;t receive the email? Check your spam folder or{" "}
                            <Link
                                href="/signup"
                                className="text-[#2EBD59] hover:text-[#26a34d] font-medium"
                            >
                                try signing up again
                            </Link>
                        </p>
                    </div>

                    <Link
                        href="/signin"
                        className="inline-flex items-center text-[#2EBD59] hover:text-[#26a34d] font-medium"
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
