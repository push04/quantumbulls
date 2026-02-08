import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://quantumbull.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const supabase = await createClient();

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: SITE_URL,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 1,
        },
        {
            url: `${SITE_URL}/courses`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: `${SITE_URL}/pricing`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
        },
        {
            url: `${SITE_URL}/about`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.6,
        },
        {
            url: `${SITE_URL}/contact`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.5,
        },
        {
            url: `${SITE_URL}/terms`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.3,
        },
        {
            url: `${SITE_URL}/privacy`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.3,
        },
    ];

    // Dynamic course pages
    const { data: courses } = await supabase
        .from("courses")
        .select("slug, updated_at")
        .eq("is_active", true);

    const coursePages: MetadataRoute.Sitemap = (courses || []).map((course) => ({
        url: `${SITE_URL}/courses/${course.slug}`,
        lastModified: course.updated_at ? new Date(course.updated_at) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
    }));

    return [...staticPages, ...coursePages];
}
