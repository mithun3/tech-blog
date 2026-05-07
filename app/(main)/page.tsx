import HomePageIntro from "@/content/site/home-intro.mdx";
import Link from "next/link";
import { buildNavTree } from "@/lib/wiki";

const META_HREFS = new Set(['/pages/about', '/pages/contact', '/pages/privacy', '/pages/terms', '/pages/faq'])

export default function HomePage() {
  const sections = buildNavTree().filter((s) => !META_HREFS.has(s.href));
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'http://localhost:3000';
  const totalTopicPages = sections.reduce((count, section) => count + section.children.length, 0);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'poc to prod',
    url: siteUrl,
    description:
      'Notes, guides, and deep-dives on software engineering, infrastructure, and building things.',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <div className="space-y-16 xl:space-y-20">
        {/* Hero */}
        <section className="grid gap-8 pt-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(19rem,0.85fr)] xl:items-start xl:gap-12">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight">poc to prod</h1>
            <div className="max-w-[72ch] space-y-4 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400 [&_p]:m-0">
              <HomePageIntro />
            </div>
          </div>

          <aside className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-6 dark:border-zinc-800 dark:bg-zinc-900/70">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Start here</p>
              <p className="text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                Wide screens work best when the spare space carries navigation and context instead of stretching paragraphs.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 border-y border-zinc-200 py-4 dark:border-zinc-800">
              <div>
                <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{sections.length}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Topics</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{totalTopicPages}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Notes</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {sections.slice(0, 4).map((section) => (
                <Link
                  key={section.href}
                  href={section.href}
                  className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white px-4 py-3 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
                >
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{section.title}</p>
                    {section.description && (
                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
                        {section.description}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-zinc-400 dark:text-zinc-500">
                    {section.children.length} {section.children.length === 1 ? 'page' : 'pages'}
                  </span>
                </Link>
              ))}
            </div>
          </aside>
        </section>

        {/* Pages sections */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Topics</h2>
            <Link
              href="/pages"
              className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Browse all →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
                {section.children.length > 0 && (
                  <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                    {section.children.length} {section.children.length === 1 ? 'page' : 'pages'}
                  </p>
                )}
              </Link>
            ))}
            {sections.length === 0 && (
              <p className="col-span-full text-zinc-500">No pages yet. Check back soon!</p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}


