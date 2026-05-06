import Link from "next/link";
import { buildNavTree } from "@/lib/wiki";

const META_HREFS = new Set(['/pages/about', '/pages/contact', '/pages/privacy', '/pages/terms', '/pages/faq'])

export default function HomePage() {
  const sections = buildNavTree().filter((s) => !META_HREFS.has(s.href));
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'http://localhost:3000';

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
      <div className="space-y-20">
      {/* Hero */}
      <section className="space-y-3 pt-4">
        <h1 className="text-4xl font-bold tracking-tight">poc to prod</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-xl">
          It&apos;s hard to find good answers in a sea of short videos and shallow tutorials. <br />
          Everything is sponsored, everyone seems biased. All the good stuff gets burried in between. <br />
          This site is for the deep divers. <br />
          It&apos;s meant to be the bridge the gap between a quick proof-of-concept and a solid production app. <br />
          It combines best patterns and practices and is near production-grade. <br />
          I&apos;ve skipped the trackers, the ads, and the fluff. <br />
          What you&apos;ll find instead is honest research and a lot of man-hours dedicated to create some contents in this wiki. <br />
          Whether you&apos;re a developer or just a curious mind, this is where stuff actually gets built.
        </p>
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
        <div className="grid gap-4 sm:grid-cols-2">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
            >
              <h3 className="font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {section.title}
              </h3>
              {section.description && (
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
                  {section.description}
                </p>
              )}
              {section.children.length > 0 && (
                <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                  {section.children.length} {section.children.length === 1 ? "page" : "pages"}
                </p>
              )}
            </Link>
          ))}
          {sections.length === 0 && (
            <p className="text-zinc-500 col-span-2">No pages yet. Check back soon!</p>
          )}
        </div>
      </section>
    </div>
    </>
  );
}


