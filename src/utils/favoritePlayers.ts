/**
 * Read favourite player ids from their stored JSON, dropping anything that isn't a valid id.
 * @param stored - The raw localStorage value, or null if nothing is stored.
 * @returns The ids, in the order they were saved, without duplicates.
 */
export function parseFavoriteIds(stored: string | null): number[] {
  if (!stored) return []
  try {
    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) return []
    return [...new Set(parsed.filter((id): id is number => Number.isInteger(id) && id > 0))]
  } catch {
    return []
  }
}

/**
 * Add the id if it's missing, or remove it if it's there. New favourites go last.
 */
export function toggleFavoriteId(ids: number[], id: number): number[] {
  return ids.includes(id) ? ids.filter((other) => other !== id) : [...ids, id]
}
