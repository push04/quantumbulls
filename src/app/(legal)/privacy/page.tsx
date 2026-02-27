import Link from "next/link";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export const metadata = {
    title: "Privacy Policy | Quantum Bull",
    description: "Learn how Quantum Bull collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="py-12 px-4">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
                <p className="text-gray-500 mb-8">Last updated: February 2026</p>

                <div className="prose prose-gray max-w-none">
                    <h2>1. Information We Collect</h2>

                    <h3>Account Information</h3>
                    <ul>
                        <li>Email address</li>
                        <li>Name (optional)</li>
                        <li>Profile picture (optional)</li>
                        <li>Password (encrypted)</li>
                    </ul>

                    <h3>Usage Data</h3>
                    <ul>
                        <li>Video watching history and progress</li>
                        <li>Course completion status</li>
                        <li>Login times and session duration</li>
                        <li>Device type and browser information</li>
                    </ul>

                    <h3>Payment Information</h3>
                    <p>
                        Payment processing is handled by Stripe. We do not store your full credit card
                        number. We only receive the last 4 digits and expiration date for display purposes.
                    </p>

                    <h2>2. How We Use Your Data</h2>
                    <ul>
                        <li><strong>Provide Services:</strong> Deliver courses, track progress, and personalize recommendations</li>
                        <li><strong>Communication:</strong> Send important updates, new course announcements, and support responses</li>
                        <li><strong>Improvement:</strong> Analyze usage patterns to improve content and user experience</li>
                        <li><strong>Security:</strong> Detect and prevent fraud, abuse, and unauthorized access</li>
                    </ul>

                    <h2>3. Data Sharing</h2>
                    <p>We share your data only with:</p>
                    <ul>
                        <li><strong>Stripe:</strong> For payment processing</li>
                        <li><strong>Supabase:</strong> For secure data storage (our database provider)</li>
                        <li><strong>Analytics Services:</strong> Anonymized usage data for platform improvement</li>
                    </ul>
                    <p>
                        We do <strong>not</strong> sell your personal data to third parties. We do <strong>not</strong>{" "}
                        share your data with advertisers.
                    </p>

                    <h2>4. Data Retention</h2>
                    <p>
                        We retain your data for as long as your account is active. If you delete your account:
                    </p>
                    <ul>
                        <li>Profile data is deleted within 30 days</li>
                        <li>Payment history is retained for 7 years (legal requirement)</li>
                        <li>Anonymized analytics may be retained indefinitely</li>
                    </ul>

                    <h2>5. Your Rights</h2>
                    <p>You have the right to:</p>
                    <ul>
                        <li><strong>Access:</strong> Download all your personal data</li>
                        <li><strong>Correct:</strong> Update inaccurate information</li>
                        <li><strong>Delete:</strong> Request deletion of your account and data</li>
                        <li><strong>Export:</strong> Receive your data in a portable format</li>
                        <li><strong>Opt-out:</strong> Unsubscribe from marketing emails</li>
                    </ul>
                    <p>
                        To exercise these rights, visit your{" "}
                        <Link href="/settings" className="text-[#2EBD59]">account settings</Link>{" "}
                        or contact us at{" "}
                        <a href="mailto:privacy@quantumbull.com">privacy@quantumbull.com</a>
                    </p>

                    <h2>6. Cookies</h2>
                    <p>We use cookies for:</p>
                    <ul>
                        <li><strong>Essential:</strong> Authentication, security, preferences</li>
                        <li><strong>Analytics:</strong> Understanding how you use the platform</li>
                        <li><strong>Functionality:</strong> Remembering your video position</li>
                    </ul>
                    <p>
                        You can manage cookie preferences in your browser settings. Note that disabling
                        essential cookies may prevent you from using the platform.
                    </p>

                    <h2>7. Security</h2>
                    <p>We protect your data through:</p>
                    <ul>
                        <li>HTTPS encryption for all data transmission</li>
                        <li>Encrypted password storage</li>
                        <li>Regular security audits</li>
                        <li>Limited employee access to personal data</li>
                    </ul>

                    <h2>8. International Users</h2>
                    <p>
                        Our servers are located in India. By using Quantum Bull, you consent to the
                        transfer and processing of your data in India.
                    </p>

                    <h2>9. Children&apos;s Privacy</h2>
                    <p>
                        Quantum Bull is not intended for users under 18 years of age. We do not
                        knowingly collect data from children.
                    </p>

                    <h2>10. Changes to This Policy</h2>
                    <p>
                        We may update this policy periodically. We will notify you of significant
                        changes via email or platform notification.
                    </p>

                    <h2>11. Contact</h2>
                    <p>
                        For privacy-related questions or requests:<br />
                        Email: <a href="mailto:privacy@quantumbull.com">privacy@quantumbull.com</a><br />
                        DMCA: <a href="mailto:dmca@quantumbull.com">dmca@quantumbull.com</a>
                    </p>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                        © 2026 Quantum Bull. All rights reserved.
                    </p>
                    <div className="flex gap-4 mt-2">
                        <Link href="/terms" className="text-sm text-[#2EBD59] hover:underline">
                            Terms of Service
                        </Link>
                        <Link href="/contact" className="text-sm text-[#2EBD59] hover:underline">
                            Contact Us
                        </Link>
                    </div>
                </div>
            </div>
            </div>
            <Footer />
        </main>
    );
}
