/**
 * Device Detection Utility
 * Parses User-Agent to extract device information
 */

export interface DeviceInfo {
    deviceName: string;
    deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
    browser: string;
    os: string;
}

/**
 * Parse User-Agent string to extract device information
 */
export function parseUserAgent(userAgent: string): DeviceInfo {
    const ua = userAgent.toLowerCase();

    // Detect OS
    let os = 'Unknown';
    if (ua.includes('windows nt 10')) os = 'Windows 10/11';
    else if (ua.includes('windows')) os = 'Windows';
    else if (ua.includes('mac os x')) os = 'macOS';
    else if (ua.includes('iphone')) os = 'iOS';
    else if (ua.includes('ipad')) os = 'iPadOS';
    else if (ua.includes('android')) os = 'Android';
    else if (ua.includes('linux')) os = 'Linux';
    else if (ua.includes('cros')) os = 'ChromeOS';

    // Detect Browser
    let browser = 'Unknown';
    if (ua.includes('edg/')) browser = 'Microsoft Edge';
    else if (ua.includes('chrome') && !ua.includes('chromium')) browser = 'Chrome';
    else if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
    else if (ua.includes('opera') || ua.includes('opr')) browser = 'Opera';
    else if (ua.includes('brave')) browser = 'Brave';

    // Detect Device Type
    let deviceType: DeviceInfo['deviceType'] = 'desktop';
    if (ua.includes('mobile') || ua.includes('iphone') || ua.includes('android')) {
        if (!ua.includes('tablet') && !ua.includes('ipad')) {
            deviceType = 'mobile';
        }
    }
    if (ua.includes('tablet') || ua.includes('ipad')) {
        deviceType = 'tablet';
    }

    // Generate human-readable device name
    const deviceName = `${browser} on ${os}`;

    return {
        deviceName,
        deviceType,
        browser,
        os,
    };
}

/**
 * Get device emoji for display
 */
export function getDeviceEmoji(deviceType: DeviceInfo['deviceType']): string {
    switch (deviceType) {
        case 'mobile': return '📱';
        case 'tablet': return '📱';
        case 'desktop': return '💻';
        default: return '🖥️';
    }
}

/**
 * Get short device description
 */
export function getShortDeviceName(info: DeviceInfo): string {
    return `${getDeviceEmoji(info.deviceType)} ${info.browser} • ${info.os}`;
}
