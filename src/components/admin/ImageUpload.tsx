"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface ImageUploadProps {
    value: string | null;
    onChange: (url: string) => void;
    label?: string;
}

export default function ImageUpload({ value, onChange, label = "Image" }: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setError(null);

        try {
            const fileExt = file.name.split(".").pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from("images")
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from("images").getPublicUrl(filePath);
            onChange(data.publicUrl);
        } catch (err: any) {
            console.error("Upload error:", err);
            setError(err.message || "Failed to upload image");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{label}</label>

            <div className="flex items-start gap-4">
                <div className="flex-1">
                    {/* URL Input Fallback */}
                    <input
                        type="text"
                        value={value || ""}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="https://... or upload file"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2EBD59]/20 focus:border-[#2EBD59] text-sm"
                    />

                    {/* File Input */}
                    <div className="mt-2">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleUpload}
                            disabled={isUploading}
                            className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-xs file:font-semibold
                                file:bg-[#2EBD59]/10 file:text-[#2EBD59]
                                hover:file:bg-[#2EBD59]/20
                                cursor-pointer
                            "
                        />
                    </div>

                    {isUploading && <p className="text-xs text-[#2EBD59] mt-1">Uploading...</p>}
                    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                </div>

                {/* Preview */}
                {value && (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 shrink-0">
                        <img
                            src={value}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
