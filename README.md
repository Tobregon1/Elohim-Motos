# 🏍️ Elohim Motos — Plataforma Web, Catálogo Interactivo, Pre-Calificador Crediticio DNI y Backoffice CRM

Plataforma web integral de alta conversión diseñada especialmente para **Elohim Motos** (identidad **Blanco, Negro y Rojo Competición**). Combina una vidriera digital moderna con un **Mini-CRM y Panel de Gestión de Inventario** pensado para la operatoria real de una concesionaria de motos en Argentina.

---

## 📑 Índice del Documento

1. **[PARTE 1 — Guía para el Cliente / Agencia (Cómo explicar y usar la plataforma)](#parte-1--guía-para-el-cliente--agencia-cómo-explicar-y-usar-la-plataforma)**
   - [1.1 ¿Cómo hace esta página para generar más ventas? (Guion de presentación)](#11-cómo-hace-esta-página-para-generar-más-ventas-guion-de-presentación)
   - [1.2 Recorrido por lo que ve el comprador (Sitio Público)](#12-recorrido-por-lo-que-ve-el-comprador-sitio-público)
   - [1.3 Manual del Panel Administrador (`/admin`) para el Dueño y Vendedores](#13-manual-del-panel-administrador-admin-para-el-dueño-y-vendedores)
   - [1.4 Herramientas Exclusivas que diferencian a Elohim Motos](#14-herramientas-exclusivas-que-diferencian-a-elohim-motos)
   - [1.5 Cumplimiento Legal en Argentina (ARCA, Ley 25.326 y Defensa del Consumidor)](#15-cumplimiento-legal-en-argentina-arca-ley-25326-y-defensa-del-consumidor)
2. **[PARTE 2 — Documentación Técnica para el Programador](#parte-2--documentación-técnica-para-el-programador)**
   - [2.1 Stack Tecnológico y Arquitectura](#21-stack-tecnológico-y-arquitectura)
   - [2.2 Estructura de Carpetas del Proyecto](#22-estructura-de-carpetas-del-proyecto)
   - [2.3 Instalación y Ejecución Local](#23-instalación-y-ejecución-local)
   - [2.4 Motor Híbrido de Datos (Modo Local vs. Supabase en Vivo)](#24-motor-híbrido-de-datos-modo-local-vs-supabase-en-vivo)
   - [2.5 Configuración de Base de Datos en Supabase (Paso a Paso)](#25-configuración-de-base-de-datos-en-supabase-paso-a-paso)
   - [2.6 Acceso y Seguridad del Panel Admin](#26-acceso-y-seguridad-del-panel-admin)
   - [2.7 ¿De dónde sacar los datos de ARCA, Píxel de Meta y Google Tag Manager?](#27-de-dónde-sacar-los-datos-de-arca-píxel-de-meta-y-google-tag-manager)
   - [2.8 Despliegue a Producción en Vercel](#28-despliegue-a-producción-en-vercel)

---

# PARTE 1 — Guía para el Cliente / Agencia (Cómo explicar y usar la plataforma)

> 💡 **Tip para tu reunión con el cliente:** Esta sección está redactada para que puedas usarla como guion al mostrarle la web al dueño de **Elohim Motos** y explicarle cómo le ahorra tiempo a sus vendedores y le consigue clientes listos para comprar.

---

## 1.1 ¿Cómo hace esta página para generar más ventas? (Guion de presentación)

A diferencia de una página web informativa tradicional, el sitio de **Elohim Motos** funciona como un **vendedor digital las 24 horas** enfocado en los 3 motores que más mueven una agencia de motos:

1. **Financiación rápida solo con DNI**: El cliente no solo mira la moto; puede dejar su **Nombre, DNI/CUIL, teléfono y situación laboral** en 30 segundos para que el vendedor ya consulte su cupo en Veraz/BCRA/financieras antes de llamarlo.
2. **Plan Canje / Toma de Usados**: El cliente que ya tiene una 110cc y quiere saltar a una 150cc o 250cc puede subir los datos y hasta **4 fotos de su moto usada** desde el celular para pedir cotización como parte de pago.
3. **Derivación inteligente a WhatsApp sin saturar un solo teléfono**: Si la agencia tiene 2 o 3 vendedores, la web reparte las consultas uno a cada uno automáticamente (o deja que el cliente elija con qué vendedor hablar), y además **guarda todos los contactos en una bandeja interna** por si algún chat de WhatsApp se pierde.

---

## 1.2 Recorrido por lo que ve el comprador (Sitio Público)

### A. Barra Superior Inteligente (`Navbar`)
- **Cinta de Anuncios Rotativa**: Muestra ofertas clave arriba de todo (*12 y 24 cuotas con DNI*, *Plan Canje*, *Cuota Simple*).
- **Mega-Menú Visual en "Motocicletas"**: Al apoyar el mouse sobre *Motocicletas*, se despliegan todas las marcas a la izquierda (*Honda, Yamaha, Motomel, Gilera, Corven, Zanella, Bajaj, Keller, Guerrero, Benelli*) y a la derecha aparecen al instante las fotos y precios de los modelos de esa marca.
- **Buscador Predictivo (Lupa)**: Al escribir por ejemplo `"Wave"`, `"110"` o `"XR"`, muestra resultados en vivo con foto y precio sin recargar la página.
- **Botón "Solicitá tu crédito"**: Abre una ventana emergente rápida desde cualquier parte del sitio para calificar con DNI en menos de 1 minuto.
- **Botón "Cuotas"**: Despliega un panel lateral explicando todos los medios de pago (*Créditos con DNI, Tarjetas Visa/Mastercard Cuota Simple, Naranja X Plan Z, Recibo de Sueldo y Plan Canje*).

### B. Pantalla de Inicio (`Home`)
1. **Banner Principal (Hero Cross-Fade)**: Con las 3 promociones fuertes del mes, barras de progreso animadas y botones directos para hablar con un vendedor o calificar con DNI.
2. **Barra de 4 Beneficios Clave**: Acceso directo a *Financiación DNI*, *Cuota Simple*, *Plan Canje* y *Posventa/Garantía*.
3. **Buscador Rápido de Unidades**: Permite filtrar en un clic por **Condición** (`0km` / `Usada`), **Marca**, **Tipo** (*Cub, Street, Enduro, Scooter, Naked*) y **Cilindrada**.
4. **Vitrina de Destacadas y Ofertas**: Tarjetas de producto con cucardas de *"0KM"*, *"Entrega Inmediata"*, *"12/24 Cuotas Solo DNI"*, precio de contado, cálculo automático de *"Precio sin impuestos nacionales"* y botón verde directo a WhatsApp.
5. **Doble Banner Promocional**: Dos bloques visuales de alto impacto para **Solicitar Crédito con DNI** y **Plan Canje de Usados**.
6. **Selector Interactivo "¿Cuál es tu marca favorita?"**: El cliente toca el escudo de su marca preferida y compara lado a lado 3 modelos con su resumen de **Cilindrada, Motor, Frenos y Arranque**.
7. **Prueba Social y Confianza**: Fotos reales de entregas de motos en el salón de Elohim Motos con reseñas de 5 estrellas de clientes.

### C. Catálogo Completo (`/motos`) y Ficha de Producto (`/motos/[slug]`)
- **Filtros laterales completos**: Búsqueda por nombre, condición, marca, categoría, cilindrada, presupuesto máximo y filtro de *"Solo aptas Financiación con DNI"*.
- **Dentro de cada moto**:
  - **Galería de fotos + Botón "Escuchar Motor / Ver Video"**: Ideal para motos usadas seleccionadas, permitiendo que el cliente escuche cómo regula el motor desde su celular.
  - **Simulador / Calculadora de Entrega**: El cliente mueve una barra para indicar cuánto dinero puede entregar de anticipo, elige `6, 12, 18 o 24 cuotas`, ve una cuota orientativa y envía su propuesta con su DNI directo al vendedor.
  - **Botón de WhatsApp Dinámico**: Arma automáticamente el mensaje: *"Hola! Estoy viendo en la web la [Marca Modelo Año] (Link) y quiero consultar precio de contado y opciones de financiación."*

---

## 1.3 Manual del Panel Administrador (`/admin`) para el Dueño y Vendedores

### ¿Cómo se entra al Panel Administrador?
El botón de administración **está oculto al público** para que ningún cliente lo vea en la barra de navegación:
- **Desde el celular o PC**: Entrando directamente a la dirección privada `tudominio.com.ar/admin` (o `http://localhost:3000/admin`).
- **Atajo rápido en PC**: Presionando las teclas **`Ctrl + Shift + A`** en cualquier pantalla de la web.
- **Clave de acceso**: Solicita la contraseña de la agencia (**`elohim2026`**) antes de mostrar la información.

### ¿Qué puede hacer la agencia dentro del Panel?

#### 1. Pestaña "Inventario de Motos" (Cargar o editar en menos de 1 minuto)
- **Botón "+ Cargar Nueva Moto"**: Formulario simple para subir título, marca, categoría, cilindrada, año, kilómetros, precio, anticipo mínimo, valor de cuota, foto y descripción.
- **Cambio de Estado en 1 clic**:
  - `Disponible`: Se muestra con etiqueta verde de *"Entrega Inmediata"*.
  - `Reservada`: Le coloca automáticamente una **cinta diagonal amarilla de "RESERVADA"** sobre la foto para generar urgencia de compra.
  - `Vendida`: Le coloca una cinta de *"VENDIDA"*.
  - `Pausada`: La oculta temporalmente del catálogo público sin borrarla.
- **Control de Precios ante inflación o cambios de lista**:
  - **Individual**: Cada moto tiene un botón para mostrar su precio en pesos o cambiarlo a **"Consultar Precio"**.
  - **Masivo ("Modo Volatilidad")**: Arriba a la derecha hay un botón llamado **"Modo Volatilidad (Ocultar Precios)"**. Si un día cambian todas las listas de precios de fábrica, el dueño toca ese único botón y **todas las motos de la web pasan a decir "Consultar Precio"** en un segundo. Cuando actualiza los valores, toca **"Mostrar Precios"** y vuelven a verse.

#### 2. Pestaña "Consultas Financiación DNI (CRM)"
- Quedan guardados todos los clientes que dejaron su **Nombre, DNI/CUIL, WhatsApp, situación laboral y anticipo**.
- **Botón para copiar DNI en 1 clic**: Para pegarlo rápido en el sistema del BCRA, Veraz o la financiera.
- **Seguimiento de estado**: El vendedor puede marcar cada consulta como `Nuevo`, `Contactado`, `En Evaluación`, `Crédito Aprobado`, `Rechazado` o `Venta Cerrada`, y escribir notas internas (ej: *"Aprobado hasta $3.200.000, viene el sábado"*).
- **Botón "Exportar a Excel / CSV"**: Descarga toda la planilla lista para abrir en Excel o Google Sheets.

#### 3. Pestaña "Tomas de Usados / Permutas"
- Muestra todas las motos usadas que los clientes ofrecieron entregar en parte de pago, con sus fotos, año, kilometraje, estado de papeles (08/título), valor pretendido y qué moto de la agencia quieren sacar.

#### 4. Pestaña "Vendedores y Rotación WA"
- Permite agregar o pausar vendedores, indicar su número de WhatsApp y sucursal, y elegir cómo funciona el botón de WhatsApp de la web:
  - **Modo Rotación Automática (Turno Rotativo)**: La consulta 1 va al Vendedor A, la consulta 2 al Vendedor B, la consulta 3 al Vendedor C, repartiendo el trabajo de forma justa.
  - **Modo Elección del Cliente**: Permite que el cliente elija con qué asesor o sucursal hablar.

---

## 1.4 Herramientas Exclusivas que diferencian a Elohim Motos

### 📲 Generador Automático de Imágenes para Estados de WhatsApp e Instagram Stories
Tanto desde el **Panel Admin** (botón *"Story"* en cada moto) como desde la ficha de cada moto, los vendedores pueden tocar un botón que **dibuja y descarga automáticamente una placa vertical en alta definición (`1080x1920 px`)** con:
- Los colores oficiales Negro, Rojo y Blanco de **Elohim Motos**.
- La foto de la moto, cilindrada, año, kilometraje, freno y arranque.
- El precio de contado o el anticipo destacado (*"Retirala con $..."*).
- La dirección del local lista para subir directo al Estado de WhatsApp o Historia de Instagram.
- También incluye opción para **imprimir o guardar la Ficha Técnica en PDF** para enviar por WhatsApp o poner sobre la moto en el salón.

---

## 1.5 Cumplimiento Legal en Argentina (ARCA, Ley 25.326 y Defensa del Consumidor)

La plataforma ya viene blindada con todos los requisitos legales vigentes en Argentina para concesionarias:
1. **Formulario 960/D Data Fiscal (ARCA - ex AFIP)**: En el pie de página con bloque QR, Razón Social y CUIT editables desde el panel.
2. **Ley 25.326 de Protección de Datos Personales**: Checkbox de consentimiento obligatorio en todos los formularios donde el cliente ingresa su DNI/CUIL para evaluación crediticia.
3. **Resolución 4/2025 (Transparencia Fiscal)**: Cálculo automático de *"Precio sin impuestos nacionales"* debajo del precio de contado en las tarjetas de catálogo.
4. **Enlace Oficial a Defensa de las y los Consumidores**: Apuntando a `argentina.gob.ar/produccion/defensadelconsumidor/formulario`.
5. **Disclaimers Legales de Concesionaria**: Textos aclaratorios sobre carácter ilustrativo de imágenes, gastos de patentamiento/flete y variación de stock sin previo aviso.

---
---

# PARTE 2 — Documentación Técnica para el Programador

## 2.1 Stack Tecnológico y Arquitectura

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router) + React 19.
- **Lenguaje**: TypeScript estricto (`tsconfig.json`).
- **Estilos y Animaciones**: Tailwind CSS 3.4 + animaciones CSS personalizadas en [`src/app/globals.css`](./src/app/globals.css).
- **Iconografía**: `lucide-react`.
- **Base de Datos y Backend**: [Supabase](https://supabase.com/) (PostgreSQL + Row Level Security) con fallback automático a `localStorage` para demostraciones sin conexión.
- **Generación Gráfica**: HTML5 `<canvas>` nativo en [`src/components/StoryGeneratorModal.tsx`](./src/components/StoryGeneratorModal.tsx) para renderizado de Stories 1080x1920.

---

## 2.2 Estructura de Carpetas del Proyecto

```text
elohim-motos/
├── supabase/
│   └── schema.sql                  # Script SQL completo (Tablas, ENUMs, Índices, Triggers, RLS y Seed)
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Layout raíz (Navbar, Footer, WhatsAppWidget, Modales globales)
│   │   ├── globals.css             # Directivas Tailwind y animaciones (fade, modal-pop, drawer, hero-progress)
│   │   ├── page.tsx                # Página de Inicio (Hero, Barra íconos, Buscador, Destacadas, Marcas, Testimonios)
│   │   ├── motos/
│   │   │   ├── page.tsx            # Catálogo completo con Sidebar de filtros combinados
│   │   │   └── [slug]/page.tsx     # Ficha individual de moto, galería/video, simulador de entrega y WA dinámico
│   │   ├── catalogo/page.tsx       # Alias de ruta /catalogo -> renderiza el Catálogo
│   │   ├── financiacion/page.tsx   # Página exclusiva de Pre-calificación Crediticia con DNI (Ley 25.326)
│   │   ├── permutas/page.tsx       # Página de Toma de Usados / Plan Canje con carga de hasta 4 fotos
│   │   ├── vende-tu-moto/page.tsx  # Alias de ruta /vende-tu-moto -> renderiza Permutas
│   │   ├── contacto/page.tsx       # Sucursal, horarios, mapa Google Maps interactivo y asesores
│   │   └── admin/page.tsx          # Backoffice protegido por clave (Inventario, CRM, CSV, Vendedores, Config)
│   ├── components/
│   │   ├── Navbar.tsx              # Barra superior con Mega-Menú hover por marca y Buscador Predictivo
│   │   ├── Footer.tsx              # Pie de página con Data Fiscal 960/D ARCA, Defensa del Consumidor y Legales
│   │   ├── MotoCard.tsx            # Tarjeta de moto estilo estudio con cucardas, precio s/impuestos y WA
│   │   ├── CreditPopupModal.tsx    # Popup modal global "Solicitá tu crédito en minutos"
│   │   ├── CuotasDrawer.tsx        # Drawer lateral deslizable de "Medios de Pago y Cuotas"
│   │   ├── WhatsAppWidget.tsx      # Botón flotante multi-vendedor con enrutador Round-Robin
│   │   └── StoryGeneratorModal.tsx # Generador de placas PNG 9:16 para Estados de WA / IG Stories y PDF
│   ├── context/
│   │   └── StoreContext.tsx        # Estado global, sincronización Supabase/LocalStorage y enrutador WA
│   ├── data/
│   │   └── seed.ts                 # Datos iniciales de demostración (10 marcas, 6 categorías, 13 motos, leads)
│   ├── lib/
│   │   ├── supabase.ts             # Cliente de conexión a Supabase
│   │   ├── analytics.ts            # Disparador de eventos Meta Pixel (fbq) y Google Tag Manager (dataLayer)
│   │   └── format.ts               # Formateadores de moneda ARS/USD, slugs y etiquetas de estados
│   └── types/
│       └── database.ts             # Interfaces TypeScript alineadas 1:1 con el esquema SQL
├── .env.example                    # Plantilla de variables de entorno
├── tailwind.config.ts              # Configuración de colores y fuentes de Elohim Motos
└── package.json
```

---

## 2.3 Instalación y Ejecución Local

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Levantar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```
   > ⚠️ **Nota importante durante el desarrollo**: Mientras tengas `npm run dev` corriendo en una consola, evitá correr `npm run build` al mismo tiempo porque ambos comandos comparten la carpeta `.next`. Si necesitás verificar tipos de TypeScript mientras desarrollás, usá `npx tsc --noEmit`.

3. **Abrir en el navegador**:
   - Sitio público: `http://localhost:3000`
   - Panel Administrador: `http://localhost:3000/admin` (o presionando `Ctrl + Shift + A`).

---

## 2.4 Motor Híbrido de Datos (Modo Local vs. Supabase en Vivo)

El archivo [`src/context/StoreContext.tsx`](./src/context/StoreContext.tsx) implementa un patrón de **Persistencia Dual**:

1. **Modo Demo / Local (Sin configurar `.env.local`)**:
   - Funciona inmediatamente apenas clonás el repositorio.
   - Carga el catálogo inicial desde [`src/data/seed.ts`](./src/data/seed.ts) y guarda cualquier moto nueva, cambio de precio, vendedor o consulta de cliente en el `localStorage` del navegador.
   - Ideal para mostrarle la plataforma al cliente en una reunión sin depender de internet o servidores externos.
2. **Modo Producción con Supabase PostgreSQL (Configurando `.env.local`)**:
   - Al detectar las variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`, el sistema cambia automáticamente a **Modo Supabase en Vivo** (indicado con un punto verde `🟢 Conectado a Supabase PostgreSQL` en el encabezado de `/admin`).
   - Todas las lecturas y escrituras se ejecutan en tiempo real contra las tablas PostgreSQL de Supabase.

---

## 2.5 Configuración de Base de Datos en Supabase (Paso a Paso)

Cuando quieras pasar la web a producción con base de datos en la nube:

1. Creá una cuenta gratuita en [supabase.com](https://supabase.com/) y creá un nuevo proyecto llamado `elohim-motos`.
2. En el menú lateral izquierdo de Supabase, entrá a **SQL Editor** → **New query**.
3. Abrí el archivo [`supabase/schema.sql`](./supabase/schema.sql) de este proyecto, copiá todo su contenido, pegalo en el editor de Supabase y hacé clic en **Run**.
   - Esto creará automáticamente los tipos `ENUM`, las tablas (`marcas`, `categorias`, `motos`, `vendedores`, `leads_financiacion`, `leads_permutas`), los índices de velocidad, las políticas de seguridad RLS y las marcas/categorías iniciales.
4. En Supabase, andá a **Project Settings** → **API** y copiá el **Project URL** y la clave **anon public**.
5. En la raíz de tu proyecto, creá un archivo llamado `.env.local` (guiándote por `.env.example`):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
6. Reiniciá `npm run dev` y el sistema quedará conectado a PostgreSQL.

---

## 2.6 Acceso y Seguridad del Panel Admin

- **Ruta**: `/admin`
- **Atajo oculto de teclado**: `Ctrl + Shift + A`
- **Clave por defecto**: `elohim2026` (también acepta `1234`).
- **¿Dónde cambiar la clave en el código?**:
  En [`src/app/admin/page.tsx`](./src/app/admin/page.tsx), dentro de la función `handleAdminLogin`:
  ```ts
  if (pass === 'elohim2026' || pass === '1234') { ... }
  ```
  Podés cambiar `'elohim2026'` por la contraseña que elija el dueño de la agencia.

---

## 2.7 ¿De dónde sacar los datos de ARCA, Píxel de Meta y Google Tag Manager?

Dentro de `/admin` → pestaña **Configuración y Píxel Meta**, podés cargar:
- **Razón Social y CUIT Oficial**: Se obtienen de la Constancia de Inscripción de ARCA (ex AFIP) o del cartel Formulario 960/D del local.
- **Meta Pixel ID**: Se obtiene gratis desde [Meta Business Suite](https://business.facebook.com/) → *Administrador de Eventos* → *Conectar orígenes de datos (Web)*. Es un número de 15-16 dígitos.
- **Google Tag Manager ID**: Se obtiene gratis desde [Google Tag Manager](https://tagmanager.google.com/) al crear un contenedor Web (formato `GTM-XXXXXXX`).

---

## 2.8 Despliegue a Producción en Vercel

La forma más rápida, gratuita y profesional de publicar esta web con certificado SSL (`https://`) es usando **Vercel**:

1. Subí este repositorio a tu cuenta de **GitHub**.
2. Entrá a [vercel.com](https://vercel.com/), tocá **"Add New Project"** e importá el repositorio `elohim-motos`.
3. Si ya creaste la base de datos en Supabase, abrí la sección **Environment Variables** en Vercel y agregá `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Hacé clic en **Deploy**. En menos de 2 minutos vas a tener la URL pública online lista para conectar el dominio `.com.ar` de la agencia.
