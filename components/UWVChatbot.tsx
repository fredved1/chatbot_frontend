'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import { Components } from 'react-markdown/lib/ast-to-react'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

const API_URL = 'http://localhost:5001'

export default function UWVChatbot() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const startNewConversation = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/start-conversation`, { method: 'POST' })
      if (!response.ok) throw new Error('Network response was not ok')
      const data = await response.json()
      setMessages([{ role: 'assistant', content: data.message }])
    } catch (error) {
      console.error('Error starting new conversation:', error instanceof Error ? error.message : String(error))
      setMessages([{ role: 'assistant', content: 'Sorry, er is een fout opgetreden bij het starten van een nieuwe conversatie.' }])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    startNewConversation()
  }, [startNewConversation])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (input.trim() === '') return

    setIsLoading(true)
    setMessages(prev => [...prev, { role: 'user', content: input }])
    setInput('')

    try {
      const response = await fetch(`${API_URL}/api/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      })
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch (error) {
      console.error('Error sending message:', error instanceof Error ? error.message : String(error))
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, er is een fout opgetreden bij het verzenden van het bericht.' 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend()
    }
  }

  const getMessageClassName = (role: 'user' | 'assistant') => {
    const baseClass = "max-w-[75%] p-2 rounded-lg text-xs"
    return role === 'user' 
      ? `${baseClass} bg-[#007bc7] text-white` 
      : `${baseClass} bg-gray-200 text-[#333333]`
  }

  const components: Components = {
    p: ({ children }) => <p className="mb-1">{children}</p>,
    ul: ({ children }) => <ul className="list-disc pl-4 mb-1">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal pl-4 mb-1">{children}</ol>,
    li: ({ children }) => <li className="mb-0.5">{children}</li>,
    a: ({ href, children }) => (
      <a href={href} className="text-blue-600 hover:underline">{children}</a>
    ),
    h1: ({ children }) => <h1 className="text-sm font-bold mb-1">{children}</h1>,
    h2: ({ children }) => <h2 className="text-xs font-bold mb-1">{children}</h2>,
    h3: ({ children }) => <h3 className="text-xs font-semibold mb-1">{children}</h3>,
    code: ({ inline, className, children }) => {
      if (inline) {
        return <code className="bg-gray-100 rounded px-0.5">{children}</code>
      }
      return (
        <pre className="block bg-gray-100 rounded p-1 mb-1 text-[10px]">
          <code className={className}>{children}</code>
        </pre>
      )
    }
  }

  return (
    <div className="flex flex-col h-screen max-h-[600px] w-full sm:max-w-md mx-auto bg-gray-100 shadow-lg rounded-lg overflow-hidden">
      <header className="bg-[#007bc7] text-white p-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Image src="/uwv-logo.png" alt="UWV Logo" width={20} height={20} className="mr-2" />
            <h1 className="text-base font-bold">UWV Chatbot</h1>
          </div>
          <button
            onClick={startNewConversation}
            className="bg-white text-[#007bc7] border border-[#007bc7] hover:bg-[#e6f2ff] px-2 py-1 rounded text-xs"
          >
            Nieuw
          </button>
        </div>
      </header>
      <main className="flex-grow overflow-auto p-2 min-h-0">
        <div className="space-y-2">
          {messages.map((message, index) => (
            <div key={index} className={`flex items-start ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={getMessageClassName(message.role)}>
                <ReactMarkdown components={components}>
                  {message.content}
                </ReactMarkdown>
                {/* Alternative ReactMarkdown usage */}
                <ReactMarkdown>{message.content}</ReactMarkdown>
                {// eslint-disable-next-line 
                }<ReactMarkdown key={index} children={[message.content]} />
              </div>
            </div>
          ))}
        </div>
        <div ref={messagesEndRef} />
      </main>
      <footer className="bg-white p-2 border-t border-gray-200 flex-shrink-0">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Typ uw vraag hier..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-grow border border-[#007bc7] p-1 rounded text-xs text-black"
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="bg-[#007bc7] text-white hover:bg-[#005b9e] px-2 py-1 rounded disabled:opacity-50 text-xs"
          >
            {isLoading ? '...' : 'Zend'}
          </button>
        </div>
      </footer>
    </div>
  )
}