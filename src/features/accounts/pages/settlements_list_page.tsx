import { useState, useEffect } from 'react'
import { Card, Table, Button, Form, Row, Col } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { BsEye } from 'react-icons/bs'
import { toast } from 'react-toastify'
import { EmptyState } from '../../../core/ui/components/empty_state'
import { Pagination } from '../../../core/ui/components/pagination'
import { StatusBadge } from '../../../core/ui/components/status_badge'
import { Loader } from '../../../core/ui/components/loader'
import { ErrorState } from '../../../core/ui/components/error_state'
import { ConfirmDialog } from '../../../core/ui/components/confirm_dialog'
import RbacService from '../../../core/services/rbac_service'
import {
  useListSettlementsMutation,
  useGetSettlementSummaryMutation,
  useGenerateCommissionMutation,
  useGeneratePeriodMutation,
} from '../api/settlements_api'
import { formatDate, formatDateTime } from '../../../core/utils/date_utils'
import { formatCurrency } from '../../../core/utils/number_utils'

export default function SettlementsListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [confirmAction, setConfirmAction] = useState<'commission' | 'period' | null>(null)
  const pageSize = 20

  // RBAC permission checks
  const canView = RbacService.can('SETTLEMENTS', 'VIEW')
  const canGenerate = RbacService.can('SETTLEMENTS', 'GENERATE')

  const queryParams = {
    ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
    ...(typeFilter !== 'all' ? { type: typeFilter } : {}),
    page: page - 1,
    size: pageSize,
  }

  const [listSettlements, { data, isLoading, error }] = useListSettlementsMutation()
  const [getSettlementSummary, { data: summaryData }] = useGetSettlementSummaryMutation()
  const [generateCommission, { isLoading: isGeneratingCommission }] = useGenerateCommissionMutation()
  const [generatePeriod, { isLoading: isGeneratingPeriod }] = useGeneratePeriodMutation()

  useEffect(() => {
    listSettlements(queryParams)
  }, [page, statusFilter, typeFilter])

  useEffect(() => {
    getSettlementSummary()
  }, [])

  const pageData = data?.data
  const settlements = pageData?.content ?? []
  const summary = summaryData?.data

  const handleGenerate = async () => {
    if (!confirmAction) return
    try {
      if (confirmAction === 'commission') {
        await generateCommission().unwrap()
        toast.success('Commission settlement job triggered successfully.')
      } else {
        await generatePeriod().unwrap()
        toast.success('Period settlement job triggered successfully.')
      }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      toast.error(e?.data?.message || `Failed to trigger ${confirmAction} settlement job.`)
    } finally {
      setConfirmAction(null)
    }
  }

  if (isLoading) return <Loader fullPage />
  if (error) return <ErrorState error="Failed to load settlements." onRetry={() => listSettlements(queryParams)} />

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Settlements</h4>
        {canGenerate && (
          <div className="d-flex gap-2">
            <Button variant="outline-primary" size="sm" onClick={() => setConfirmAction('commission')}>
              Generate Commission
            </Button>
            <Button variant="outline-primary" size="sm" onClick={() => setConfirmAction('period')}>
              Generate Period
            </Button>
          </div>
        )}
      </div>

      {summary && (
        <Row className="g-3 mb-4">
          <Col sm={6} lg>
            <Card className="shadow-sm text-center p-3">
              <div className="text-muted small">Total</div>
              <div className="fw-bold fs-5">{summary.totalSettlements}</div>
            </Card>
          </Col>
          <Col sm={6} lg>
            <Card className="shadow-sm text-center p-3">
              <div className="text-muted small">Pending</div>
              <div className="fw-bold fs-5">{summary.pendingCount}</div>
              <div className="text-muted small">{formatCurrency(summary.totalPendingAmount)}</div>
            </Card>
          </Col>
          <Col sm={6} lg>
            <Card className="shadow-sm text-center p-3">
              <div className="text-muted small">Approved</div>
              <div className="fw-bold fs-5">{summary.approvedCount}</div>
            </Card>
          </Col>
          <Col sm={6} lg>
            <Card className="shadow-sm text-center p-3">
              <div className="text-muted small">Paid</div>
              <div className="fw-bold fs-5">{summary.paidCount}</div>
              <div className="text-muted small">{formatCurrency(summary.totalPaidAmount)}</div>
            </Card>
          </Col>
          <Col sm={6} lg>
            <Card className="shadow-sm text-center p-3">
              <div className="text-muted small">Failed</div>
              <div className="fw-bold fs-5">{summary.failedCount}</div>
            </Card>
          </Col>
        </Row>
      )}

      <Card className="shadow-sm">
        <Card.Body>
          <Row className="mb-3 g-2">
            <Col md={2}>
              <Form.Select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="PAID">Paid</option>
                <option value="FAILED">Failed</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }}>
                <option value="all">All Types</option>
                <option value="COMMISSION">Commission</option>
                <option value="PERIOD">Period</option>
              </Form.Select>
            </Col>
          </Row>

          {settlements.length === 0 ? <EmptyState title="No settlements found" description="No settlements match the selected filters." /> : (
            <>
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Provider</th>
                    <th>Type</th>
                    <th>Period</th>
                    <th>Total Amount</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {settlements.map((s) => (
                    <tr key={s.id}>
                      <td>#{s.id}</td>
                      <td>{s.providerName}</td>
                      <td>{s.settlementType}</td>
                      <td>{formatDate(s.periodStart)} — {formatDate(s.periodEnd)}</td>
                      <td>{formatCurrency(s.totalAmount, s.currency)}</td>
                      <td><StatusBadge status={s.status.toLowerCase()} /></td>
                      <td>{formatDateTime(s.createdOn)}</td>
                      <td>
                        {canView && (
                          <Button size="sm" variant="outline-primary" title="View" onClick={() => navigate(`/accounts/settlements/${s.id}`)}>
                            <BsEye />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Pagination
                page={page}
                totalPages={pageData?.totalPages ?? 1}
                pageSize={pageSize}
                totalItems={pageData?.totalElements ?? 0}
                onPageChange={setPage}
              />
            </>
          )}
        </Card.Body>
      </Card>

      <ConfirmDialog
        show={confirmAction !== null}
        title={confirmAction === 'commission' ? 'Generate Commission Settlements' : 'Generate Period Settlements'}
        message={`Are you sure you want to trigger the ${confirmAction} settlement generation job?`}
        confirmLabel="Generate"
        variant="primary"
        isLoading={isGeneratingCommission || isGeneratingPeriod}
        onConfirm={handleGenerate}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  )
}
