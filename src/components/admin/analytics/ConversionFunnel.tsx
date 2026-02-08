"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface FunnelStep {
    label: string;
    count: number;
    percentage: number;
    dropoff: number;
}

/**
 * Conversion Funnel
 */
export default function ConversionFunnel() {
    const [steps, setSteps] = useState<FunnelStep[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            const supabase = createClient();

            // Get counts for each step
            const { count: signups } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            const { count: emailVerified } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .not('email_confirmed_at', 'is', null);

            const { count: watchedVideo } = await supabase
                .from('video_progress')
                .select('user_id', { count: 'exact', head: true });

            const { count: paidUsers } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .neq('tier', 'free');

            // Users active after 3 months
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

            const { count: retainedUsers } = await supabase
                .from('user_streaks')
                .select('*', { count: 'exact', head: true })
                .gte('last_activity_date', threeMonthsAgo.toISOString().split('T')[0]);

            const totalSignups = signups || 0;

            const funnelSteps: FunnelStep[] = [
                {
                    label: 'Signups',
                    count: totalSignups,
                    percentage: 100,
                    dropoff: 0,
                },
                {
                    label: 'Email Verified',
                    count: emailVerified || 0,
                    percentage: totalSignups > 0 ? Math.round(((emailVerified || 0) / totalSignups) * 100) : 0,
                    dropoff: totalSignups > 0 ? Math.round(((totalSignups - (emailVerified || 0)) / totalSignups) * 100) : 0,
                },
                {
                    label: 'Watched First Video',
                    count: watchedVideo || 0,
                    percentage: totalSignups > 0 ? Math.round(((watchedVideo || 0) / totalSignups) * 100) : 0,
                    dropoff: (emailVerified || 0) > 0
                        ? Math.round((((emailVerified || 0) - (watchedVideo || 0)) / (emailVerified || 0)) * 100)
                        : 0,
                },
                {
                    label: 'Upgraded to Paid',
                    count: paidUsers || 0,
                    percentage: totalSignups > 0 ? Math.round(((paidUsers || 0) / totalSignups) * 100) : 0,
                    dropoff: (watchedVideo || 0) > 0
                        ? Math.round((((watchedVideo || 0) - (paidUsers || 0)) / (watchedVideo || 0)) * 100)
                        : 0,
                },
                {
                    label: 'Active After 3 Months',
                    count: retainedUsers || 0,
                    percentage: totalSignups > 0 ? Math.round(((retainedUsers || 0) / totalSignups) * 100) : 0,
                    dropoff: (paidUsers || 0) > 0
                        ? Math.round((((paidUsers || 0) - (retainedUsers || 0)) / (paidUsers || 0)) * 100)
                        : 0,
                },
            ];

            setSteps(funnelSteps);
            setLoading(false);
        }
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="h-64 flex items-center justify-center text-gray-400">
                    Loading...
                </div>
            </div>
        );
    }

    const maxCount = steps[0]?.count || 1;

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-6">Conversion Funnel</h3>

            <div className="space-y-4">
                {steps.map((step, index) => (
                    <div key={step.label}>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">
                                {step.label}
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-gray-900">
                                    {step.count.toLocaleString()}
                                </span>
                                <span className={`text-xs px-1.5 py-0.5 rounded ${step.percentage >= 50
                                    ? 'text-green-700 bg-green-50'
                                    : step.percentage >= 20
                                        ? 'text-amber-700 bg-amber-50'
                                        : 'text-red-700 bg-red-100'
                                    }`}>
                                    {step.percentage}%
                                </span>
                            </div>
                        </div>

                        {/* Funnel bar */}
                        <div className="h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                            <div
                                className="h-full bg-gradient-to-r from-[#2EBD59] to-emerald-400 transition-all duration-500"
                                style={{ width: `${(step.count / maxCount) * 100}%` }}
                            />
                        </div>

                        {/* Drop-off indicator */}
                        {index > 0 && step.dropoff > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                                <span className="text-xs text-red-500">
                                    ↓ {step.dropoff}% drop-off
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Insights */}
            <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                    <strong>Overall Conversion:</strong>{' '}
                    {steps[0]?.count > 0
                        ? `${((steps[steps.length - 1].count / steps[0].count) * 100).toFixed(1)}%`
                        : '0%'}
                    <span className="text-gray-400 ml-1">
                        from signup to retained customer
                    </span>
                </p>
            </div>
        </div>
    );
}
