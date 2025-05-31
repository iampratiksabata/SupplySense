import React from 'react'

const users = [
  { id: 1, name: 'Alice Smith', role: 'Procurement Manager', email: 'alice@company.com' },
  { id: 2, name: 'Bob Johnson', role: 'Supplier', email: 'bob@supplier.com' },
  { id: 3, name: 'Carol Lee', role: 'Logistics', email: 'carol@logistics.com' },
]

const UsersPage = () => (
  <div className="bg-white rounded-xl shadow p-8 w-full">
    <h2 className="text-2xl font-bold mb-6 text-gray-900">Users</h2>
    <table className="min-w-full divide-y divide-gray-200">
      <thead>
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {users.map(user => (
          <tr key={user.id}>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.role}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

export default UsersPage 