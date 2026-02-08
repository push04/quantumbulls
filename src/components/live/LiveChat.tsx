"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { type LiveSession } from "@/lib/live";

interface ChatMessage {
    id: string;
    user_id: string;
    message: string;
    created_at: string;
    is_question: boolean;
    is_answered: boolean;
    is_pinned: boolean;
    profiles?: { full_name?: string; avatar_url?: string };
}

interface LiveChatProps {
    session: LiveSession;
    userId: string;
    userTier: string;
    isAdmin?: boolean;
}

/**
 * Live Chat Component
 * Real-time chat with Supabase Realtime
 */
export default function LiveChat({ session, userId, userTier, isAdmin }: LiveChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isQuestion, setIsQuestion] = useState(false);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    // Check if user can chat (not Basic tier)
    const canChat = userTier !== "basic" || isAdmin;

    // Load initial messages and subscribe to realtime
    useEffect(() => {
        async function loadMessages() {
            const { data } = await supabase
                .from("session_chat")
                .select("*, profiles(full_name, avatar_url)")
                .eq("session_id", session.id)
                .eq("is_deleted", false)
                .order("created_at", { ascending: true })
                .limit(100);

            setMessages(data || []);
            setLoading(false);
        }

        loadMessages();

        // Subscribe to new messages
        const channel = supabase
            .channel(`chat-${session.id}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "session_chat",
                    filter: `session_id=eq.${session.id}`,
                },
                async (payload) => {
                    // Fetch user profile for new message
                    const { data: profile } = await supabase
                        .from("profiles")
                        .select("full_name, avatar_url")
                        .eq("id", payload.new.user_id)
                        .single();

                    const newMsg = {
                        ...payload.new,
                        profiles: profile,
                    } as ChatMessage;

                    setMessages((prev) => [...prev, newMsg]);
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "session_chat",
                    filter: `session_id=eq.${session.id}`,
                },
                (payload) => {
                    setMessages((prev) =>
                        prev.map((m) =>
                            m.id === payload.new.id ? { ...m, ...payload.new } : m
                        )
                    );
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [session.id, supabase]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !canChat) return;

        const { error } = await supabase.from("session_chat").insert({
            session_id: session.id,
            user_id: userId,
            message: newMessage.trim(),
            is_question: isQuestion,
        });

        if (!error) {
            setNewMessage("");
            setIsQuestion(false);
        }
    };

    const markAsAnswered = async (messageId: string) => {
        if (!isAdmin) return;
        await supabase
            .from("session_chat")
            .update({ is_answered: true })
            .eq("id", messageId);
    };

    const pinMessage = async (messageId: string) => {
        if (!isAdmin) return;
        await supabase
            .from("session_chat")
            .update({ is_pinned: true })
            .eq("id", messageId);
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 rounded-xl border border-gray-200">
            {/* Header */}
            <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 bg-white rounded-t-xl">
                <h3 className="font-semibold text-gray-900">Live Chat</h3>
                <p className="text-xs text-gray-500">{messages.length} messages</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loading ? (
                    <div className="text-center text-gray-500 py-8">Loading chat...</div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        No messages yet. Be the first to say hello!
                    </div>
                ) : (
                    messages.map((msg) => (
                        <ChatMessageItem
                            key={msg.id}
                            message={msg}
                            isOwn={msg.user_id === userId}
                            isAdmin={isAdmin}
                            onMarkAnswered={() => markAsAnswered(msg.id)}
                            onPin={() => pinMessage(msg.id)}
                        />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {canChat ? (
                <form onSubmit={sendMessage} className="flex-shrink-0 p-3 border-t border-gray-200 bg-white rounded-b-xl">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2EBD59]/50"
                            maxLength={500}
                        />
                        <button
                            type="button"
                            onClick={() => setIsQuestion(!isQuestion)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isQuestion
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                            title="Mark as question"
                        >
                            ?
                        </button>
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="px-4 py-2 bg-[#2EBD59] text-white rounded-lg text-sm font-medium hover:bg-[#26a34d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Send
                        </button>
                    </div>
                    {isQuestion && (
                        <p className="text-xs text-amber-600 mt-1">
                            This will be marked as a question for the host to answer
                        </p>
                    )}
                </form>
            ) : (
                <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-100 rounded-b-xl text-center">
                    <p className="text-sm text-gray-500">
                        Upgrade to Medium or higher to participate in chat
                    </p>
                </div>
            )}
        </div>
    );
}

function ChatMessageItem({
    message,
    isOwn,
    isAdmin,
    onMarkAnswered,
    onPin,
}: {
    message: ChatMessage;
    isOwn: boolean;
    isAdmin?: boolean;
    onMarkAnswered: () => void;
    onPin: () => void;
}) {
    const name = message.profiles?.full_name || "Anonymous";
    const time = new Date(message.created_at).toLocaleTimeString("en", {
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <div
            className={`${message.is_pinned ? "bg-amber-50 border border-amber-200" : ""
                } ${message.is_question && !message.is_answered ? "bg-blue-50 border border-blue-200" : ""} 
            ${message.is_answered ? "bg-green-50 border border-green-200" : ""} 
            rounded-lg p-2`}
        >
            <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                    {name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${isOwn ? "text-[#2EBD59]" : "text-gray-900"}`}>
                            {name}
                        </span>
                        <span className="text-xs text-gray-400">{time}</span>
                        {message.is_question && (
                            <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                                Q
                            </span>
                        )}
                        {message.is_answered && (
                            <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded">
                                ✓
                            </span>
                        )}
                        {message.is_pinned && (
                            <span className="text-xs">📌</span>
                        )}
                    </div>
                    <p className="text-sm text-gray-700 break-words">{message.message}</p>
                </div>
                {isAdmin && (
                    <div className="flex gap-1">
                        {message.is_question && !message.is_answered && (
                            <button
                                onClick={onMarkAnswered}
                                className="text-xs text-green-600 hover:underline"
                            >
                                ✓ Answered
                            </button>
                        )}
                        {!message.is_pinned && (
                            <button
                                onClick={onPin}
                                className="text-xs text-amber-600 hover:underline"
                            >
                                📌 Pin
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
