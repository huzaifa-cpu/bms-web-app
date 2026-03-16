import { Spinner } from 'react-bootstrap'

interface LoaderProps {
  fullPage?: boolean
  size?: 'sm' | undefined
}

export function Loader({ fullPage = false, size }: LoaderProps) {
  if (fullPage) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" role="status" size={size}>
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    )
  }
  return (
    <div className="d-flex justify-content-center py-5">
      <Spinner animation="border" role="status" size={size}>
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  )
}
