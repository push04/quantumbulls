/**
 * Revenue Calculator
 * Calculates MRR, LTV, churn rate, and revenue metrics
 */

import { createClient } from '@/lib/supabase/client';

export interface RevenueMetrics {
    mrr: number; // Monthly Recurring Revenue in cents
    arr: number; // Annual Recurring Revenue
    ltv: number; // Lifetime Value
    arpu: number; // Average Revenue Per User
    churnRate: number; // Percentage
    totalRevenue: number;
    revenueGrowth: number; // Percentage change from last month
}

export interface SubscriptionBreakdown {
    tier: string;
    count: number;
    revenue: number;
    percentage: number;
}

// Tier pricing (in cents per month)
const TIER_PRICING: Record<string, number> = {
    free: 0,
    basic: 49900, // ₹499
    medium: 99900, // ₹999
    advanced: 199900, // ₹1999
};

/**
 * Get subscription breakdown
 */
export async function getSubscriptionBreakdown(): Promise<SubscriptionBreakdown[]> {
    const supabase = createClient();

    const { data: profiles } = await supabase
        .from('profiles')
        .select('tier')
        .not('tier', 'is', null);

    if (!profiles) return [];

    const counts: Record<string, number> = {
        free: 0,
        basic: 0,
        medium: 0,
        advanced: 0,
    };

    profiles.forEach(p => {
        const tier = p.tier || 'free';
        counts[tier] = (counts[tier] || 0) + 1;
    });

    const total = profiles.length;
    const breakdown: SubscriptionBreakdown[] = [];

    Object.entries(counts).forEach(([tier, count]) => {
        breakdown.push({
            tier,
            count,
            revenue: count * TIER_PRICING[tier],
            percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        });
    });

    return breakdown;
}

/**
 * Calculate Monthly Recurring Revenue
 */
export async function calculateMRR(): Promise<number> {
    const breakdown = await getSubscriptionBreakdown();
    return breakdown.reduce((sum, tier) => sum + tier.revenue, 0);
}

/**
 * Get revenue for a date range
 */
export async function getRevenueByDateRange(
    startDate: Date,
    endDate: Date
): Promise<{ date: string; revenue: number }[]> {
    const supabase = createClient();

    const { data: events } = await supabase
        .from('subscription_events')
        .select('amount_cents, created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .in('event_type', ['created', 'upgraded', 'renewed']);

    if (!events) return [];

    // Group by date
    const revenueByDate: Record<string, number> = {};
    events.forEach(e => {
        const date = e.created_at.split('T')[0];
        revenueByDate[date] = (revenueByDate[date] || 0) + (e.amount_cents || 0);
    });

    // Fill in missing dates
    const result: { date: string; revenue: number }[] = [];
    const current = new Date(startDate);
    while (current <= endDate) {
        const dateStr = current.toISOString().split('T')[0];
        result.push({
            date: dateStr,
            revenue: revenueByDate[dateStr] || 0,
        });
        current.setDate(current.getDate() + 1);
    }

    return result;
}

/**
 * Calculate churn rate for a period
 */
export async function calculateChurnRate(
    startDate: Date,
    endDate: Date
): Promise<number> {
    const supabase = createClient();

    // Get subscribers at start
    const { count: startCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .neq('tier', 'free')
        .lte('created_at', startDate.toISOString());

    // Get cancellations in period
    const { count: cancelCount } = await supabase
        .from('subscription_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'cancelled')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

    if (!startCount || startCount === 0) return 0;
    return Math.round(((cancelCount || 0) / startCount) * 100 * 10) / 10;
}

/**
 * Calculate Lifetime Value
 */
export async function calculateLTV(): Promise<number> {
    const supabase = createClient();

    // Get average subscription duration
    const { data: events } = await supabase
        .from('subscription_events')
        .select('user_id, event_type, created_at')
        .in('event_type', ['created', 'cancelled'])
        .order('created_at');

    if (!events || events.length === 0) return 0;

    // Calculate average months subscribed
    const userDurations: Record<string, { start?: Date; end?: Date }> = {};

    events.forEach(e => {
        if (!userDurations[e.user_id]) {
            userDurations[e.user_id] = {};
        }
        if (e.event_type === 'created') {
            userDurations[e.user_id].start = new Date(e.created_at);
        } else if (e.event_type === 'cancelled') {
            userDurations[e.user_id].end = new Date(e.created_at);
        }
    });

    // Calculate average months
    let totalMonths = 0;
    let count = 0;
    const now = new Date();

    Object.values(userDurations).forEach(d => {
        if (d.start) {
            const end = d.end || now;
            const months = (end.getTime() - d.start.getTime()) / (1000 * 60 * 60 * 24 * 30);
            totalMonths += months;
            count++;
        }
    });

    const avgMonths = count > 0 ? totalMonths / count : 0;

    // LTV = ARPU * Average Lifetime
    const breakdown = await getSubscriptionBreakdown();
    const paidBreakdown = breakdown.filter(b => b.tier !== 'free');
    const totalPaidUsers = paidBreakdown.reduce((sum, b) => sum + b.count, 0);
    const totalRevenue = paidBreakdown.reduce((sum, b) => sum + b.revenue, 0);
    const arpu = totalPaidUsers > 0 ? totalRevenue / totalPaidUsers : 0;

    return Math.round(arpu * avgMonths);
}

/**
 * Get all revenue metrics
 */
export async function getRevenueMetrics(): Promise<RevenueMetrics> {
    const mrr = await calculateMRR();
    const ltv = await calculateLTV();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const churnRate = await calculateChurnRate(startOfMonth, now);

    // Get this month's revenue
    const thisMonthRevenue = await getRevenueByDateRange(startOfMonth, now);
    const totalThisMonth = thisMonthRevenue.reduce((sum, d) => sum + d.revenue, 0);

    // Get last month's revenue
    const lastMonthRevenue = await getRevenueByDateRange(startOfLastMonth, endOfLastMonth);
    const totalLastMonth = lastMonthRevenue.reduce((sum, d) => sum + d.revenue, 0);

    // Growth rate
    const revenueGrowth = totalLastMonth > 0
        ? Math.round(((totalThisMonth - totalLastMonth) / totalLastMonth) * 100)
        : 0;

    // ARPU
    const breakdown = await getSubscriptionBreakdown();
    const paidUsers = breakdown.filter(b => b.tier !== 'free').reduce((sum, b) => sum + b.count, 0);
    const arpu = paidUsers > 0 ? Math.round(mrr / paidUsers) : 0;

    return {
        mrr,
        arr: mrr * 12,
        ltv,
        arpu,
        churnRate,
        totalRevenue: totalThisMonth,
        revenueGrowth,
    };
}

/**
 * Get subscriber counts
 */
export async function getSubscriberCounts(): Promise<{
    total: number;
    basic: number;
    medium: number;
    advanced: number;
    free: number;
}> {
    const breakdown = await getSubscriptionBreakdown();

    const counts = { total: 0, free: 0, basic: 0, medium: 0, advanced: 0 };
    breakdown.forEach(b => {
        counts[b.tier as keyof typeof counts] = b.count;
        counts.total += b.count;
    });

    return counts;
}

/**
 * Format currency (INR)
 */
export function formatCurrency(cents: number): string {
    const rupees = cents / 100;
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(rupees);
}
