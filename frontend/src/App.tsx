import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import LandingPage from './components/LandingPage'
import Dashboard from './components/Dashboard'
import NetworkGraph from './components/NetworkGraph'
import Insights from './components/Insights'

function App() {
  const [data, setData] = useState<any>(null)

  const handleDataReceived = (uploadedData: any) => {
    setData(uploadedData)
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 md:p-10">
          {!data ? (
            <LandingPage onDataReceived={handleDataReceived} />
          ) : (
            <div className="space-y-8">
              <Dashboard data={data} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Supplier Network</h2>
                  <NetworkGraph data={data} />
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Insights</h2>
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
          )}
        </main>
      </div>
    </div>
  )
}

export default App
