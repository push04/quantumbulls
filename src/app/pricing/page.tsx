import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PlanPaymentButton from "@/components/payment/PlanPaymentButton";

export const metadata = {
    title: "Pricing | Quantum Bull",
    description: "Choose the plan that fits your trading journey",
};

export default async function PricingPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: plans } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price', { ascending: true });

    return (
        <main className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
                    <p className="text-xl text-gray-600">
                        Invest in your education and get lifetime value.
                    </p>
                </div>

                {!plans || plans.length === 0 ? (
                    <div className="text-center py-20">
                        <h3 className="text-xl font-medium text-gray-600">Pricing information is currently being updated.</h3>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className={`bg-white rounded-2xl shadow-sm border p-8 relative ${plan.is_popular
                                    ? 'shadow-xl border-[#2EBD59] transform md:-translate-y-4 z-10'
                                    : 'border-gray-100 hover:shadow-md transition-shadow'
                                    }`}
                            >
                                {plan.is_popular && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#2EBD59] text-white px-4 py-1 rounded-b-lg text-sm font-medium">
                                        Most Popular
                                    </div>
                                )}
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                                <div className="text-4xl font-bold text-gray-900 mb-1">
                                    {plan.price === 0 ? 'Free' : `₹${plan.price}`}
                                </div>
                                <div className="text-sm text-gray-500 mb-6">/{plan.interval}</div>
                                <ul className="space-y-4 mb-8">
                                    {plan.features?.map((feature: string, i: number) => (
                                        <li key={i} className="flex items-center gap-2 text-gray-600">
                                            <span className="text-green-500">✓</span> {feature}
                                        </li>
                                    ))}
                                </ul>
                                {/* <Link
                                    href={plan.cta_link || "/signup"}
                                    className={`block w-full text-center px-4 py-2 rounded-lg transition-colors ${plan.is_popular
                                            ? 'bg-[#2EBD59] text-white hover:bg-[#26a34d]'
                                            : 'border border-[#2EBD59] text-[#2EBD59] hover:bg-green-50'
                                        }`}
                                >
                                    {plan.cta_text || "Get Started"}
                                </Link> */}
                                <PlanPaymentButton
                                    plan={plan}
                                    user={user}
                                    className={`block w-full text-center px-4 py-2 rounded-lg transition-colors font-semibold ${plan.is_popular
                                        ? 'bg-[#2EBD59] text-white hover:bg-[#26a34d]'
                                        : 'border border-[#2EBD59] text-[#2EBD59] hover:bg-green-50'
                                        }`}
                                >
                                    {plan.cta_text || (plan.price === 0 ? "Get Started" : "Subscribe Now")}
                                </PlanPaymentButton>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
