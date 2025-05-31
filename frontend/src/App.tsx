import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import LandingPage from './components/LandingPage'
import Dashboard from './components/Dashboard'
import NetworkGraph from './components/NetworkGraph'
import Insights from './components/Insights'
import RecommendationsPage from './components/RecommendationsPage'
import ChatPage from './components/ChatPage'

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

interface RecommendationsData {
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
}

function App() {
  const [data, setData] = useState<any>(null)
  const [csvText, setCsvText] = useState<string | null>(null)
  const [aiRecs, setAiRecs] = useState<RecommendationsData | null>(null)

  const handleDataReceived = async (uploadedData: any, csvText?: string) => {
    setData(uploadedData)
    setCsvText(csvText || null)
    // Call /recommendation endpoint
    if (uploadedData && csvText) {
      try {
        const res = await fetch('http://localhost:8000/recommendation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ analyze_result: uploadedData, csv_data: csvText })
        })
        if (!res.ok) throw new Error('Failed to fetch AI recommendations')
        const recs = await res.json()
        setAiRecs(recs)
      } catch (err) {
        console.error('Error fetching recommendations:', err)
        setAiRecs(null)
      }
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col items-center justify-center" style={{ width: '86vw' }}>
        {/* <Header /> */}
        <main className="flex-1 p-6 md:p-10 w-full max-w-7xl">
          <Routes>
            <Route path="/" element={<LandingPage onDataReceived={handleDataReceived} />} />
            <Route path="/dashboard" element={data ? (
              <div className="space-y-8">
                <Dashboard data={data} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Supplier Network</h2>
                    <NetworkGraph data={data} />
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Outliers</h2>
                    <Insights data={data} />
                  </div>
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={() => setData(null)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Upload New File
                  </button>
                </div>
              </div>
            ) : <LandingPage onDataReceived={handleDataReceived} />} />

            <Route path="/insights" element={<RecommendationsPage data={aiRecs} />} />
            <Route path="/chat" element={<ChatPage csvText={csvText} />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App