"use client";

import { useState, useRef, useEffect } from "react";
import { formatDuration } from "@/lib/learning/progressCalculator";

interface Note {
    id: string;
    timestampSeconds: number;
    content: string;
    createdAt: string;
}

interface NotesPanelProps {
    lessonId: string;
    notes: Note[];
    currentTime: number;
    onSeek: (time: number) => void;
    onAddNote: (timestamp: number, content: string) => Promise<void>;
    onDeleteNote: (noteId: string) => Promise<void>;
}

/**
 * Notes Panel with timestamped notes
 */
export default function NotesPanel({
    lessonId,
    notes,
    currentTime,
    onSeek,
    onAddNote,
    onDeleteNote,
}: NotesPanelProps) {
    const [newNote, setNewNote] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const handleAddNote = async () => {
        if (!newNote.trim()) return;

        setIsAdding(true);
        try {
            await onAddNote(Math.floor(currentTime), newNote.trim());
            setNewNote('');
        } finally {
            setIsAdding(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAddNote();
        }
    };

    // Sort notes by timestamp
    const sortedNotes = [...notes].sort((a, b) => a.timestampSeconds - b.timestampSeconds);

    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span className="font-medium text-gray-900">Notes</span>
                    {notes.length > 0 && (
                        <span className="text-xs text-gray-400">({notes.length})</span>
                    )}
                </div>
                <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isExpanded && (
                <div className="border-t border-gray-100">
                    {/* Add note input */}
                    <div className="p-4 border-b border-gray-100">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 px-2 py-1 bg-[#2EBD59]/10 text-[#2EBD59] text-xs font-mono rounded">
                                {formatDuration(Math.floor(currentTime))}
                            </div>
                            <div className="flex-1">
                                <textarea
                                    ref={inputRef}
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Add a note at this timestamp..."
                                    rows={2}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#2EBD59]/20 focus:border-[#2EBD59]"
                                />
                                <div className="flex justify-end mt-2">
                                    <button
                                        onClick={handleAddNote}
                                        disabled={!newNote.trim() || isAdding}
                                        className="px-3 py-1.5 bg-[#2EBD59] hover:bg-[#26a34d] disabled:bg-gray-200 text-white disabled:text-gray-400 text-sm font-medium rounded-lg transition-colors"
                                    >
                                        {isAdding ? 'Adding...' : 'Add Note'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notes list */}
                    <div className="max-h-80 overflow-y-auto">
                        {sortedNotes.length === 0 ? (
                            <div className="p-6 text-center text-gray-500 text-sm">
                                No notes yet. Add your first note above!
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {sortedNotes.map((note) => (
                                    <div key={note.id} className="p-4 hover:bg-gray-50 group">
                                        <div className="flex items-start gap-3">
                                            {/* Timestamp */}
                                            <button
                                                onClick={() => onSeek(note.timestampSeconds)}
                                                className="flex-shrink-0 px-2 py-1 bg-gray-100 hover:bg-[#2EBD59]/10 text-gray-600 hover:text-[#2EBD59] text-xs font-mono rounded transition-colors"
                                            >
                                                {formatDuration(note.timestampSeconds)}
                                            </button>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                                    {note.content}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {new Date(note.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>

                                            {/* Delete button */}
                                            <button
                                                onClick={() => onDeleteNote(note.id)}
                                                className="flex-shrink-0 p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Export button */}
                    {notes.length > 0 && (
                        <div className="p-4 border-t border-gray-100">
                            <button
                                onClick={() => window.open(`/api/notes/export?lessonId=${lessonId}`, '_blank')}
                                className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Export Notes as PDF
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
