'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  Bike,
  ShieldCheck,
  MessageCircle,
  Check,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import MotoCard from '@/components/MotoCard';

function CatalogoContent() {
  const searchParams = useSearchParams();
  const { motos, marcas, categorias, openWhatsAppRouter } = useStore();

  const [busqueda, setBusqueda] = useState('');
  const [condicion, setCondicion] = useState<string>('');
  const [marcaSlug, setMarcaSlug] = useState<string>('');
  const [categoriaSlug, setCategoriaSlug] = useState<string>('');
  const [cilindradaRango, setCilindradaRango] = useState<string>('');
  const [precioMaximo, setPrecioMaximo] = useState<string>('');
  const [soloDni, setSoloDni] = useState<boolean>(false);
  const [ordenarPor, setOrdenarPor] = useState<string>('destacadas');

  // Inicializar filtros desde query params del buscador del Home
  useEffect(() => {
    const qCondicion = searchParams.get('condicion');
    const qMarca = searchParams.get('marca');
    const qCategoria = searchParams.get('categoria');
    const qCilindrada = searchParams.get('cilindrada');

    if (qCondicion) setCondicion(qCondicion);
    if (qMarca) setMarcaSlug(qMarca);
    if (qCategoria) setCategoriaSlug(qCategoria);
    if (qCilindrada) setCilindradaRango(qCilindrada);
  }, [searchParams]);

  const limpiarFiltros = () => {
    setBusqueda('');
    setCondicion('');
    setMarcaSlug('');
    setCategoriaSlug('');
    setCilindradaRango('');
    setPrecioMaximo('');
    setSoloDni(false);
    setOrdenarPor('destacadas');
  };

  const motosActivas = motos.filter((m) => m.estado !== 'pausada');

  const motosFiltradas = motosActivas
    .filter((moto) => {
      // Texto
      if (busqueda.trim()) {
        const q = busqueda.toLowerCase();
        const marcaObj = marcas.find((m) => m.id === moto.marca_id);
        const matchTitulo = moto.titulo.toLowerCase().includes(q);
        const matchMarca = marcaObj?.nombre.toLowerCase().includes(q);
        if (!matchTitulo && !matchMarca) return false;
      }

      // Condición
      if (condicion && moto.condicion !== condicion) return false;

      // Marca
      if (marcaSlug) {
        const marcaObj = marcas.find((m) => m.slug === marcaSlug);
        if (marcaObj && moto.marca_id !== marcaObj.id) return false;
      }

      // Categoría
      if (categoriaSlug) {
        const catObj = categorias.find((c) => c.slug === categoriaSlug);
        if (catObj && moto.categoria_id !== catObj.id) return false;
      }

      // Cilindrada
      if (cilindradaRango === '110' && moto.cilindrada > 115) return false;
      if (
        cilindradaRango === '150' &&
        (moto.cilindrada < 120 || moto.cilindrada > 160)
      )
        return false;
      if (cilindradaRango === '200' && moto.cilindrada < 165) return false;

      // Rango de Precio máximo
      if (precioMaximo) {
        const maxVal = Number(precioMaximo);
        if (moto.mostrar_precio && moto.precio_contado && moto.precio_contado > maxVal) {
          return false;
        }
      }

      // Solo DNI
      if (soloDni && !moto.financiacion_dni) return false;

      return true;
    })
    .sort((a, b) => {
      if (ordenarPor === 'menor_precio') {
        const pa = a.mostrar_precio && a.precio_contado ? a.precio_contado : 999999999;
        const pb = b.mostrar_precio && b.precio_contado ? b.precio_contado : 999999999;
        return pa - pb;
      }
      if (ordenarPor === 'mayor_cilindrada') {
        return b.cilindrada - a.cilindrada;
      }
      if (ordenarPor === 'mas_nuevas') {
        return b.anio - a.anio;
      }
      // Default: destacadas y disponibles primero
      if (a.destacada !== b.destacada) return a.destacada ? -1 : 1;
      return 0;
    });

  return (
    <div className="pb-20">
      {/* Page Header */}
      <div className="bg-neutral-950 text-white py-12 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-red-500 block mb-1">
              Catálogo Oficial Elohim Motos
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Motos 0km y Usadas Seleccionadas
            </h1>
            <p className="text-sm text-neutral-400 mt-1">
              Filtrá por condición, marca, cilindrada o tipo y consultá financiación con DNI en 1 clic.
            </p>
          </div>
          <Link
            href="/financiacion"
            className="px-5 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 self-start md:self-auto shadow-lg shadow-red-600/25 transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Pre-Calificar con mi DNI</span>
          </Link>
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* =================================================================
              SIDEBAR DE FILTROS (3 Cols)
          ================================================================= */}
          <aside className="lg:col-span-3 bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm space-y-6 lg:sticky lg:top-24">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2 font-black text-sm uppercase tracking-wider text-neutral-950">
                <SlidersHorizontal className="w-4 h-4 text-red-600" />
                <span>Filtros</span>
              </div>
              <button
                onClick={limpiarFiltros}
                className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Limpiar</span>
              </button>
            </div>

            {/* Buscador por texto */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-500 mb-2">
                Buscar Modelo
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Ej: Wave, XR 150, Blitz..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-neutral-100 border border-neutral-200 text-sm font-medium focus:outline-none focus:border-red-600"
                />
              </div>
            </div>

            {/* Estado / Condición */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-500 mb-2">
                Condición
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { val: '', label: 'Todas' },
                  { val: '0km', label: '0km' },
                  { val: 'usada', label: 'Usadas' },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    onClick={() => setCondicion(opt.val)}
                    className={`py-2 px-2 rounded-lg text-xs font-bold border transition-all ${
                      condicion === opt.val
                        ? 'bg-neutral-950 text-white border-neutral-950'
                        : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Marca */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-500 mb-2">
                Marca
              </label>
              <select
                value={marcaSlug}
                onChange={(e) => setMarcaSlug(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl bg-neutral-100 border border-neutral-200 text-sm font-bold text-neutral-900 focus:outline-none focus:border-red-600"
              >
                <option value="">Todas las marcas</option>
                {marcas.map((m) => (
                  <option key={m.id} value={m.slug}>
                    {m.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo / Categoría */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-500 mb-2">
                Tipo / Categoría
              </label>
              <div className="space-y-1.5">
                <button
                  onClick={() => setCategoriaSlug('')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between ${
                    categoriaSlug === ''
                      ? 'bg-red-600 text-white'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  <span>Todos los tipos</span>
                  {categoriaSlug === '' && <Check className="w-3.5 h-3.5" />}
                </button>
                {categorias.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCategoriaSlug(c.slug)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between ${
                      categoriaSlug === c.slug
                        ? 'bg-red-600 text-white'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <span>{c.nombre}</span>
                    {categoriaSlug === c.slug && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Cilindrada */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-500 mb-2">
                Cilindrada
              </label>
              <select
                value={cilindradaRango}
                onChange={(e) => setCilindradaRango(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl bg-neutral-100 border border-neutral-200 text-sm font-bold text-neutral-900 focus:outline-none focus:border-red-600"
              >
                <option value="">Todas las cilindradas</option>
                <option value="110">110 cc</option>
                <option value="150">125 cc a 150 cc</option>
                <option value="200">200 cc a +250 cc</option>
              </select>
            </div>

            {/* Rango de Precio */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-500 mb-2">
                Presupuesto de Contado
              </label>
              <select
                value={precioMaximo}
                onChange={(e) => setPrecioMaximo(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl bg-neutral-100 border border-neutral-200 text-sm font-bold text-neutral-900 focus:outline-none focus:border-red-600"
              >
                <option value="">Sin límite de precio</option>
                <option value="2200000">Hasta $ 2.200.000</option>
                <option value="3500000">Hasta $ 3.500.000</option>
                <option value="5500000">Hasta $ 5.500.000</option>
              </select>
            </div>

            {/* Checkbox Financiación DNI */}
            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 cursor-pointer">
              <input
                type="checkbox"
                checked={soloDni}
                onChange={(e) => setSoloDni(e.target.checked)}
                className="w-4 h-4 accent-red-600 rounded"
              />
              <span className="text-xs font-extrabold text-red-900">
                Solo aptas Financiación con DNI
              </span>
            </label>
          </aside>

          {/* =================================================================
              LISTADO DE MOTOS (9 Cols)
          ================================================================= */}
          <div className="lg:col-span-9 space-y-6">
            {/* Top Bar: Count & Sorting */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-2">
                <Bike className="w-5 h-5 text-red-600" />
                <span className="text-sm font-bold text-neutral-800">
                  Mostrando{' '}
                  <strong className="font-black text-neutral-950">
                    {motosFiltradas.length}
                  </strong>{' '}
                  {motosFiltradas.length === 1 ? 'unidad disponible' : 'unidades disponibles'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-500">Ordenar por:</span>
                <select
                  value={ordenarPor}
                  onChange={(e) => setOrdenarPor(e.target.value)}
                  className="py-2 px-3 rounded-xl bg-neutral-100 border border-neutral-200 text-xs font-bold text-neutral-900 focus:outline-none focus:border-red-600"
                >
                  <option value="destacadas">Destacadas y Ofertas</option>
                  <option value="menor_precio">Menor Precio</option>
                  <option value="mayor_cilindrada">Mayor Cilindrada</option>
                  <option value="mas_nuevas">Año más reciente</option>
                </select>
              </div>
            </div>

            {/* Grid or Empty State */}
            {motosFiltradas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {motosFiltradas.map((moto) => (
                  <MotoCard key={moto.id} moto={moto} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                  <Bike className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-neutral-950">
                  No encontramos motos con esos filtros exactos
                </h3>
                <p className="text-sm text-neutral-500 max-w-md mx-auto">
                  Probá limpiando los filtros o escribinos por WhatsApp: todas las semanas
                  ingresan nuevas unidades 0km y usadas seleccionadas.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={limpiarFiltros}
                    className="px-5 py-2.5 rounded-xl bg-neutral-950 text-white font-bold text-xs uppercase tracking-wider"
                  >
                    Ver Todas las Motos
                  </button>
                  <button
                    onClick={() =>
                      openWhatsAppRouter({
                        mensaje:
                          'Hola Elohim Motos! Estoy buscando un modelo en particular en el catálogo y quería consultar disponibilidad.',
                        source: 'catalogo_empty_state',
                      })
                    }
                    className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Consultar Stock por WhatsApp
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CatalogoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center text-sm font-bold text-neutral-500">
          Cargando catálogo de Elohim Motos...
        </div>
      }
    >
      <CatalogoContent />
    </Suspense>
  );
}

