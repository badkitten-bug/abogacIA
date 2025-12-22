'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Filter,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Star,
  Users,
  Building2,
  ChevronDown,
  ArrowLeft,
  Scale,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Tipos
interface Lawyer {
  id: number
  full_name: string
  photo_url?: string
  bio?: string
  colegiatura?: string
  colegio?: string
  years_experience?: number
  specialties?: string
  phone?: string
  email?: string
  linkedin?: string
  is_verified: boolean
  is_available: boolean
  offers_free_consultation: boolean
}

interface LawFirm {
  id: number
  name: string
  description?: string
  logo_url?: string
  address?: string
  city?: string
  phone?: string
  email?: string
  website?: string
  specialties?: string
  is_verified: boolean
}

// Especialidades
const specialties = [
  { value: '', label: 'Todas las especialidades' },
  { value: 'civil', label: 'Derecho Civil' },
  { value: 'penal', label: 'Derecho Penal' },
  { value: 'laboral', label: 'Derecho Laboral' },
  { value: 'familia', label: 'Derecho de Familia' },
  { value: 'tributario', label: 'Derecho Tributario' },
  { value: 'comercial', label: 'Derecho Comercial' },
  { value: 'corporativo', label: 'Derecho Corporativo' },
  { value: 'inmobiliario', label: 'Derecho Inmobiliario' },
  { value: 'migratorio', label: 'Derecho Migratorio' },
]

export default function DirectorioPage() {
  const [activeTab, setActiveTab] = useState<'abogados' | 'estudios'>('abogados')
  const [lawyers, setLawyers] = useState<Lawyer[]>([])
  const [firms, setFirms] = useState<LawFirm[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Fetch data
  useEffect(() => {
    fetchLawyers()
    fetchFirms()
  }, [selectedSpecialty, searchTerm])

  const fetchLawyers = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedSpecialty) params.append('specialty', selectedSpecialty)
      if (searchTerm) params.append('search', searchTerm)
      
      const response = await fetch(`${API_URL}/api/directorio/abogados?${params}`)
      if (response.ok) {
        const data = await response.json()
        setLawyers(data.items || [])
      }
    } catch (error) {
      console.error('Error fetching lawyers:', error)
      // Mock data para demo
      setLawyers([
        {
          id: 1,
          full_name: 'Dr. Carlos Mendoza',
          bio: 'Abogado especialista en derecho civil y comercial con más de 15 años de experiencia.',
          colegiatura: 'CAL 45678',
          colegio: 'Colegio de Abogados de Lima',
          years_experience: 15,
          specialties: 'civil,comercial',
          phone: '+51 999 888 777',
          email: 'carlos.mendoza@email.com',
          is_verified: true,
          is_available: true,
          offers_free_consultation: true
        },
        {
          id: 2,
          full_name: 'Dra. María García',
          bio: 'Especialista en derecho de familia y pensión de alimentos.',
          colegiatura: 'CAL 56789',
          colegio: 'Colegio de Abogados de Lima',
          years_experience: 10,
          specialties: 'familia',
          phone: '+51 999 777 666',
          email: 'maria.garcia@email.com',
          is_verified: true,
          is_available: true,
          offers_free_consultation: false
        },
        {
          id: 3,
          full_name: 'Dr. José Rodríguez',
          bio: 'Experto en derecho laboral y defensa del trabajador.',
          colegiatura: 'CAL 34567',
          colegio: 'Colegio de Abogados de Lima',
          years_experience: 12,
          specialties: 'laboral',
          phone: '+51 999 666 555',
          email: 'jose.rodriguez@email.com',
          is_verified: true,
          is_available: true,
          offers_free_consultation: true
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchFirms = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedSpecialty) params.append('specialty', selectedSpecialty)
      if (searchTerm) params.append('search', searchTerm)
      
      const response = await fetch(`${API_URL}/api/directorio/estudios?${params}`)
      if (response.ok) {
        const data = await response.json()
        setFirms(data || [])
      }
    } catch (error) {
      console.error('Error fetching firms:', error)
      // Mock data
      setFirms([
        {
          id: 1,
          name: 'Estudio Jurídico Mendoza & Asociados',
          description: 'Firma legal líder en Lima especializada en derecho corporativo y comercial.',
          address: 'Av. Javier Prado Este 1234, San Isidro',
          city: 'Lima',
          phone: '+51 1 234 5678',
          email: 'contacto@mendozalaw.pe',
          website: 'www.mendozalaw.pe',
          specialties: 'corporativo,comercial,tributario',
          is_verified: true
        },
        {
          id: 2,
          name: 'García & Rodríguez Abogados',
          description: 'Bufete especializado en derecho de familia y sucesiones.',
          address: 'Calle Las Begonias 456, Miraflores',
          city: 'Lima',
          phone: '+51 1 345 6789',
          email: 'info@grlaw.pe',
          specialties: 'familia,civil',
          is_verified: true
        }
      ])
    }
  }

  const parseSpecialties = (specialtiesStr?: string) => {
    if (!specialtiesStr) return []
    return specialtiesStr.split(',').map(s => {
      const spec = specialties.find(sp => sp.value === s.trim())
      return spec?.label || s.trim()
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-500 hover:text-gray-700 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <Scale className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-800">Directorio Legal</h1>
              </div>
            </div>
            <Link
              href="/chat"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Consultar Ahora
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Encuentra al abogado ideal para tu caso
          </h2>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Conectamos personas con abogados verificados especializados en diferentes áreas del derecho peruano.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
            {/* Tabs */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('abogados')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'abogados'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Users className="w-4 h-4" />
                Abogados
              </button>
              <button
                onClick={() => setActiveTab('estudios')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'estudios'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Estudios Jurídicos
              </button>
            </div>

            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, especialidad..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Specialty Filter */}
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {specialties.map((spec) => (
                <option key={spec.value} value={spec.value}>{spec.label}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Results */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'abogados' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lawyers.map((lawyer) => (
              <motion.div
                key={lawyer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                      {lawyer.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-800 truncate">{lawyer.full_name}</h3>
                        {lawyer.is_verified && (
                          <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        )}
                      </div>
                      {lawyer.colegiatura && (
                        <p className="text-sm text-gray-500">{lawyer.colegiatura}</p>
                      )}
                      {lawyer.years_experience && (
                        <p className="text-sm text-gray-500">{lawyer.years_experience} años de experiencia</p>
                      )}
                    </div>
                  </div>

                  {lawyer.bio && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{lawyer.bio}</p>
                  )}

                  {/* Specialties */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {parseSpecialties(lawyer.specialties).slice(0, 3).map((spec, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {lawyer.is_available && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Disponible
                      </span>
                    )}
                    {lawyer.offers_free_consultation && (
                      <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full">
                        Consulta gratuita
                      </span>
                    )}
                  </div>

                  {/* Contact */}
                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    {lawyer.phone && (
                      <a
                        href={`tel:${lawyer.phone}`}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        Llamar
                      </a>
                    )}
                    {lawyer.email && (
                      <a
                        href={`mailto:${lawyer.email}`}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm text-white transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                        Contactar
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {firms.map((firm) => (
              <motion.div
                key={firm.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-800">{firm.name}</h3>
                        {firm.is_verified && (
                          <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        )}
                      </div>
                      {firm.city && (
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {firm.city}
                        </p>
                      )}
                    </div>
                  </div>

                  {firm.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{firm.description}</p>
                  )}

                  {firm.address && (
                    <p className="text-sm text-gray-500 mb-4 flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      {firm.address}
                    </p>
                  )}

                  {/* Specialties */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {parseSpecialties(firm.specialties).map((spec, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>

                  {/* Contact */}
                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    {firm.phone && (
                      <a
                        href={`tel:${firm.phone}`}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        Llamar
                      </a>
                    )}
                    {firm.website && (
                      <a
                        href={`https://${firm.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm text-white transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Sitio Web
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {((activeTab === 'abogados' && lawyers.length === 0) ||
          (activeTab === 'estudios' && firms.length === 0)) && !isLoading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No se encontraron resultados</h3>
            <p className="text-gray-500">Intenta con otros términos de búsqueda o filtros</p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            ¿Eres abogado y quieres aparecer en nuestro directorio?
          </h3>
          <p className="text-blue-100 mb-6">
            Únete a nuestra red de profesionales legales y conecta con clientes potenciales.
          </p>
          <a
            href="mailto:contacto@abogacia.pe"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Mail className="w-5 h-5" />
            Contáctanos
          </a>
        </div>
      </main>
    </div>
  )
}
