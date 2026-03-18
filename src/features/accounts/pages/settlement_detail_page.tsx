import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Row, Col, Button, Table, Form } from 'react-bootstrap'
import { BsArrowLeft } from 'react-icons/bs'
import { toast } from 'react-toastify'
import { StatusBadge } from '../../../core/ui/components/status_badge'
import { ErrorState } from '../../../core/ui/components/error_state'
import { Loader } from '../../../core/ui/components/loader'
import { ConfirmDialog } from '../../../core/ui/components/confirm_dialog'
import RbacService from '../../../core/services/rbac_service'
import {
  useGetSettlementMutation,
  useGetSettlementItemsMutation,
  useMarkSettlementPaidMutation,
  useMarkSettlementFailedMutation,
} from '../api/settlements_api'
import { formatDate, formatDateTime } from '../../../core/utils/date_utils'
import { formatCurrency } from '../../../core/utils/number_utils'

type ActionType = 'mark-paid' | 'mark-failed' | null

export default function SettlementDetailPage() {
  const { settlementId } = useParams()
  const navigate = useNavigate()
  const id = Number(settlementId)

  const [getSettlement, { data, isLoading, error }] = useGetSettlementMutation()
  const [getSettlementItems, { data: itemsData }] = useGetSettlementItemsMutation()
  const [markPaid, { isLoading: isMarkingPaid }] = useMarkSettlementPaidMutation()
  const [markFailed, { isLoading: isMarkingFailed }] = useMarkSettlementFailedMutation()

  const [activeAction, setActiveAction] = useState<ActionType>(null)
  const [failReason, setFailReason] = useState('')

  useEffect(() => {
    getSettlement(id)
    getSettlementItems(id)
  }, [id])

  const settlement = data?.data
  const items = itemsData?.data ?? settlement?.items ?? []

  // RBAC permission checks
  const canMarkPaid = RbacService.can('SETTLEMENTS', 'MARK_PAID')
  const canMarkFailed = RbacService.can('SETTLEMENTS', 'MARK_FAILED')

  const handleConfirm = async () => {
    if (!settlement) return
    if (activeAction === 'mark-failed' && failReason.trim() === '') return
    try {
      if (activeAction === 'mark-paid') {
        await markPaid(settlement.id).unwrap()
        toast.success('Settlement marked as paid.')
      } else if (activeAction === 'mark-failed') {
        await markFailed({ id: settlement.id, body: { reason: failReason } }).unwrap()
        toast.success('Settlement marked as failed.')
      }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      toast.error(e?.data?.message || 'Action failed.')
    } finally {
      setActiveAction(null)
      setFailReason('')
    }
  }

  if (isLoading) return <Loader fullPage />
  if (error || !settlement) return <ErrorState error="Settlement not found." onRetry={() => getSettlement(id)} />

  const status = settlement.status
  const showMarkPaid = status === 'APPROVED' && canMarkPaid
  const showMarkFailed = (status === 'PENDING' || status === 'APPROVED') && canMarkFailed

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
        <Button variant="outline-secondary" size="sm" onClick={() => navigate('/accounts/settlements')}>
          <BsArrowLeft className="me-1" />Back
        </Button>
        <h4 className="fw-bold mb-0">Settlement #{settlement.id}</h4>
        <StatusBadge status={status.toLowerCase()} />
        <div className="ms-auto d-flex gap-2">
          {showMarkPaid && (
            <Button variant="success" size="sm" onClick={() => setActiveAction('mark-paid')}>
              Mark Paid
            </Button>
          )}
          {showMarkFailed && (
            <Button variant="danger" size="sm" onClick={() => setActiveAction('mark-failed')}>
              Mark Failed
            </Button>
          )}
        </div>
      </div>

      <Card className="shadow-sm mb-4">
        <Card.Header><strong>Settlement Details</strong></Card.Header>
        <Card.Body>
          <Row>
            <Col sm={6}><small className="text-muted">Provider Name</small><p>{settlement.providerName}</p></Col>
            <Col sm={6}><small className="text-muted">Provider Email</small><p>{settlement.providerEmail}</p></Col>
            <Col sm={6}><small className="text-muted">Plan Name</small><p>{settlement.planName ?? '—'}</p></Col>
            <Col sm={6}><small className="text-muted">Settlement Type</small><p>{settlement.settlementType}</p></Col>
            <Col sm={6}><small className="text-muted">Currency</small><p>{settlement.currency}</p></Col>
            <Col sm={6}>
              <small className="text-muted">Total Amount</small>
              <p className="fw-bold fs-5">{formatCurrency(settlement.totalAmount, settlement.currency)}</p>
            </Col>
            <Col sm={6}><small className="text-muted">Period</small><p>{formatDate(settlement.periodStart)} — {formatDate(settlement.periodEnd)}</p></Col>
            <Col sm={6}><small className="text-muted">Created</small><p>{formatDateTime(settlement.createdOn)}</p></Col>
            {settlement.approvedAt && (
              <Col sm={6}><small className="text-muted">Approved At</small><p>{formatDateTime(settlement.approvedAt)}</p></Col>
            )}
            {settlement.approvedBy && (
              <Col sm={6}><small className="text-muted">Approved By</small><p>{settlement.approvedBy}</p></Col>
            )}
            {settlement.paidAt && (
              <Col sm={6}><small className="text-muted">Paid At</small><p>{formatDateTime(settlement.paidAt)}</p></Col>
            )}
            {settlement.failureReason && (
              <Col sm={12}><small className="text-muted">Failure Reason</small><p className="text-danger">{settlement.failureReason}</p></Col>
            )}
            {settlement.notes && (
              <Col sm={12}><small className="text-muted">Notes</small><p>{settlement.notes}</p></Col>
            )}
          </Row>
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Header><strong>Settlement Items</strong></Card.Header>
        <Card.Body>
          {items.length === 0 ? (
            <p className="text-muted mb-0">No items found.</p>
          ) : (
            <Table hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Booking Ref</th>
                  <th>Booking Amount</th>
                  <th>Commission %</th>
                  <th>Commission Amount</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={item.id}>
                    <td>{idx + 1}</td>
                    <td>{item.bookingRef}</td>
                    <td>{formatCurrency(item.bookingAmount, settlement.currency)}</td>
                    <td>{item.commissionPercentage}%</td>
                    <td>{formatCurrency(item.commissionAmount, settlement.currency)}</td>
                    <td>{item.description ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>


      {/* Mark Paid Dialog */}
      <ConfirmDialog
        show={activeAction === 'mark-paid'}
        title="Mark Settlement as Paid"
        message="Are you sure you want to mark this settlement as paid?"
        confirmLabel="Mark Paid"
        variant="primary"
        isLoading={isMarkingPaid}
        onConfirm={handleConfirm}
        onCancel={() => setActiveAction(null)}
      />

      {/* Mark Failed Dialog */}
      <ConfirmDialog
        show={activeAction === 'mark-failed'}
        title="Mark Settlement as Failed"
        message="Please provide a reason for marking this settlement as failed."
        confirmLabel="Mark Failed"
        variant="danger"
        isLoading={isMarkingFailed}
        onConfirm={handleConfirm}
        onCancel={() => { setActiveAction(null); setFailReason('') }}
      >
        <Form.Group>
          <Form.Label>Reason <span className="text-danger">*</span></Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={failReason}
            onChange={(e) => setFailReason(e.target.value)}
            placeholder="Enter failure reason..."
            required
          />
          {activeAction === 'mark-failed' && failReason.trim() === '' && (
            <Form.Text className="text-danger">Reason is required.</Form.Text>
          )}
        </Form.Group>
      </ConfirmDialog>
    </div>
  )
}
