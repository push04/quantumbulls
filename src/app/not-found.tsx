import Link from "next/link";

export default function NotFound() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="text-center max-w-md">
                {/* 404 Illustration */}
                <div className="relative w-48 h-48 mx-auto mb-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#2EBD59]/20 to-[#2EBD59]/5 rounded-full animate-pulse" />
                    <div className="absolute inset-4 bg-white rounded-full shadow-lg flex items-center justify-center">
                        <span className="text-6xl font-bold text-gray-300">404</span>
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Page Not Found
                </h1>
                <p className="text-gray-600 mb-8">
                    Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>

                <div className="space-y-3">
                    <Link
                        href="/"
                        className="block w-full px-6 py-3 bg-[#2EBD59] text-white font-medium rounded-lg hover:bg-[#26a34d] transition-colors"
                    >
                        Go Home
                    </Link>
                    <Link
                        href="/courses"
                        className="block w-full px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Browse Courses
                    </Link>
                </div>

                <p className="mt-8 text-sm text-gray-400">
                    Need help?{" "}
                    <Link href="/contact" className="text-[#2EBD59] hover:underline">
                        Contact Support
                    </Link>
                </p>
            </div>
        </main>
    );
}
