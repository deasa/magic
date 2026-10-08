export type Section = 'commander' | 'main' | 'side'

export type Entry = { qty: number; name: string; section: Section }

const HEADERS: Record<string, Section> = {
  commander: 'commander',
  commanders: 'commander',
  deck: 'main',
  main: 'main',
  mainboard: 'main',
  library: 'main',
  sideboard: 'side',
  maybeboard: 'side',
  considering: 'side',
}

/**
 * Parse a plain-text decklist as exported by Moxfield, Archidekt, MTGA and friends.
 * Accepts "1 Sol Ring", "1x Sol Ring", "Sol Ring", set codes "(CMM) 123", foil marks "*F*",
 * commander marks "*CMDR*", and section headers like "Commander" or "// Sideboard".
 */
export function parseDecklist(text: string): Entry[] {
  const out = new Map<string, Entry>()
  let section: Section = 'main'

  for (const rawLine of text.split(/\r?\n/)) {
    let line = rawLine.trim()
    if (!line || line.startsWith('#')) continue

    const header = line.replace(/^\/\/\s*/, '').replace(/:$/, '').replace(/\s*\(\d+\)$/, '').toLowerCase()
    if (header in HEADERS) {
      section = HEADERS[header]
      continue
    }
    if (line.startsWith('//')) continue

    let lineSection = section
    if (/\*CMDR\*/i.test(line)) lineSection = 'commander'
    if (/^SB:\s*/i.test(line)) {
      lineSection = 'side'
      line = line.replace(/^SB:\s*/i, '')
    }

    const m = line.match(/^(\d+)\s*x?\s+(.+)$/i)
    const qty = m ? Number(m[1]) : 1
    const name = (m ? m[2] : line)
      .replace(/\s*\*[A-Z]+\*/gi, '') // *F*, *CMDR*, *E*
      .replace(/\s*\[[^\]]*\]/g, '') // [tags]
      .replace(/\s+\([A-Z0-9]{2,6}\)(\s+[\w-]+★?)?\s*$/i, '') // (SET) 123
      .replace(/\s+#\S.*$/, '') // #category
      .trim()
    if (!name || qty <= 0) continue

    const key = `${lineSection}|${name.toLowerCase()}`
    const existing = out.get(key)
    if (existing) existing.qty += qty
    else out.set(key, { qty, name, section: lineSection })
  }
  return [...out.values()]
}
