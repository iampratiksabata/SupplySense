import React, { useState, useRef, useEffect } from 'react'

interface Message {
  id: number
  sender: string
  text: string
}

interface ChatPageProps {
  csvText: string | null
}

const ChatPage = ({ csvText }: ChatPageProps) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = { id: messages.length + 1, sender: 'You', text: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, csv_data: csvText })
      })

      if (!response.ok) throw new Error('Failed to get response')
      
      const data = await response.json()
      const botMessage: Message = { 
        id: messages.length + 2, 
        sender: 'SupplySense AI', 
        text: data.response 
      }
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = { 
        id: messages.length + 2, 
        sender: 'System', 
        text: 'Sorry, I encountered an error. Please try again.' 
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  return (
    <div className="bg-gray-100 rounded-xl shadow w-full max-w-2xl mx-auto flex flex-col h-[36rem] border border-gray-200">
      <div className="flex-shrink-0 px-8 pt-8 pb-4 bg-gray-100 rounded-t-xl">
        <h2 className="text-2xl font-bold text-gray-900">Chat with SupplySense AI</h2>
        <p className="text-gray-500 text-sm mt-1">Ask anything about your supply chain, orders, or suppliers.</p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3 bg-gray-50">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`relative max-w-[75%] px-5 py-3 rounded-2xl shadow-sm text-base whitespace-pre-line
                ${msg.sender === 'You'
                  ? 'bg-blue-600 text-white rounded-br-md'
                  : msg.sender === 'SupplySense AI'
                    ? 'bg-white text-gray-900 border border-green-200 rounded-bl-md'
                    : 'bg-gray-200 text-gray-700 rounded-bl-md'}
              `}
            >
              <span className={`block text-xs mb-1 ${msg.sender === 'You' ? 'text-blue-200' : 'text-gray-400'}`}>{msg.sender}</span>
              <span className="block leading-relaxed">{msg.text}</span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="relative max-w-[75%] px-5 py-3 rounded-2xl shadow-sm text-base bg-gray-200 text-gray-700 rounded-bl-md">
              <span className="block text-xs mb-1 text-gray-400">SupplySense AI</span>
              <span className="block">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t border-gray-200 bg-white rounded-b-xl px-4 py-3 sticky bottom-0">
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about your supply chain..."
            disabled={isLoading}
            autoFocus
          />
          <button 
            type="submit" 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatPage 