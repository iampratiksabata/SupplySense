import React, { useState, useEffect } from 'react'

interface Recommendation {
  id: string
  title: string
  description: string
  recommendation: string
  severity: 'critical' | 'warning' | 'info'
  category: string
  impact_score: number
  effort_score: number
  estimated_savings: string
  timeline: string
  metrics: {
    current_value: string
    target_value: string
    improvement: string
  }
  tags: string[]
  risk_level: string
  implementation_complexity: string
  department: string
  priority: string
}

interface SupplierAnalysis {
  underperforming_suppliers: Array<{
    supplier_id: string
    issues: string[]
    performance_metrics: {
      quality_score: number
      on_time_rate: number
      total_orders: number
      total_value: number
    }
    risk_level: string
    recommended_actions: string[]
  }>
  verified_suppliers: Array<{
    supplier_id: string
    strengths: string[]
    performance_metrics: {
      quality_score: number
      on_time_rate: number
      total_orders: number
      total_value: number
    }
    reliability_score: number
    recommended_usage: string[]
  }>
}

interface RecommendationsPageProps {
  data: {
    recommendations: Recommendation[]
    supplier_analysis: SupplierAnalysis
    total_count: number
    categories: string[]
    departments: string[]
    severity_counts: {
      critical: number
      warning: number
      info: number
    }
    priority_counts: {
      p0: number
      p1: number
      p2: number
    }
    risk_distribution: {
      high: number
      medium: number
      low: number
    }
  } | null
}

const typeStyles = {
  critical: 'border-red-300 bg-red-50',
  warning: 'border-yellow-300 bg-yellow-50',
  info: 'border-blue-300 bg-blue-50',
}

const typeIcons = {
  critical: (
    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" /></svg>
  ),
  warning: (
    <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" /></svg>
  ),
  info: (
    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" /></svg>
  ),
}

// Helper for severity-based styles
const severityStyles = {
  high: {
    bg: 'bg-red-50',
    border: 'border-red-400',
    text: 'text-red-900',
    badge: 'bg-red-500 text-white',
    tag: 'bg-red-100 text-red-700',
  },
  medium: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-400',
    text: 'text-yellow-900',
    badge: 'bg-yellow-500 text-white',
    tag: 'bg-yellow-100 text-yellow-700',
  },
  low: {
    bg: 'bg-blue-50',
    border: 'border-blue-400',
    text: 'text-blue-900',
    badge: 'bg-blue-500 text-white',
    tag: 'bg-blue-100 text-blue-700',
  },
}

// Helper for reliability-based styles for verified suppliers
const reliabilityStyles = {
  high: {
    bg: 'bg-green-50',
    border: 'border-green-400',
    text: 'text-green-900',
    badge: 'bg-green-500 text-white',
    tag: 'bg-green-100 text-green-700',
  },
  medium: {
    bg: 'bg-blue-50',
    border: 'border-blue-400',
    text: 'text-blue-900',
    badge: 'bg-blue-500 text-white',
    tag: 'bg-blue-100 text-blue-700',
  },
  low: {
    bg: 'bg-blue-50',
    border: 'border-blue-400',
    text: 'text-blue-900',
    badge: 'bg-blue-500 text-white',
    tag: 'bg-blue-100 text-blue-700',
  },
}

const RecommendationsPage = ({ data }: RecommendationsPageProps) => {
  const [dismissed, setDismissed] = useState<number[]>([])
  const [sort, setSort] = useState('Severity')
  const [filter, setFilter] = useState('All')
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (data) {
      setIsLoading(false)
    }
  }, [data])

  if (isLoading) {
    return (
      <div className="w-full max-w-3xl mx-auto py-8">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"></div>
          <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
        <p className="text-center text-gray-600 mt-4">Loading recommendations...</p>
      </div>
    )
  }

  if (!data?.recommendations?.length) return <div className="w-full max-w-3xl mx-auto py-8 text-center text-gray-500">No recommendations available.</div>

  // Filtering logic (optional, can be expanded)
  const filteredRecs = data.recommendations.filter((r, idx) => !dismissed.includes(idx))

  // Sorting logic
  const severityOrder = { critical: 0, warning: 1, info: 2 }
  let sortedRecs = [...filteredRecs]
  if (sort === 'Severity') {
    sortedRecs.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
  } else if (sort === 'Type') {
    sortedRecs.sort((a, b) => a.title.localeCompare(b.title))
  }

  return (
    <div className="w-full max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">AI Insights & Recommendations</h1>
      <div className="flex gap-4 mb-6">
        <div>
          <label className="text-sm font-medium text-gray-700 mr-2">Sort by:</label>
          <select className="border rounded px-2 py-1" value={sort} onChange={e => setSort(e.target.value)} style={{ backgroundColor: 'unset', borderRadius: '10px' }}>
            <option>Severity</option>
            <option>Type</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mr-2">Filter:</label>
          <select className="border rounded px-2 py-1" value={filter} onChange={e => setFilter(e.target.value)} style={{ backgroundColor: 'unset', borderRadius: '10px' }}>
            <option>All</option>
            <option>Optimization</option>
            <option>Diversification</option>
            <option>Timing</option>
            <option>Quality</option>
          </select>
        </div>
      </div>
      <div className="space-y-6">
        {sortedRecs.map((rec, idx) => (
          <div
            key={idx}
            className={`relative flex flex-col md:flex-row items-stretch bg-white rounded-2xl shadow border-l-8 p-6 md:p-8 gap-4 ${
              rec.severity === 'critical' ? 'border-l-red-500' : rec.severity === 'warning' ? 'border-l-yellow-400' : 'border-l-blue-500'
            }`}
          >
            <div className="flex flex-col items-center mr-4 mt-1">
              <span className={`rounded-full p-2 ${
                rec.severity === 'critical' ? 'bg-red-100' : rec.severity === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
              }`}>{typeIcons[rec.severity]}</span>
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-semibold text-lg ${
                    rec.severity === 'critical' ? 'text-red-600' : rec.severity === 'warning' ? 'text-yellow-700' : 'text-blue-600'
                  }`}>{rec.title}</span>
                </div>
                <div className="text-gray-700 mb-3 text-base">{rec.description}</div>
                <div className="font-semibold text-gray-900 mb-1">Recommendation</div>
                <div className="text-gray-700 mb-2">{rec.recommendation}</div>
              </div>
              <div className="flex flex-row justify-end gap-2 mt-4">
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  onClick={() => setSelectedRec(rec)}
                >
                  View Details
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors" onClick={() => setDismissed([...dismissed, idx])}>Dismiss</button>
              </div>
            </div>
            <div className="hidden md:flex items-center justify-center w-28 h-20 ml-4">
              {/* Placeholder for chart/graphic */}
              <svg width="80" height="40" viewBox="0 0 80 40" fill="none"><rect x="0" y="0" width="80" height="40" rx="8" fill="#F3F4F6"/><path d="M10 30 Q 20 10, 30 20 T 50 25 T 70 10" stroke="#2563EB" strokeWidth="2" fill="none"/></svg>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedRec && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-gray-900">{selectedRec.title}</h2>
              <button 
                onClick={() => setSelectedRec(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700">{selectedRec.description}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Recommendation</h3>
                <p className="text-gray-700">{selectedRec.recommendation}</p>
              </div>

              {selectedRec.metrics && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Metrics</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-500">Current Value</div>
                      <div className="font-medium">{selectedRec.metrics.current_value}</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-500">Target Value</div>
                      <div className="font-medium">{selectedRec.metrics.target_value}</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-500">Improvement</div>
                      <div className="font-medium">{selectedRec.metrics.improvement}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Underperforming Suppliers Section */}
              {data.supplier_analysis.underperforming_suppliers && data.supplier_analysis.underperforming_suppliers.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Underperforming Suppliers</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.supplier_analysis.underperforming_suppliers.map((supplier) => {
                      const sev = supplier.risk_level === 'high' ? 'high' : supplier.risk_level === 'medium' ? 'medium' : 'low'
                      const style = severityStyles[sev]
                      return (
                        <div
                          key={supplier.supplier_id}
                          className={`${style.bg} ${style.border} border-2 rounded-xl shadow-lg hover:shadow-xl transition-shadow`}
                        >
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <span className={`font-bold text-lg ${style.text}`}>{supplier.supplier_id}</span>
                                <span className={`px-2 py-0.5 text-xs rounded-full font-semibold uppercase tracking-wide ${style.badge}`}>{supplier.risk_level}</span>
                              </div>
                              <div className="text-sm font-semibold text-gray-700">
                                {(supplier.performance_metrics.quality_score * 100).toFixed(1)}% <span className="font-normal text-gray-400">Quality</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1 mb-1">
                              {supplier.issues.map((issue, idx) => (
                                <span key={idx} className={`px-2 py-0.5 rounded-full text-xs font-medium ${style.tag}`}>{issue}</span>
                              ))}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {supplier.recommended_actions.map((action, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-white text-gray-700 border border-gray-200 rounded-full text-xs font-medium">
                                  {action}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Verified Suppliers Section */}
              {data.supplier_analysis.verified_suppliers && data.supplier_analysis.verified_suppliers.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Recommended Suppliers</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.supplier_analysis.verified_suppliers.map((supplier) => {
                      let rel: 'high' | 'medium' | 'low' = 'high'
                      if (supplier.reliability_score < 0.9) rel = 'medium'
                      if (supplier.reliability_score < 0.7) rel = 'low'
                      const style = reliabilityStyles[rel]
                      return (
                        <div
                          key={supplier.supplier_id}
                          className={`${style.bg} ${style.border} border-2 rounded-xl shadow-lg hover:shadow-xl transition-shadow`}
                        >
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <span className={`font-bold text-lg ${style.text}`}>{supplier.supplier_id}</span>
                                <span className={`px-2 py-0.5 text-xs rounded-full font-semibold uppercase tracking-wide ${style.badge}`}>{(supplier.reliability_score * 100).toFixed(0)}%</span>
                              </div>
                              <div className="text-sm font-semibold text-gray-700">
                                {(supplier.performance_metrics.quality_score * 100).toFixed(1)}% <span className="font-normal text-gray-400">Quality</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1 mb-1">
                              {supplier.strengths.map((strength, idx) => (
                                <span key={idx} className={`px-2 py-0.5 rounded-full text-xs font-medium ${style.tag}`}>{strength}</span>
                              ))}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {supplier.recommended_usage.map((usage, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-white text-gray-700 border border-gray-200 rounded-full text-xs font-medium">
                                  {usage}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Onboarding Section */}
                  <div className="mt-8 bg-black rounded-2xl border border-gray-900 p-8 flex flex-col items-center shadow-lg">
                    <button
                      onClick={() => console.log('Onboard suppliers')}
                      className="px-6 py-2 bg-black text-white rounded-lg font-semibold flex items-center gap-2 border border-white hover:bg-gray-900 transition-colors shadow"
                    >
                      Onboard Verified Suppliers
                      <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-white text-black font-bold uppercase">Beta</span>
                    </button>
                    <p className="text-white text-sm mt-3">This feature is currently in beta. Onboarding may take up to 48 hours.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RecommendationsPage