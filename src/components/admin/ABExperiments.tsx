"use client";

import { useEffect, useState } from "react";
import {
    getRunningExperiments,
    getExperimentResults,
    startExperiment,
    endExperiment,
    createExperiment,
    type Experiment,
    type ExperimentResults,
} from "@/lib/analytics/abTesting";

/**
 * A/B Experiments Dashboard
 */
export default function ABExperiments() {
    const [experiments, setExperiments] = useState<(Experiment & { results?: ExperimentResults })[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newExperiment, setNewExperiment] = useState({ name: '', description: '', goalEvent: 'signup' });

    async function loadExperiments() {
        const running = await getRunningExperiments();

        const withResults = await Promise.all(
            running.map(async (exp) => ({
                ...exp,
                results: await getExperimentResults(exp.id) || undefined,
            }))
        );

        setExperiments(withResults);
        setLoading(false);
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadExperiments();
    }, []);

    async function handleCreate() {
        if (!newExperiment.name) return;

        const id = await createExperiment(
            newExperiment.name,
            newExperiment.description,
            newExperiment.goalEvent
        );

        if (id) {
            await loadExperiments();
            setShowCreate(false);
            setNewExperiment({ name: '', description: '', goalEvent: 'signup' });
        }
    }

    async function handleStart(experimentId: string) {
        await startExperiment(experimentId);
        await loadExperiments();
    }

    async function handleEnd(experimentId: string, winner: string) {
        if (confirm(`Declare "${winner}" as the winner and end this experiment?`)) {
            await endExperiment(experimentId, winner);
            await loadExperiments();
        }
    }

    if (loading) {
        return (
            <div className="p-8 text-center text-gray-400">
                Loading experiments...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">A/B Experiments</h2>
                    <p className="text-sm text-gray-500">Test and optimize conversions</p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="px-4 py-2 bg-[#2EBD59] text-white font-medium rounded-lg hover:bg-[#26a34d]"
                >
                    + New Experiment
                </button>
            </div>

            {/* Create Form */}
            {showCreate && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Create Experiment</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                value={newExperiment.name}
                                onChange={(e) => setNewExperiment(p => ({ ...p, name: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2EBD59]/20"
                                placeholder="e.g., Pricing Page V2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <input
                                type="text"
                                value={newExperiment.description}
                                onChange={(e) => setNewExperiment(p => ({ ...p, description: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2EBD59]/20"
                                placeholder="Testing new pricing layout"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Goal Event</label>
                            <select
                                value={newExperiment.goalEvent}
                                onChange={(e) => setNewExperiment(p => ({ ...p, goalEvent: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2EBD59]/20"
                            >
                                <option value="signup">Signup</option>
                                <option value="upgrade">Upgrade to Paid</option>
                                <option value="video_complete">Video Completion</option>
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleCreate}
                                className="px-4 py-2 bg-[#2EBD59] text-white font-medium rounded-lg hover:bg-[#26a34d]"
                            >
                                Create
                            </button>
                            <button
                                onClick={() => setShowCreate(false)}
                                className="px-4 py-2 border border-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Experiments List */}
            {experiments.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                    <div className="text-4xl mb-2">🧪</div>
                    <h3 className="font-medium text-gray-900 mb-1">No experiments yet</h3>
                    <p className="text-sm text-gray-500">Create your first A/B test</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {experiments.map((exp) => (
                        <div
                            key={exp.id}
                            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                        >
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-gray-900">{exp.name}</h3>
                                    <p className="text-sm text-gray-500">{exp.description}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${exp.status === 'running'
                                        ? 'bg-green-100 text-green-700'
                                        : exp.status === 'completed'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-gray-100 text-gray-700'
                                    }`}>
                                    {exp.status.toUpperCase()}
                                </span>
                            </div>

                            {/* Results */}
                            {exp.results && (
                                <div className="p-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        {exp.results.variants.map((v) => (
                                            <div
                                                key={v.id}
                                                className={`p-4 rounded-lg border ${exp.results?.winner === v.id
                                                        ? 'border-[#2EBD59] bg-[#2EBD59]/5'
                                                        : 'border-gray-200'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-medium text-gray-900">{v.name}</span>
                                                    {exp.results?.winner === v.id && (
                                                        <span className="text-xs text-[#2EBD59]">👑 Leading</span>
                                                    )}
                                                </div>
                                                <div className="text-3xl font-bold text-gray-900 mb-1">
                                                    {v.conversionRate}%
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {v.conversions} / {v.participants} users
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {exp.status === 'running' && exp.results.winner && (
                                        <div className="mt-4 flex justify-end">
                                            <button
                                                onClick={() => handleEnd(exp.id, exp.results!.winner!)}
                                                className="px-4 py-2 bg-[#2EBD59] text-white font-medium rounded-lg hover:bg-[#26a34d] text-sm"
                                            >
                                                End Experiment & Use Winner
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {exp.status === 'draft' && (
                                <div className="p-4 bg-gray-50">
                                    <button
                                        onClick={() => handleStart(exp.id)}
                                        className="px-4 py-2 bg-[#2EBD59] text-white font-medium rounded-lg hover:bg-[#26a34d] text-sm"
                                    >
                                        Start Experiment
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
