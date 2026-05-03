import { getAllPostsMeta } from "@/lib/posts";
import { PostCard } from "@/components/post-card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "All blog posts.",
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
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
        {posts.length === 0 && (
          <p className="text-zinc-500">No posts yet. Check back soon!</p>
        )}
      </div>
    </div>
  );
}
