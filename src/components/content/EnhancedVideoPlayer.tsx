"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";

interface EnhancedVideoPlayerProps {
    url: string;
    thumbnail?: string | null;
    onEnded?: () => void;
    onProgress?: (progress: { played: number; playedSeconds: number }) => void;
    onDuration?: (duration: number) => void;
    autoPlay?: boolean;
    muted?: boolean;
    startTime?: number;
}

type VideoSource = "supabase" | "youtube" | "direct" | "unknown";

function detectVideoSource(url: string): VideoSource {
    if (!url) return "unknown";
    
    const youtubePatterns = [
        /youtube\.com\/watch/,
        /youtu\.be\//,
        /youtube\.com\/embed\//,
        /youtube\.com\/shorts\//
    ];
    
    if (youtubePatterns.some(p => p.test(url))) return "youtube";
    
    const supabasePatterns = [
        /supabase\.co\/storage\/v1\/object\/public\//,
        /storage\.googleapis\.com\//
    ];
    
    if (supabasePatterns.some(p => p.test(url))) return "supabase";
    
    if (url.match(/\.(mp4|webm|ogg|m3u8)(?:\?.*)?$/i)) return "direct";
    
    if (url.startsWith("http")) return "direct";
    
    return "unknown";
}

function getYouTubeId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) return match[1];
    }
    return null;
}

export default function EnhancedVideoPlayer({
    url,
    thumbnail,
    onEnded,
    onProgress,
    onDuration,
    autoPlay = false,
    muted = false,
    startTime = 0
}: EnhancedVideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    
    const [mounted, setMounted] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(startTime);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(muted ? 0 : 0.8);
    const [isMuted, setIsMuted] = useState(muted);
    const [showControls, setShowControls] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);
    const [buffered, setBuffered] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const validUrl = url && typeof url === 'string' && url.length > 0 ? url : '';
    const source = detectVideoSource(validUrl);
    const youtubeId = source === "youtube" ? getYouTubeId(validUrl) : null;

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (startTime > 0 && videoRef.current && duration > 0) {
            videoRef.current.currentTime = startTime;
        }
    }, [startTime, duration]);

    const formatTime = (seconds: number) => {
        if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
        }
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handleMouseMove = useCallback(() => {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        if (isPlaying) {
            controlsTimeoutRef.current = setTimeout(() => {
                setShowControls(false);
            }, 3000);
        }
    }, [isPlaying]);

    useEffect(() => {
        return () => {
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        };
    }, []);

    const handlePlayPause = useCallback(() => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play().catch(console.error);
            }
        }
    }, [isPlaying]);

    const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!progressRef.current || !videoRef.current || !duration) return;
        
        const rect = progressRef.current.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const newTime = Math.max(0, Math.min(duration, percent * duration));
        
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    }, [duration]);

    const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
            videoRef.current.muted = newVolume === 0;
        }
    }, []);

    const toggleMute = useCallback(() => {
        if (videoRef.current) {
            const newMuted = !isMuted;
            setIsMuted(newMuted);
            videoRef.current.muted = newMuted;
        }
    }, [isMuted]);

    const changePlaybackRate = useCallback((rate: number) => {
        setPlaybackRate(rate);
        if (videoRef.current) {
            videoRef.current.playbackRate = rate;
        }
        setShowSpeedMenu(false);
    }, []);

    const toggleFullscreen = useCallback(async () => {
        if (!containerRef.current) return;
        
        try {
            if (!document.fullscreenElement) {
                await containerRef.current.requestFullscreen();
                setIsFullscreen(true);
            } else {
                await document.exitFullscreen();
                setIsFullscreen(false);
            }
        } catch (err) {
            console.error("Fullscreen error:", err);
        }
    }, []);

    const skipTime = useCallback((seconds: number) => {
        if (videoRef.current) {
            const newTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
            videoRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    }, [duration]);

    useEffect(() => {
        if (source === "youtube" || !validUrl) return;

        const video = videoRef.current;
        if (!video) return;

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleTimeUpdate = () => {
            setCurrentTime(video.currentTime);
            if (onProgress) {
                onProgress({
                    played: video.currentTime / (duration || 1),
                    playedSeconds: video.currentTime
                });
            }
        };
        const handleDurationChange = () => {
            setDuration(video.duration);
            if (onDuration) onDuration(video.duration);
        };
        const handleLoadStart = () => setIsLoading(true);
        const handleCanPlay = () => setIsLoading(false);
        const handleError = () => {
            setError("Failed to load video. Please check the URL or try again.");
            setIsLoading(false);
        };
        const handleEnded = () => {
            setIsPlaying(false);
            if (onEnded) onEnded();
        };
        const handleProgress = () => {
            if (video.buffered.length > 0) {
                const bufferedEnd = video.buffered.end(video.buffered.length - 1);
                setBuffered((bufferedEnd / (duration || 1)) * 100);
            }
        };
        const handleWaiting = () => setIsLoading(true);
        const handlePlaying = () => setIsLoading(false);

        video.addEventListener("play", handlePlay);
        video.addEventListener("pause", handlePause);
        video.addEventListener("timeupdate", handleTimeUpdate);
        video.addEventListener("durationchange", handleDurationChange);
        video.addEventListener("loadstart", handleLoadStart);
        video.addEventListener("canplay", handleCanPlay);
        video.addEventListener("error", handleError);
        video.addEventListener("ended", handleEnded);
        video.addEventListener("progress", handleProgress);
        video.addEventListener("waiting", handleWaiting);
        video.addEventListener("playing", handlePlaying);

        if (video.src) {
            video.load();
        }

        return () => {
            video.removeEventListener("play", handlePlay);
            video.removeEventListener("pause", handlePause);
            video.removeEventListener("timeupdate", handleTimeUpdate);
            video.removeEventListener("durationchange", handleDurationChange);
            video.removeEventListener("loadstart", handleLoadStart);
            video.removeEventListener("canplay", handleCanPlay);
            video.removeEventListener("error", handleError);
            video.removeEventListener("ended", handleEnded);
            video.removeEventListener("progress", handleProgress);
            video.removeEventListener("waiting", handleWaiting);
            video.removeEventListener("playing", handlePlaying);
        };
    }, [validUrl, source, onEnded, onProgress, onDuration, duration]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            
            switch (e.key.toLowerCase()) {
                case " ":
                case "k":
                    e.preventDefault();
                    handlePlayPause();
                    break;
                case "arrowleft":
                case "j":
                    e.preventDefault();
                    skipTime(-10);
                    break;
                case "arrowright":
                case "l":
                    e.preventDefault();
                    skipTime(10);
                    break;
                case "arrowup":
                    e.preventDefault();
                    setVolume(v => {
                        const newVol = Math.min(1, v + 0.1);
                        if (videoRef.current) videoRef.current.volume = newVol;
                        return newVol;
                    });
                    break;
                case "arrowdown":
                    e.preventDefault();
                    setVolume(v => {
                        const newVol = Math.max(0, v - 0.1);
                        if (videoRef.current) videoRef.current.volume = newVol;
                        return newVol;
                    });
                    break;
                case "m":
                    e.preventDefault();
                    toggleMute();
                    break;
                case "f":
                    e.preventDefault();
                    toggleFullscreen();
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handlePlayPause, skipTime, toggleMute, toggleFullscreen]);

    if (!mounted) {
        return (
            <div className="relative w-full aspect-video bg-black rounded-xl animate-pulse flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-[#2EBD59] animate-spin"></div>
            </div>
        );
    }

    if (!validUrl) {
        return (
            <div className="relative w-full aspect-video bg-[#0B0F19] rounded-xl flex flex-col items-center justify-center">
                <svg className="w-16 h-16 text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500 font-medium">No video available</p>
            </div>
        );
    }

    if (source === "youtube" && youtubeId) {
        return (
            <div
                ref={containerRef}
                className="relative w-full aspect-video bg-black group overflow-hidden rounded-xl shadow-2xl"
            >
                <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&disablekb=1&showinfo=0&cc_load_policy=0`}
                    title="YouTube video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                />
            </div>
        );
    }

    if (error) {
        return (
            <div className="relative w-full aspect-video bg-black rounded-xl flex flex-col items-center justify-center p-6 text-center border border-red-500/20">
                <svg className="w-14 h-14 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="text-white font-bold text-lg mb-2">Video Unavailable</h3>
                <p className="text-gray-400 text-sm mb-4 max-w-md">{error}</p>
                <p className="text-gray-500 text-xs mb-4 font-mono break-all bg-gray-800 p-2 rounded">
                    URL: {validUrl}
                </p>
                <button
                    onClick={() => window.open(validUrl, '_blank')}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
                >
                    Open in New Tab
                </button>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="relative w-full aspect-video bg-black group overflow-hidden rounded-xl shadow-2xl"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
            onClick={handlePlayPause}
        >
            {/* Debug Info */}
            <div className="absolute top-2 left-2 z-40 bg-black/70 px-2 py-1 rounded text-xs text-gray-400 font-mono">
                {source}: {validUrl.substring(0, 50)}...
            </div>
            
            {thumbnail && !isPlaying && (
                <div 
                    className="absolute inset-0 bg-cover bg-center z-0"
                    style={{ backgroundImage: `url(${thumbnail})` }}
                />
            )}
            
            <video
                ref={videoRef}
                src={validUrl}
                className="w-full h-full object-contain"
                playsInline
                preload="metadata"
                muted={muted}
                crossOrigin="anonymous"
            />

            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                    <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-[#2EBD59] animate-spin"></div>
                </div>
            )}

            {!isPlaying && !isLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer">
                    <div className="w-20 h-20 bg-[#2EBD59]/90 hover:bg-[#2EBD59] rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(46,189,0.5)] transition-all transform hover:scale-110">
                        <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </div>
            )}

            <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-300 pointer-events-none ${showControls ? 'opacity-100' : 'opacity-0'}`} />

            <div className={`absolute bottom-0 left-0 right-0 p-4 transition-all duration-300 z-20 ${showControls ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                <div 
                    ref={progressRef}
                    className="relative h-1.5 bg-white/20 rounded-full mb-3 cursor-pointer group/progress"
                    onClick={handleSeek}
                    onMouseEnter={(e) => {
                        e.stopPropagation();
                        (e.currentTarget as HTMLDivElement).style.height = '6px';
                    }}
                    onMouseLeave={(e) => {
                        e.stopPropagation();
                        (e.currentTarget as HTMLDivElement).style.height = '6px';
                    }}
                >
                    <div 
                        className="absolute h-full bg-white/30 rounded-full overflow-hidden"
                        style={{ width: `${buffered}%` }}
                    />
                    <div 
                        className="absolute h-full bg-[#2EBD59] rounded-full"
                        style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                    />
                    <div 
                        className="absolute w-3 h-3 bg-[#2EBD59] rounded-full -top-1 transform -translate-x-1/2 opacity-0 group-hover/progress:opacity-100 transition-opacity"
                        style={{ left: `${(currentTime / (duration || 1)) * 100}%` }}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={(e) => { e.stopPropagation(); handlePlayPause(); }} className="text-white hover:text-[#2EBD59] transition-colors p-1">
                            {isPlaying ? (
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            )}
                        </button>

                        <button onClick={(e) => { e.stopPropagation(); skipTime(-10); }} className="text-white/80 hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
                            </svg>
                        </button>

                        <button onClick={(e) => { e.stopPropagation(); skipTime(10); }} className="text-white/80 hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
                            </svg>
                        </button>

                        <div className="flex items-center gap-2">
                            <button onClick={(e) => { e.stopPropagation(); toggleMute(); }} className="text-white/70 hover:text-white transition-colors">
                                {isMuted || volume === 0 ? (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                                    </svg>
                                ) : volume < 0.5 ? (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                                    </svg>
                                )}
                            </button>
                            <input
                                type="range"
                                min={0}
                                max={1}
                                step="any"
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                                onClick={(e) => e.stopPropagation()}
                                className="w-20 h-1 accent-[#2EBD59] bg-white/20 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        <span className="text-xs font-medium text-white/80 min-w-[90px]">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <button 
                                onClick={(e) => { e.stopPropagation(); setShowSpeedMenu(!showSpeedMenu); }}
                                className="text-white/70 hover:text-white transition-colors text-sm font-medium px-2"
                            >
                                {playbackRate}x
                            </button>
                            {showSpeedMenu && (
                                <div className="absolute bottom-full right-0 mb-2 bg-[#1a1a1a] rounded-lg shadow-xl border border-white/10 py-1 z-50">
                                    {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(rate => (
                                        <button
                                            key={rate}
                                            onClick={(e) => { e.stopPropagation(); changePlaybackRate(rate); }}
                                            className={`block w-full px-4 py-1.5 text-sm text-left hover:bg-white/10 ${playbackRate === rate ? 'text-[#2EBD59]' : 'text-white'}`}
                                        >
                                            {rate}x
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }} className="text-white/70 hover:text-white transition-colors">
                            {isFullscreen ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 4l-5-5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
