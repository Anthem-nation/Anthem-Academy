import Link from 'next/link'

export { PAGE_SIZE } from '@/lib/utils/pagination'

interface PaginationProps {
  page: number
  totalPages: number
  baseUrl: string
}

export default function Pagination({ page, totalPages, baseUrl }: PaginationProps) {
  if (totalPages <= 1) return null

  // Build URL preserving existing params, swapping ?page=N
  function buildUrl(targetPage: number) {
    const url = new URL(baseUrl, 'http://x')
    url.searchParams.set('page', String(targetPage))
    return url.pathname + url.search
  }

  const isFirst = page <= 1
  const isLast = page >= totalPages

  return (
    <div className="flex items-center justify-center gap-4 py-4 text-sm">
      {isFirst ? (
        <span className="cursor-not-allowed text-muted-foreground">Previous</span>
      ) : (
        <Link href={buildUrl(page - 1)} className="text-primary hover:underline">
          Previous
        </Link>
      )}

      <span className="text-muted-foreground">
        Page {page} of {totalPages}
      </span>

      {isLast ? (
        <span className="cursor-not-allowed text-muted-foreground">Next</span>
      ) : (
        <Link href={buildUrl(page + 1)} className="text-primary hover:underline">
          Next
        </Link>
      )}
    </div>
  )
}
