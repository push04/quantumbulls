"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getMessages, sendMessage } from "@/lib/community";

interface Message {
    id: string;
    sender_id: string;
    recipient_id: string;
    content: string;
    read_at?: string;
    created_at: string;
    sender?: { full_name?: string; avatar_url?: string };
    recipient?: { full_name?: string; avatar_url?: string };
}

interface MessageInboxProps {
    userId: string;
}

/**
 * Message Inbox Component
 * Private messaging inbox with conversations
 */
export function MessageInbox({ userId }: MessageInboxProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const data = await getMessages(1, 100);
                setMessages(data as Message[]);
            } catch (error) {
                console.error("Failed to load messages:", error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    // Group messages by conversation partner
    const conversations = messages.reduce((acc, msg) => {
        const partnerId = msg.sender_id === userId ? msg.recipient_id : msg.sender_id;
        const partnerName = msg.sender_id === userId
            ? msg.recipient?.full_name
            : msg.sender?.full_name;

        if (!acc[partnerId]) {
            acc[partnerId] = {
                partnerId,
                partnerName: partnerName || "Unknown",
                messages: [],
                lastMessage: msg,
            };
        }
        acc[partnerId].messages.push(msg);
        return acc;
    }, {} as Record<string, { partnerId: string; partnerName: string; messages: Message[]; lastMessage: Message }>);

    const handleSend = async () => {
        if (!selectedUser || !newMessage.trim() || sending) return;

        setSending(true);
        try {
            await sendMessage(selectedUser, newMessage);
            setNewMessage("");
            // Reload messages
            const data = await getMessages(1, 100);
            setMessages(data as Message[]);
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-16 bg-gray-100 rounded-xl" />
                <div className="h-16 bg-gray-100 rounded-xl" />
                <div className="h-16 bg-gray-100 rounded-xl" />
            </div>
        );
    }

    const conversationList = Object.values(conversations);
    const selectedConversation = selectedUser ? conversations[selectedUser] : null;

    return (
        <div className="flex h-[600px] bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Conversation List */}
            <div className="w-80 border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="font-semibold text-gray-900">Messages</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversationList.length === 0 ? (
                        <p className="p-4 text-center text-gray-500 text-sm">No conversations yet</p>
                    ) : (
                        conversationList.map((conv) => (
                            <button
                                key={conv.partnerId}
                                onClick={() => setSelectedUser(conv.partnerId)}
                                className={`w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 ${selectedUser === conv.partnerId ? "bg-gray-50" : ""
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#2EBD59] flex items-center justify-center text-white font-medium">
                                        {conv.partnerName.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">{conv.partnerName}</p>
                                        <p className="text-sm text-gray-500 truncate">{conv.lastMessage.content}</p>
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Message Thread */}
            <div className="flex-1 flex flex-col">
                {selectedConversation ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#2EBD59] flex items-center justify-center text-white font-medium">
                                {selectedConversation.partnerName.charAt(0)}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">{selectedConversation.partnerName}</p>
                                <Link href={`/profile/${selectedConversation.partnerId}`} className="text-xs text-[#2EBD59] hover:underline">
                                    View Profile
                                </Link>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {selectedConversation.messages.map((msg) => {
                                const isMine = msg.sender_id === userId;
                                return (
                                    <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                                        <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMine
                                                ? "bg-[#2EBD59] text-white"
                                                : "bg-gray-100 text-gray-900"
                                            }`}>
                                            <p>{msg.content}</p>
                                            <p className={`text-xs mt-1 ${isMine ? "text-white/70" : "text-gray-500"}`}>
                                                {new Date(msg.created_at).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-gray-200">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:ring-2 focus:ring-[#2EBD59] focus:border-transparent"
                                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!newMessage.trim() || sending}
                                    className="px-4 py-2 bg-[#2EBD59] text-white rounded-full disabled:opacity-50"
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        Select a conversation to start messaging
                    </div>
                )}
            </div>
        </div>
    );
}
