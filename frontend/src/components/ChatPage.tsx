import React, { useState } from 'react'

const mockMessages = [
  { id: 1, sender: 'Alice', text: 'Hey team, any update on the last shipment?' },
  { id: 2, sender: 'Bob', text: 'Shipment is on track, should arrive tomorrow.' },
  { id: 3, sender: 'Carol', text: 'Received the invoice, thanks!' },
]

const ChatPage = () => {
  const [messages, setMessages] = useState(mockMessages)
  const [input, setInput] = useState('')

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    setMessages([...messages, { id: messages.length + 1, sender: 'You', text: input }])
    setInput('')
  }

  return (
    <div className="bg-white rounded-xl shadow p-8 w-full flex flex-col h-[32rem]">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Chat</h2>
      <div className="flex-1 overflow-y-auto mb-4 space-y-2">
        {messages.map(msg => (
          <div key={msg.id} className={`p-3 rounded-lg ${msg.sender === 'You' ? 'bg-blue-100 text-right ml-auto' : 'bg-gray-100 text-left mr-auto'} max-w-xs`}> 
            <span className="block text-xs text-gray-500 mb-1">{msg.sender}</span>
            <span className="block text-gray-900">{msg.text}</span>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">Send</button>
      </form>
    </div>
  )
}

export default ChatPage 