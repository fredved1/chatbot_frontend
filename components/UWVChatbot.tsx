/* eslint-disable */
'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'

// ... rest of your component code ...

type Message = {
  role: 'user' | 'assistant'
  content: string
}

//const API_URL = 'http://localhost:5001'
const API_URL = 'https://uwvchatbot-f850ea49bdeb.herokuapp.com/'
const defaultMarkdown = 'No content available.'

export default function UWVChatbot() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    startNewConversation()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const startNewConversation = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/start-conversation`, { method: 'POST' })
      if (!response.ok) throw new Error('Network response was not ok')
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      })
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, er is een fout opgetreden bij het verzenden van het bericht.' 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const MarkdownRenderer = (props: { className?: string, markdown?: string }) => {
    const components: Components = {
      p: ({ children, ...props }) => <p className="mb-2" {...props}>{children}</p>,
      ul: ({ children, ...props }) => <ul className="list-disc pl-4 mb-2" {...props}>{children}</ul>,
      ol: ({ children, ...props }) => <ol className="list-decimal pl-4 mb-2" {...props}>{children}</ol>,
      li: ({ children, ...props }) => <li className="mb-1" {...props}>{children}</li>,
      a: ({ href, children, ...props }) => <a href={href} className="text-blue-600 hover:underline" {...props}>{children}</a>,
      h1: ({ children, ...props }) => <h1 className="text-lg font-bold mb-2" {...props}>{children}</h1>,
      h2: ({ children, ...props }) => <h2 className="text-base font-bold mb-2" {...props}>{children}</h2>,
      h3: ({ children, ...props }) => <h3 className="text-sm font-bold mb-2" {...props}>{children}</h3>,
      code: ({ className, children, ...props }) => {
        const match = /language-(\w+)/.exec(className || '')
        return match ? (
          <code className="block bg-gray-100 rounded p-2 mb-2" {...props}>{children}</code>
        ) : (
          <code className="bg-gray-100 rounded px-1" {...props}>{children}</code>
        )
      }
    }

    return (
      <ReactMarkdown 
        className={`markdown-content ${props.className || ''}`}
        components={components}
      >
        {props.markdown || defaultMarkdown}
      </ReactMarkdown>
    );
  }

  return (
    <>
      <style jsx global>{`
        .markdown-content {
          font-size: 0.875rem;
          line-height: 1.25rem;
        }
        .markdown-content p {
          margin-bottom: 0.5rem;
        }
        .markdown-content ul, .markdown-content ol {
          margin-left: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .markdown-content li {
          margin-bottom: 0.25rem;
        }
        .markdown-content h1, .markdown-content h2, .markdown-content h3 {
          font-weight: bold;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        .markdown-content h1 {
          font-size: 1.25rem;
        }
        .markdown-content h2 {
          font-size: 1.125rem;
        }
        .markdown-content h3 {
          font-size: 1rem;
        }
        .markdown-content pre {
          background-color: #f3f4f6;
          padding: 0.5rem;
          border-radius: 0.25rem;
          overflow-x: auto;
        }
        .markdown-content code {
          font-family: monospace;
          font-size: 0.875rem;
        }
        .markdown-content a {
          color: #2563eb;
          text-decoration: underline;
        }
      `}</style>
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
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 mr-2">
                    <Image
                      src="/ai-icon.png"
                      alt="AI"
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  </div>
                )}
                <div className={`max-w-[75%] p-2 rounded-lg ${
                  message.role === 'user' ? 'bg-[#007bc7] text-white' : 'bg-gray-200 text-[#333333]'
                }`}>
                  <MarkdownRenderer markdown={message.content} />
                </div>
                {message.role === 'user' && (
                  <div className="flex-shrink-0 ml-2">
                    <Image
                      src="/user-icon.png"
                      alt="User"
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  </div>
                )}
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
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="flex-grow border border-[#007bc7] p-1 rounded text-xs"
              style={{ color: 'black' }}
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
    </>
  )
}