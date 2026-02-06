'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Building2,
  LogOut,
  Plus,
  Search,
  Filter,
  BarChart3,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  Settings,
  Key
} from 'lucide-react'
import Link from 'next/link'


// API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Tipos
interface DashboardStats {
  content: {
    total: number
    indexed: number
    pending: number
  }
  users: {
    total: number
    admins: number
  }
  directory: {
    lawyers: number
    verified_lawyers: number
    law_firms: number
  }
  chat: {
    sessions: number
    messages: number
  }
}

interface LegalContent {
  id: number
  title: string
  category: string
  content_type: string
  number: string
  is_indexed: boolean
  createdAt: string
}

// Categorías y tipos
const categories = [
  { value: 'civil', label: 'Civil' },
  { value: 'penal', label: 'Penal' },
  { value: 'laboral', label: 'Laboral' },
  { value: 'tributario', label: 'Tributario' },
  { value: 'constitucional', label: 'Constitucional' },
  { value: 'administrativo', label: 'Administrativo' },
  { value: 'comercial', label: 'Comercial' },
  { value: 'familia', label: 'Familia' },
  { value: 'procesal', label: 'Procesal' },
  { value: 'consumidor', label: 'Consumidor' },
]

const contentTypes = [
  { value: 'ley', label: 'Ley' },
  { value: 'articulo', label: 'Artículo' },
  { value: 'codigo', label: 'Código' },
  { value: 'decreto_supremo', label: 'Decreto Supremo' },
  { value: 'decreto_legislativo', label: 'Decreto Legislativo' },
  { value: 'resolucion', label: 'Resolución' },
  { value: 'jurisprudencia', label: 'Jurisprudencia' },
  { value: 'doctrina', label: 'Doctrina' },
]

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('content') // Default to content
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [contents, setContents] = useState<LegalContent[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [token, setToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Search and Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Auth State
  const [apiKey, setApiKey] = useState('')
  const [configStatus, setConfigStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')


  // Form para nuevo contenido
  const [newContent, setNewContent] = useState({
    title: '',
    content: '',
    category: 'civil',
    content_type: 'ley',
    number: '',
    source: '',
    keywords: '',
    notes: ''
  })

  // Modales para abogados y estudios
  const [showAddLawyerModal, setShowAddLawyerModal] = useState(false)
  const [showAddFirmModal, setShowAddFirmModal] = useState(false)

  // Form para nuevo abogado
  const [newLawyer, setNewLawyer] = useState({
    full_name: '',
    email: '',
    phone: '',
    specialties: '',
    colegio_abogados: '',
    numero_colegiatura: '',
    years_experience: 0,
    city: 'Lima',
    address: '',
    bio: ''
  })

  // Form para nuevo estudio
  const [newFirm, setNewFirm] = useState({
    name: '',
    description: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: 'Lima',
    specialties: ''
  })

  // Verificar autenticación al cargar
  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token')
    if (savedToken) {
      setToken(savedToken)
      setIsAuthenticated(true)
    }
  }, [])

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, typeFilter, categoryFilter])

  // Cargar datos cuando está autenticado
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchDashboard()
      fetchContents()
    }
  }, [isAuthenticated, token])

  // Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: loginForm.email,
          password: loginForm.password,
        }),
      })

      if (!response.ok) {
        throw new Error('Credenciales inválidas')
      }

      const data = await response.json()
      localStorage.setItem('admin_token', data.access_token)
      setToken(data.access_token)
      setIsAuthenticated(true)
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión')
    }
  }

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    setToken(null)
    setIsAuthenticated(false)
  }

  // Fetch Dashboard
  const fetchDashboard = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err)
    }
  }

  // Fetch Contents
  const fetchContents = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/laws`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setContents(Array.isArray(data) ? data : data.items || [])
      }
    } catch (err) {
      console.error('Error fetching contents:', err)
    }
  }

  // Create Content
  const handleCreateContent = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(`${API_URL}/api/admin/laws`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`, // Pass token if auth enabled later
        },
        body: JSON.stringify({
           title: newContent.title,
           content: newContent.content,
           category: newContent.category,
           content_type: newContent.content_type,
           number: newContent.number,
           source: newContent.source || 'Manual Admin Upload' 
        }),
      })


      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Error al crear contenido')
      }

      setSuccess('Contenido creado exitosamente')
      setShowAddModal(false)
      setNewContent({
        title: '',
        content: '',
        category: 'civil',
        content_type: 'ley',
        number: '',
        source: '',
        keywords: '',
        notes: ''
      })
      fetchContents()
    } catch (err: any) {
      setError(err.message)
    }
  }

  // Index Content
  const handleIndexContent = async (contentId: number) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/laws/${contentId}/index`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setSuccess('Contenido indexado correctamente')
        fetchContents()
        fetchDashboard()
      }
    } catch (err) {
      setError('Error al indexar contenido')
    }
  }

  // Delete Content
  const handleDeleteContent = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('¿Está seguro de eliminar este contenido?')) return

    try {
      const response = await fetch(`${API_URL}/api/admin/laws/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setContents(prev => prev.filter(c => c.id !== id))
        setSuccess('Contenido eliminado exitosamente')
      } else {
        throw new Error('Error al eliminar')
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  // Create Lawyer
  const handleCreateLawyer = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(`${API_URL}/api/directorio/abogados`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newLawyer,
          specialties: newLawyer.specialties.split(',').map(s => s.trim()).filter(s => s)
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Error al crear abogado')
      }

      setSuccess('Abogado creado exitosamente')
      setShowAddLawyerModal(false)
      setNewLawyer({
        full_name: '',
        email: '',
        phone: '',
        specialties: '',
        colegio_abogados: '',
        numero_colegiatura: '',
        years_experience: 0,
        city: 'Lima',
        address: '',
        bio: ''
      })
      fetchDashboard()
    } catch (err: any) {
      setError(err.message)
    }
  }

  // Create Law Firm
  const handleCreateFirm = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(`${API_URL}/api/directorio/estudios`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newFirm,
          specialties: newFirm.specialties.split(',').map(s => s.trim()).filter(s => s)
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Error al crear estudio jurídico')
      }

      setSuccess('Estudio jurídico creado exitosamente')
      setShowAddFirmModal(false)
      setNewFirm({
        name: '',
        description: '',
        email: '',
        phone: '',
        website: '',
        address: '',
        city: 'Lima',
        specialties: ''
      })
      fetchDashboard()
    } catch (err: any) {
      setError(err.message)
    }
  }

  // Update API Key
  const handleUpdateApiKey = async (e: React.FormEvent) => {
    e.preventDefault()
    setConfigStatus('saving')
    try {
      const response = await fetch(`${API_URL}/api/chat/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey }),
      })
      
      if (response.ok) {
        setConfigStatus('success')
        setApiKey('') // Clear for security
        setTimeout(() => setConfigStatus('idle'), 3000)
      } else {
        throw new Error('Failed to update Key')
      }
    } catch (err) {
      setConfigStatus('error')
    }
  }

  // Login Screen - Authentication Check
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <LayoutDashboard className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Panel Administrativo</h1>
            <p className="text-gray-500">ABOGAC.IA</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                placeholder="admin@abogacia.pe"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Iniciar Sesión
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
              ← Volver al inicio
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  // Admin Panel
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full">
        <div className="p-6">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ABOGAC.IA Admin
          </h1>
        </div>

        <nav className="px-4 space-y-1">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'content', icon: FileText, label: 'Contenido Legal' },
            { id: 'config', icon: Settings, label: 'Configuración' },
            // { id: 'lawyers', icon: Users, label: 'Abogados' },
            // { id: 'firms', icon: Building2, label: 'Estudios' },

          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">
        {/* Alerts */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto">×</button>
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            {success}
            <button onClick={() => setSuccess(null)} className="ml-auto">×</button>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>
            
            {stats ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {[
                    { label: 'Contenido Total', value: stats.content.total, color: 'blue' },
                    { label: 'Indexado', value: stats.content.indexed, color: 'green' },
                    { label: 'Pendiente', value: stats.content.pending, color: 'yellow' },
                    { label: 'Mensajes Chat', value: stats.chat.messages, color: 'purple' },
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                      <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      Usuarios
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Total Usuarios</span>
                        <span className="font-semibold">{stats.users.total}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Administradores</span>
                        <span className="font-semibold">{stats.users.admins}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-600" />
                      Directorio
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Abogados</span>
                        <span className="font-semibold">{stats.directory.lawyers}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Estudios Jurídicos</span>
                        <span className="font-semibold">{stats.directory.law_firms}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded w-32"></div>
                </div>
                <p className="text-gray-500 mt-4">Cargando estadísticas...</p>
                <button 
                  onClick={fetchDashboard}
                  className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Reintentar
                </button>
              </div>
            )}
          </div>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Contenido Legal</h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-5 h-5" />
                Agregar Contenido
              </button>
            </div>

            {/* Filters and Search */ }
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar por título, número o contenido..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  />
                </div>
              </div>
              
              <div className="min-w-[150px]">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                >
                  <option value="all">Todos los Tipos</option>
                  <option value="ley">Leyes</option>
                  <option value="norma">Normas</option>
                  <option value="decreto">Decretos</option>
                  <option value="jurisprudencia">Jurisprudencia</option>
                  <option value="otro">Otros</option>
                </select>
              </div>

              <div className="min-w-[150px]">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                >
                  <option value="all">Todas las Categorías</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Content List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Número</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(() => {
                    const filtered = contents.filter(content => {
                      const matchesSearch = (content.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                           content.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                           content.content_type?.toLowerCase().includes(searchTerm.toLowerCase()));
                      const matchesType = typeFilter === 'all' || content.content_type === typeFilter;
                      const matchesCategory = categoryFilter === 'all' || content.category === categoryFilter;
                      return matchesSearch && matchesType && matchesCategory;
                    })
                    
                    const indexOfLastItem = currentPage * itemsPerPage;
                    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
                    const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
                    const totalPages = Math.ceil(filtered.length / itemsPerPage);

                    if (currentItems.length === 0) {
                      return (
                         <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                            No se encontraron resultados para tu búsqueda.
                          </td>
                        </tr>
                      )
                    }

                    return (
                      <>
                        {currentItems.map((content) => (
                          <tr key={content.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-800">
                              {content.title}
                              <div className="text-xs text-gray-400 mt-1">{new Date(content.createdAt).toLocaleDateString()}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full capitalize">
                                {content.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                              {content.content_type}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {content.number || '-'}
                            </td>
                            <td className="px-6 py-4">
                              {content.is_indexed ? (
                                <span className="flex items-center text-green-600 text-xs font-medium">
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Indexado
                                </span>
                              ) : (
                                <span className="flex items-center text-yellow-600 text-xs font-medium">
                                  <AlertCircle className="w-4 h-4 mr-1" />
                                  Pendiente
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium">
                              <div className="flex space-x-3">
                                {!content.is_indexed && (
                                  <button
                                    onClick={() => handleIndexContent(content.id)}
                                    className="text-blue-600 hover:text-blue-900 flex items-center"
                                  >
                                    Indexar
                                  </button>
                                )}
                                <button
                                  onClick={(e) => handleDeleteContent(content.id, e)}
                                  className="text-red-600 hover:text-red-900 flex items-center"
                                >
                                  Eliminar
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {totalPages > 1 && (
                          <tr>
                            <td colSpan={6} className="px-6 py-4">
                              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                                <div className="flex flex-1 justify-between sm:hidden">
                                  <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                  >
                                    Anterior
                                  </button>
                                  <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                  >
                                    Siguiente
                                  </button>
                                </div>
                                <div className="hidden sm:flex flex-1 items-center justify-between">
                                  <div>
                                    <p className="text-sm text-gray-700">
                                      Mostrando <span className="font-medium">{indexOfFirstItem + 1}</span> a <span className="font-medium">{Math.min(indexOfLastItem, filtered.length)}</span> de <span className="font-medium">{filtered.length}</span> resultados
                                    </p>
                                  </div>
                                  <div>
                                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                      <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                      >
                                        <span className="sr-only">Anterior</span>
                                        <ChevronDown className="h-5 w-5 rotate-90" aria-hidden="true" />
                                      </button>
                                      {Array.from({ length: totalPages }).map((_, i) => (
                                        <button
                                          key={i}
                                          onClick={() => setCurrentPage(i + 1)}
                                          aria-current={currentPage === i + 1 ? 'page' : undefined}
                                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                            currentPage === i + 1
                                              ? 'bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                                              : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                                          }`}
                                        >
                                          {i + 1}
                                        </button>
                                      ))}
                                      <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                      >
                                        <span className="sr-only">Siguiente</span>
                                        <ChevronDown className="h-5 w-5 -rotate-90" aria-hidden="true" />
                                      </button>
                                    </nav>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    )
                  })()}
                </tbody>
              </table>

              {contents.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No hay contenido legal. Agrega el primero usando el botón de arriba.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Lawyers Tab */}
        {activeTab === 'lawyers' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Abogados</h2>
              <button 
                onClick={() => setShowAddLawyerModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-5 h-5" />
                Agregar Abogado
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">No hay abogados registrados</h3>
              <p className="text-gray-500 mb-4">
                Los abogados que se registren en el directorio aparecerán aquí para verificación.
              </p>
              <p className="text-sm text-gray-400">
                Dirección del directorio: <a href="/directorio" className="text-blue-600 hover:underline">/directorio</a>
              </p>
            </div>
          </div>
        )}

        {/* Firms Tab */}
        {activeTab === 'firms' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Estudios Jurídicos</h2>
              <button 
                onClick={() => setShowAddFirmModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-5 h-5" />
                Agregar Estudio
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">No hay estudios jurídicos registrados</h3>
              <p className="text-gray-500 mb-4">
                Los estudios jurídicos que se registren en el directorio aparecerán aquí para verificación.
              </p>
              <p className="text-sm text-gray-400">
                Dirección del directorio: <a href="/directorio" className="text-blue-600 hover:underline">/directorio</a>
              </p>
            </div>
          </div>
        )}

        {/* Config Tab */}
        {activeTab === 'config' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Configuración del Sistema</h2>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                  <Key className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">API Key de Groq</h3>
                  <p className="text-sm text-gray-500">Actualiza la llave para el motor de IA.</p>
                </div>
              </div>

              <form onSubmit={handleUpdateApiKey} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nueva API Key
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                    placeholder="gsk_..."
                    required
                  />
                </div>

                <div className="flex items-center justify-between">
                   <button
                    type="submit"
                    disabled={configStatus === 'saving'}
                    className={`px-6 py-2 rounded-lg font-medium text-white transition-colors ${
                      configStatus === 'saving' ? 'bg-gray-400' : 
                      configStatus === 'success' ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {configStatus === 'saving' ? 'Guardando...' : 
                     configStatus === 'success' ? '¡Actualizado!' : 
                     configStatus === 'error' ? 'Error' : 'Actualizar Key'}
                  </button>
                  {configStatus === 'success' && (
                    <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Guardado correctamente
                    </span>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}


        {/* Add Content Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-800">Agregar Contenido Legal</h3>
                <p className="text-sm text-gray-500">Complete los campos para agregar nueva información legal</p>
              </div>

              <form onSubmit={handleCreateContent} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoría *
                    </label>
                    <select
                      value={newContent.category}
                      onChange={(e) => setNewContent({ ...newContent, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      required
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo *
                    </label>
                    <select
                      value={newContent.content_type}
                      onChange={(e) => setNewContent({ ...newContent, content_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      required
                    >
                      {contentTypes.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={newContent.title}
                    onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    placeholder="Ej: Código Civil - Artículo 1969"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de Ley/Artículo
                    </label>
                    <input
                      type="text"
                      value={newContent.number}
                      onChange={(e) => setNewContent({ ...newContent, number: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      placeholder="Ej: 29783, Art. 1969"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fuente
                    </label>
                    <input
                      type="text"
                      value={newContent.source}
                      onChange={(e) => setNewContent({ ...newContent, source: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      placeholder="Ej: Diario El Peruano"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contenido *
                  </label>
                  <textarea
                    value={newContent.content}
                    onChange={(e) => setNewContent({ ...newContent, content: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[200px] text-gray-900 bg-white"
                    placeholder="Pegue aquí el texto completo de la ley, artículo o norma..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Palabras clave
                  </label>
                  <input
                    type="text"
                    value={newContent.keywords}
                    onChange={(e) => setNewContent({ ...newContent, keywords: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    placeholder="Separadas por coma: contrato, obligaciones, daños"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas adicionales
                  </label>
                  <textarea
                    value={newContent.notes}
                    onChange={(e) => setNewContent({ ...newContent, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    placeholder="Notas internas sobre este contenido..."
                    rows={2}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Guardar Contenido
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Add Lawyer Modal */}
        {showAddLawyerModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-800">Agregar Abogado</h3>
                <p className="text-sm text-gray-500">Complete los datos del abogado</p>
              </div>

              <form onSubmit={handleCreateLawyer} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      value={newLawyer.full_name}
                      onChange={(e) => setNewLawyer({ ...newLawyer, full_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      placeholder="Ej: Dr. Juan Pérez García"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={newLawyer.email}
                      onChange={(e) => setNewLawyer({ ...newLawyer, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      placeholder="abogado@email.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={newLawyer.phone}
                      onChange={(e) => setNewLawyer({ ...newLawyer, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      placeholder="+51 999 999 999"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Colegio de Abogados *
                    </label>
                    <input
                      type="text"
                      value={newLawyer.colegio_abogados}
                      onChange={(e) => setNewLawyer({ ...newLawyer, colegio_abogados: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      placeholder="CAL, CAA, etc."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      N° Colegiatura *
                    </label>
                    <input
                      type="text"
                      value={newLawyer.numero_colegiatura}
                      onChange={(e) => setNewLawyer({ ...newLawyer, numero_colegiatura: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      placeholder="12345"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Años de Experiencia
                    </label>
                    <input
                      type="number"
                      value={newLawyer.years_experience}
                      onChange={(e) => setNewLawyer({ ...newLawyer, years_experience: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      value={newLawyer.city}
                      onChange={(e) => setNewLawyer({ ...newLawyer, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      placeholder="Lima"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Especialidades
                    </label>
                    <input
                      type="text"
                      value={newLawyer.specialties}
                      onChange={(e) => setNewLawyer({ ...newLawyer, specialties: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      placeholder="Civil, Penal, Laboral (separadas por coma)"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección
                    </label>
                    <input
                      type="text"
                      value={newLawyer.address}
                      onChange={(e) => setNewLawyer({ ...newLawyer, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      placeholder="Av. Principal 123, Miraflores"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Biografía
                    </label>
                    <textarea
                      value={newLawyer.bio}
                      onChange={(e) => setNewLawyer({ ...newLawyer, bio: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      placeholder="Breve descripción del abogado..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAddLawyerModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Guardar Abogado
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Add Firm Modal */}
        {showAddFirmModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-800">Agregar Estudio Jurídico</h3>
                <p className="text-sm text-gray-500">Complete los datos del estudio</p>
              </div>

              <form onSubmit={handleCreateFirm} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Estudio *
                    </label>
                    <input
                      type="text"
                      value={newFirm.name}
                      onChange={(e) => setNewFirm({ ...newFirm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      placeholder="Ej: Estudio Jurídico Pérez & Asociados"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={newFirm.email}
                      onChange={(e) => setNewFirm({ ...newFirm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      placeholder="contacto@estudio.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={newFirm.phone}
                      onChange={(e) => setNewFirm({ ...newFirm, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      placeholder="+51 1 234 5678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sitio Web
                    </label>
                    <input
                      type="url"
                      value={newFirm.website}
                      onChange={(e) => setNewFirm({ ...newFirm, website: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      placeholder="https://www.estudio.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      value={newFirm.city}
                      onChange={(e) => setNewFirm({ ...newFirm, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      placeholder="Lima"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Especialidades
                    </label>
                    <input
                      type="text"
                      value={newFirm.specialties}
                      onChange={(e) => setNewFirm({ ...newFirm, specialties: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      placeholder="Corporativo, Tributario, Laboral (separadas por coma)"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección
                    </label>
                    <input
                      type="text"
                      value={newFirm.address}
                      onChange={(e) => setNewFirm({ ...newFirm, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      placeholder="Av. Javier Prado 1234, San Isidro"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      value={newFirm.description}
                      onChange={(e) => setNewFirm({ ...newFirm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      placeholder="Descripción del estudio jurídico..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAddFirmModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Guardar Estudio
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  )
}
