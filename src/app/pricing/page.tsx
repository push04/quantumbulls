import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PlanPaymentButton from "@/components/payment/PlanPaymentButton";
import Icon from "@/components/ui/Icon";

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
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20 pb-12 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-10 sm:mb-12">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
                    <p className="text-lg sm:text-xl text-gray-600">
                        Invest in your education and get lifetime value.
                    </p>
                </div>

                {!plans || plans.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                            <Icon name="info" size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-600">Pricing information is currently being updated.</h3>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
                        {plans.map((plan, index) => (
                            <div
                                key={plan.id}
                                className={`bg-white rounded-2xl shadow-sm border p-6 sm:p-8 relative transition-all duration-300 hover:shadow-lg animate-fade-in-up ${plan.is_popular
                                    ? 'shadow-xl border-[#2EBD59] md:-translate-y-2 z-10'
                                    : 'border-gray-100 hover:shadow-md'
                                    }`}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                {plan.is_popular && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#2EBD59] text-white px-4 py-1.5 rounded-b-lg text-xs sm:text-sm font-medium">
                                        Most Popular
                                    </div>
                                )}
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                                <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">
                                    {plan.price === 0 ? 'Free' : `Rs.${plan.price}`}
                                </div>
                                <div className="text-sm text-gray-500 mb-6">/{plan.interval}</div>
                                <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                                    {plan.features?.map((feature: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2 text-gray-600 text-sm">
                                            <Icon name="check" size={18} className="text-[#2EBD59] flex-shrink-0 mt-0.5" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <PlanPaymentButton
                                    plan={plan}
                                    user={user}
                                    className={`block w-full text-center px-4 py-3 rounded-xl transition-all duration-200 font-semibold active:scale-95 ${plan.is_popular
                                        ? 'bg-[#2EBD59] text-white hover:bg-[#26a34d] shadow-lg shadow-[#2EBD59]/20'
                                        : 'border-2 border-[#2EBD59] text-[#2EBD59] hover:bg-[#2EBD59] hover:text-white'
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
