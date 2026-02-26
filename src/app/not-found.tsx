import Link from "next/link";
import Icon from "@/components/ui/Icon";

export default function NotFound() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
            </div>
            
            <div className="text-center max-w-md relative z-10">
                <div className="relative w-40 h-40 mx-auto mb-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-full animate-pulse"></div>
                    <div className="absolute inset-4 bg-white rounded-full shadow-xl flex items-center justify-center border border-slate-100">
                        <span className="text-5xl font-bold text-slate-300">404</span>
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-slate-900 mb-3">
                    Page Not Found
                </h1>
                <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                    Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/25"
                    >
                        <Icon name="home" size={18} />
                        Go Home
                    </Link>
                    <Link
                        href="/courses"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                    >
                        <Icon name="book" size={18} />
                        Browse Courses
                    </Link>
                </div>

                <p className="mt-8 text-sm text-slate-400">
                    Need help?{" "}
                    <Link href="/contact" className="text-emerald-600 hover:text-emerald-700 font-medium">
                        Contact Support
                    </Link>
                </p>
            </div>
        </main>
    );
}
