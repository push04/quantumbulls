/**
 * A/B Testing Framework
 * Assigns users to experiments and tracks conversions
 */

import { createClient } from '@/lib/supabase/client';

export interface Experiment {
    id: string;
    name: string;
    description: string;
    variants: { id: string; name: string }[];
    trafficSplit: Record<string, number>;
    goalEvent: string;
    status: 'draft' | 'running' | 'paused' | 'completed';
    winnerVariant?: string;
    createdAt: string;
}

export interface ExperimentResults {
    experimentId: string;
    variants: {
        id: string;
        name: string;
        participants: number;
        conversions: number;
        conversionRate: number;
    }[];
    statisticalSignificance?: number;
    winner?: string;
}

/**
 * Get running experiments
 */
export async function getRunningExperiments(): Promise<Experiment[]> {
    const supabase = createClient();

    const { data } = await supabase
        .from('ab_experiments')
        .select('*')
        .eq('status', 'running');

    return (data || []).map(e => ({
        id: e.id,
        name: e.name,
        description: e.description,
        variants: e.variants,
        trafficSplit: e.traffic_split,
        goalEvent: e.goal_event,
        status: e.status,
        winnerVariant: e.winner_variant,
        createdAt: e.created_at,
    }));
}

/**
 * Get user's variant for an experiment
 */
export async function getUserVariant(
    userId: string,
    experimentId: string
): Promise<string | null> {
    const supabase = createClient();

    const { data } = await supabase
        .from('ab_assignments')
        .select('variant_id')
        .eq('user_id', userId)
        .eq('experiment_id', experimentId)
        .single();

    return data?.variant_id || null;
}

/**
 * Assign user to experiment variant
 */
export async function assignUserToExperiment(
    userId: string,
    experimentId: string
): Promise<string | null> {
    const supabase = createClient();

    // Check if already assigned
    const existing = await getUserVariant(userId, experimentId);
    if (existing) return existing;

    // Get experiment
    const { data: experiment } = await supabase
        .from('ab_experiments')
        .select('variants, traffic_split, status')
        .eq('id', experimentId)
        .single();

    if (!experiment || experiment.status !== 'running') return null;

    // Select variant based on traffic split
    const random = Math.random() * 100;
    let cumulative = 0;
    let selectedVariant: string | null = null;

    for (const [variantId, percentage] of Object.entries(experiment.traffic_split)) {
        cumulative += percentage as number;
        if (random <= cumulative) {
            selectedVariant = variantId;
            break;
        }
    }

    if (!selectedVariant) {
        const variants = experiment.variants as { id: string; name: string }[];
        selectedVariant = variants[0]?.id;
    }

    // Create assignment
    await supabase.from('ab_assignments').insert({
        user_id: userId,
        experiment_id: experimentId,
        variant_id: selectedVariant,
    });

    return selectedVariant;
}

/**
 * Track conversion for experiment
 */
export async function trackConversion(
    userId: string,
    experimentId: string
): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
        .from('ab_assignments')
        .update({
            converted: true,
            converted_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('experiment_id', experimentId)
        .eq('converted', false);

    return !error;
}

/**
 * Get experiment results
 */
export async function getExperimentResults(
    experimentId: string
): Promise<ExperimentResults | null> {
    const supabase = createClient();

    // Get experiment
    const { data: experiment } = await supabase
        .from('ab_experiments')
        .select('*')
        .eq('id', experimentId)
        .single();

    if (!experiment) return null;

    // Get assignments
    const { data: assignments } = await supabase
        .from('ab_assignments')
        .select('variant_id, converted')
        .eq('experiment_id', experimentId);

    if (!assignments) return null;

    // Calculate results per variant
    const variantStats: Record<string, { participants: number; conversions: number }> = {};

    experiment.variants.forEach((v: { id: string }) => {
        variantStats[v.id] = { participants: 0, conversions: 0 };
    });

    assignments.forEach(a => {
        if (variantStats[a.variant_id]) {
            variantStats[a.variant_id].participants++;
            if (a.converted) variantStats[a.variant_id].conversions++;
        }
    });

    const variants: { id: string; name: string; participants: number; conversions: number; conversionRate: number }[] =
        (experiment.variants as { id: string; name: string }[]).map((v) => ({
            id: v.id,
            name: v.name,
            participants: variantStats[v.id].participants,
            conversions: variantStats[v.id].conversions,
            conversionRate: variantStats[v.id].participants > 0
                ? Math.round((variantStats[v.id].conversions / variantStats[v.id].participants) * 1000) / 10
                : 0,
        }));

    // Simple winner detection (highest conversion rate with min sample)
    const minSample = 30;
    const validVariants = variants.filter(v => v.participants >= minSample);
    let winner: string | undefined;

    if (validVariants.length > 1) {
        const sorted = [...validVariants].sort((a, b) => b.conversionRate - a.conversionRate);
        if (sorted[0].conversionRate > sorted[1].conversionRate * 1.1) {
            winner = sorted[0].id;
        }
    }

    return {
        experimentId,
        variants,
        winner,
    };
}

/**
 * Create new experiment
 */
export async function createExperiment(
    name: string,
    description: string,
    goalEvent: string,
    variants: { id: string; name: string }[] = [
        { id: 'control', name: 'Control' },
        { id: 'variant_b', name: 'Variant B' },
    ]
): Promise<string | null> {
    const supabase = createClient();

    const trafficSplit: Record<string, number> = {};
    const splitPercentage = Math.floor(100 / variants.length);
    variants.forEach((v, i) => {
        trafficSplit[v.id] = i === variants.length - 1
            ? 100 - splitPercentage * (variants.length - 1)
            : splitPercentage;
    });

    const { data, error } = await supabase
        .from('ab_experiments')
        .insert({
            name,
            description,
            goal_event: goalEvent,
            variants,
            traffic_split: trafficSplit,
            status: 'draft',
        })
        .select('id')
        .single();

    if (error) {
        console.error('Failed to create experiment:', error);
        return null;
    }

    return data?.id || null;
}

/**
 * Start experiment
 */
export async function startExperiment(experimentId: string): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
        .from('ab_experiments')
        .update({
            status: 'running',
            start_date: new Date().toISOString(),
        })
        .eq('id', experimentId);

    return !error;
}

/**
 * End experiment with winner
 */
export async function endExperiment(
    experimentId: string,
    winnerVariant: string
): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
        .from('ab_experiments')
        .update({
            status: 'completed',
            winner_variant: winnerVariant,
            end_date: new Date().toISOString(),
        })
        .eq('id', experimentId);

    return !error;
}
