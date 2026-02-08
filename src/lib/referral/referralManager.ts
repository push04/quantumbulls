/**
 * Referral System Manager
 * Handles referral codes, tracking, and rewards
 */

import { createClient } from "@/lib/supabase/client";

export interface Referral {
    id: string;
    referrerId: string;
    referredId: string;
    status: "pending" | "completed" | "rewarded";
    rewardType: string;
    createdAt: string;
}

export interface ReferralStats {
    totalReferrals: number;
    pendingReferrals: number;
    completedReferrals: number;
    totalRewards: number;
    referralCode: string;
    referralLink: string;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://quantumbull.com";
const REWARD_DAYS_FREE = 7; // 1 week free for both parties

/**
 * Generate referral code from username
 */
export function generateReferralCode(username: string): string {
    // Clean username and add random suffix
    const cleanName = username.toLowerCase().replace(/[^a-z0-9]/g, "");
    const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${cleanName}-${suffix}`;
}

/**
 * Get user's referral link
 */
export function getReferralLink(referralCode: string): string {
    return `${SITE_URL}/ref/${referralCode}`;
}

/**
 * Get or create user's referral code
 */
export async function getUserReferralCode(userId: string): Promise<string> {
    const supabase = createClient();

    // Check if user already has a referral code
    const { data: profile } = await supabase
        .from("profiles")
        .select("referral_code, full_name")
        .eq("id", userId)
        .single();

    if (profile?.referral_code) {
        return profile.referral_code;
    }

    // Generate new code
    const code = generateReferralCode(profile?.full_name || "user");

    // Save to profile
    await supabase
        .from("profiles")
        .update({ referral_code: code })
        .eq("id", userId);

    return code;
}

/**
 * Record a referral signup
 */
export async function recordReferral(
    referralCode: string,
    newUserId: string
): Promise<boolean> {
    const supabase = createClient();

    // Find referrer by code
    const { data: referrer } = await supabase
        .from("profiles")
        .select("id")
        .eq("referral_code", referralCode)
        .single();

    if (!referrer || referrer.id === newUserId) {
        return false; // Can't refer yourself
    }

    // Check if this user was already referred
    const { data: existing } = await supabase
        .from("referrals")
        .select("id")
        .eq("referred_user_id", newUserId)
        .single();

    if (existing) {
        return false; // Already referred
    }

    // Create referral record
    const { error } = await supabase.from("referrals").insert({
        referrer_id: referrer.id,
        referred_user_id: newUserId,
        status: "pending",
        reward_type: `${REWARD_DAYS_FREE}_days_free`,
    });

    return !error;
}

/**
 * Complete referral when referred user upgrades to paid
 */
export async function completeReferral(referredUserId: string): Promise<boolean> {
    const supabase = createClient();

    // Find pending referral
    const { data: referral } = await supabase
        .from("referrals")
        .select("*")
        .eq("referred_user_id", referredUserId)
        .eq("status", "pending")
        .single();

    if (!referral) return false;

    // Update to completed
    const { error } = await supabase
        .from("referrals")
        .update({
            status: "completed",
            completed_at: new Date().toISOString(),
        })
        .eq("id", referral.id);

    if (error) return false;

    // TODO: Add reward logic (extend subscription, add credits, etc.)
    // This would integrate with your payment/subscription system

    return true;
}

/**
 * Get user's referral statistics
 */
export async function getReferralStats(userId: string): Promise<ReferralStats> {
    const supabase = createClient();

    // Get referral code
    const referralCode = await getUserReferralCode(userId);

    // Get referral counts
    const { data: referrals } = await supabase
        .from("referrals")
        .select("status")
        .eq("referrer_id", userId);

    const stats = {
        totalReferrals: referrals?.length || 0,
        pendingReferrals: referrals?.filter(r => r.status === "pending").length || 0,
        completedReferrals: referrals?.filter(r => r.status === "completed" || r.status === "rewarded").length || 0,
        totalRewards: (referrals?.filter(r => r.status === "rewarded").length || 0) * REWARD_DAYS_FREE,
        referralCode,
        referralLink: getReferralLink(referralCode),
    };

    return stats;
}

/**
 * Get referral leaderboard
 */
export async function getReferralLeaderboard(limit: number = 10): Promise<{
    userId: string;
    name: string;
    count: number;
}[]> {
    const supabase = createClient();

    // This would ideally be a view or RPC function
    const { data } = await supabase
        .from("referrals")
        .select("referrer_id, profiles!referrer_id(full_name)")
        .in("status", ["completed", "rewarded"]);

    if (!data) return [];

    // Count by referrer
    const counts: Record<string, { name: string; count: number }> = {};

    data.forEach((r) => {
        const id = r.referrer_id;
        const name = (r.profiles as { full_name?: string })?.full_name || "Anonymous";

        if (!counts[id]) {
            counts[id] = { name, count: 0 };
        }
        counts[id].count++;
    });

    // Sort and return top
    return Object.entries(counts)
        .map(([userId, { name, count }]) => ({ userId, name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
}
