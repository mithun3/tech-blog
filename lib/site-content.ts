import fs from 'fs'
import path from 'path'

const SITE_CONTENT_DIR = path.join(process.cwd(), 'content', 'site')

/** Raw MDX source of a snippet in content/site, such as 'home-intro'. */
export function getSiteSnippet(name: string): string {
  return fs.readFileSync(path.join(SITE_CONTENT_DIR, `${name}.mdx`), 'utf-8')
}
