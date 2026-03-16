export interface ReportDataDto {
  reportType: string
  startDate?: string
  endDate?: string
  generatedAt: string
  summary: Record<string, number | string>
  rows: Record<string, number | string>[]
}
