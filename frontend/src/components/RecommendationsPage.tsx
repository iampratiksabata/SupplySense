import React, { useState, useEffect } from 'react'

interface Recommendation {
  id: number
  type: 'danger' | 'warning' | 'info'
  title: string
  message: string
  recommendation: string
}

interface RecommendationsPageProps {
  data?: any
}

const staticRecommendations: Recommendation[] = [
  {
    id: 1,
    type: 'danger',
    title: 'Supplier Optimization',
    message: 'Supplier X is 23% late on orders >$10k. Split large orders across X and Y, or switch to Z for orders >$5k',
    recommendation: 'Split large orders or switch suppliers for high-value orders.'
  },
  {
    id: 2,
    type: 'warning',
    title: 'Diversification Suggestions',
    message: '82% of your Widget supply comes from Region A. Add suppliers from Region B to reduce geo-risk',
    recommendation: 'Add suppliers from Region B to reduce geo-risk.'
  },
  {
    id: 3,
    type: 'info',
    title: 'Order Timing',
    message: 'Supplier Y performs 30% better on Tuesday deliveries. Adjust order schedule.',
    recommendation: 'Adjust order schedule to optimize for supplier performance.'
  },
  {
    id: 4,
    type: 'warning',
    title: 'Quality Improvements',
    message: "Supplier Z's quality drops after 1000 units/month. Cap orders or negotiate capacity expansion",
    recommendation: 'Cap orders or negotiate capacity expansion with Supplier Z.'
  },
]

const typeStyles = {
  danger: 'border-red-300 bg-red-50',
  warning: 'border-yellow-300 bg-yellow-50',
  info: 'border-blue-300 bg-blue-50',
}

const typeIcons = {
  danger: (
    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" /></svg>
  ),
  warning: (
    <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" /></svg>
  ),
  info: (
    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" /></svg>
  ),
}

const RecommendationsPage = ({ data }: RecommendationsPageProps) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dismissed, setDismissed] = useState<number[]>([])
  const [sort, setSort] = useState('Severity')
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    if (!data) {
      setRecommendations(staticRecommendations)
      return
    }
    setLoading(true)
    setError(null)
    fetch('http://localhost:8000/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch recommendations')
        return res.json()
      })
      .then((recs: Recommendation[]) => setRecommendations(recs))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [data])

  // Filtering logic
  const filterMap: Record<string, string[]> = {
    All: [],
    Optimization: ['optimization'],
    Diversification: ['diversification'],
    Timing: ['timing', 'schedule'],
    Quality: ['quality'],
  }
  const filteredRecs = recommendations.filter(r => {
    if (dismissed.includes(r.id)) return false
    if (filter === 'All') return true
    const keywords = filterMap[filter] || []
    return keywords.some(kw => r.title.toLowerCase().includes(kw))
  })

  // Sorting logic
  const severityOrder = { danger: 0, warning: 1, info: 2 }
  let sortedRecs = [...filteredRecs]
  if (sort === 'Severity') {
    sortedRecs.sort((a, b) => severityOrder[a.type] - severityOrder[b.type])
  } else if (sort === 'Type') {
    sortedRecs.sort((a, b) => a.title.localeCompare(b.title))
  }

  if (loading) return <div className="w-full max-w-3xl mx-auto py-8 text-center text-gray-500">Loading recommendations...</div>
  if (error) return <div className="w-full max-w-3xl mx-auto py-8 text-center text-red-500">{error}</div>
  if (!recommendations.length) return <div className="w-full max-w-3xl mx-auto py-8 text-center text-gray-500">No recommendations available.</div>

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
        {sortedRecs.map(rec => (
          <div
            key={rec.id}
            className={`relative flex flex-col md:flex-row items-stretch bg-white rounded-2xl shadow border-l-8 p-6 md:p-8 gap-4 ${
              rec.type === 'danger' ? 'border-l-red-500' : rec.type === 'warning' ? 'border-l-yellow-400' : 'border-l-blue-500'
            }`}
          >
            <div className="flex flex-col items-center mr-4 mt-1">
              <span className={`rounded-full p-2 ${
                rec.type === 'danger' ? 'bg-red-100' : rec.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
              }`}>{typeIcons[rec.type as keyof typeof typeIcons]}</span>
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-semibold text-lg ${
                    rec.type === 'danger' ? 'text-red-600' : rec.type === 'warning' ? 'text-yellow-700' : 'text-blue-600'
                  }`}>{rec.title}</span>
                </div>
                <div className="text-gray-700 mb-3 text-base">{rec.message}</div>
                <div className="font-semibold text-gray-900 mb-1">Recommendation</div>
                <div className="text-gray-700 mb-2">{rec.recommendation}</div>
              </div>
              <div className="flex flex-row justify-end gap-2 mt-4">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">View Details</button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors" onClick={() => setDismissed([...dismissed, rec.id])}>Dismiss</button>
              </div>
            </div>
            <div className="hidden md:flex items-center justify-center w-28 h-20 ml-4">
              {/* Placeholder for chart/graphic */}
              <svg width="80" height="40" viewBox="0 0 80 40" fill="none"><rect x="0" y="0" width="80" height="40" rx="8" fill="#F3F4F6"/><path d="M10 30 Q 20 10, 30 20 T 50 25 T 70 10" stroke="#2563EB" strokeWidth="2" fill="none"/></svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RecommendationsPage 