import { Metadata } from "next";

interface SEOProps {
    title: string;
    description: string;
    url?: string;
    image?: string;
    type?: "website" | "article" | "course";
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    keywords?: string[];
}

const DEFAULT_IMAGE = "/og-image.jpg";
const SITE_NAME = "Quantum Bull";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://quantumbull.com";

/**
 * Generate metadata for Next.js pages
 */
export function generateSEOMetadata({
    title,
    description,
    url,
    image = DEFAULT_IMAGE,
    type = "website",
    publishedTime,
    modifiedTime,
    author,
    keywords = [],
}: SEOProps): Metadata {
    const fullUrl = url ? `${SITE_URL}${url}` : SITE_URL;
    const fullImage = image.startsWith("http") ? image : `${SITE_URL}${image}`;

    return {
        title: `${title} | ${SITE_NAME}`,
        description,
        keywords: [...keywords, "trading", "courses", "learn trading", "Quantum Bull"],
        authors: author ? [{ name: author }] : undefined,
        openGraph: {
            title,
            description,
            url: fullUrl,
            siteName: SITE_NAME,
            images: [
                {
                    url: fullImage,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
            type: type === "course" ? "article" : type,
            ...(publishedTime && { publishedTime }),
            ...(modifiedTime && { modifiedTime }),
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [fullImage],
        },
        alternates: {
            canonical: fullUrl,
        },
    };
}

/**
 * Course-specific metadata
 */
export function generateCourseMetadata(course: {
    title: string;
    description: string;
    slug: string;
    thumbnail_url?: string;
    created_at?: string;
    updated_at?: string;
}): Metadata {
    return generateSEOMetadata({
        title: course.title,
        description: course.description,
        url: `/courses/${course.slug}`,
        image: course.thumbnail_url,
        type: "course",
        publishedTime: course.created_at,
        modifiedTime: course.updated_at,
        keywords: [course.title.toLowerCase(), "trading course"],
    });
}

/**
 * Lesson-specific metadata
 */
export function generateLessonMetadata(lesson: {
    title: string;
    description?: string;
    courseTitle: string;
    courseSlug: string;
    lessonSlug: string;
    thumbnail_url?: string;
}): Metadata {
    return generateSEOMetadata({
        title: `${lesson.title} - ${lesson.courseTitle}`,
        description: lesson.description || `Learn ${lesson.title} in the ${lesson.courseTitle} course`,
        url: `/courses/${lesson.courseSlug}/lessons/${lesson.lessonSlug}`,
        image: lesson.thumbnail_url,
        type: "article",
    });
}

/**
 * JSON-LD Schema for Course
 */
export function generateCourseSchema(course: {
    title: string;
    description: string;
    slug: string;
    thumbnail_url?: string;
    instructor?: string;
    lessonsCount?: number;
    duration?: string;
    price?: number;
}) {
    return {
        "@context": "https://schema.org",
        "@type": "Course",
        name: course.title,
        description: course.description,
        url: `${SITE_URL}/courses/${course.slug}`,
        image: course.thumbnail_url,
        provider: {
            "@type": "Organization",
            name: SITE_NAME,
            url: SITE_URL,
        },
        instructor: course.instructor ? {
            "@type": "Person",
            name: course.instructor,
        } : undefined,
        numberOfCredits: course.lessonsCount,
        timeRequired: course.duration,
        offers: course.price ? {
            "@type": "Offer",
            price: course.price,
            priceCurrency: "INR",
        } : undefined,
    };
}

/**
 * Schema.org script component
 */
export function SchemaScript({ schema }: { schema: object }) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
