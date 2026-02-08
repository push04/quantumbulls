"use client";

import React, { useRef, useState, useEffect } from "react";

interface SmartVideoPlayerProps {
    url: string;
    thumbnail?: string | null;
    onEnded?: () => void;
}

// Helper to extract YouTube video ID from various URL formats
function getYouTubeVideoId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    return null;
}

// Helper to detect if URL is a YouTube link
function isYouTubeUrl(url: string): boolean {
    return getYouTubeVideoId(url) !== null;
}

export default function SmartVideoPlayer({ url, thumbnail, onEnded }: SmartVideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.8);
    const [showControls, setShowControls] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const isYouTube = isYouTubeUrl(url);
    const youtubeVideoId = isYouTube ? getYouTubeVideoId(url) : null;

    useEffect(() => {
        setMounted(true);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) setShowControls(false);
        }, 3000);
    };

    useEffect(() => {
        return () => {
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        };
    }, []);

    // ========== Native Video Player Handlers (for direct files) ==========
    const handleNativePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
        }
    };

    const handleNativeSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = parseFloat(e.target.value);
        if (videoRef.current) {
            videoRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const handleNativeVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
        }
    };

    useEffect(() => {
        if (isYouTube) return;

        const video = videoRef.current;
        if (!video) return;

        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onTimeUpdate = () => setCurrentTime(video.currentTime);
        const onDurationChange = () => setDuration(video.duration);
        const onError = () => setError("Failed to load video. Please check the URL.");
        const onEnded_internal = () => {
            setIsPlaying(false);
            if (onEnded) onEnded();
        };

        video.addEventListener("play", onPlay);
        video.addEventListener("pause", onPause);
        video.addEventListener("timeupdate", onTimeUpdate);
        video.addEventListener("durationchange", onDurationChange);
        video.addEventListener("error", onError);
        video.addEventListener("ended", onEnded_internal);

        return () => {
            video.removeEventListener("play", onPlay);
            video.removeEventListener("pause", onPause);
            video.removeEventListener("timeupdate", onTimeUpdate);
            video.removeEventListener("durationchange", onDurationChange);
            video.removeEventListener("error", onError);
            video.removeEventListener("ended", onEnded_internal);
        };
    }, [onEnded, isYouTube]);

    const toggleFullscreen = () => {
        if (containerRef.current) {
            if (!document.fullscreenElement) {
                containerRef.current.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        }
    };

    // Loading state
    if (!mounted) {
        return (
            <div className="relative w-full aspect-video bg-black rounded-xl animate-pulse flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-[#2EBD59] animate-spin"></div>
            </div>
        );
    }

    // Error state (only for non-YouTube)
    if (error && !isYouTube) {
        return (
            <div className="relative w-full aspect-video bg-black rounded-xl flex flex-col items-center justify-center p-6 text-center border border-red-500/20">
                <svg className="w-12 h-12 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="text-white font-bold text-lg mb-2">Video Unavailable</h3>
                <p className="text-gray-400 text-sm mb-4">{error}</p>
                <button
                    onClick={() => window.open(url, '_blank')}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
                >
                    Open Video Link
                </button>
            </div>
        );
    }

    // ========== YouTube Embed (simple iframe) ==========
    if (isYouTube && youtubeVideoId) {
        return (
            <div
                ref={containerRef}
                className="relative w-full aspect-video bg-black group overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10"
            >
                <iframe
                    src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=0&rel=0&modestbranding=1&playsinline=1`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                />
            </div>
        );
    }

    // ========== Native HTML5 Video Player (for direct files) ==========
    return (
        <div
            ref={containerRef}
            className="relative w-full aspect-video bg-black group overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
        >
            <video
                ref={videoRef}
                src={url}
                className="w-full h-full object-contain"
                playsInline
                onClick={handleNativePlayPause}
            />

            {/* Overlay Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 pointer-events-none ${showControls ? 'opacity-100' : 'opacity-0'}`} />

            {/* Center Play Button (when paused) */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <button
                        onClick={handleNativePlayPause}
                        className="w-20 h-20 bg-[#2EBD59]/90 hover:bg-[#2EBD59] text-white rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(46,189,89,0.4)] transition-all transform hover:scale-110"
                    >
                        <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </button>
                </div>
            )}

            {/* Custom Controls Bar */}
            <div className={`absolute bottom-0 left-0 right-0 p-4 transition-all duration-300 ${showControls ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                {/* Progress Bar */}
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-medium text-white min-w-[40px]">{formatTime(currentTime)}</span>
                    <div className="relative flex-1 h-1.5 cursor-pointer">
                        <input
                            type="range"
                            min={0}
                            max={duration || 100}
                            step="any"
                            value={currentTime}
                            onChange={handleNativeSeek}
                            className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                        />
                        <div className="absolute inset-0 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="bg-[#2EBD59] h-full transition-all"
                                style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                            />
                        </div>
                    </div>
                    <span className="text-xs font-medium text-white min-w-[40px]">{formatTime(duration)}</span>
                </div>

                {/* Controls Row */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={handleNativePlayPause} className="text-white hover:text-[#2EBD59] transition-colors">
                            {isPlaying ? (
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                            ) : (
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                            )}
                        </button>

                        {/* Volume */}
                        <div className="flex items-center gap-2 group/vol">
                            <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                            <input
                                type="range"
                                min={0}
                                max={1}
                                step="any"
                                value={volume}
                                onChange={handleNativeVolumeChange}
                                className="w-0 group-hover/vol:w-20 transition-all duration-300 h-1 accent-[#2EBD59] bg-white/20 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={toggleFullscreen} className="text-white/70 hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 4l-5-5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
