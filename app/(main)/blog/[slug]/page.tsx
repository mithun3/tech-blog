import { notFound } from "next/navigation";
import { getAllPostsMeta, getPostBySlug } from "@/lib/posts";
import type { Metadata } from "next";
import Comments from "@/components/comments";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllPostsMeta().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  const url = `${process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'http://localhost:3000'}/blog/${slug}`;

  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.summary,
      type: "article",
      url,
      publishedTime: post.publishedAt,
      ...(post.updatedAt && { modifiedTime: post.updatedAt }),
      ...(post.image && { images: [{ url: post.image }] }),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary ?? undefined,
    },
  };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
  const postUrl = `${siteUrl}/blog/${slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary,
    url: postUrl,
    datePublished: post.publishedAt,
    ...(post.updatedAt && { dateModified: post.updatedAt }),
    author: {
      "@type": "Person",
      name: "poc to prod",
      url: siteUrl,
    },
    publisher: {
      "@type": "Person",
      name: "poc to prod",
      url: siteUrl,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <div className="max-w-[78ch] space-y-12">
        <article className="space-y-8">
          <header className="space-y-4">
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <h1 className="text-4xl font-bold tracking-tight">{post.title}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-500">
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              <span aria-hidden="true">·</span>
              <span>{post.readingTime}</span>
              {post.updatedAt && post.updatedAt !== post.publishedAt && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>Updated {formatDate(post.updatedAt)}</span>
                </>
              )}
            </div>
          </header>

          <div
            className="
              prose prose-zinc dark:prose-invert max-w-none
              prose-headings:font-semibold prose-headings:tracking-tight
              prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
              prose-code:before:content-none prose-code:after:content-none
              prose-pre:p-0 prose-pre:bg-transparent prose-pre:border prose-pre:border-zinc-200 dark:prose-pre:border-zinc-800
              prose-img:rounded-lg
            "
            dangerouslySetInnerHTML={{ __html: post.htmlContent }}
          />
        </article>

        <Comments />
      </div>
    </>
  );
}
