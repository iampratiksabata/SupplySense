import { useState } from 'react'
import FileUpload from './components/FileUpload'
import Dashboard from './components/Dashboard'
import NetworkGraph from './components/NetworkGraph'
import Insights from './components/Insights'

function App() {
  const [data, setData] = useState<any>(null)

  const handleDataReceived = (uploadedData: any) => {
    setData(uploadedData)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">SupplySense</h1>
          <p className="mt-2 text-gray-600">Upload your supplier data to analyze performance and relationships</p>
        </div>

        {!data ? (
          <FileUpload onDataReceived={handleDataReceived} />
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
      </div>
    </div>
  )
}

export default App
