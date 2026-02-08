"use client";

import { Component, ReactNode } from "react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorType: 'generic' | 'browser' | 'network' | 'media';
}

/**
 * Error Boundary for Video Playback
 * Catches errors and shows user-friendly messages
 */
export default class PlaybackErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorType: 'generic'
        };
    }

    static getDerivedStateFromError(error: Error): State {
        const errorType = categorizeError(error);
        return {
            hasError: true,
            error,
            errorType
        };
    }

    componentDidCatch(error: Error) {
        console.error('Video playback error:', error);
        this.props.onError?.(error);
    }

    handleRefresh = () => {
        window.location.reload();
    };

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorType: 'generic' });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-gray-50 rounded-xl">
                    {/* Error icon */}
                    <div className="w-16 h-16 mb-6 rounded-full bg-red-100 flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>

                    {/* Error message */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {getErrorTitle(this.state.errorType)}
                    </h3>
                    <p className="text-gray-600 text-center max-w-md mb-6">
                        {getErrorMessage(this.state.errorType)}
                    </p>

                    {/* Steps to resolve */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 w-full max-w-md">
                        <p className="font-medium text-gray-900 mb-3">Please try:</p>
                        <ol className="space-y-2 text-sm text-gray-600">
                            {getRecoverySteps(this.state.errorType).map((step, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#2EBD59]/10 text-[#2EBD59] text-xs font-bold flex items-center justify-center">
                                        {i + 1}
                                    </span>
                                    {step}
                                </li>
                            ))}
                        </ol>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={this.handleRetry}
                            className="px-6 py-2 bg-[#2EBD59] hover:bg-[#26a34d] text-white font-medium rounded-lg transition-colors"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={this.handleRefresh}
                            className="px-6 py-2 border border-gray-200 hover:border-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
                        >
                            Refresh Page
                        </button>
                    </div>

                    {/* Report issue link */}
                    <button className="mt-6 text-sm text-gray-500 hover:text-[#2EBD59] underline">
                        Report this issue
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Categorize error type for appropriate messaging
 */
function categorizeError(error: Error): State['errorType'] {
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch')) {
        return 'network';
    }
    if (message.includes('media') || message.includes('video') || message.includes('hls')) {
        return 'media';
    }
    if (message.includes('browser') || message.includes('support')) {
        return 'browser';
    }

    return 'generic';
}

/**
 * Get user-friendly error title
 */
function getErrorTitle(type: State['errorType']): string {
    switch (type) {
        case 'network':
            return 'Connection Problem';
        case 'media':
            return 'Video Playback Issue';
        case 'browser':
            return 'Browser Not Supported';
        default:
            return 'Something Went Wrong';
    }
}

/**
 * Get user-friendly error message
 */
function getErrorMessage(type: State['errorType']): string {
    switch (type) {
        case 'network':
            return "We couldn't load the video. Please check your internet connection.";
        case 'media':
            return "There was a problem playing this video. This might be a temporary issue.";
        case 'browser':
            return "Your browser doesn't support video playback. Please try a different browser.";
        default:
            return "We ran into an unexpected problem. Don't worry, this is usually temporary.";
    }
}

/**
 * Get recovery steps based on error type
 */
function getRecoverySteps(type: State['errorType']): string[] {
    switch (type) {
        case 'network':
            return [
                'Check your internet connection',
                'Try refreshing the page',
                'If the problem persists, try again later',
            ];
        case 'media':
            return [
                'Refresh the page',
                'Clear your browser cache',
                'Try a different browser',
            ];
        case 'browser':
            return [
                'Update to Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+',
                'Try a different browser',
                'Contact support if you need help',
            ];
        default:
            return [
                'Refresh the page',
                'Update your browser to the latest version',
                'Contact support if the problem continues',
            ];
    }
}
