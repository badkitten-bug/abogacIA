'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Bot, 
  User, 
  Plus,
  MessageSquare,
  Menu,
  X,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Loader2,
  Scale,
  Briefcase,
  Home,
  Users,
  DollarSign,
  FileText,
  Building,
  ShoppingCart,
  Gavel,
  Trash2,
  ChevronLeft
} from 'lucide-react'
import Link from 'next/link'

// Tipos
interface SourceReference {
  id: number
  title: string
  content_type: string
  number?: string
  relevance_score: number
}

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
  sources?: SourceReference[]
  timestamp: Date
}

interface ChatSession {
  id: string
  title: string
  timestamp: Date
  preview: string
}

// Categorías legales
const legalCategories = [
  { value: 'civil', label: 'Civil', icon: FileText },
  { value: 'penal', label: 'Penal', icon: Gavel },
  { value: 'laboral', label: 'Laboral', icon: Briefcase },
  { value: 'familia', label: 'Familia', icon: Home },
  { value: 'tributario', label: 'Tributario', icon: DollarSign },
  { value: 'constitucional', label: 'Constitucional', icon: Scale },
  { value: 'comercial', label: 'Comercial', icon: Building },
  { value: 'consumidor', label: 'Consumidor', icon: ShoppingCart },
]

// Preguntas sugeridas
const suggestedQuestions = [
  { text: "¿Cuáles son mis derechos laborales básicos?", icon: Briefcase },
  { text: "¿Cómo reclamar un producto defectuoso?", icon: ShoppingCart },
  { text: "¿Qué es la pensión de alimentos?", icon: Home },
  { text: "¿Cuántos días de vacaciones me corresponden?", icon: Briefcase },
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([
    { id: '1', title: 'Consulta sobre despido', timestamp: new Date(), preview: '¿Cuáles son mis derechos si me despiden...' },
    { id: '2', title: 'Pensión alimenticia', timestamp: new Date(Date.now() - 86400000), preview: '¿Cómo se calcula la pensión de alimentos...' },
  ])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px'
  }

  const sendMessage = async (messageText?: string) => {
    const text = messageText || inputValue.trim()
    if (!text || isLoading) return

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }

    try {
      const response = await fetch(`${API_URL}/api/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          session_id: sessionId,
          category: selectedCategory
        })
      })

      if (!response.ok) throw new Error('Error en la respuesta')

      const data = await response.json()
      if (data.session_id) setSessionId(data.session_id)

      const assistantMessage: Message = {
        id: data.message_id || Date.now() + 1,
        role: 'assistant',
        content: data.response,
        sources: data.sources || [],
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])

    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Lo siento, hubo un error. Verifica que el backend esté corriendo y tengas la API key de Groq configurada.',
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const startNewChat = () => {
    setMessages([])
    setSessionId(null)
    setSelectedCategory(null)
  }

  return (
    <div className="h-screen flex bg-slate-50">
      {/* Sidebar - Historial */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-0'} bg-slate-900 flex flex-col transition-all duration-300 overflow-hidden`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-700">
          <button
            onClick={startNewChat}
            className="w-full flex items-center gap-3 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-600"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Nueva consulta</span>
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <p className="text-xs text-slate-500 uppercase tracking-wide px-3 py-2 font-medium">
            Historial
          </p>
          {chatHistory.map((chat) => (
            <button
              key={chat.id}
              className="w-full text-left px-3 py-3 rounded-lg hover:bg-slate-800 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 truncate">{chat.title}</p>
                  <p className="text-xs text-slate-500 truncate">{chat.preview}</p>
                </div>
                <Trash2 className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all" />
              </div>
            </button>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-700">
          <Link 
            href="/"
            className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm">Volver al inicio</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-4 shadow-sm">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5 text-slate-600" /> : <Menu className="w-5 h-5 text-slate-600" />}
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center">
              <Scale className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-800">ABOGAC.IA</h1>
              <p className="text-xs text-slate-500">Asistente Legal Peruano</p>
            </div>
          </div>

          <div className="flex-1" />

          {/* Category Selector */}
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="px-3 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="">Todas las áreas</option>
            {legalCategories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            // Welcome State
            <div className="h-full flex flex-col items-center justify-center p-8">
              <motion.div 
                className="max-w-2xl w-full text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Logo */}
                <div className="w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <Scale className="w-10 h-10 text-amber-400" />
                </div>

                <h2 className="text-2xl font-semibold text-slate-800 mb-2">
                  ¿En qué puedo ayudarte hoy?
                </h2>
                <p className="text-slate-500 mb-8">
                  Consulta sobre tus derechos, trámites legales o cualquier duda jurídica
                </p>

                {/* Category Pills */}
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                  {legalCategories.map(cat => {
                    const Icon = cat.icon
                    return (
                      <button
                        key={cat.value}
                        onClick={() => setSelectedCategory(
                          selectedCategory === cat.value ? null : cat.value
                        )}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                          selectedCategory === cat.value
                            ? 'bg-slate-800 text-white border-slate-800'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {cat.label}
                      </button>
                    )
                  })}
                </div>

                {/* Suggested Questions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {suggestedQuestions.map((q, idx) => {
                    const Icon = q.icon
                    return (
                      <motion.button
                        key={idx}
                        onClick={() => sendMessage(q.text)}
                        className="flex items-center gap-3 p-4 text-left bg-white hover:bg-slate-50 rounded-xl border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all group"
                        whileHover={{ scale: 1.02 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <div className="p-2 bg-amber-50 rounded-lg group-hover:bg-amber-100 transition-colors">
                          <Icon className="w-5 h-5 text-amber-600" />
                        </div>
                        <span className="text-slate-700 text-sm">{q.text}</span>
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            </div>
          ) : (
            // Messages
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
                      message.role === 'assistant' 
                        ? 'bg-gradient-to-br from-slate-700 to-slate-900' 
                        : 'bg-amber-500'
                    }`}>
                      {message.role === 'assistant' 
                        ? <Scale className="w-5 h-5 text-amber-400" />
                        : <User className="w-5 h-5 text-white" />
                      }
                    </div>
                    
                    <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
                      <div className={`inline-block rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-amber-500 text-white'
                          : 'bg-white border border-slate-200 text-slate-700'
                      }`}>
                        <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{message.content}</p>
                      </div>
                      
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {message.sources.map((source, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full"
                            >
                              <ExternalLink className="w-3 h-3" />
                              {source.content_type.toUpperCase()} {source.number || ''}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {message.role === 'assistant' && (
                        <div className="mt-2 flex gap-1">
                          <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-green-600 transition-colors">
                            <ThumbsUp className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-red-500 transition-colors">
                            <ThumbsDown className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                  <div className="w-9 h-9 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center">
                    <Scale className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                      <span className="text-slate-500">Analizando tu consulta...</span>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-200 bg-white p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-3 bg-slate-100 rounded-2xl p-2 border border-slate-200 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-100 transition-all">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu consulta legal..."
                className="flex-1 resize-none bg-transparent px-3 py-2 text-slate-700 placeholder-slate-400 focus:outline-none max-h-36"
                rows={1}
                disabled={isLoading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className={`p-3 rounded-xl transition-all ${
                  inputValue.trim() && !isLoading
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-200'
                    : 'bg-slate-300 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 text-center mt-2">
              ABOGAC.IA es un asistente informativo. Para casos específicos, consulte con un abogado.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
