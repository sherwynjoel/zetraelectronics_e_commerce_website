"use client";

import { API_URL } from '@/lib/api';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { useAuthStore } from "@/lib/auth-store";

interface ImageUploadProps {
    value: string;
    onChange: (url: string) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const { token } = useAuthStore();

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setIsUploading(true);
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(`${API_URL}/products/upload`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData,
            });

            if (!res.ok) {
                throw new Error("Upload failed");
            }

            const data = await res.json();
            onChange(data.url);
        } catch (error) {
            console.error(error);
            alert("Failed to upload image");
        } finally {
            setIsUploading(false);
        }
    };

    if (value) {
        return (
            <div className="relative w-40 h-40 border rounded-lg overflow-hidden group">
                <Image src={value} alt="Product Image" fill className="object-cover" unoptimized />
                <button
                    type="button"
                    onClick={() => onChange("")}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        );
    }

    return (
        <div className="w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {isUploading ? (
                        <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                    ) : (
                        <>
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">Click to upload image</p>
                            <p className="text-xs text-muted-foreground">(JPG, PNG)</p>
                        </>
                    )}
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={isUploading} />
            </label>
        </div>
    );
}
