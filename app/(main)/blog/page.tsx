import { getAllPostsMeta } from "@/lib/posts";
import { PostCard } from "@/components/post-card";
import { SITE_NAME, SITE_URL, ogImageUrl } from "@/lib/site";
import type { Metadata } from "next";

const description = "All blog posts.";
const ogImage = ogImageUrl("Blog", description, "Blog");

export const metadata: Metadata = {
  title: "Blog",
  description,
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: `${SITE_URL}/blog`,
    title: "Blog",
    description,
    images: [{ url: ogImage, width: 1200, height: 630, alt: "Blog" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog",
    description,
    images: [ogImage],
  },
};

export default function BlogPage() {
  const posts = getAllPostsMeta();

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          {posts.length} {posts.length === 1 ? "post" : "posts"}
        </p>
      </div>
      <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
        {posts.length === 0 && (
          <p className="col-span-full text-zinc-500 dark:text-zinc-400">No posts yet. Check back soon!</p>
        )}
      </div>
    </div>
  );
}
