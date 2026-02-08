export const metadata = {
    title: "Contact Us | Quantum Bull",
};

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-white pt-24 pb-12 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
                <p className="text-lg text-gray-700 mb-8">
                    Have questions? We'd love to hear from you.
                </p>

                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                    <h2 className="text-xl font-semibold mb-4">Get in Touch</h2>
                    <p className="mb-2"><strong>Email:</strong> support@quantumbull.com</p>
                    <p className="mb-2"><strong>Phone:</strong> +91 98765 43210</p>
                    <p><strong>Address:</strong> 123 Trading Hub, Mumbai, India</p>
                </div>
            </div>
        </main>
    );
}
