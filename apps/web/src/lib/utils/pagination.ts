export const PAGE_SIZE = 20

export function getPaginationRange(
  page: number,
  pageSize: number,
  total: number,
): { offset: number; totalPages: number } {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const offset = (safePage - 1) * pageSize
  return { offset, totalPages }
}
