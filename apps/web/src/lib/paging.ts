/** The products API returns at most this many rows per request. */
export const PAGE_SIZE = 100;

/**
 * Collects every page of a paged list. Stops at the first short page or at `maxPages`.
 * Returns null only when the first page fails; a later failure keeps what already arrived.
 */
export async function fetchAllPages<T extends { id: number | string }>(
  fetchPage: (page: number) => Promise<T[] | null>,
  maxPages = 20,
): Promise<T[] | null> {
  const seen = new Set<T["id"]>();
  const out: T[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const rows = await fetchPage(page);
    if (!rows) return page === 1 ? null : out;
    for (const r of rows) {
      if (seen.has(r.id)) continue;
      seen.add(r.id);
      out.push(r);
    }
    if (rows.length < PAGE_SIZE) break;
  }
  return out;
}
