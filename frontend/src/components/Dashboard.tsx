import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

const Dashboard = ({ data }: DashboardProps) => {
  const metrics = [
    {
      label: 'Total Suppliers',
      value: data.total_suppliers,
      color: 'bg-blue-500',
      icon: '🏢'
    },
    {
      label: 'Total Orders',
      value: data.total_orders,
      color: 'bg-green-500',
      icon: '📦'
    },
    {
      label: 'Total Order Value',
      value: `$${data.total_order_value.toLocaleString()}`,
      color: 'bg-purple-500',
      icon: '💰'
    },
    {
      label: 'Total Loss',
      value: `$${data.supplier_metrics ? data.supplier_metrics.reduce((acc, s) => acc + (s.total_order_value * (1 - s.avg_quality_score)), 0).toLocaleString(undefined, {maximumFractionDigits: 0}) : 0}`,
      color: 'bg-red-500',
      icon: '💸'
    },
    {
      label: 'Avg Quality Score',
      value: `${(data.avg_quality_score * 100).toFixed(1)}%`,
      color: 'bg-yellow-500',
      icon: '⭐'
    },
    {
      label: 'On-Time Delivery Rate',
      value: `${(data.on_time_delivery_rate * 100).toFixed(1)}%`,
      color: 'bg-indigo-500',
      icon: '⏰'
    }
  ]

  // Prepare data for pie chart
  const pieData = [
    { name: 'On Time', value: data.on_time_delivery_rate * 100 },
    { name: 'Delayed', value: (1 - data.on_time_delivery_rate) * 100 }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Supply Chain Analytics</h2>
        <div className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-2xl">{metric.icon}</span>
              <div className={`w-2 h-2 rounded-full ${metric.color}`}></div>
            </div>
            <h3 className="mt-4 text-sm font-medium text-gray-500">{metric.label}</h3>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{metric.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Supplier Performance Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Supplier Performance</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.supplier_metrics.map(({supplier_id, avg_quality_score, on_time_delivery_rate}) => ({
                supplier_id, avg_quality_score, on_time_delivery_rate
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="supplier_id" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #f0f0f0',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="avg_quality_score" fill="#6366F1" name="Quality Score" radius={[4, 4, 0, 0]} />
                <Bar dataKey="on_time_delivery_rate" fill="#10B981" name="On-Time Rate" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Delivery Performance Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Performance</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #f0f0f0',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 