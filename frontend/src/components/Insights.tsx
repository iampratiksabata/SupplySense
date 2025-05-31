import { useEffect, useState } from 'react'

interface InsightsProps {
  data: {
    flakiest_suppliers: Array<{
      supplier_id: string
      anomaly_score: number
      delay_days: number
      quality_score: number
      order_value: number
    }>
    supplier_metrics: Array<{
      supplier_id: string
      total_orders: number
      avg_delay: number
      on_time_delivery_rate: number
      avg_quality_score: number
      total_order_value: number
    }>
  }
}

const Insights = ({ data }: InsightsProps) => {
  const generateInsights = () => {
    const insights = []

    // Analyze flakiest suppliers
    data.flakiest_suppliers.forEach(supplier => {
      const supplierMetrics = data.supplier_metrics.find(m => m.supplier_id === supplier.supplier_id)
      if (!supplierMetrics) return

      let insight = `Supplier ${supplier.supplier_id} shows concerning patterns: `
      const issues = []

      if (supplier.delay_days > 0) {
        issues.push(`average delay of ${supplier.delay_days} days`)
      }
      if (supplier.quality_score < 0.8) {
        issues.push(`quality score of ${(supplier.quality_score * 100).toFixed(1)}%`)
      }
      if (supplier.order_value > 100000) {
        issues.push(`high order value of $${supplier.order_value.toLocaleString()}`)
      }

      if (issues.length > 0) {
        insight += issues.join(', ') + '.'
        insights.push(insight)
      }
    })

    // Add general insights
    const avgQualityScore = data.supplier_metrics.reduce((acc, curr) => acc + curr.avg_quality_score, 0) / data.supplier_metrics.length
    const avgDelay = data.supplier_metrics.reduce((acc, curr) => acc + curr.avg_delay, 0) / data.supplier_metrics.length

    if (avgQualityScore < 0.85) {
      insights.push(`Overall quality score (${(avgQualityScore * 100).toFixed(1)}%) is below target. Consider implementing quality improvement programs.`)
    }

    if (avgDelay > 1) {
      insights.push(`Average delivery delay of ${avgDelay.toFixed(1)} days indicates potential supply chain issues. Review logistics processes.`)
    }

    return insights
  }

  const insights = generateInsights()

  return (
    <div className="space-y-4">
      {insights.map((insight, index) => (
        <div
          key={index}
          className="p-4 bg-indigo-50 rounded-lg border border-indigo-100"
        >
          <p className="text-indigo-700">{insight}</p>
        </div>
      ))}
    </div>
  )
}

export default Insights 