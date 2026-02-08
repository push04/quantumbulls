import Link from "next/link";

export const metadata = {
    title: "Terms of Service | Quantum Bull",
    description: "Read our terms of service for using the Quantum Bull trading education platform.",
};

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
                <p className="text-gray-500 mb-8">Last updated: February 2026</p>

                <div className="prose prose-gray max-w-none">
                    <h2>1. Acceptance of Terms</h2>
                    <p>
                        By accessing or using Quantum Bull (&quot;the Platform&quot;), you agree to be bound by these
                        Terms of Service. If you do not agree to these terms, please do not use the Platform.
                    </p>

                    <h2>2. Account Registration</h2>
                    <p>
                        To access certain features, you must create an account. You agree to:
                    </p>
                    <ul>
                        <li>Provide accurate and complete information</li>
                        <li>Maintain the security of your account credentials</li>
                        <li>Not share your account with others</li>
                        <li>Immediately notify us of any unauthorized access</li>
                    </ul>

                    <h2>3. Subscription & Payments</h2>
                    <p>
                        Paid subscriptions are billed monthly or annually. By subscribing, you authorize us
                        to charge your payment method. Subscriptions auto-renew unless cancelled.
                    </p>
                    <ul>
                        <li>Refunds are available within 14 days of initial purchase</li>
                        <li>No refunds for partial month usage after the 14-day period</li>
                        <li>You may cancel at any time; access continues until the billing period ends</li>
                    </ul>

                    <h2>4. Content Usage</h2>
                    <p>
                        All content on the Platform is owned by Quantum Bull and protected by copyright law. You may not:
                    </p>
                    <ul>
                        <li>Download, copy, or redistribute video content</li>
                        <li>Share your account credentials with others</li>
                        <li>Use automated tools to access or scrape content</li>
                        <li>Record or screen-capture video lessons</li>
                    </ul>

                    <h2>5. Investment Disclaimer</h2>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 not-prose">
                        <p className="text-amber-800 font-medium">⚠️ Important Notice</p>
                        <p className="text-amber-700 text-sm mt-1">
                            Trading involves significant risk and may not be suitable for everyone.
                            The content on this Platform is for educational purposes only and does not
                            constitute financial advice. Past performance is not indicative of future results.
                            You should consult a qualified financial advisor before making investment decisions.
                        </p>
                    </div>

                    <h2>6. User Conduct</h2>
                    <p>You agree not to:</p>
                    <ul>
                        <li>Violate any applicable laws or regulations</li>
                        <li>Harass, abuse, or harm other users</li>
                        <li>Post spam or misleading content</li>
                        <li>Attempt to gain unauthorized access to the Platform</li>
                    </ul>

                    <h2>7. Account Termination</h2>
                    <p>
                        We may suspend or terminate your account for violations of these terms,
                        suspicious activity, or at our discretion. You may delete your account
                        at any time through your profile settings.
                    </p>

                    <h2>8. Limitation of Liability</h2>
                    <p>
                        Quantum Bull is provided &quot;as is&quot; without warranties. We are not liable for
                        any financial losses resulting from trading decisions made after using our content.
                    </p>

                    <h2>9. Changes to Terms</h2>
                    <p>
                        We may update these terms at any time. Continued use after changes constitutes
                        acceptance of the new terms. We will notify users of significant changes via email.
                    </p>

                    <h2>10. Contact</h2>
                    <p>
                        For questions about these terms, contact us at{" "}
                        <a href="mailto:legal@quantumbull.com">legal@quantumbull.com</a>
                    </p>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                        © 2026 Quantum Bull. All rights reserved.
                    </p>
                    <div className="flex gap-4 mt-2">
                        <Link href="/privacy" className="text-sm text-[#2EBD59] hover:underline">
                            Privacy Policy
                        </Link>
                        <Link href="/contact" className="text-sm text-[#2EBD59] hover:underline">
                            Contact Us
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
