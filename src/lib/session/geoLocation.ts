/**
 * IP-based Geolocation Utility
 * Uses free ip-api.com service
 */

export interface GeoLocation {
    country: string;
    countryCode: string;
    city: string;
    region: string;
    timezone: string;
    isp: string;
}

// Simple in-memory cache for geolocation results
const geoCache = new Map<string, { data: GeoLocation; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get geolocation data for an IP address
 * Uses ip-api.com (free, 45 requests/minute limit)
 */
export async function getGeoLocation(ip: string): Promise<GeoLocation | null> {
    // Skip localhost/private IPs
    if (isPrivateIP(ip)) {
        return {
            country: 'Local',
            countryCode: 'LO',
            city: 'Local Network',
            region: '',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            isp: 'Local',
        };
    }

    // Check cache
    const cached = geoCache.get(ip);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }

    try {
        const response = await fetch(
            `http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,timezone,isp`,
            { next: { revalidate: 86400 } } // Cache for 24 hours in Next.js
        );

        if (!response.ok) {
            console.error('Geolocation API error:', response.status);
            return null;
        }

        const data = await response.json();

        if (data.status !== 'success') {
            console.error('Geolocation failed:', data);
            return null;
        }

        const geoData: GeoLocation = {
            country: data.country || 'Unknown',
            countryCode: data.countryCode || 'UN',
            city: data.city || 'Unknown',
            region: data.regionName || '',
            timezone: data.timezone || '',
            isp: data.isp || '',
        };

        // Cache the result
        geoCache.set(ip, { data: geoData, timestamp: Date.now() });

        return geoData;
    } catch (error) {
        console.error('Geolocation error:', error);
        return null;
    }
}

/**
 * Check if IP is private/local
 */
function isPrivateIP(ip: string): boolean {
    if (!ip || ip === '::1' || ip === '127.0.0.1' || ip === 'localhost') {
        return true;
    }

    // IPv4 private ranges
    const privateRanges = [
        /^10\./,
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
        /^192\.168\./,
    ];

    return privateRanges.some(range => range.test(ip));
}

/**
 * Compare two locations to detect suspicious activity
 * Returns true if locations are significantly different
 */
export function isLocationSuspicious(
    previousLocation: GeoLocation | null,
    currentLocation: GeoLocation | null
): boolean {
    if (!previousLocation || !currentLocation) return false;

    // Different country is definitely suspicious
    if (previousLocation.countryCode !== currentLocation.countryCode) {
        return true;
    }

    return false;
}

/**
 * Format location for display
 */
export function formatLocation(geo: GeoLocation | null): string {
    if (!geo) return 'Unknown location';
    if (geo.countryCode === 'LO') return 'Local network';

    if (geo.city && geo.country) {
        return `${geo.city}, ${geo.country}`;
    }
    return geo.country || 'Unknown';
}
