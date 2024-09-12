'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

const API_URL = 'https://uwvchatbot-f850ea49bdeb.herokuapp.com'

export default function UWVChatbot() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [models, setModels] = useState<string[]>([])
  const [selectedModel, setSelectedModel] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    startNewConversation()
    fetchAvailableModels()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchAvailableModels = async () => {
    try {
      const response = await fetch(`${API_URL}/api/available-models`)
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const data = await response.json()
      setModels(data.models)
      if (data.models.length > 0) {
        setSelectedModel(data.models[0])
      }
    } catch (error) {
      console.error('Error fetching available models:', error)
    }
  }

  const startNewConversation = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/start-conversation`, { method: 'POST' })
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const data = await response.json()
      setMessages([{ role: 'assistant', content: data.message }])
    } catch (error) {
      console.error('Error starting new conversation:', error)
      setMessages([{ role: 'assistant', content: 'Sorry, er is een fout opgetreden bij het starten van een nieuwe conversatie.' }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSend = async () => {
    if (input.trim() === '') return

    setIsLoading(true)
    setMessages(prev => [...prev, { role: 'user', content: input }])
    setInput('')

    try {
      const response = await fetch(`${API_URL}/api/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      })
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, er is een fout opgetreden.' }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectModel = async (model: string) => {
    try {
      const response = await fetch(`${API_URL}/api/select-model`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model }),
      })
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      setSelectedModel(model)
    } catch (error) {
      console.error('Error selecting model:', error)
    }
  }

  const handleClearMemory = async () => {
    try {
      const response = await fetch(`${API_URL}/api/clear-memory`, { method: 'POST' })
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      setMessages([{ role: 'assistant', content: 'Geheugen is gewist. Hoe kan ik u verder helpen?' }])
    } catch (error) {
      console.error('Error clearing memory:', error)
    }
  }

  return (
    <div className="flex flex-col h-screen sm:h-[700px] w-full sm:max-w-md mx-auto bg-gray-100 shadow-lg rounded-lg overflow-hidden">
      <header className="bg-[#007bc7] text-white p-2 sm:p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Image 
              src="/uwv-logo.png" 
              alt="UWV Logo" 
              width={20} 
              height={20} 
              className="mr-2 sm:w-6 sm:h-6"
            />
            <h1 className="text-base sm:text-lg font-bold">UWV Chatbot</h1>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <select
              value={selectedModel}
              onChange={(e) => handleSelectModel(e.target.value)}
              className="bg-white text-[#007bc7] border border-[#007bc7] rounded p-1 text-xs sm:text-sm"
            >
              {models.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
            <button
              onClick={startNewConversation}
              className="bg-white text-[#007bc7] border border-[#007bc7] hover:bg-[#e6f2ff] px-1 py-1 rounded text-xs sm:text-sm"
            >
              Nieuw
            </button>
            <button
              onClick={handleClearMemory}
              className="bg-white text-[#007bc7] border border-[#007bc7] hover:bg-[#e6f2ff] px-1 py-1 rounded text-xs sm:text-sm"
            >
              Wis
            </button>
          </div>
        </div>
      </header>
      <main className="flex-grow overflow-auto p-2 sm:p-3">
        <div className="space-y-2 sm:space-y-3">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 mr-1 sm:mr-2">
                  <Image
                    src="/ai-icon.png"
                    alt="AI"
                    width={20}
                    height={20}
                    className="rounded-full sm:w-6 sm:h-6"
                  />
                </div>
              )}
              <div
                className={`max-w-[75%] p-2 rounded-lg text-sm ${
                  message.role === 'user'
                    ? 'bg-[#007bc7] text-white'
                    : 'bg-gray-200 text-[#333333]'
                }`}
              >
                {message.content}
              </div>
              {message.role === 'user' && (
                <div className="flex-shrink-0 ml-1 sm:ml-2">
                  <Image
                    src="/user-icon.png"
                    alt="User"
                    width={20}
                    height={20}
                    className="rounded-full sm:w-6 sm:h-6"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        <div ref={messagesEndRef} />
      </main>
      <footer className="bg-white p-2 sm:p-3 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Typ uw vraag hier..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-grow border border-[#007bc7] p-1 sm:p-2 rounded text-sm"
            style={{ color: 'black' }}
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="bg-[#007bc7] text-white hover:bg-[#005b9e] px-2 py-1 rounded disabled:opacity-50 text-sm"
          >
            {isLoading ? '...' : 'Zend'}
          </button>
        </div>
      </footer>
    </div>
  )
}