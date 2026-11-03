'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bike,
  Menu,
  X,
  ShieldCheck,
  Sparkles,
  MapPin,
  Search,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  CreditCard,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { formatCurrency } from '@/lib/format';

const ANNOUNCEMENTS = [
  {
    text: 'FINANCIACIÓN SOLO CON DNI: Llevate tu moto en 12, 18 y 24 cuotas fijas • Aprobación en el acto',
    cta: 'Solicitar Crédito',
    action: 'credit',
  },
  {
    text: 'PLAN CANJE ELOHIM: Tomamos tu moto usada como anticipo al mejor valor de plaza',
    cta: 'Cotizar mi Usada',
    href: '/permutas',
  },
  {
    text: 'CUOTA SIMPLE Y TARJETAS BANCARIAS: 3, 6, 9 y 12 cuotas con Visa, Mastercard y Naranja X',
    cta: 'Ver Promos',
    action: 'cuotas',
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    motos,
    marcas,
    config,
    openCreditModal,
    openCuotasDrawer,
  } = useStore();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [hoveredMarcaId, setHoveredMarcaId] = useState<string>('m-honda');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [announcementIdx, setAnnouncementIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnnouncementIdx((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Atajo oculto para el dueño/vendedor: Ctrl + Shift + A abre /admin
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        router.push('/admin');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  const motosActivas = motos.filter((m) => m.estado !== 'pausada');

  // Motos de la marca seleccionada en el Mega-Menu
  const activeMarca =
    marcas.find((m) => m.id === hoveredMarcaId) || marcas[0];
  const megaMenuMotos = motosActivas
    .filter((m) => m.marca_id === activeMarca?.id)
    .slice(0, 4);

  // Resultados del buscador predictivo
  const searchResults = searchQuery.trim()
    ? motosActivas
        .filter((m) => {
          const q = searchQuery.toLowerCase();
          const marcaNombre =
            marcas.find((ma) => ma.id === m.marca_id)?.nombre.toLowerCase() || '';
          return (
            m.titulo.toLowerCase().includes(q) ||
            marcaNombre.includes(q) ||
            String(m.cilindrada).includes(q) ||
            m.condicion.toLowerCase().includes(q)
          );
        })
        .slice(0, 6)
    : motosActivas.filter((m) => m.destacada).slice(0, 4);

  const currentAnnouncement = ANNOUNCEMENTS[announcementIdx];

  return (
    <>
      <header
        className="sticky top-0 z-50 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800 text-white"
        onMouseLeave={() => setMegaMenuOpen(false)}
      >
        {/* 1. Topbar Dinámica Rotativa */}
        <div className="bg-red-600 text-white text-xs font-medium py-1.5 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() =>
                setAnnouncementIdx(
                  (prev) => (prev - 1 + ANNOUNCEMENTS.length) % ANNOUNCEMENTS.length
                )
              }
              className="hidden sm:flex p-0.5 rounded hover:bg-black/20 transition-colors"
              aria-label="Anuncio anterior"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <div className="flex-1 flex items-center justify-center gap-2 text-center truncate">
              <Sparkles className="w-3.5 h-3.5 shrink-0 hidden sm:inline" />
              <span className="font-semibold tracking-wide truncate">
                {currentAnnouncement.text}
              </span>
              {currentAnnouncement.action === 'credit' ? (
                <button
                  type="button"
                  onClick={() => openCreditModal()}
                  className="underline font-black uppercase tracking-wider hover:text-neutral-950 transition-colors shrink-0 ml-1"
                >
                  {currentAnnouncement.cta} →
                </button>
              ) : currentAnnouncement.action === 'cuotas' ? (
                <button
                  type="button"
                  onClick={() => openCuotasDrawer()}
                  className="underline font-black uppercase tracking-wider hover:text-neutral-950 transition-colors shrink-0 ml-1"
                >
                  {currentAnnouncement.cta} →
                </button>
              ) : (
                <Link
                  href={currentAnnouncement.href || '/motos'}
                  className="underline font-black uppercase tracking-wider hover:text-neutral-950 transition-colors shrink-0 ml-1"
                >
                  {currentAnnouncement.cta} →
                </Link>
              )}
            </div>

            <div className="hidden xl:flex items-center gap-3 text-white/90 shrink-0 text-[11px]">
              <span className="flex items-center gap-1 whitespace-nowrap">
                <MapPin className="w-3 h-3" /> {config.direccion}, {config.ciudad}
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                setAnnouncementIdx((prev) => (prev + 1) % ANNOUNCEMENTS.length)
              }
              className="hidden sm:flex p-0.5 rounded hover:bg-black/20 transition-colors"
              aria-label="Siguiente anuncio"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2. Barra Principal de Navegación (Alineada en 1 sola línea limpia) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo Elohim Motos */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:bg-red-500 transition-colors shrink-0">
              <Bike className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex flex-col whitespace-nowrap">
              <span className="text-lg sm:text-2xl font-black tracking-tighter leading-none text-white">
                ELOHIM <span className="text-red-600">MOTOS</span>
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-semibold mt-0.5">
                Concesionario Multimarca
              </span>
            </div>
          </Link>

          {/* Navegación Central Desktop (Sin saltos de línea) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <Link
              href="/"
              onMouseEnter={() => setMegaMenuOpen(false)}
              className={`h-10 px-3.5 rounded-full text-sm font-bold whitespace-nowrap inline-flex items-center transition-all ${
                pathname === '/'
                  ? 'bg-white/10 text-white'
                  : 'text-neutral-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Inicio
            </Link>

            {/* Trigger Mega-Menu Motocicletas */}
            <div
              onMouseEnter={() => setMegaMenuOpen(true)}
              className={`h-10 rounded-full inline-flex items-center transition-all ${
                pathname.startsWith('/motos') || megaMenuOpen
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/25'
                  : 'text-neutral-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Link
                href="/motos"
                onClick={() => setMegaMenuOpen(false)}
                className="pl-4 pr-1.5 h-full inline-flex items-center text-sm font-bold whitespace-nowrap"
              >
                Motocicletas
              </Link>
              <button
                type="button"
                onClick={() => setMegaMenuOpen((prev) => !prev)}
                aria-label="Desplegar marcas de motocicletas"
                className="pr-3 pl-1 h-full inline-flex items-center"
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    megaMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>

            <Link
              href="/financiacion"
              onMouseEnter={() => setMegaMenuOpen(false)}
              className={`h-10 px-3.5 rounded-full text-sm font-bold whitespace-nowrap inline-flex items-center transition-all ${
                pathname.startsWith('/financiacion')
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/25'
                  : 'text-neutral-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Financiación DNI
            </Link>

            <Link
              href="/permutas"
              onMouseEnter={() => setMegaMenuOpen(false)}
              className={`h-10 px-3.5 rounded-full text-sm font-bold whitespace-nowrap inline-flex items-center transition-all ${
                pathname.startsWith('/permutas')
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/25'
                  : 'text-neutral-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Plan Canje
            </Link>

            <Link
              href="/contacto"
              onMouseEnter={() => setMegaMenuOpen(false)}
              className={`h-10 px-3.5 rounded-full text-sm font-bold whitespace-nowrap inline-flex items-center transition-all ${
                pathname.startsWith('/contacto')
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/25'
                  : 'text-neutral-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Sucursal
            </Link>
          </nav>

          {/* Acciones Derecha Ordenadas (Buscador + Solicitá tu crédito + Cuotas) */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            {/* Buscador Predictivo */}
            <button
              type="button"
              onClick={() => {
                setMegaMenuOpen(false);
                setSearchOpen(true);
              }}
              className="w-10 h-10 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 hover:text-white flex items-center justify-center transition-colors shrink-0"
              title="Buscar moto por marca, modelo o cilindrada"
              aria-label="Abrir buscador"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Botón Píldora "Solicitá tu crédito" (1 sola línea) */}
            <button
              type="button"
              onClick={() => {
                setMegaMenuOpen(false);
                openCreditModal();
              }}
              className="h-10 px-5 rounded-full text-xs font-black uppercase tracking-wider bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/25 inline-flex items-center gap-2 whitespace-nowrap transition-all shrink-0"
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Solicitá tu crédito</span>
            </button>

            {/* Botón Píldora "Cuotas" (1 sola línea) */}
            <button
              type="button"
              onClick={() => {
                setMegaMenuOpen(false);
                openCuotasDrawer();
              }}
              className="h-10 px-4 rounded-full text-xs font-black uppercase tracking-wider bg-white text-neutral-950 hover:bg-neutral-200 inline-flex items-center gap-1.5 whitespace-nowrap transition-all shadow-sm shrink-0"
            >
              <CreditCard className="w-4 h-4 text-red-600 shrink-0" />
              <span>Cuotas</span>
            </button>
          </div>

          {/* Controles Mobile */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-200 flex items-center justify-center"
              aria-label="Buscar"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 text-white flex items-center justify-center"
              aria-label="Abrir menú"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* 3. MEGA-MENU DESKTOP ("Motocicletas" -> Marcas a la izquierda + Grilla de 4 Motos a la derecha) */}
        {megaMenuOpen && (
          <div
            onMouseEnter={() => setMegaMenuOpen(true)}
            onMouseLeave={() => setMegaMenuOpen(false)}
            className="hidden lg:block absolute top-full inset-x-0 bg-white text-neutral-950 shadow-2xl border-t-2 border-red-600 animate-fade-in z-50"
          >
            <div className="max-w-7xl mx-auto grid grid-cols-12 min-h-[340px]">
              {/* Columna Izquierda: Marcas */}
              <div className="col-span-3 bg-neutral-950 text-white p-5 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-3 block mb-2">
                    Nuestras Marcas
                  </span>
                  {marcas.map((marca) => {
                    const isSelected = marca.id === activeMarca?.id;
                    const count = motosActivas.filter(
                      (m) => m.marca_id === marca.id
                    ).length;
                    return (
                      <button
                        type="button"
                        key={marca.id}
                        onMouseEnter={() => setHoveredMarcaId(marca.id)}
                        onClick={() => {
                          setMegaMenuOpen(false);
                          router.push(`/motos?marca=${marca.slug}`);
                        }}
                        className={`w-full px-3.5 py-2 rounded-xl text-left text-sm font-bold flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-red-600 text-white shadow-md'
                            : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
                        }`}
                      >
                        <span>{marca.nombre}</span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                              isSelected
                                ? 'bg-black/25 text-white'
                                : 'bg-neutral-900 text-neutral-400'
                            }`}
                          >
                            {count}
                          </span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-neutral-800 mt-4">
                  <Link
                    href="/motos"
                    onClick={() => setMegaMenuOpen(false)}
                    className="w-full py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Ver Todo el Catálogo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Columna Derecha: Grilla de 4 Motos de la Marca Activa */}
              <div className="col-span-9 p-6 bg-white flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-4">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-red-600">
                      Modelos Destacados
                    </span>
                    <h3 className="text-xl font-black text-neutral-950">
                      Motocicletas {activeMarca?.nombre}
                    </h3>
                  </div>
                  <Link
                    href={`/motos?marca=${activeMarca?.slug}`}
                    onClick={() => setMegaMenuOpen(false)}
                    className="text-xs font-black uppercase tracking-wider text-red-600 hover:text-neutral-950 flex items-center gap-1"
                  >
                    <span>Ver todos los modelos de {activeMarca?.nombre}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {megaMenuMotos.length > 0 ? (
                  <div className="grid grid-cols-4 gap-4">
                    {megaMenuMotos.map((moto) => (
                      <Link
                        key={moto.id}
                        href={`/motos/${moto.slug}`}
                        onClick={() => setMegaMenuOpen(false)}
                        className="group rounded-2xl border border-neutral-200 hover:border-red-600 p-3 transition-all hover:shadow-lg flex flex-col justify-between bg-[#F7F7F8]"
                      >
                        <div>
                          <div className="relative h-32 rounded-xl overflow-hidden bg-neutral-900 mb-2.5">
                            <img
                              src={moto.imagen_portada}
                              alt={moto.titulo}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <span
                              className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                moto.condicion === '0km'
                                  ? 'bg-red-600 text-white'
                                  : 'bg-neutral-950 text-white'
                              }`}
                            >
                              {moto.condicion === '0km' ? '0KM' : `USADA ${moto.anio}`}
                            </span>
                          </div>
                          <h4 className="text-xs font-black text-neutral-950 group-hover:text-red-600 line-clamp-1">
                            {moto.titulo}
                          </h4>
                          <p className="text-[11px] text-neutral-500 font-semibold">
                            {moto.cilindrada} cc • Año {moto.anio}
                          </p>
                        </div>

                        <div className="pt-2 mt-2 border-t border-neutral-200/80 flex items-center justify-between">
                          <span className="text-xs font-black text-neutral-950">
                            {moto.mostrar_precio && moto.precio_contado
                              ? formatCurrency(moto.precio_contado, moto.moneda)
                              : 'Consultar'}
                          </span>
                          <span className="text-[10px] font-extrabold text-red-600 group-hover:translate-x-0.5 transition-transform">
                            Ver ficha →
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-sm text-neutral-500">
                    Consultá disponibilidad inmediata de toda la línea{' '}
                    <strong>{activeMarca?.nombre}</strong> en nuestro salón.
                  </div>
                )}

                {/* Barra Inferior del Mega-Menu */}
                <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-600">
                  <div className="flex items-center gap-4 font-bold">
                    <span className="text-red-600">✓ Financiación Solo con DNI</span>
                    <span>✓ Entrega Inmediata</span>
                    <span>✓ Plan Canje de Usados</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMegaMenuOpen(false);
                      openCreditModal();
                    }}
                    className="font-black text-neutral-950 hover:text-red-600 underline"
                  >
                    ¿Querés financiar una {activeMarca?.nombre} con tu DNI? Hacé clic acá
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. Mobile Menu Dropdown */}
        {mobileOpen && (
          <div className="lg:hidden bg-neutral-950 border-b border-neutral-800 px-4 pt-3 pb-6 space-y-3">
            <div className="space-y-1">
              {[
                { href: '/', label: 'Inicio' },
                { href: '/motos', label: 'Catálogo de Motocicletas' },
                { href: '/financiacion', label: 'Financiación Solo con DNI' },
                { href: '/permutas', label: 'Plan Canje / Entregá tu Moto' },
                { href: '/contacto', label: 'Sucursal y Contacto' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-sm font-bold text-neutral-200 hover:bg-neutral-900"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Marcas rápidas en Mobile */}
            <div className="pt-2 border-t border-neutral-800">
              <span className="px-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-2">
                Filtrar por Marca
              </span>
              <div className="flex flex-wrap gap-1.5">
                {marcas.map((m) => (
                  <Link
                    key={m.id}
                    href={`/motos?marca=${m.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-bold text-white"
                  >
                    {m.nombre}
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  openCreditModal();
                }}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-red-600 text-white font-black text-xs uppercase tracking-wider"
              >
                <ShieldCheck className="w-4 h-4" />
                Solicitar Crédito
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  openCuotasDrawer();
                }}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-white text-neutral-950 font-black text-xs uppercase tracking-wider"
              >
                <CreditCard className="w-4 h-4 text-red-600" />
                Ver Cuotas
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 5. MODAL DE BÚSQUEDA PREDICTIVA EN TIEMPO REAL */}
      {searchOpen && (
        <div className="fixed inset-0 z-[75] bg-black/75 backdrop-blur-sm flex items-start justify-center pt-16 px-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-neutral-200 animate-modal-pop">
            <div className="p-4 sm:p-5 bg-neutral-950 text-white flex items-center gap-3">
              <Search className="w-5 h-5 text-red-500 shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por modelo, marca o cilindrada (ej: Wave, XR 150, Blitz, 110)..."
                className="w-full bg-transparent text-sm sm:text-base font-semibold text-white placeholder-neutral-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-neutral-400 hover:text-white"
                >
                  Limpiar
                </button>
              )}
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-red-600 flex items-center justify-center transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 max-h-[65vh] overflow-y-auto space-y-4">
              <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-neutral-400">
                <span>
                  {searchQuery.trim()
                    ? `Resultados para "${searchQuery}" (${searchResults.length})`
                    : 'Modelos más buscados'}
                </span>
                <Link
                  href="/motos"
                  onClick={() => setSearchOpen(false)}
                  className="text-red-600 hover:underline"
                >
                  Ver catálogo completo →
                </Link>
              </div>

              {searchResults.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {searchResults.map((moto) => (
                    <Link
                      key={moto.id}
                      href={`/motos/${moto.slug}`}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center gap-3 p-2.5 rounded-2xl border border-neutral-200 hover:border-red-600 hover:bg-neutral-50 transition-all group"
                    >
                      <img
                        src={moto.imagen_portada}
                        alt={moto.titulo}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 bg-neutral-900"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-black uppercase text-red-600">
                          {moto.condicion.toUpperCase()} • {moto.cilindrada}CC
                        </span>
                        <h4 className="text-sm font-black text-neutral-950 group-hover:text-red-600 truncate">
                          {moto.titulo}
                        </h4>
                        <p className="text-xs font-bold text-neutral-600">
                          {moto.mostrar_precio && moto.precio_contado
                            ? formatCurrency(moto.precio_contado, moto.moneda)
                            : 'Consultar Precio'}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-neutral-500">
                  No encontramos modelos con ese nombre. Probá buscando por marca (Honda,
                  Motomel, Yamaha, Gilera).
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
