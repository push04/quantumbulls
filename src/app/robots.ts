import { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://quantumbull.com";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: [
                    "/admin",
                    "/admin/*",
                    "/api/*",
                    "/auth/*",
                    "/dashboard",
                    "/dashboard/*",
                    "/profile",
                    "/profile/*",
                    "/checkout",
                    "/checkout/*",
                    "/*.json$",
                    "/*?*", // Query parameters
                ],
            },
            {
                userAgent: "Googlebot",
                allow: "/",
                disallow: [
                    "/admin",
                    "/admin/*",
                    "/api/*",
                    "/auth/*",
                ],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    };
}
