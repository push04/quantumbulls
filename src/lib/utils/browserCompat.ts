/**
 * Browser Compatibility Utilities
 * Checks browser support for required features
 */

export interface BrowserCheck {
    feature: string;
    supported: boolean;
    required: boolean;
    fallback?: string;
}

export interface CompatibilityResult {
    compatible: boolean;
    checks: BrowserCheck[];
    recommendedBrowser?: string;
}

/**
 * Check browser compatibility for video playback
 */
export function checkBrowserCompatibility(): CompatibilityResult {
    const checks: BrowserCheck[] = [];

    // Check HLS support (required)
    const hlsSupported = typeof window !== 'undefined' && (
        document.createElement('video').canPlayType('application/vnd.apple.mpegurl') !== '' ||
        typeof window.MediaSource !== 'undefined'
    );
    checks.push({
        feature: 'HLS Video Streaming',
        supported: hlsSupported,
        required: true,
        fallback: 'Using MP4 fallback',
    });

    // Check Fullscreen API (nice to have)
    const fullscreenSupported = typeof window !== 'undefined' && (
        document.fullscreenEnabled ||
        (document as Document & { webkitFullscreenEnabled?: boolean }).webkitFullscreenEnabled ||
        false
    );
    checks.push({
        feature: 'Fullscreen Mode',
        supported: fullscreenSupported,
        required: false,
    });

    // Check localStorage (required for progress saving)
    let localStorageSupported = false;
    try {
        if (typeof window !== 'undefined') {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            localStorageSupported = true;
        }
    } catch (e) {
        localStorageSupported = false;
    }
    checks.push({
        feature: 'Progress Saving',
        supported: localStorageSupported,
        required: true,
        fallback: 'Progress won\'t be saved between sessions',
    });

    // Check if cookies enabled (required for auth)
    const cookiesEnabled = typeof navigator !== 'undefined' && navigator.cookieEnabled;
    checks.push({
        feature: 'Session Management',
        supported: cookiesEnabled,
        required: true,
    });

    // Check network information API (nice to have for quality selection)
    const networkInfoSupported = typeof navigator !== 'undefined' &&
        'connection' in navigator;
    checks.push({
        feature: 'Adaptive Quality',
        supported: networkInfoSupported,
        required: false,
        fallback: 'Manual quality selection only',
    });

    // Determine overall compatibility
    const requiredChecks = checks.filter(c => c.required);
    const compatible = requiredChecks.every(c => c.supported);

    // Recommend browser if not compatible
    let recommendedBrowser: string | undefined;
    if (!compatible) {
        recommendedBrowser = 'We recommend using Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+ for the best experience.';
    }

    return {
        compatible,
        checks,
        recommendedBrowser,
    };
}

/**
 * Get browser name from user agent
 */
export function getBrowserName(): string {
    if (typeof navigator === 'undefined') return 'Unknown';

    const ua = navigator.userAgent.toLowerCase();

    if (ua.includes('edg/')) return 'Microsoft Edge';
    if (ua.includes('chrome') && !ua.includes('chromium')) return 'Chrome';
    if (ua.includes('firefox')) return 'Firefox';
    if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
    if (ua.includes('opera') || ua.includes('opr')) return 'Opera';

    return 'Unknown';
}

/**
 * Check if browser is outdated based on common features
 */
export function isBrowserOutdated(): boolean {
    if (typeof window === 'undefined') return false;

    // Check for modern features that indicate recent browser
    const modernFeatures = [
        typeof window.fetch !== 'undefined',
        typeof Promise !== 'undefined',
        typeof navigator.sendBeacon !== 'undefined',
        CSS.supports('backdrop-filter', 'blur(10px)'),
    ];

    const supportedCount = modernFeatures.filter(Boolean).length;

    // If less than half of modern features, browser is likely outdated
    return supportedCount < modernFeatures.length / 2;
}
