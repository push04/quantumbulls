import Icon from "@/components/ui/Icon";

export const metadata = {
    title: "Contact Us | Quantum Bull",
};

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20 pb-12 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">Contact Us</h1>
                <p className="text-lg text-gray-600 mb-8 sm:mb-10">
                    Have questions? We would love to hear from you.
                </p>

                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
                    <div className="bg-white p-5 sm:p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                            <Icon name="mail" size={24} className="text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Us</h3>
                        <p className="text-gray-600 text-sm mb-3">For general inquiries and support</p>
                        <a href="mailto:support@quantumbull.com" className="text-[#2EBD59] font-medium hover:underline">
                            support@quantumbull.com
                        </a>
                    </div>

                    <div className="bg-white p-5 sm:p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-4">
                            <Icon name="phone" size={24} className="text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Call Us</h3>
                        <p className="text-gray-600 text-sm mb-3">Mon - Sat, 9AM - 7PM IST</p>
                        <a href="tel:+919876543210" className="text-[#2EBD59] font-medium hover:underline">
                            +91 98765 43210
                        </a>
                    </div>

                    <div className="bg-white p-5 sm:p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
                            <Icon name="location" size={24} className="text-purple-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Visit Us</h3>
                        <p className="text-gray-600 text-sm mb-3">Our headquarters</p>
                        <p className="text-gray-700">
                            123 Trading Hub, Mumbai, India
                        </p>
                    </div>

                    <div className="bg-white p-5 sm:p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-4">
                            <Icon name="clock" size={24} className="text-amber-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Business Hours</h3>
                        <p className="text-gray-600 text-sm mb-3">When you can reach us</p>
                        <p className="text-gray-700">
                            Monday - Saturday<br />
                            9:00 AM - 7:00 PM IST
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
