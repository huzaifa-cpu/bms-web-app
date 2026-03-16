import { useState } from 'react'
import { Card, Form, Button, Row, Col, Table, Dropdown } from 'react-bootstrap'
import { BsDownload, BsBarChart, BsFiletypeCsv, BsFiletypePdf } from 'react-icons/bs'
import { toast } from 'react-toastify'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import RbacService from '../../../core/services/rbac_service'
import { Loader } from '../../../core/ui/components/loader'
import { useLazyGenerateReportQuery } from '../api/reports_api'
import type { ReportDataDto } from '../api/reports_types'

function downloadCsv(report: ReportDataDto) {
  if (!report.rows.length) return
  const headers = Object.keys(report.rows[0])
  const csvRows = [headers.join(',')]
  for (const row of report.rows) {
    csvRows.push(headers.map(h => String(row[h] ?? '')).join(','))
  }
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${report.reportType}-report-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function downloadPdf(report: ReportDataDto) {
  if (!report.rows.length) return

  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // Title
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(`${report.reportType.toUpperCase()} REPORT`, pageWidth / 2, 20, { align: 'center' })

  // Generated date
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Generated: ${new Date(report.generatedAt).toLocaleString()}`, pageWidth / 2, 28, { align: 'center' })

  // Summary Section
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Summary', 14, 40)

  const summaryEntries = Object.entries(report.summary)
  let yPos = 48
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  summaryEntries.forEach(([key, value]) => {
    const formattedKey = key.replace(/([A-Z])/g, ' $1').trim()
    doc.text(`${formattedKey}: ${String(value)}`, 14, yPos)
    yPos += 8
  })

  // Details Table
  if (report.rows.length > 0) {
    const headers = Object.keys(report.rows[0])
    const tableData = report.rows.map(row => headers.map(h => String(row[h] ?? '')))

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Details', 14, yPos + 10)

    autoTable(doc, {
      startY: yPos + 16,
      head: [headers.map(h => h.charAt(0).toUpperCase() + h.slice(1))],
      body: tableData,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [66, 139, 202], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 14, right: 14 },
    })
  }

  doc.save(`${report.reportType}-report-${new Date().toISOString().split('T')[0]}.pdf`)
}

export default function ReportsPage() {
  const canExport = RbacService.can('REPORTS', 'EXPORT')
  const [reportType, setReportType] = useState('')
  const [trigger, { data, isLoading, error }] = useLazyGenerateReportQuery()

  const report = data?.data

  const handleGenerate = async () => {
    if (!reportType) {
      toast.error('Please select a report type.')
      return
    }
    try {
      await trigger({ reportType }).unwrap()
      toast.success('Report generated successfully.')
    } catch {
      toast.error('Failed to generate report.')
    }
  }

  return (
    <div>
      <h4 className="fw-bold mb-4">Reports</h4>
      <Card className="shadow-sm mb-4" style={{ maxWidth: 640 }}>
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Label>Report Type</Form.Label>
            <Form.Select value={reportType} onChange={e => setReportType(e.target.value)}>
              <option value="">Select a report type...</option>
              <option value="bookings">Bookings Report</option>
              <option value="disputes">Disputes Report</option>
              <option value="providers">Providers Report</option>
              <option value="consumers">Consumers Report</option>
            </Form.Select>
          </Form.Group>
          {canExport ? (
            <Button variant="primary" onClick={handleGenerate} disabled={isLoading || !reportType}>
              {isLoading ? 'Generating...' : <><BsBarChart className="me-2" />Generate Report</>}
            </Button>
          ) : (
            <p className="text-muted small">You do not have permission to export reports.</p>
          )}
        </Card.Body>
      </Card>

      {isLoading && <Loader />}
      {error && <p className="text-danger">Failed to generate report.</p>}

      {report && (
        <>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-transparent d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-bold">Summary — {report.reportType}</h6>
              <Dropdown>
                <Dropdown.Toggle variant="outline-success" size="sm">
                  <BsDownload className="me-1" />Download
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => downloadCsv(report)}>
                    <BsFiletypeCsv className="me-2" />Download CSV
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => downloadPdf(report)}>
                    <BsFiletypePdf className="me-2" />Download PDF
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                {Object.entries(report.summary).map(([key, value]) => (
                  <Col sm={3} key={key}>
                    <div className="text-center p-3 border rounded">
                      <div className="text-muted small text-capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                      <div className="fw-bold fs-4">{String(value)}</div>
                    </div>
                  </Col>
                ))}
              </Row>
              <small className="text-muted d-block mt-3">Generated at: {new Date(report.generatedAt).toLocaleString()}</small>
            </Card.Body>
          </Card>

          {report.rows.length > 0 && (
            <Card className="shadow-sm">
              <Card.Header className="bg-transparent">
                <h6 className="mb-0 fw-bold">Details</h6>
              </Card.Header>
              <Card.Body className="p-0">
                <Table hover responsive className="mb-0">
                  <thead>
                    <tr>
                      {Object.keys(report.rows[0]).map(h => (
                        <th key={h} className="text-capitalize">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {report.rows.map((row, idx) => (
                      <tr key={idx}>
                        {Object.values(row).map((val, i) => (
                          <td key={i}>{String(val)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
