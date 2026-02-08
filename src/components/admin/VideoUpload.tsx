"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

interface VideoUploadProps {
    value: string | null;
    onChange: (url: string) => void;
    label?: string;
}

export default function VideoUpload({ value, onChange, label = "Video Source" }: VideoUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type (mp4, webm, ogg)
        if (!file.type.startsWith('video/')) {
            setError("Please upload a valid video file.");
            return;
        }

        // Validate file size (e.g., 500MB limit)
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
        } catch (err: any) {
            console.error("Upload error:", err);
            setError(err.message || "Failed to upload video");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{label}</label>

            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gray-50 hover:bg-white transition-colors">
                {!value ? (
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
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                )}
                            </div>
                            <span className="text-sm font-medium text-gray-600">
                                {isUploading ? "Uploading..." : "Click to upload video"}
                            </span>
                            <span className="text-xs text-gray-400">MP4, WebM up to 500MB</span>
                        </div>
                    </div>
                ) : (
                    <div className="relative rounded-lg overflow-hidden bg-black aspect-video group">
                        <video src={value} controls className="w-full h-full" />
                        <button
                            onClick={() => onChange("")}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove Video"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
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
