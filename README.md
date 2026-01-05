# Amaretto Jewelry - E-commerce Minimalista

E-commerce elegante y minimalista para Amaretto Jewelry, especializado en joyería de acero inoxidable y chapa de oro.

## 🚀 Inicio Rápido

### 1. Instalación

```bash
npm install
```

### 2. Ejecutar el proyecto

```bash
npm run dev
```

### 3. Abrir en el navegador

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📋 Stack Tecnológico

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Mobile-first**

## ✨ Características

- ✅ Diseño minimalista y elegante
- ✅ Paleta de colores personalizada de marca
- ✅ Fuente serif elegante para títulos (Playfair Display)
- ✅ Fuente sans-serif limpia para texto (Inter)
- ✅ Navbar fija con menú responsive
- ✅ Footer completo con enlaces y redes sociales
- ✅ Catálogo de productos con filtros y paginación
- ✅ Carrito de compras funcional con persistencia en localStorage
- ✅ Checkout completo con validación de formularios
- ✅ Integración con Stripe (modo mock, lista para producción)
- ✅ Pago por WhatsApp como alternativa
- ✅ Página de confirmación de pedido

## 📁 Estructura del Proyecto

```
amaretto/
├── app/
│   ├── layout.tsx              # Layout global con Navbar y Footer
│   ├── page.tsx                # Página de inicio
│   ├── globals.css             # Estilos globales y clases utilitarias
│   ├── coleccion/              # Página de colección
│   ├── producto/[slug]/       # Página de producto dinámica
│   ├── nosotros/               # Página sobre nosotros
│   ├── contacto/               # Página de contacto
│   ├── carrito/                # Página del carrito
│   ├── checkout/               # Página de checkout
│   ├── gracias/                # Página de confirmación
│   └── api/
│       └── checkout/            # API Route para Stripe
├── components/
│   ├── Navbar.tsx              # Componente de navegación
│   ├── Footer.tsx               # Componente de footer
│   ├── ProductCard.tsx         # Tarjeta de producto
│   ├── CollectionCard.tsx      # Tarjeta de colección
│   ├── TestimonialCard.tsx     # Tarjeta de testimonio
│   ├── WhatsAppButton.tsx      # Botón de WhatsApp
│   ├── AddToCartButton.tsx     # Botón agregar al carrito
│   └── MiniCarrito.tsx         # Mini carrito deslizable
├── src/
│   ├── data/
│   │   └── products.ts         # Datos de productos
│   └── context/
│       └── CartContext.tsx     # Contexto global del carrito
└── tailwind.config.js          # Configuración de Tailwind
```

## 🎨 Paleta de Colores

- **Fondo principal**: `#FFFFFF` - `bg-amaretto-white`
- **Fondo beige secundario**: `#E3DFD7` - `bg-amaretto-beige`
- **Fondo gris claro**: `#D9D9D9` - `bg-amaretto-gray-light`
- **Rosa acento**: `#EFA4CC` - `bg-amaretto-pink` / `text-amaretto-pink`
- **Dorado**: `#D4AF37` - `bg-amaretto-gold` / `text-amaretto-gold`
- **Texto negro**: `#000000` - `text-amaretto-black`

## 📝 Dónde Editar

### 1. Productos y Precios

**Archivo**: `src/data/products.ts`

Este archivo contiene todos los productos del catálogo. Para agregar o editar productos:

```typescript
{
  id: 'producto-unico',
  slug: 'producto-unico',
  name: 'Nombre del Producto',
  description: 'Descripción del producto',
  price: 1299, // Precio en MXN
  category: 'Anillos' | 'Aretes' | 'Collares' | 'Pulseras',
  tags: ['elegante', 'minimalista'],
  images: ['imagen-1', 'imagen-2', 'imagen-3'],
  stock: 15,
  material: 'Acero inoxidable 316L con chapa de oro de 18k',
  medidas: 'Talla única (ajustable)',
  cierre: 'Ajustable',
}
```

### 2. Textos de la Marca

**Archivos principales**:
- `app/page.tsx` - Textos de la página de inicio
- `components/Navbar.tsx` - Textos del menú de navegación
- `components/Footer.tsx` - Textos del footer
- `app/nosotros/page.tsx` - Textos sobre la marca
- `app/contacto/page.tsx` - Textos de contacto

**Ejemplo de edición en la página de inicio** (`app/page.tsx`):

```typescript
<h1 className="font-serif text-4xl md:text-6xl font-bold text-amaretto-black mb-6">
  Joyería elegante para tu día a día
</h1>
<p className="text-lg text-amaretto-black/70 font-sans mb-8 max-w-xl mx-auto md:mx-0">
  Piezas minimalistas en acero inoxidable y chapa de oro...
</p>
```

### 3. Número de WhatsApp

**Archivo**: `components/WhatsAppButton.tsx`

Busca la línea:

```typescript
const phoneNumber = "525512345678" // Número de WhatsApp (formato internacional sin +)
```

Cambia `525512345678` por tu número de WhatsApp en formato internacional (sin el signo +).

**También en**:
- `components/Footer.tsx` - Enlace de WhatsApp en el footer
- `app/checkout/page.tsx` - Pago por WhatsApp en checkout

### 4. Configuración de Cloudinary

**Archivo**: `.env.local`

Para subir imágenes de productos, necesitas configurar Cloudinary:

1. **Crea una cuenta en Cloudinary**:
   - Ve a [Cloudinary](https://cloudinary.com/)
   - Crea una cuenta gratuita (incluye 25GB de almacenamiento)

2. **Obtén tus credenciales**:
   - Ve a tu Dashboard de Cloudinary
   - En la sección "Account Details", encontrarás:
     - `Cloud name`
     - `API Key`
     - `API Secret`

3. **Agrega las variables al `.env.local`**:
```env
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

4. **Las imágenes se subirán automáticamente**:
   - Al crear o editar un producto en el panel de administración
   - Las imágenes se almacenan en la carpeta `amaretto/productos` en Cloudinary
   - Se optimizan automáticamente (calidad y formato)

### 5. Claves de Stripe

**Archivo**: `app/api/checkout/route.ts`

Para activar Stripe en producción:

1. **Instala el paquete de Stripe**:
```bash
npm install stripe
```

2. **Crea un archivo `.env.local`** en la raíz del proyecto:
```env
# Base de datos MongoDB
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/amaretto

# Cloudinary (para subida de imágenes)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Administrador
ADMIN_USERNAME=admin
ADMIN_PASSWORD=tu_contraseña_segura

# URL Base (opcional)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Stripe (opcional, para pagos)
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta_aqui
```

3. **Descomenta el código de Stripe** en `app/api/checkout/route.ts`:
   - Busca el bloque comentado que dice `CÓDIGO DE STRIPE PARA PRODUCCIÓN:`
   - Descomenta todo el código dentro de ese bloque
   - Elimina o comenta el bloque de código mock

4. **Obtén tus claves de Stripe**:
   - Ve a [Stripe Dashboard](https://dashboard.stripe.com/)
   - Navega a Developers > API keys
   - Copia tu Secret key y agrégalo a `.env.local`

### 6. Cambiar Moneda o Endpoint

**Archivo**: `app/api/checkout/route.ts`

Para cambiar la moneda, busca en el código de Stripe:

```typescript
currency: 'mxn', // Cambiar a 'usd' si necesitas dólares
```

Monedas soportadas por Stripe:
- `mxn` - Pesos Mexicanos
- `usd` - Dólares Americanos
- `eur` - Euros
- Y otras monedas según tu región

Para cambiar el endpoint de Stripe (si usas una versión diferente de la API):

```typescript
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia', // Cambiar según la versión que necesites
})
```

## 🛒 Funcionalidades del Carrito

El carrito está completamente funcional con:

- ✅ Agregar productos desde catálogo o detalle
- ✅ Mini-carrito deslizable desde el Navbar
- ✅ Cambiar cantidad de productos
- ✅ Eliminar productos
- ✅ Persistencia en localStorage (sobrevive recargas)
- ✅ Cálculo automático de subtotal y total
- ✅ Envío estimado ($150 MXN)

## 💳 Sistema de Pago

### Modo Mock (Actual)

El sistema está configurado en modo mock, lo que significa que:
- No se procesan pagos reales
- Se simula la creación de sesiones de pago
- Es perfecto para desarrollo y pruebas

### Modo Producción (Stripe)

Para activar pagos reales con Stripe:

1. Sigue las instrucciones en la sección "Claves de Stripe" arriba
2. Asegúrate de tener tu cuenta de Stripe configurada
3. Usa claves de producción (no de prueba) cuando estés listo

### Pago por WhatsApp

Como alternativa, los usuarios pueden elegir pagar por WhatsApp:
- Se genera un mensaje con el resumen del pedido
- Se abre WhatsApp con el mensaje pre-formateado
- El usuario coordina el pago directamente

## 📱 Rutas Disponibles

- `/` - Página de inicio
- `/coleccion` - Catálogo de productos con filtros
- `/producto/[slug]` - Página de producto individual
- `/nosotros` - Información sobre la marca
- `/contacto` - Formulario de contacto
- `/carrito` - Carrito de compras
- `/checkout` - Proceso de pago
- `/gracias` - Página de confirmación de pedido

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start

# Linting
npm run lint
```

## 📦 Dependencias Principales

- `next` - Framework React
- `react` - Biblioteca UI
- `typescript` - Tipado estático
- `tailwindcss` - Estilos utilitarios
- `mongoose` - ODM para MongoDB
- `cloudinary` - Servicio de almacenamiento de imágenes
- `stripe` - (Opcional) Pasarela de pago

## 🚀 Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio a [Vercel](https://vercel.com)
2. Agrega las variables de entorno en el dashboard
3. Vercel detectará automáticamente Next.js y desplegará

### Otros Proveedores

El proyecto puede desplegarse en cualquier proveedor que soporte Next.js:
- Netlify
- AWS Amplify
- Railway
- Render

## 📚 Recursos Adicionales

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Stripe](https://stripe.com/docs)
- [Documentación de Tailwind CSS](https://tailwindcss.com/docs)

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y propiedad de Amaretto Jewelry.

---

**Desarrollado con ❤️ para Amaretto Jewelry**
