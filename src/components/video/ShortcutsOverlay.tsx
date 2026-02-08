"use client";

import { getShortcutList } from "@/hooks/useVideoKeyboard";

interface ShortcutsOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Keyboard Shortcuts Overlay
 * Shows available keyboard shortcuts for video player
 */
export default function ShortcutsOverlay({ isOpen, onClose }: ShortcutsOverlayProps) {
    if (!isOpen) return null;

    const shortcuts = getShortcutList();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6 text-white animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Keyboard Shortcuts</h3>
                    <button
                        onClick={onClose}
                        className="p-1 text-white/50 hover:text-white transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Shortcuts list */}
                <div className="space-y-3">
                    {shortcuts.map((shortcut, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between py-2 border-b border-white/10 last:border-0"
                        >
                            <span className="text-white/80">{shortcut.description}</span>
                            <kbd className="px-3 py-1 bg-white/10 rounded-lg text-sm font-mono">
                                {shortcut.key}
                            </kbd>
                        </div>
                    ))}
                </div>

                {/* Close hint */}
                <p className="mt-6 text-center text-sm text-white/50">
                    Press <kbd className="px-2 py-0.5 bg-white/10 rounded text-xs">?</kbd> to toggle this panel
                </p>
            </div>
        </div>
    );
}
