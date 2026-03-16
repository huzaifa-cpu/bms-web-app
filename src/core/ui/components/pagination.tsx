import { Pagination as BsPagination, Form } from 'react-bootstrap'

interface PaginationProps {
  page: number
  totalPages: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
}

export function Pagination({
  page,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
}: PaginationProps) {
  const startItem = (page - 1) * pageSize + 1
  const endItem = Math.min(page * pageSize, totalItems)

  const pages: number[] = []
  const delta = 2
  const left = Math.max(1, page - delta)
  const right = Math.min(totalPages, page + delta)

  for (let i = left; i <= right; i++) {
    pages.push(i)
  }

  if (totalPages <= 1) return null

  return (
    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-3">
      <div className="text-muted small">
        Showing {startItem}–{endItem} of {totalItems} items
      </div>
      <div className="d-flex align-items-center gap-3">
        {onPageSizeChange && (
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted small">Per page:</span>
            <Form.Select
              size="sm"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              style={{ width: 'auto' }}
            >
              {pageSizeOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Form.Select>
          </div>
        )}
        <BsPagination size="sm" className="mb-0">
          <BsPagination.First disabled={page === 1} onClick={() => onPageChange(1)} />
          <BsPagination.Prev disabled={page === 1} onClick={() => onPageChange(page - 1)} />
          {left > 1 && <BsPagination.Ellipsis disabled />}
          {pages.map((p) => (
            <BsPagination.Item key={p} active={p === page} onClick={() => onPageChange(p)}>
              {p}
            </BsPagination.Item>
          ))}
          {right < totalPages && <BsPagination.Ellipsis disabled />}
          <BsPagination.Next disabled={page === totalPages} onClick={() => onPageChange(page + 1)} />
          <BsPagination.Last disabled={page === totalPages} onClick={() => onPageChange(totalPages)} />
        </BsPagination>
      </div>
    </div>
  )
}
