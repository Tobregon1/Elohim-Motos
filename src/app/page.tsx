'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShieldCheck,
  CreditCard,
  Repeat,
  Star,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  MapPin,
  MessageCircle,
  Bike,
  Wrench,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import MotoCard from '@/components/MotoCard';
import { formatCurrency } from '@/lib/format';

const HERO_SLIDES = [
  {
    id: 1,
    badge: 'OFERTA ESTRELLA DEL MES • APROBACIÓN EN 15 MINUTOS',
    title: 'Llevate tu 110cc 0km solo con tu DNI en 12 o 24 cuotas',
    subtitle:
      'Honda Wave 110S, Motomel Blitz V8 y Gilera Smash Full con entrega inmediata. Mínimos requisitos, con o sin recibo de sueldo.',
    highlight: 'Anticipos desde $190.000 o 100% financiado',
    image:
      'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1600&q=85',
  },
  {
    id: 2,
    badge: 'LÍNEA ENDURO & ON-OFF • PLAN CANJE ACTIVO',
    title: 'Subite hoy a tu Honda XR 150L, Tornado 250 o Skua 0km',
    subtitle:
      'Entregá tu moto usada como anticipo al mejor valor de plaza y financiá la diferencia en cuotas fijas en pesos o con Cuota Simple.',
    highlight: 'Tasación en el acto + Transferencia ágil',
    image:
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1600&q=85',
  },
  {
    id: 3,
    badge: 'USADOS SELECCIONADOS ELOHIM • GARANTÍA MECÁNICA',
    title: 'Oportunidades Usadas revisadas a fondo y listas para transferir',
    subtitle:
      'Unidades seleccionadas con pocos kilómetros, carpeta completa al día (08, verificación policial y libre deuda) y financiación disponible.',
    highlight: 'Escuchá el motor en cada ficha y reservala hoy',
    image:
      'https://images.unsplash.com/photo-1558981285-6f0c94958bb6?auto=format&fit=crop&w=1600&q=85',
  },
];

const BRAND_MONOGRAMS: Record<string, { code: string; tagline: string }> = {
  honda: { code: 'H', tagline: 'Alas de libertad y valor de reventa #1' },
  yamaha: { code: 'Y', tagline: 'Ingeniería japonesa y confiabilidad pura' },
  motomel: { code: 'M', tagline: 'La número 1 en relación precio y repuestos' },
  gilera: { code: 'G', tagline: 'Diseño italiano y agilidad urbana' },
  corven: { code: 'C', tagline: 'Potencia en calle y aventura On-Off' },
  bajaj: { code: 'B', tagline: 'Tecnología DTS-i de alto rendimiento' },
  zanella: { code: 'Z', tagline: 'Clásicos argentinos que mueven al país' },
};

export default function HomePage() {
  const router = useRouter();
  const {
    motos,
    marcas,
    categorias,
    entregas,
    openWhatsAppRouter,
    openCreditModal,
    openCuotasDrawer,
  } = useStore();

  // Hero Slider state
  const [currentSlide, setCurrentSlide] = useState(0);

  // Quick Filter state
  const [condicion, setCondicion] = useState('');
  const [marcaSlug, setMarcaSlug] = useState('');
  const [categoriaSlug, setCategoriaSlug] = useState('');
  const [cilindrada, setCilindrada] = useState('');

  // Featured Tabs state
  const [activeTab, setActiveTab] = useState<'todas' | '0km' | 'usada' | 'ofertas'>('todas');
  const [featuredPage, setFeaturedPage] = useState(0);

  // "¿Cuál es tu marca favorita?" interactive brand selector state
  const [selectedBrandSlug, setSelectedBrandSlug] = useState('honda');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (condicion) params.set('condicion', condicion);
    if (marcaSlug) params.set('marca', marcaSlug);
    if (categoriaSlug) params.set('categoria', categoriaSlug);
    if (cilindrada) params.set('cilindrada', cilindrada);
    router.push(`/motos?${params.toString()}`);
  };

  // Motos activas para mostrar en Home
  const motosVisibles = motos.filter((m) => m.estado !== 'pausada');
  const motosFiltradasHome = motosVisibles
    .filter((m) => {
      if (activeTab === '0km') return m.condicion === '0km';
      if (activeTab === 'usada') return m.condicion === 'usada';
      if (activeTab === 'ofertas') return m.oferta_mes;
      return true;
    })
    .sort((a, b) => (a.destacada === b.destacada ? 0 : a.destacada ? -1 : 1));

  const ITEMS_PER_STEP = 3;
  const maxSteps = Math.max(1, Math.ceil(motosFiltradasHome.length / ITEMS_PER_STEP));
  const currentStep = featuredPage % maxSteps;
  const startIdx = currentStep * ITEMS_PER_STEP;
  const motosDestacadasPaginadas = [
    ...motosFiltradasHome.slice(startIdx, startIdx + 6),
    ...motosFiltradasHome.slice(
      0,
      Math.max(0, 6 - (motosFiltradasHome.length - startIdx))
    ),
  ].slice(0, Math.min(6, motosFiltradasHome.length));

  // Motos para la sección "¿Cuál es tu marca favorita?"
  const selectedMarcaObj =
    marcas.find((m) => m.slug === selectedBrandSlug) || marcas[0];
  const motosPorMarcaFavorita = motosVisibles.filter(
    (m) => m.marca_id === selectedMarcaObj?.id
  );
  // Si una marca tiene pocas motos en el seed, completamos con destacadas para que siempre luzca la vitrina de 3
  const vitrinaMarcaMotos =
    motosPorMarcaFavorita.length > 0
      ? motosPorMarcaFavorita.slice(0, 3)
      : motosVisibles.slice(0, 3);

  const slide = HERO_SLIDES[currentSlide];

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-16 pb-20">
      {/* =====================================================================
          1. HERO SECTION CROSS-FADE (ESTILO MYM MOTOS + BARRA PROGRESO)
      ===================================================================== */}
      <div>
        <section className="relative bg-neutral-950 text-white overflow-hidden min-h-[540px] lg:min-h-[600px] flex items-center">
          {/* Cross-fade Background Slides */}
          {HERO_SLIDES.map((s, idx) => (
            <div
              key={s.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                currentSlide === idx ? 'opacity-100 z-0' : 'opacity-0 -z-10'
              }`}
            >
              <img
                src={s.image}
                alt={s.title}
                className={`w-full h-full object-cover opacity-40 transition-transform duration-[6500ms] ease-out ${
                  currentSlide === idx ? 'scale-105' : 'scale-100'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/90 to-neutral-950/30" />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-neutral-950/40" />
            </div>
          ))}

          {/* Flechas Flotantes Laterales (Desktop) */}
          <button
            onClick={() =>
              setCurrentSlide(
                (prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length
              )
            }
            className="hidden xl:flex absolute left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/50 hover:bg-red-600 border border-white/20 text-white items-center justify-center transition-all shadow-lg"
            aria-label="Slide anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() =>
              setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
            }
            className="hidden xl:flex absolute right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/50 hover:bg-red-600 border border-white/20 text-white items-center justify-center transition-all shadow-lg"
            aria-label="Siguiente slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Contenido Principal Hero */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 w-full">
            <div key={slide.id} className="max-w-3xl space-y-6 animate-fade-in">
              {/* Badge Superior */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 text-xs font-extrabold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-red-500" />
                <span>{slide.badge}</span>
              </div>

              {/* Título Principal */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.06] text-white">
                {slide.title}
              </h1>

              {/* Subtítulo */}
              <p className="text-base sm:text-lg text-neutral-300 leading-relaxed max-w-2xl">
                {slide.subtitle}
              </p>

              {/* Píldora Destacada */}
              <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-white bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-2 rounded-full">
                <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
                <span>{slide.highlight}</span>
              </div>

              {/* Botones Píldora (Rounded-Full Estilo MyM Motos) */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <button
                  onClick={() =>
                    openWhatsAppRouter({
                      mensaje: `Hola Elohim Motos! Vi en el banner principal la promo: "${slide.title}" y quiero hablar con un vendedor.`,
                      source: 'hero_hablar_vendedor',
                    })
                  }
                  className="px-7 py-4 rounded-full bg-[#2db742] hover:bg-[#249e36] text-white font-black text-sm sm:text-base uppercase tracking-wider shadow-xl shadow-[#2db742]/25 flex items-center justify-center gap-2.5 transition-all"
                >
                  <MessageCircle className="w-5 h-5 fill-white/20" />
                  <span>Hablar con un vendedor</span>
                </button>

                <button
                  onClick={() => openCreditModal()}
                  className="px-7 py-4 rounded-full bg-red-600 hover:bg-red-500 text-white font-black text-sm sm:text-base uppercase tracking-wider shadow-xl shadow-red-600/30 flex items-center justify-center gap-2.5 transition-all"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>Calificar con mi DNI</span>
                </button>

                <Link
                  href="/motos"
                  className="px-6 py-4 rounded-full bg-white/10 hover:bg-white hover:text-neutral-950 border border-white/25 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                >
                  <span>Ver Catálogo</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Paginación de Barras Rectangulares Animadas + Flechas (Estilo MyM Hero Swiper) */}
              <div className="pt-4 flex items-center gap-4">
                <div className="flex items-center gap-2.5">
                  {HERO_SLIDES.map((s, idx) => {
                    const isActive = currentSlide === idx;
                    return (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => setCurrentSlide(idx)}
                        aria-label={`Ir al banner ${idx + 1}`}
                        className="relative h-1.5 w-12 rounded-full bg-white/25 overflow-hidden transition-all"
                      >
                        {isActive && (
                          <span className="absolute inset-y-0 left-0 bg-red-600 rounded-full animate-hero-progress" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentSlide(
                        (prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length
                      )
                    }
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-red-600 border border-white/20 text-white flex items-center justify-center transition-all"
                    aria-label="Banner anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
                    }
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-red-600 border border-white/20 text-white flex items-center justify-center transition-all"
                    aria-label="Siguiente banner"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            2. BARRA DE 4 ÍCONOS CLAVE DEBAJO DEL HERO (ESTILO MYM FEATURES BAR)
        ===================================================================== */}
        <div className="bg-neutral-900 border-y border-neutral-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-neutral-800">
              {/* Item 1 */}
              <button
                onClick={() => openCreditModal()}
                className="py-5 px-4 flex items-center gap-4 text-left hover:bg-neutral-800/60 transition-colors group"
              >
                <div className="w-12 h-12 rounded-2xl bg-red-600/15 border border-red-500/30 flex items-center justify-center shrink-0 group-hover:bg-red-600 transition-colors">
                  <ShieldCheck className="w-6 h-6 text-red-500 group-hover:text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wide text-white group-hover:text-red-400 transition-colors">
                    Financiación Solo con DNI
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Aprobación en 15 min • 12 a 24 cuotas
                  </p>
                </div>
              </button>

              {/* Item 2 */}
              <button
                onClick={() => openCuotasDrawer()}
                className="py-5 px-4 flex items-center gap-4 text-left hover:bg-neutral-800/60 transition-colors group"
              >
                <div className="w-12 h-12 rounded-2xl bg-red-600/15 border border-red-500/30 flex items-center justify-center shrink-0 group-hover:bg-red-600 transition-colors">
                  <CreditCard className="w-6 h-6 text-red-500 group-hover:text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wide text-white group-hover:text-red-400 transition-colors">
                    Cuota Simple y Tarjetas
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Visa, Mastercard, Naranja X y Bancos
                  </p>
                </div>
              </button>

              {/* Item 3 */}
              <Link
                href="/permutas"
                className="py-5 px-4 flex items-center gap-4 text-left hover:bg-neutral-800/60 transition-colors group"
              >
                <div className="w-12 h-12 rounded-2xl bg-red-600/15 border border-red-500/30 flex items-center justify-center shrink-0 group-hover:bg-red-600 transition-colors">
                  <Repeat className="w-6 h-6 text-red-500 group-hover:text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wide text-white group-hover:text-red-400 transition-colors">
                    Plan Canje de Usados
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Tomamos tu moto en parte de pago
                  </p>
                </div>
              </Link>

              {/* Item 4 */}
              <Link
                href="/contacto"
                className="py-5 px-4 flex items-center gap-4 text-left hover:bg-neutral-800/60 transition-colors group"
              >
                <div className="w-12 h-12 rounded-2xl bg-red-600/15 border border-red-500/30 flex items-center justify-center shrink-0 group-hover:bg-red-600 transition-colors">
                  <Wrench className="w-6 h-6 text-red-500 group-hover:text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wide text-white group-hover:text-red-400 transition-colors">
                    Servicio Posventa y Garantía
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Entrega inmediata y gestoría propia
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          3. BUSCADOR / FILTRO RÁPIDO DE UNIDADES
      ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[22px] shadow-xl border border-neutral-200 p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-6 bg-red-600 rounded-full inline-block" />
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wide text-neutral-950">
                Encontrá tu próxima moto
              </h2>
            </div>
            <Link
              href="/motos"
              className="text-xs font-extrabold text-red-600 hover:text-neutral-950 flex items-center gap-1 transition-colors"
            >
              <span>Ver las {motosVisibles.length} unidades en stock</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <form
            onSubmit={handleQuickSearch}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5"
          >
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-500 mb-1">
                Condición
              </label>
              <select
                value={condicion}
                onChange={(e) => setCondicion(e.target.value)}
                className="w-full h-12 px-3.5 rounded-xl bg-neutral-100 border border-neutral-200 text-sm font-bold text-neutral-900 focus:outline-none focus:border-red-600"
              >
                <option value="">Todas (0km y Usadas)</option>
                <option value="0km">Solo Motos 0km</option>
                <option value="usada">Usadas Seleccionadas</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-500 mb-1">
                Marca
              </label>
              <select
                value={marcaSlug}
                onChange={(e) => setMarcaSlug(e.target.value)}
                className="w-full h-12 px-3.5 rounded-xl bg-neutral-100 border border-neutral-200 text-sm font-bold text-neutral-900 focus:outline-none focus:border-red-600"
              >
                <option value="">Todas las Marcas</option>
                {marcas.map((m) => (
                  <option key={m.id} value={m.slug}>
                    {m.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-500 mb-1">
                Tipo de Moto
              </label>
              <select
                value={categoriaSlug}
                onChange={(e) => setCategoriaSlug(e.target.value)}
                className="w-full h-12 px-3.5 rounded-xl bg-neutral-100 border border-neutral-200 text-sm font-bold text-neutral-900 focus:outline-none focus:border-red-600"
              >
                <option value="">Todos los Tipos</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-500 mb-1">
                Cilindrada
              </label>
              <select
                value={cilindrada}
                onChange={(e) => setCilindrada(e.target.value)}
                className="w-full h-12 px-3.5 rounded-xl bg-neutral-100 border border-neutral-200 text-sm font-bold text-neutral-900 focus:outline-none focus:border-red-600"
              >
                <option value="">Todas las Cilindradas</option>
                <option value="110">110 cc (Cub / Económicas)</option>
                <option value="150">125 cc a 150 cc</option>
                <option value="200">160 cc a 250 cc</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full h-12 rounded-full bg-neutral-950 hover:bg-red-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                <Search className="w-4 h-4" />
                <span>Buscar Moto</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* =====================================================================
          4. NUESTRAS MOTOS DESTACADAS (CARRUSEL & FILTROS ESTILO MYM)
      ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-red-600 block mb-1">
              Entrega Inmediata • Financiación en el Acto
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-neutral-950 tracking-tight">
              Nuestras motos destacadas
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'todas', label: 'Destacadas' },
              { id: '0km', label: 'Motos 0km' },
              { id: 'usada', label: 'Usadas Seleccionadas' },
              { id: 'ofertas', label: '🔥 Ofertas del Mes' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as typeof activeTab);
                  setFeaturedPage(0);
                }}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-neutral-950 text-white shadow-md'
                    : 'bg-white border border-neutral-200 text-neutral-700 hover:border-red-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grilla de Tarjetas */}
        <div
          key={`${activeTab}-${currentStep}`}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in"
        >
          {motosDestacadasPaginadas.map((moto) => (
            <MotoCard key={moto.id} moto={moto} />
          ))}
        </div>

        {/* Footer de Navegación Redonda + Botón Ver Todas */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setFeaturedPage((p) => (p - 1 + maxSteps) % maxSteps)
              }
              className="w-11 h-11 rounded-full bg-white hover:bg-neutral-950 hover:text-white border border-neutral-300 text-neutral-900 flex items-center justify-center transition-colors shadow-sm"
              aria-label="Anterior grupo de motos"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setFeaturedPage((p) => (p + 1) % maxSteps)}
              className="w-11 h-11 rounded-full bg-white hover:bg-neutral-950 hover:text-white border border-neutral-300 text-neutral-900 flex items-center justify-center transition-colors shadow-sm"
              aria-label="Siguiente grupo de motos"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold text-neutral-500 ml-2 hidden sm:inline">
              Vista {currentStep + 1} de {maxSteps} • {motosFiltradasHome.length}{' '}
              unidades en esta categoría
            </span>
          </div>

          <Link
            href="/motos"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-neutral-950 hover:bg-red-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg"
          >
            <span>Ver Todo el Catálogo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* =====================================================================
          5. DOBLE BANNER PROMOCIONAL DIVIDIDO (ESTILO MYM "CREDITO-RENOVA")
      ===================================================================== */}
      <section className="bg-neutral-950 py-14 sm:py-16 border-y border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tarjeta 1: Solo con DNI -> Solicitá tu crédito en minutos */}
            <div className="relative h-[320px] rounded-[20px] overflow-hidden p-7 sm:p-9 flex flex-col justify-between text-white group border border-white/10 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1000&q=80"
                alt="Solicitá tu crédito solo con DNI"
                className="absolute inset-0 w-full h-full object-cover object-right group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/90 to-red-950/35" />

              <div className="relative z-10 space-y-3 max-w-sm">
                <span className="inline-block px-3.5 py-1 rounded-full bg-red-600 text-white text-xs font-black uppercase tracking-wider">
                  Solo con DNI
                </span>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                  Solicitá tu crédito en minutos.
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  Sin recibo de sueldo. Evaluamos tu DNI en el acto y retirás en 12,
                  18 o 24 cuotas fijas en pesos.
                </p>
              </div>

              <div className="relative z-10 flex items-center gap-3">
                <button
                  onClick={() => openCreditModal()}
                  className="px-6 py-3 rounded-full bg-white hover:bg-red-600 text-neutral-950 hover:text-white font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg"
                >
                  Solicitar crédito
                </button>
                <button
                  onClick={() => openCuotasDrawer()}
                  className="px-4 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all"
                >
                  Ver medios de pago
                </button>
              </div>
            </div>

            {/* Tarjeta 2: Plan Canje -> Entregá tu usada y renová */}
            <div className="relative h-[320px] rounded-[20px] overflow-hidden p-7 sm:p-9 flex flex-col justify-between text-white group border border-white/10 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1558981359-219d6364c9c8?auto=format&fit=crop&w=1000&q=80"
                alt="Plan Canje de Motos Usadas"
                className="absolute inset-0 w-full h-full object-cover object-right group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-red-700 via-red-800/90 to-neutral-950/40" />

              <div className="relative z-10 space-y-3 max-w-sm">
                <span className="inline-block px-3.5 py-1 rounded-full bg-neutral-950 text-white text-xs font-black uppercase tracking-wider">
                  Plan Canje
                </span>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                  Entregá tu usada y renová.
                </h3>
                <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                  Tomamos tu moto usada como parte de pago al mejor valor y financiás
                  solo la diferencia en cuotas.
                </p>
              </div>

              <div className="relative z-10 flex items-center gap-3">
                <Link
                  href="/permutas"
                  className="px-6 py-3 rounded-full bg-neutral-950 hover:bg-white text-white hover:text-neutral-950 font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg"
                >
                  Conocer más
                </Link>
                <button
                  onClick={() =>
                    openWhatsAppRouter({
                      mensaje:
                        'Hola Elohim Motos! Quiero consultar por el Plan Canje para entregar mi moto usada y sacar una más nueva.',
                      source: 'dual_banner_plan_canje',
                    })
                  }
                  className="px-4 py-3 rounded-full bg-black/25 hover:bg-black/40 text-white font-bold text-xs border border-white/25 transition-all"
                >
                  Tasación por WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          6. "¿CUÁL ES TU MARCA FAVORITA?" (SELECTOR INTERACTIVO ESTILO MYM)
      ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Encabezado Centrado */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-neutral-950 tracking-tight">
            ¿Cuál es tu marca favorita?
          </h2>
          <p className="text-base sm:text-lg text-neutral-500 font-medium">
            Adrenalina que trasciende la pista. Seleccioná una marca y compará sus
            fichas técnicas.
          </p>
        </div>

        {/* Barra Horizontal de Pestañas de Marcas (Brand Tabs) */}
        <div className="flex items-center justify-start sm:justify-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-2">
          {marcas.map((marca) => {
            const isSelected = marca.slug === selectedBrandSlug;
            const mono = BRAND_MONOGRAMS[marca.slug] || {
              code: marca.nombre[0],
              tagline: 'Concesionario Oficial',
            };
            return (
              <button
                key={marca.id}
                onClick={() => setSelectedBrandSlug(marca.slug)}
                className="group flex flex-col items-center gap-2 shrink-0 focus:outline-none"
              >
                <div
                  className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 border-2 ${
                    isSelected
                      ? 'bg-neutral-950 text-white border-red-600 shadow-xl shadow-red-600/20 scale-105'
                      : 'bg-white text-neutral-900 border-neutral-200 hover:border-red-600/50 hover:shadow-md'
                  }`}
                >
                  <span
                    className={`text-2xl sm:text-3xl font-black tracking-tighter leading-none ${
                      isSelected ? 'text-red-500' : 'text-neutral-950 group-hover:text-red-600'
                    }`}
                  >
                    {mono.code}
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest mt-1 ${
                      isSelected ? 'text-white' : 'text-neutral-500'
                    }`}
                  >
                    {marca.nombre}
                  </span>
                </div>
                <span
                  className={`text-xs font-extrabold transition-colors ${
                    isSelected ? 'text-red-600' : 'text-neutral-600'
                  }`}
                >
                  {marca.nombre}
                </span>
              </button>
            );
          })}
        </div>

        {/* Vitrina Animada de 3 Tarjetas con Especificaciones Técnicas (Estilo MyM product-card-tab) */}
        <div
          key={selectedBrandSlug}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in"
        >
          {vitrinaMarcaMotos.map((moto) => (
            <div
              key={moto.id}
              className="bg-white rounded-[20px] border border-neutral-200/90 p-6 shadow-sm hover:shadow-xl hover:border-red-600/40 transition-all flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                {/* Imagen */}
                <Link
                  href={`/motos/${moto.slug}`}
                  className="block relative h-52 rounded-2xl overflow-hidden bg-neutral-900 group"
                >
                  <img
                    src={moto.imagen_portada}
                    alt={moto.titulo}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider">
                    {selectedMarcaObj?.nombre} • {moto.cilindrada}cc
                  </span>
                </Link>

                {/* Título y Precio */}
                <div>
                  <Link href={`/motos/${moto.slug}`}>
                    <h3 className="text-xl font-black text-neutral-950 hover:text-red-600 transition-colors">
                      {moto.titulo}
                    </h3>
                  </Link>
                  <p className="text-lg font-black text-red-600 mt-1">
                    {moto.mostrar_precio && moto.precio_contado
                      ? formatCurrency(moto.precio_contado, moto.moneda)
                      : 'Consultar Precio'}
                  </p>
                </div>

                {/* Lista de 4 Especificaciones Técnicas (Estilo MyM product-desc) */}
                <div className="pt-3 border-t border-neutral-100 space-y-1.5 text-xs text-neutral-600">
                  <p>
                    <strong className="text-neutral-900">Cilindrada:</strong>{' '}
                    {moto.cilindrada} cc ({moto.condicion.toUpperCase()} • Año{' '}
                    {moto.anio})
                  </p>
                  <p>
                    <strong className="text-neutral-900">Motor:</strong>{' '}
                    {moto.ficha_tecnica?.motor || 'Monocilíndrico 4 tiempos'}
                  </p>
                  <p>
                    <strong className="text-neutral-900">Frenos:</strong>{' '}
                    {moto.ficha_tecnica?.freno_delantero || 'Disco / Tambor'}
                  </p>
                  <p>
                    <strong className="text-neutral-900">Arranque:</strong>{' '}
                    {moto.ficha_tecnica?.arranque || 'Eléctrico y a patada'}
                  </p>
                </div>
              </div>

              {/* Botón Píldora Verde Contactanos + Link Ver todos los detalles */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={() =>
                    openWhatsAppRouter({
                      mensaje: `Hola Elohim Motos! Estuve viendo la sección ${selectedMarcaObj?.nombre} en la web y quiero consultar por la ${moto.titulo}.`,
                      motoTitulo: moto.titulo,
                      motoSlug: moto.slug,
                      source: 'brand_tab_whatsapp',
                    })
                  }
                  className="w-full py-3 px-5 rounded-full bg-[#2db742] hover:bg-[#249e36] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <MessageCircle className="w-4 h-4 fill-white/20" />
                  <span>Contactanos</span>
                </button>

                <div className="text-center">
                  <Link
                    href={`/motos/${moto.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-extrabold text-neutral-900 hover:text-red-600 transition-colors"
                  >
                    <span>Ver todos los detalles</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================================
          7. TESTIMONIOS Y ENTREGAS REALES (ESTILO MYM TESTIMONIALS + AVATAR INICIALES)
      ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-red-600 block mb-1">
              Clientes Reales • Calificación 4.9★ en Google Maps
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-neutral-950 tracking-tight">
              Experiencias en Elohim Motos
            </h2>
          </div>

          <div className="inline-flex items-center gap-3 bg-white border border-neutral-200 px-4 py-2.5 rounded-full shadow-sm">
            <div className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center font-black text-sm">
              4.9
            </div>
            <div className="pr-2">
              <div className="flex items-center gap-0.5 text-[#fbbf24]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#fbbf24]" />
                ))}
              </div>
              <p className="text-[11px] font-bold text-neutral-600">
                +320 Reseñas Verificadas
              </p>
            </div>
          </div>
        </div>

        {/* Grilla de Testimonios con Iniciales + Foto de Entrega */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {entregas.map((ent) => (
            <div
              key={ent.id}
              className="bg-white rounded-[18px] border border-neutral-200 p-7 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                {/* 5 Estrellas Doradas */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[#fbbf24]">
                    {[...Array(ent.estrellas)].map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-[#fbbf24]" />
                    ))}
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-wider">
                    {ent.modalidad}
                  </span>
                </div>

                {/* Cita del Cliente */}
                <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
                  &ldquo;{ent.comentario}&rdquo;
                </p>

                {/* Miniatura de la entrega en el local */}
                <div className="relative h-40 rounded-xl overflow-hidden bg-neutral-900">
                  <img
                    src={ent.imagen_url}
                    alt={ent.moto_entregada}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/85 via-transparent to-transparent" />
                  <span className="absolute bottom-2.5 left-3 text-xs font-black text-white">
                    🏍️ {ent.moto_entregada}
                  </span>
                </div>
              </div>

              {/* Autor con Avatar de Iniciales (Estilo MyM author-avatar) */}
              <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
                <div className="w-11 h-11 rounded-full bg-neutral-950 text-white font-black text-sm flex items-center justify-center shrink-0 border-2 border-red-600">
                  {getInitials(ent.cliente)}
                </div>
                <div>
                  <h4 className="text-sm font-black text-neutral-950">
                    {ent.cliente}
                  </h4>
                  <p className="text-xs text-neutral-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-red-600" />
                    {ent.barrio_localidad} • {ent.fecha}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
