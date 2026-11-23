export type SupabasePageResult<T> = {
  data: T[] | null;
  error: { message: string } | null;
};

/**
 * Fetches every row from a Supabase REST query without relying on the
 * project's per-request row limit. The caller provides a fresh range query for
 * each page, which also makes the helper easy to use with different tables.
 */
export async function fetchAllSupabaseRows<T>(
  fetchPage: (from: number, to: number) => PromiseLike<SupabasePageResult<T>>,
  pageSize = 1_000,
): Promise<SupabasePageResult<T>> {
  const rows: T[] = [];
  let from = 0;

  while (true) {
    const result = await fetchPage(from, from + pageSize - 1);
    if (result.error) return { data: null, error: result.error };

    const page = result.data ?? [];
    rows.push(...page);
    if (page.length < pageSize) return { data: rows, error: null };
    from += pageSize;
  }
}
