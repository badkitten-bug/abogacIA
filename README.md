# ABOGAC.IA - Landing Page

Una landing page moderna para ABOGAC.IA, el asistente legal personal disponible 24/7 para Perú.

## 🚀 Características

- **Diseño Moderno**: Interfaz limpia y profesional
- **Responsive**: Optimizado para todos los dispositivos
- **Performance**: Construido con Next.js 14 y optimizado para velocidad
- **Accesibilidad**: Cumple con estándares de accesibilidad web
- **SEO Optimizado**: Meta tags y estructura optimizada para buscadores

## 🛠️ Tecnologías

- **Next.js 14** - Framework de React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de CSS
- **Lucide React** - Iconos modernos
- **Responsive Design** - Mobile-first approach

## 📦 Instalación

1. Instalar dependencias:
```bash
npm install
# o
yarn install
# o
bun install
```

2. Ejecutar en modo desarrollo:
```bash
npm run dev
# o
yarn dev
# o
bun dev
```

3. Abrir [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🎨 Secciones

- **Hero Section**: Mensaje principal y call-to-action
- **Características**: Beneficios clave del producto
- **Beneficios**: Valor agregado y estadísticas
- **Call-to-Action**: Formulario de registro
- **Footer**: Enlaces y información de contacto

## 📱 Responsive

La landing page está optimizada para:
- 📱 Móviles (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1280px+)

## 🚀 Deploy

### Opción 1: Deploy automático con Vercel (Recomendado)

1. **Sube tu código a GitHub:**
```bash
git add .
git commit -m "Initial commit - ABOGAC.IA landing page"
git remote add origin https://github.com/badkitten-bug/abogacIA.git
git branch -M main
git push -u origin main
```

2. **Conecta con Vercel:**
   - Ve a [vercel.com](https://vercel.com)
   - Importa tu repositorio de GitHub
   - Vercel detectará automáticamente que es un proyecto Next.js
   - El deploy se hará automáticamente

### Opción 2: Deploy manual

```bash
# Instalar dependencias
bun install

# Build para producción
bun run build

# Iniciar servidor
bun run start
```

### Variables de entorno (si las necesitas)
Crea un archivo `.env.local` para variables locales:
```
NEXT_PUBLIC_SITE_URL=https://tu-dominio.com
```

## 📄 Licencia

Todos los derechos reservados © 2024 ABOGAC.IA
