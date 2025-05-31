import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DashboardProps {
  data: {
    supplier_metrics: Array<{
      supplier_id: string
      total_orders: number
      avg_delay: number
      on_time_delivery_rate: number
      avg_quality_score: number
      total_order_value: number
    }>
    total_suppliers: number
    total_orders: number
    total_order_value: number
    avg_quality_score: number
    on_time_delivery_rate: number
  }
}

const Dashboard = ({ data }: DashboardProps) => {
  const metrics = [
    {
      label: 'Total Suppliers',
      value: data.total_suppliers,
      color: 'bg-blue-500'
    },
    {
      label: 'Total Orders',
      value: data.total_orders,
      color: 'bg-green-500'
    },
    {
      label: 'Total Order Value',
      value: `$${data.total_order_value.toLocaleString()}`,
      color: 'bg-purple-500'
    },
    {
      label: 'Avg Quality Score',
      value: `${(data.avg_quality_score * 100).toFixed(1)}%`,
      color: 'bg-yellow-500'
    },
    {
      label: 'On-Time Delivery Rate',
      value: `${(data.on_time_delivery_rate * 100).toFixed(1)}%`,
      color: 'bg-indigo-500'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500">{metric.label}</h3>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="h-80">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Supplier Performance</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.supplier_metrics}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="supplier_id" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="avg_quality_score" fill="#6366F1" name="Quality Score" />
            <Bar dataKey="on_time_delivery_rate" fill="#10B981" name="On-Time Rate" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default Dashboard 