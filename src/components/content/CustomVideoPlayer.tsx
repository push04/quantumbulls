"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactPlayer from "react-player"; // Reverted to standard import to fix build error
import screenfull from "screenfull";

interface CustomVideoPlayerProps {
    url: string;
    thumbnail?: string | null;
    onEnded?: () => void;
    onDuration?: (duration: number) => void;
    onProgress?: (state: any) => void;
}

const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

export default function CustomVideoPlayer({ url, thumbnail, onEnded, onDuration, onProgress }: CustomVideoPlayerProps) {
    const playerRef = useRef<any>(null);
    const playerContainerRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const [playing, setPlaying] = useState(false);
    const [volume, setVolume] = useState(0.8);
    const [muted, setMuted] = useState(false);
    const [played, setPlayed] = useState(0);
    const [duration, setDuration] = useState(0);
    const [seeking, setSeeking] = useState(false);
    const [showControls, setShowControls] = useState(false);
    const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handlePlayPause = () => {
        setPlaying(!playing);
    };

    const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPlayed(parseFloat(e.target.value));
    };

    const handleSeekMouseDown = () => {
        setSeeking(true);
    };

    const handleSeekMouseUp = (e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
        setSeeking(false);
        if (playerRef.current) {
            playerRef.current.seekTo(parseFloat((e.target as HTMLInputElement).value));
        }
    };

    const handleProgress = (state: any) => {
        if (!seeking) {
            setPlayed(state.played);
        }
        if (onProgress) onProgress(state);
    };

    const handleDuration = (duration: number) => {
        setDuration(duration);
        if (onDuration) onDuration(duration);
    };

    const toggleFullscreen = () => {
        if (playerContainerRef.current && screenfull.isEnabled) {
            screenfull.toggle(playerContainerRef.current);
        }
    };

    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeout) clearTimeout(controlsTimeout);

        // Hide controls after 3 seconds of inactivity
        const timeout = setTimeout(() => {
            if (playing) setShowControls(false);
        }, 3000);
        setControlsTimeout(timeout);
    };

    const handleMouseLeave = () => {
        if (playing) setShowControls(false);
    };

    useEffect(() => {
        return () => {
            if (controlsTimeout) clearTimeout(controlsTimeout);
        };
    }, [controlsTimeout]);

    // Prevent hydration mismatch by only rendering player on client
    if (!mounted) {
        return (
            <div className="relative w-full aspect-video bg-black rounded-xl animate-pulse flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-[#2EBD59] animate-spin"></div>
            </div>
        );
    }

    // Cast to any to avoid strict type checks on this external library
    const ReactPlayerAny = ReactPlayer as any;

    if (error) {
        return (
            <div className="relative w-full aspect-video bg-black rounded-xl flex flex-col items-center justify-center p-6 text-center border border-red-500/20">
                <svg className="w-12 h-12 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <h3 className="text-white font-bold text-lg mb-2">Video Unavailable</h3>
                <p className="text-gray-400 text-sm mb-4">The video could not be loaded. Please check the URL or try again later.</p>
                <button
                    onClick={() => window.open(url, '_blank')}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
                >
                    Watch on YouTube
                </button>
            </div>
        );
    }

    return (
        <div
            ref={playerContainerRef}
            className="relative w-full aspect-video bg-black group overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* @ts-ignore */}
            <ReactPlayerAny
                key={url} // Force re-mount on URL change
                ref={playerRef}
                url={url}
                width="100%"
                height="100%"
                playing={playing}
                volume={volume}
                muted={muted}
                onEnded={() => {
                    setPlaying(false);
                    if (onEnded) onEnded();
                }}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onError={(e: any) => {
                    console.error("Video Player Error:", e);
                    setError("Failed to load video");
                }}
                onReady={() => console.log("Video Player Ready")}
                onProgress={handleProgress}
                onDuration={handleDuration}

                // Removed light mode - video loads directly now
                // config for different video sources
                config={{
                    youtube: {
                        playerVars: {
                            showinfo: 0,
                            controls: 1,
                            modestbranding: 1,
                            rel: 0,
                            iv_load_policy: 3,
                            playsinline: 1
                        }
                    },
                    vimeo: {
                        playerOptions: { controls: true, title: false, byline: false, portrait: false }
                    },
                    file: {
                        attributes: {
                            crossOrigin: "anonymous",
                            controlsList: "nodownload"
                        },
                        forceVideo: true
                    }
                }}
            />

            {/* Overlay Gradient for Controls Visibility */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 pointer-events-none ${showControls || !playing ? 'opacity-100' : 'opacity-0'}`} />

            {/* Center Play Button is now handled by light prop above, removed manual overlay to avoid conflicts */}

            {/* Custom Controls Bar */}
            <div className={`absolute bottom-0 left-0 right-0 p-4 transition-all duration-300 ${showControls || !playing ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>

                {/* Progress Bar */}
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-medium text-white min-w-[40px]">{formatDuration(duration * played)}</span>
                    <div className="relative flex-1 h-1.5 group/seek cursor-pointer">
                        <input
                            type="range"
                            min={0}
                            max={0.999999}
                            step="any"
                            value={played}
                            onMouseDown={handleSeekMouseDown}
                            onChange={handleSeekChange}
                            onMouseUp={handleSeekMouseUp}
                            className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                        />
                        <div className="absolute inset-0 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="bg-[#2EBD59] h-full transition-all"
                                style={{ width: `${played * 100}%` }}
                            />
                        </div>
                        <div
                            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover/seek:opacity-100 transition-opacity pointer-events-none"
                            style={{ left: `${played * 100}%` }}
                        />
                    </div>
                    <span className="text-xs font-medium text-white min-w-[40px]">{formatDuration(duration)}</span>
                </div>

                {/* Controls Row */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={handlePlayPause} className="text-white hover:text-[#2EBD59] transition-colors">
                            {playing ? (
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                            ) : (
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                            )}
                        </button>

                        <button onClick={() => {
                            if (playerRef.current) {
                                playerRef.current.seekTo(playerRef.current.getCurrentTime() - 10);
                            }
                        }} className="text-white/70 hover:text-white transition-colors group">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" /></svg>
                            <span className="sr-only">Rewind 10s</span>
                        </button>

                        <button onClick={() => {
                            if (playerRef.current) {
                                playerRef.current.seekTo(playerRef.current.getCurrentTime() + 10);
                            }
                        }} className="text-white/70 hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" /></svg>
                            <span className="sr-only">Forward 10s</span>
                        </button>

                        {/* Volume Control */}
                        <div className="flex items-center gap-2 group/vol">
                            <button onClick={() => setMuted(!muted)} className="text-white/70 hover:text-white transition-colors">
                                {muted || volume === 0 ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                                )}
                            </button>
                            <input
                                type="range"
                                min={0}
                                max={1}
                                step="any"
                                value={volume}
                                onChange={(e) => {
                                    setVolume(parseFloat(e.target.value));
                                    setMuted(false);
                                }}
                                className="w-0 group-hover/vol:w-20 transition-all duration-300 h-1 accent-[#2EBD59] bg-white/20 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={toggleFullscreen} className="text-white/70 hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 4l-5-5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
