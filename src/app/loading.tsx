export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-[#2EBD59] rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Loading...</p>
            </div>
        </div>
    );
}
