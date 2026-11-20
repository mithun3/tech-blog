import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { PostCard } from "@/components/post-card";
import { getAllPostsMeta } from "@/lib/posts";
import { buildNavTree, getPageMeta, type NavNode } from "@/lib/wiki";
import { getSiteSnippet } from "@/lib/site-content";
import { MORE_HREFS, SITE_DESCRIPTION, SITE_NAME, SITE_URL, formatDate } from "@/lib/site";

const RECENT_PAGE_COUNT = 3;

/** Every node in the tree, depth-first in sidebar order. */
function flattenNav(nodes: NavNode[]): NavNode[] {
  return nodes.flatMap((node) => [node, ...flattenNav(node.children)]);
}

export default function HomePage() {
  const sections = buildNavTree()
    .filter((s) => !MORE_HREFS.has(s.href))
    .map((section) => ({ ...section, pageCount: flattenNav(section.children).length }));
  const totalTopicPages = sections.reduce((count, section) => count + section.pageCount, 0);
  // Newest publishedAt first; Array.sort is stable, so ties keep sidebar order.
  const recentPages = flattenNav(sections)
    .map((node) => ({ ...node, publishedAt: getPageMeta(node.slug)?.publishedAt }))
    .filter((page): page is typeof page & { publishedAt: string } => Boolean(page.publishedAt))
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, RECENT_PAGE_COUNT);
  const posts = getAllPostsMeta();
  const latestPost = posts[0];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <div className="grid gap-10 pt-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(18rem,22rem)] xl:gap-x-12 xl:gap-y-16">
        {/* Hero */}
        <section className="space-y-3 xl:col-start-1 xl:row-start-1">
          <h1 className="text-4xl font-bold tracking-tight">{SITE_NAME}</h1>
          <div className="max-w-[72ch] space-y-4 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400 [&_p]:m-0">
            <MDXRemote source={getSiteSnippet("home-intro")} />
          </div>
        </section>

        <aside className="self-start rounded-2xl border border-zinc-200 bg-zinc-50/70 p-6 dark:border-zinc-800 dark:bg-zinc-900/70 xl:sticky xl:top-8 xl:col-start-2 xl:row-span-2">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Start here</p>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4 border-y border-zinc-200 py-4 dark:border-zinc-800">
            <div>
              <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{sections.length}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Topics</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{totalTopicPages}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Notes</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{posts.length}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Posts</p>
            </div>
          </div>

          <div className="mt-6 space-y-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
              Recently added
            </p>
            {recentPages.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className="flex items-start justify-between gap-4 rounded-xl border border-zinc-200 bg-white px-4 py-3 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
              >
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">{page.title}</p>
                  {page.description && (
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
                      {page.description}
                    </p>
                  )}
                </div>
                <time dateTime={page.publishedAt} className="shrink-0 pt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  {formatDate(page.publishedAt, 'short')}
                </time>
              </Link>
            ))}
          </div>

          {latestPost && (
            <div className="mt-6 space-y-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                Latest post
              </p>
              <PostCard post={latestPost} />
            </div>
          )}

          <Link
            href="/pages"
            className="mt-6 inline-flex items-center text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
          >
            Browse all topics →
          </Link>
        </aside>

        {/* Pages sections */}
        <section className="space-y-6 xl:col-start-1 xl:row-start-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Topics</h2>
            <Link
              href="/pages"
              className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Browse all →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {sections.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className="group rounded-xl border border-zinc-200 p-5 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
              >
                <h3 className="font-semibold transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {section.title}
                </h3>
                {section.description && (
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
                    {section.description}
                  </p>
                )}
                {section.pageCount > 0 && (
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                    {section.pageCount} {section.pageCount === 1 ? 'page' : 'pages'}
                  </p>
                )}
              </Link>
            ))}
            {sections.length === 0 && (
              <p className="col-span-full text-zinc-500 dark:text-zinc-400">No pages yet. Check back soon!</p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}


