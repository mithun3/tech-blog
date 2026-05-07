'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

export default function Comments() {
  const { resolvedTheme } = useTheme();
  const mounted = useRef(false);

  // Inject Giscus script on mount (only once)
  useEffect(() => {
    const container = document.getElementById('giscus-container');
    if (!container) return;

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.dataset.repo = 'mithun3/tech-blog';
    script.dataset.repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID ?? '';
    script.dataset.category = 'Comments';
    script.dataset.categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID ?? '';
    script.dataset.mapping = 'pathname';
    script.dataset.reactionsEnabled = '1';
    script.dataset.emitMetadata = '0';
    script.dataset.inputPosition = 'bottom';
    script.dataset.theme = resolvedTheme === 'dark' ? 'dark' : 'light';
    script.dataset.lang = 'en';
    script.dataset.loading = 'lazy';
    script.async = true;
    script.crossOrigin = 'anonymous';

    container.appendChild(script);
    mounted.current = true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync theme changes to the already-loaded Giscus iframe
  useEffect(() => {
    if (!mounted.current) return;
    const theme = resolvedTheme === 'dark' ? 'dark' : 'light';
    const iframe = document.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
    iframe?.contentWindow?.postMessage(
      { giscus: { setConfig: { theme } } },
      'https://giscus.app',
    );
  }, [resolvedTheme]);

  return (
    <div className="mt-12 border-t border-zinc-200 dark:border-zinc-800 pt-10">
      <h2 className="mb-2 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
        Comments
      </h2>
      <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
        Sign in with GitHub to leave a comment or reaction.
      </p>
      <div id="giscus-container" />
    </div>
  );
}
