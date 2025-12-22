'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import AOS from 'aos'
import Link from 'next/link'
import { MessageCircle, Play, Sparkles, Shield, Clock, Users, Scale, Building2, ArrowRight } from 'lucide-react'

export default function Home() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    })
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <motion.nav 
        className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex-shrink-0">
                {/* Logo animado */}
                <motion.div 
                  className="w-8 h-8 bg-gradient-to-r from-primary-600 to-purple-600 rounded-full mr-3 flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4 text-white" />
                </motion.div>
                <h1 className="text-2xl font-bold gradient-text">ABOGAC.IA</h1>
              </div>
            </motion.div>
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-baseline space-x-4">
                <Link
                  href="/directorio"
                  className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:bg-primary-50 flex items-center gap-1"
                >
                  <Building2 className="w-4 h-4" />
                  Directorio
                </Link>
                <a
                  href="#normas-diario"
                  className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:bg-primary-50"
                >
                  Normas de uso
                </a>
                <a
                  href="#explicacion"
                  className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:bg-primary-50"
                >
                  Cómo funciona
                </a>
              </div>
              <Link
                href="/chat"
                className="ml-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <Scale className="w-4 h-4" />
                Probar Ahora
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="hero-gradient py-20 relative overflow-hidden">
        {/* Partículas flotantes */}
        <div className="floating-particles">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 10 + 5}px`,
                height: `${Math.random() * 10 + 5}px`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${Math.random() * 4 + 8}s`
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 8, repeat: Infinity, delay: i * 1.5 }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.h1 
                className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Tener dudas legales es{' '}
                <motion.span 
                  className="text-primary-600"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  normal
                </motion.span>.
                <br />
                No tener{' '}
                <span className="shimmer-text">respuestas</span>, no.
              </motion.h1>
              
              <motion.p 
                className="text-xl md:text-2xl text-gray-600 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <strong>Respuesta legal que necesitas, cuando la necesitas.</strong>
              </motion.p>
              
              <motion.p 
                className="text-lg text-gray-700 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                ABOGAC.IA es como tener un asistente legal en tu celular disponible 24/7: 
                le haces una pregunta y te explica tus derechos de forma clara, rápida y confiable.
              </motion.p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Probar Ahora - Botón Principal */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                >
                  <Link
                    href="/chat"
                    className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105"
                  >
                    <Scale className="w-6 h-6 mr-2" />
                    Probar Ahora
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </motion.div>

                {/* WhatsApp - Botón Secundario */}
                <motion.a 
                  href="https://wa.me/51999999999?text=Hola,%20quiero%20consultar%20sobre%20ABOGAC.IA" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-white border-2 border-green-600 text-green-700 px-6 py-4 rounded-xl text-lg font-semibold hover:bg-green-50 transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  WhatsApp
                </motion.a>
              </div>

              {/* Stats animadas */}
              <motion.div 
                className="mt-12 grid grid-cols-3 gap-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
              >
                {[
                  { icon: Clock, value: "24/7", label: "Disponible" },
                  { icon: Shield, value: "100%", label: "Confidencial" },
                  { icon: Users, value: "10k+", label: "Usuarios" }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className="text-center"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <stat.icon className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="text-2xl font-bold text-primary-600 mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
            
            {/* Right side - Video placeholder mejorado */}
            <motion.div 
              className="flex justify-center"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="video-container w-full max-w-lg">
                <div className="relative aspect-video bg-gradient-to-br from-primary-600 via-purple-600 to-primary-800 flex items-center justify-center">
                  {/* Efecto de brillo */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
                  
                  <motion.div 
                    className="text-center z-10"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <motion.div 
                      className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white/30"
                      whileHover={{ 
                        scale: 1.1,
                        boxShadow: "0 0 30px rgba(255, 255, 255, 0.5)"
                      }}
                      animate={{ 
                        boxShadow: [
                          "0 0 20px rgba(255, 255, 255, 0.3)",
                          "0 0 30px rgba(255, 255, 255, 0.5)",
                          "0 0 20px rgba(255, 255, 255, 0.3)"
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Play className="w-8 h-8 text-white ml-1" />
                    </motion.div>
                    <p className="text-white text-xl font-medium mb-2">Demo Video</p>
                    <p className="text-white/80 text-sm">Próximamente</p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Navigation Sections */}
      <section id="normas-diario" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Normas de uso diario</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Información legal para situaciones cotidianas que enfrentas día a día.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                title: "Contratos",
                description: "Entiende tus derechos en contratos de alquiler, compraventa y servicios",
                icon: "📋"
              },
              {
                title: "Derechos del Consumidor",
                description: "Protege tus derechos cuando compras productos o servicios",
                icon: "🛡️"
              },
              {
                title: "Relaciones Laborales",
                description: "Conoce tus derechos y obligaciones en el trabajo",
                icon: "💼"
              }
            ].map((item, index) => (
              <motion.div
                key={item.title}
                className="card-hover bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
                data-aos="fade-up"
                data-aos-delay={index * 100}
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
          
          <div className="bg-gradient-to-r from-primary-50 to-blue-50 p-8 rounded-2xl" data-aos="fade-up">
            <p className="text-gray-700 text-center text-lg">
              <strong>Próximamente:</strong> Guías legales detalladas y casos prácticos 
              para ayudarte a resolver situaciones legales comunes de manera informada.
            </p>
          </div>
        </div>
      </section>

      <section id="normas-empresas" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Normas para uso de empresas</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Asesoría legal especializada para empresas y emprendimientos.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Constitución", icon: "🏢", color: "from-blue-500 to-blue-600" },
              { title: "Contratos", icon: "📄", color: "from-green-500 to-green-600" },
              { title: "Laboral", icon: "👥", color: "from-purple-500 to-purple-600" },
              { title: "Fiscal", icon: "💰", color: "from-orange-500 to-orange-600" }
            ].map((item, index) => (
              <motion.div
                key={item.title}
                className="card-hover bg-white p-6 rounded-xl shadow-lg"
                data-aos="zoom-in"
                data-aos-delay={index * 100}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${item.color} rounded-full flex items-center justify-center mb-4 mx-auto`}>
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 text-center">{item.title}</h3>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-16 bg-white p-8 rounded-2xl shadow-lg" data-aos="fade-up">
            <p className="text-gray-700 text-center text-lg">
              <strong>En desarrollo:</strong> Herramientas legales especializadas para empresas, 
              desde la constitución hasta el cumplimiento normativo diario.
            </p>
          </div>
        </div>
      </section>

      <section id="explicacion" className="py-20 bg-white relative overflow-hidden">
        {/* Fondo decorativo */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-transparent to-purple-50"></div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Explicación clara y sencilla</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Derecho explicado en términos simples y comprensibles.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div data-aos="fade-right">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Lenguaje Simple</h3>
                    <p className="text-gray-600">Traducimos el lenguaje legal complejo a términos que todos puedan entender.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Ejemplos Prácticos</h3>
                    <p className="text-gray-600">Incluimos casos reales y ejemplos para que sea más fácil de aplicar.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Actualizado</h3>
                    <p className="text-gray-600">Mantenemos la información actualizada con las últimas leyes y regulaciones.</p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-gradient-to-br from-primary-600 to-purple-600 p-8 rounded-2xl text-white"
              data-aos="fade-left"
            >
              <h3 className="text-2xl font-bold mb-6">Nuestra Misión</h3>
              <p className="text-lg mb-6">
                Hacer que el derecho sea accesible para todos los peruanos, 
                independientemente de su formación académica.
              </p>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                <p className="text-sm">
                  "El conocimiento legal no debería ser un privilegio, sino un derecho de todos."
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">ABOGAC.IA</h3>
              <p className="text-gray-400 mb-4">
                Tu asistente legal personal disponible 24/7. Respuestas legales claras, 
                rápidas y confiables para todos los peruanos.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Características</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Precios</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Demo</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Centro de Ayuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacidad</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Términos</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ABOGAC.IA. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
