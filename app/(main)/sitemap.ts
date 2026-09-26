import { getAllPostsMeta } from "@/lib/posts";
import { getAllPageSlugs, getPageMeta } from "@/lib/wiki";
import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPostsMeta();

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(post.publishedAt),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...postEntries,
    {
      url: `${BASE_URL}/pages`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...getAllPageSlugs()
      .filter((slugSegments) => slugSegments.length > 0)
      .map((slugSegments) => {
        const meta = getPageMeta(slugSegments);
        return {
          url: `${BASE_URL}/pages/${slugSegments.join("/")}`,
          lastModified: meta?.updatedAt
            ? new Date(meta.updatedAt)
            : meta?.publishedAt
              ? new Date(meta.publishedAt)
              : new Date(),
          changeFrequency: "monthly" as const,
          priority: 0.7,
        };
      }),
  ];
}
