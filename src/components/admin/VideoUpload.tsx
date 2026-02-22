"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import Icon from "@/components/ui/Icon";

interface VideoUploadProps {
    value: string | null;
    onChange: (url: string) => void;
    label?: string;
}

export default function VideoUpload({ value, onChange, label = "Video Source" }: VideoUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [inputMode, setInputMode] = useState<"upload" | "url">("upload");
    const [urlInput, setUrlInput] = useState(value || "");
    const supabase = createClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('video/')) {
            setError("Please upload a valid video file.");
            return;
        }

        if (file.size > 500 * 1024 * 1024) {
            setError("File size exceeds 500MB limit.");
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);
        setError(null);

        try {
            const fileExt = file.name.split(".").pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { data, error: uploadError } = await supabase.storage
                .from("videos")
                .upload(filePath, file, {
                    cacheControl: "3600",
                    upsert: false,
                });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from("videos")
                .getPublicUrl(filePath);

            onChange(publicUrl);
            setUploadProgress(100);
        } catch (err: unknown) {
            console.error("Upload error:", err);
            setError(err instanceof Error ? err.message : "Failed to upload video");
        } finally {
            setIsUploading(false);
        }
    };

    const handleUrlSubmit = () => {
        if (urlInput.trim()) {
            onChange(urlInput.trim());
            setError(null);
        } else {
            setError("Please enter a valid URL");
        }
    };

    const handleRemove = () => {
        onChange("");
        setUrlInput("");
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{label}</label>

            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 bg-gray-50">
                {!value ? (
                    <div>
                        <div className="flex gap-2 mb-4">
                            <button
                                type="button"
                                onClick={() => setInputMode("upload")}
                                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                                    inputMode === "upload" 
                                        ? "bg-[#2EBD59] text-white" 
                                        : "bg-white text-gray-600 border border-gray-200"
                                }`}
                            >
                                <Icon name="upload" size={16} className="inline mr-2" />
                                Upload
                            </button>
                            <button
                                type="button"
                                onClick={() => setInputMode("url")}
                                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                                    inputMode === "url" 
                                        ? "bg-[#2EBD59] text-white" 
                                        : "bg-white text-gray-600 border border-gray-200"
                                }`}
                            >
                                <Icon name="link" size={16} className="inline mr-2" />
                                URL
                            </button>
                        </div>

                        {inputMode === "upload" ? (
                            <div className="text-center">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="video/*"
                                    onChange={handleUpload}
                                    disabled={isUploading}
                                    className="hidden"
                                />
                                <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                        {isUploading ? (
                                            <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        ) : (
                                            <Icon name="upload" size={24} />
                                        )}
                                    </div>
                                    <span className="text-sm font-medium text-gray-600">
                                        {isUploading ? "Uploading..." : "Click to upload video"}
                                    </span>
                                    <span className="text-xs text-gray-400">MP4, WebM up to 500MB</span>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <input
                                    type="url"
                                    value={urlInput}
                                    onChange={(e) => setUrlInput(e.target.value)}
                                    placeholder="Enter video URL (YouTube, direct MP4 link)"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2EBD59] focus:border-transparent"
                                />
                                <button
                                    type="button"
                                    onClick={handleUrlSubmit}
                                    className="w-full py-2 bg-[#2EBD59] text-white rounded-lg text-sm font-medium hover:bg-[#26a34d] transition-colors"
                                >
                                    Add Video URL
                                </button>
                                <p className="text-xs text-gray-400">
                                    Supports YouTube URLs and direct video links (.mp4, .webm)
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="relative rounded-lg overflow-hidden bg-black aspect-video group">
                        <video src={value} controls className="w-full h-full" />
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove Video"
                        >
                            <Icon name="close" size={16} />
                        </button>
                    </div>
                )}

                {error && <p className="text-xs text-red-500 mt-2 text-center">{error}</p>}

                {isUploading && (
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-4 overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full animate-pulse" style={{ width: '100%' }}></div>
                    </div>
                )}
            </div>
        </div>
    );
}
