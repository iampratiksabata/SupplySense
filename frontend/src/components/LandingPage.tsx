import React from 'react'
import FileUpload from './FileUpload'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface LandingPageProps {
  onDataReceived: (data: any) => void
}

const sampleStats = {
  totalSuppliers: 10,
  avgOnTimeRate: 0.82
}

const deliveryTrend = [
  { month: 'Jan', rate: 62 },
  { month: 'Feb', rate: 65 },
  { month: 'Mar', rate: 68 },
  { month: 'Apr', rate: 70 },
  { month: 'May', rate: 78 },
  { month: 'Jun', rate: 75 }
]

const qualityDist = [
  { range: '0–20', value: 50 },
  { range: '20–40', value: 120 },
  { range: '40–60', value: 180 },
  { range: '60–80', value: 220 },
  { range: '80–100', value: 170 }
]

const LandingPage = ({ onDataReceived }: LandingPageProps) => {
  return (
    <div className="w-full h-full p-0 md:p-6 flex flex-col gap-8">
      <div className="bg-white rounded-2xl shadow p-4 md:p-8 mb-0 w-full">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-4 w-full">Upload Your Data</h1>
        <div className="w-full">
          <FileUpload onDataReceived={onDataReceived} />
          <div className="flex w-full justify-center">
            <a href="#" className="text-blue-600 hover:underline text-sm mt-4">Learn about CSV format</a>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 w-full">
        <div className="bg-white rounded-xl shadow p-4 md:p-6 w-full">
          <div className="text-gray-500 text-sm mb-1">Total Suppliers</div>
          <div className="text-3xl md:text-4xl font-bold text-gray-900">{sampleStats.totalSuppliers}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 md:p-6 w-full">
          <div className="text-gray-500 text-sm mb-1">Avg On-Time Rate</div>
          <div className="text-3xl md:text-4xl font-bold text-gray-900">{Math.round(sampleStats.avgOnTimeRate * 100)}%</div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full flex-1">
        <div className="bg-white rounded-xl shadow p-4 md:p-6 w-full h-full flex flex-col">
          <div className="font-semibold text-gray-900 mb-2">On-Time Delivery Trend <span className="text-xs text-gray-400">(Sample)</span></div>
          <div className="h-48 md:h-56 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={deliveryTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[60, 100]} tickFormatter={v => `${v}%`} />
                <Tooltip />
                <Line type="monotone" dataKey="rate" stroke="#2563EB" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 md:p-6 w-full h-full flex flex-col">
          <div className="font-semibold text-gray-900 mb-2">Quality Score Distribution <span className="text-xs text-gray-400">(Sample)</span></div>
          <div className="h-48 md:h-56 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={qualityDist}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#60A5FA" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage 