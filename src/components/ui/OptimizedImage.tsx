"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface OptimizedImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    fill?: boolean;
    priority?: boolean;
    className?: string;
    sizes?: string;
    quality?: number;
    placeholder?: "blur" | "empty";
    blurDataURL?: string;
    onLoad?: () => void;
}

// Default blur placeholder (tiny gray image)
const DEFAULT_BLUR = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88P/BfwYABQMB/fQR8CAAAAAASUVORK5CYII=";

/**
 * Optimized Image Component
 * - Lazy loading with intersection observer
 * - WebP with fallback
 * - Blur placeholder
 * - Responsive srcset
 */
export default function OptimizedImage({
    src,
    alt,
    width,
    height,
    fill = false,
    priority = false,
    className = "",
    sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
    quality = 80,
    placeholder = "blur",
    blurDataURL = DEFAULT_BLUR,
    onLoad,
}: OptimizedImageProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(priority);
    const imgRef = useRef<HTMLDivElement>(null);

    // Intersection observer for lazy loading
    useEffect(() => {
        if (priority || !imgRef.current) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsInView(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: "200px", // Start loading 200px before in view
                threshold: 0,
            }
        );

        observer.observe(imgRef.current);
        return () => observer.disconnect();
    }, [priority]);

    const handleLoad = () => {
        setIsLoaded(true);
        onLoad?.();
    };

    // Check if external URL
    const isExternal = src.startsWith("http") || src.startsWith("//");

    // For external images, use unoptimized
    const imageProps = isExternal ? { unoptimized: true } : {};

    return (
        <div
            ref={imgRef}
            className={`relative overflow-hidden ${className}`}
            style={!fill ? { width, height } : undefined}
        >
            {/* Blur placeholder while loading */}
            {!isLoaded && placeholder === "blur" && (
                <div
                    className="absolute inset-0 bg-gray-200 animate-pulse"
                    style={{
                        backgroundImage: `url(${blurDataURL})`,
                        backgroundSize: "cover",
                        filter: "blur(20px)",
                        transform: "scale(1.1)",
                    }}
                />
            )}

            {/* Actual image */}
            {isInView && (
                <Image
                    src={src}
                    alt={alt}
                    width={fill ? undefined : width}
                    height={fill ? undefined : height}
                    fill={fill}
                    sizes={sizes}
                    quality={quality}
                    priority={priority}
                    onLoad={handleLoad}
                    className={`transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"
                        } ${fill ? "object-cover" : ""}`}
                    {...imageProps}
                />
            )}
        </div>
    );
}

/**
 * Video Thumbnail with duration overlay
 */
export function VideoThumbnail({
    src,
    alt,
    duration,
    className = "",
    ...props
}: OptimizedImageProps & { duration?: number }) {
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div className={`relative ${className}`}>
            <OptimizedImage
                src={src}
                alt={alt}
                fill
                className="rounded-lg"
                {...props}
            />

            {/* Duration overlay */}
            {duration && (
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium px-1.5 py-0.5 rounded">
                    {formatDuration(duration)}
                </div>
            )}

            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </div>
            </div>
        </div>
    );
}
