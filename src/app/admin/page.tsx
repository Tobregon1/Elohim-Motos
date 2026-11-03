'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bike,
  Users,
  FileSpreadsheet,
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Smartphone,
  Star,
  Flame,
  MessageCircle,
  Copy,
  Check,
  Repeat,
  ShieldCheck,
  Settings,
  Activity,
  RotateCcw,
  ExternalLink,
  X,
  Lock,
  LogOut,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import {
  CondicionMoto,
  EstadoLead,
  EstadoMoto,
  Moto,
} from '@/types/database';
import {
  ESTADO_LEAD_LABELS,
  SITUACION_LABORAL_LABELS,
  formatCurrency,
  slugify,
} from '@/lib/format';
import { getTrackingEventsLog, TrackingEventLog } from '@/lib/analytics';
import StoryGeneratorModal from '@/components/StoryGeneratorModal';

export default function AdminDashboardPage() {
  const {
    motos,
    marcas,
    categorias,
    vendedores,
    leadsFinanciacion,
    leadsPermutas,
    config,
    isLiveSupabase,
    getMarcaNombre,
    saveMoto,
    deleteMoto,
    toggleEstadoMoto,
    toggleMostrarPrecio,
    toggleDestacadaMoto,
    toggleOfertaMesMoto,
    toggleAllPrecios,
    updateLeadFinanciacion,
    updateLeadPermuta,
    saveVendedor,
    deleteVendedor,
    updateConfig,
    resetDemoData,
  } = useStore();

  const [activeTab, setActiveTab] = useState<
    'inventario' | 'crm_financiacion' | 'crm_permutas' | 'vendedores' | 'config_pixel'
  >('inventario');

  // Story Generator state
  const [storyMoto, setStoryMoto] = useState<Moto | null>(null);

  // Copied DNI state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Tracking events log
  const [pixelEvents, setPixelEvents] = useState<TrackingEventLog[]>([]);

  // Autenticación del Panel Admin (Acceso por enlace privado /admin)
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAuth = sessionStorage.getItem('elohim_admin_auth');
      if (savedAuth === 'true') setIsAdminAuth(true);
    }
    setPixelEvents(getTrackingEventsLog());
    const handler = () => setPixelEvents(getTrackingEventsLog());
    window.addEventListener('elohim-tracking-event', handler);
    return () => window.removeEventListener('elohim-tracking-event', handler);
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const pass = adminPassword.trim().toLowerCase();
    if (pass === 'elohim2026' || pass === '1234' || pass === 'admin') {
      setIsAdminAuth(true);
      setAuthError('');
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('elohim_admin_auth', 'true');
      }
    } else {
      setAuthError('Clave incorrecta. Probá con: elohim2026');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuth(false);
    setAdminPassword('');
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('elohim_admin_auth');
    }
  };

  // =========================================================================
  // MODAL DE CARGA / EDICIÓN RÁPIDA DE MOTO (< 1 MINUTO)
  // =========================================================================
  const [isMotoModalOpen, setIsMotoModalOpen] = useState(false);
  const [editingMotoId, setEditingMotoId] = useState<string | undefined>(undefined);
  const [titulo, setTitulo] = useState('');
  const [marcaId, setMarcaId] = useState(marcas[0]?.id || 'm-honda');
  const [categoriaId, setCategoriaId] = useState(categorias[0]?.id || 'c-cub');
  const [condicion, setCondicion] = useState<CondicionMoto>('0km');
  const [estado, setEstado] = useState<EstadoMoto>('disponible');
  const [cilindrada, setCilindrada] = useState(110);
  const [anio, setAnio] = useState(2026);
  const [kilometraje, setKilometraje] = useState(0);
  const [precioContado, setPrecioContado] = useState('3150000');
  const [mostrarPrecio, setMostrarPrecio] = useState(true);
  const [entregaMinima, setEntregaMinima] = useState('450000');
  const [cuotaDesde, setCuotaDesde] = useState('145000');
  const [imagenPortada, setImagenPortada] = useState(
    'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1000&q=85'
  );
  const [videoUrl, setVideoUrl] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [motorSpec, setMotorSpec] = useState('4 tiempos monocilíndrico');
  const [arranqueSpec, setArranqueSpec] = useState('Eléctrico y patada');
  const [frenoDelSpec, setFrenoDelSpec] = useState('Disco');
  const [frenoTrasSpec, setFrenoTrasSpec] = useState('Tambor');
  const [destacada, setDestacada] = useState(true);
  const [ofertaMes, setOfertaMes] = useState(false);

  const openNewMotoModal = () => {
    setEditingMotoId(undefined);
    setTitulo('');
    setMarcaId(marcas[0]?.id || 'm-honda');
    setCategoriaId(categorias[0]?.id || 'c-cub');
    setCondicion('0km');
    setEstado('disponible');
    setCilindrada(110);
    setAnio(2026);
    setKilometraje(0);
    setPrecioContado('2250000');
    setMostrarPrecio(true);
    setEntregaMinima('350000');
    setCuotaDesde('110000');
    setImagenPortada(
      'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1000&q=85'
    );
    setVideoUrl('');
    setDescripcion('Entrega inmediata solo con DNI. Aceptamos permuta.');
    setMotorSpec('4 tiempos monocilíndrico');
    setArranqueSpec('Eléctrico y patada');
    setFrenoDelSpec('Disco');
    setFrenoTrasSpec('Tambor');
    setDestacada(true);
    setOfertaMes(false);
    setIsMotoModalOpen(true);
  };

  const openEditMotoModal = (m: Moto) => {
    setEditingMotoId(m.id);
    setTitulo(m.titulo);
    setMarcaId(m.marca_id);
    setCategoriaId(m.categoria_id);
    setCondicion(m.condicion);
    setEstado(m.estado);
    setCilindrada(m.cilindrada);
    setAnio(m.anio);
    setKilometraje(m.kilometraje);
    setPrecioContado(m.precio_contado ? String(m.precio_contado) : '');
    setMostrarPrecio(m.mostrar_precio);
    setEntregaMinima(m.entrega_minima ? String(m.entrega_minima) : '');
    setCuotaDesde(m.cuota_desde ? String(m.cuota_desde) : '');
    setImagenPortada(m.imagen_portada);
    setVideoUrl(m.video_url || '');
    setDescripcion(m.descripcion);
    setMotorSpec(m.ficha_tecnica.motor || '4 tiempos');
    setArranqueSpec(m.ficha_tecnica.arranque || 'Eléctrico y patada');
    setFrenoDelSpec(m.ficha_tecnica.freno_delantero || 'Disco');
    setFrenoTrasSpec(m.ficha_tecnica.freno_trasero || 'Tambor');
    setDestacada(m.destacada);
    setOfertaMes(m.oferta_mes);
    setIsMotoModalOpen(true);
  };

  const handleSaveMotoForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const generatedSlug = `${slugify(titulo)}-${condicion}-${anio}`;
    await saveMoto({
      id: editingMotoId,
      titulo,
      slug: generatedSlug,
      marca_id: marcaId,
      categoria_id: categoriaId,
      condicion,
      estado,
      cilindrada: Number(cilindrada),
      anio: Number(anio),
      kilometraje: condicion === '0km' ? 0 : Number(kilometraje),
      precio_contado: precioContado ? Number(precioContado) : null,
      moneda: 'ARS',
      mostrar_precio: mostrarPrecio,
      entrega_minima: entregaMinima ? Number(entregaMinima) : null,
      cuota_desde: cuotaDesde ? Number(cuotaDesde) : null,
      acepta_permuta: true,
      financiacion_dni: true,
      ficha_tecnica: {
        motor: motorSpec,
        arranque: arranqueSpec,
        freno_delantero: frenoDelSpec,
        freno_trasero: frenoTrasSpec,
        colores: ['Rojo', 'Negro', 'Blanco'],
      },
      descripcion,
      imagen_portada: imagenPortada,
      galeria_imagenes: [imagenPortada],
      video_url: videoUrl || undefined,
      destacada,
      oferta_mes: ofertaMes,
    });
    setIsMotoModalOpen(false);
  };

  // =========================================================================
  // VENDEDOR FORM STATE
  // =========================================================================
  const [nuevoVendedorNombre, setNuevoVendedorNombre] = useState('');
  const [nuevoVendedorRol, setNuevoVendedorRol] = useState('Asesor Comercial');
  const [nuevoVendedorWa, setNuevoVendedorWa] = useState('5493794');
  const [nuevoVendedorSucursal, setNuevoVendedorSucursal] = useState('Casa Central');

  const handleAddVendedor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoVendedorNombre || !nuevoVendedorWa) return;
    await saveVendedor({
      nombre: nuevoVendedorNombre,
      rol: nuevoVendedorRol,
      whatsapp: nuevoVendedorWa,
      sucursal: nuevoVendedorSucursal,
      activo: true,
      orden_rotacion: vendedores.length + 1,
    });
    setNuevoVendedorNombre('');
    setNuevoVendedorWa('5493794');
  };

  // =========================================================================
  // EXPORTACIÓN A EXCEL / CSV (MINI CRM)
  // =========================================================================
  const exportarFinanciacionCSV = () => {
    const headers = [
      'Fecha',
      'Nombre Completo',
      'DNI / CUIL',
      'Telefono WhatsApp',
      'Localidad',
      'Situacion Laboral',
      'Anticipo Disponible',
      'Ingreso Aprox',
      'Moto de Interes',
      'Estado',
      'Notas Internas',
    ];
    const rows = leadsFinanciacion.map((l) => [
      new Date(l.created_at).toLocaleDateString('es-AR'),
      `"${l.nombre_completo}"`,
      `"${l.dni_cuil}"`,
      `"${l.telefono}"`,
      `"${l.localidad}"`,
      `"${SITUACION_LABORAL_LABELS[l.situacion_laboral]}"`,
      l.anticipo_disponible || 0,
      l.ingreso_aproximado || 0,
      `"${l.moto_interes_titulo}"`,
      l.estado,
      `"${(l.notas_internas || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `elohim-motos-leads-financiacion-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    a.click();
  };

  const exportarPermutasCSV = () => {
    const headers = [
      'Fecha',
      'Cliente',
      'Telefono',
      'Marca Usada',
      'Modelo Usado',
      'Anio',
      'Kilometraje',
      'Papeles al Dia',
      'Valor Pretendido',
      'Moto a Retirar',
      'Estado',
      'Notas Tasacion',
    ];
    const rows = leadsPermutas.map((l) => [
      new Date(l.created_at).toLocaleDateString('es-AR'),
      `"${l.cliente_nombre}"`,
      `"${l.cliente_telefono}"`,
      `"${l.marca_ofrecida}"`,
      `"${l.modelo_ofrecido}"`,
      l.anio_ofrecido,
      l.kilometraje_aprox,
      l.papeles_al_dia ? 'SI' : 'NO',
      l.valor_pretendido || 0,
      `"${l.moto_interes_titulo}"`,
      l.estado,
      `"${(l.notas_tasacion || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `elohim-motos-leads-permutas-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    a.click();
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isAdminAuth) {
    return (
      <div className="min-h-[82vh] bg-neutral-950 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl text-white space-y-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/30">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-red-500">
                Acceso Exclusivo Personal Autorizado
              </span>
              <h1 className="text-2xl font-black tracking-tight mt-0.5">
                Backoffice Elohim Motos
              </h1>
              <p className="text-xs text-neutral-400 mt-1">
                Ingresá la clave de la agencia para administrar el inventario y la
                bandeja CRM de consultas.
              </p>
            </div>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            {authError && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-700 text-xs font-bold text-red-300 text-center">
                {authError}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-400 mb-1.5">
                Clave de Acceso Administrador
              </label>
              <input
                type="password"
                autoFocus
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Ingresá tu clave..."
                className="w-full h-12 px-4 rounded-xl bg-neutral-950 border border-neutral-700 text-sm font-bold text-white focus:outline-none focus:border-red-600"
              />
              <span className="block text-[11px] text-neutral-500 mt-1.5">
                Clave activa: <code className="text-red-400 font-bold">elohim2026</code> (o{' '}
                <code className="text-neutral-300">1234</code>)
              </span>
            </div>

            <button
              type="submit"
              className="w-full h-12 rounded-full bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/25 transition-all"
            >
              Ingresar al Panel
            </button>
          </form>

          <div className="pt-4 border-t border-neutral-800 text-center">
            <Link
              href="/"
              className="text-xs font-bold text-neutral-400 hover:text-white transition-colors"
            >
              ← Volver al sitio público
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 pb-20">
      {/* Top Admin Header */}
      <div className="bg-neutral-950 text-white py-8 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col xl:flex-row xl:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="px-2.5 py-0.5 rounded bg-red-600 text-white text-[10px] font-black uppercase tracking-widest">
                Backoffice Oficial
              </span>
              <span className="text-xs text-neutral-400 font-semibold">
                {isLiveSupabase
                  ? '🟢 Conectado a Supabase PostgreSQL'
                  : '⚡ Modo Interactivo Local (Persistencia activa en navegador)'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Panel Administrador — Elohim Motos
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={openNewMotoModal}
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-red-600/25 transition-all whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Cargar Nueva Moto</span>
            </button>

            <button
              onClick={() => toggleAllPrecios(false)}
              className="px-3.5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 font-bold text-xs flex items-center gap-1.5 whitespace-nowrap"
              title="Pasa todo el catálogo a 'Consultar Precio' en 1 clic"
            >
              <EyeOff className="w-4 h-4 text-amber-400" />
              <span>Ocultar Precios</span>
            </button>

            <button
              onClick={() => toggleAllPrecios(true)}
              className="px-3.5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 font-bold text-xs flex items-center gap-1.5 whitespace-nowrap"
            >
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Mostrar Precios</span>
            </button>

            <Link
              href="/"
              className="px-3.5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 font-bold text-xs flex items-center gap-1.5 whitespace-nowrap transition-colors"
              title="Ir a la tienda pública"
            >
              <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
              <span>Ver Tienda</span>
            </Link>

            <button
              onClick={handleAdminLogout}
              className="px-3.5 py-2.5 rounded-xl bg-neutral-900 hover:bg-red-600 border border-neutral-700 hover:border-red-600 text-neutral-300 hover:text-white font-bold text-xs flex items-center gap-1.5 whitespace-nowrap transition-colors"
              title="Bloquear panel administrador"
            >
              <LogOut className="w-4 h-4" />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-sm">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-400">
              Stock en Catálogo
            </span>
            <p className="text-2xl font-black text-neutral-950 mt-0.5">
              {motos.length} motos
            </p>
            <span className="text-xs text-neutral-500">
              {motos.filter((m) => m.condicion === '0km').length} 0km •{' '}
              {motos.filter((m) => m.condicion === 'usada').length} usadas
            </span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-sm">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-red-600">
              Solicitudes DNI (CRM)
            </span>
            <p className="text-2xl font-black text-neutral-950 mt-0.5">
              {leadsFinanciacion.length} consultas
            </p>
            <span className="text-xs font-bold text-red-600">
              {leadsFinanciacion.filter((l) => l.estado === 'nuevo').length} nuevas para
              evaluar en BCRA
            </span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-sm">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-400">
              Permutas / Toma Usados
            </span>
            <p className="text-2xl font-black text-neutral-950 mt-0.5">
              {leadsPermutas.length} motos ofrecidas
            </p>
            <span className="text-xs text-neutral-500">
              {leadsPermutas.filter((l) => l.estado === 'nuevo').length} pendientes de
              tasación
            </span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-sm">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600">
              Enrutador WhatsApp
            </span>
            <p className="text-2xl font-black text-neutral-950 mt-0.5">
              {vendedores.filter((v) => v.activo).length} asesores activos
            </p>
            <span className="text-xs text-neutral-500">
              Rotación automática de turnos
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 pb-4">
          <button
            onClick={() => setActiveTab('inventario')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all ${
              activeTab === 'inventario'
                ? 'bg-neutral-950 text-white shadow'
                : 'bg-white text-neutral-700 hover:bg-neutral-200 border border-neutral-200'
            }`}
          >
            <Bike className="w-4 h-4 text-red-500" />
            <span>1. Inventario de Motos ({motos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('crm_financiacion')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all ${
              activeTab === 'crm_financiacion'
                ? 'bg-neutral-950 text-white shadow'
                : 'bg-white text-neutral-700 hover:bg-neutral-200 border border-neutral-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-red-500" />
            <span>2. Bandeja Financiación DNI ({leadsFinanciacion.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('crm_permutas')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all ${
              activeTab === 'crm_permutas'
                ? 'bg-neutral-950 text-white shadow'
                : 'bg-white text-neutral-700 hover:bg-neutral-200 border border-neutral-200'
            }`}
          >
            <Repeat className="w-4 h-4 text-red-500" />
            <span>3. Bandeja Toma de Usados ({leadsPermutas.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('vendedores')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all ${
              activeTab === 'vendedores'
                ? 'bg-neutral-950 text-white shadow'
                : 'bg-white text-neutral-700 hover:bg-neutral-200 border border-neutral-200'
            }`}
          >
            <Users className="w-4 h-4 text-red-500" />
            <span>4. Vendedores WhatsApp ({vendedores.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('config_pixel')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all ${
              activeTab === 'config_pixel'
                ? 'bg-neutral-950 text-white shadow'
                : 'bg-white text-neutral-700 hover:bg-neutral-200 border border-neutral-200'
            }`}
          >
            <Settings className="w-4 h-4 text-red-500" />
            <span>5. Meta Pixel, GTM y Datos Agencia</span>
          </button>
        </div>

        {/* ===================================================================
            TAB 1: GESTIÓN DE INVENTARIO (CRUD DE MOTOS + SWITCHES RÁPIDOS)
        =================================================================== */}
        {activeTab === 'inventario' && (
          <div className="pt-6 space-y-4">
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-950 text-white text-[11px] font-extrabold uppercase tracking-wider">
                      <th className="py-3.5 px-4">Unidad</th>
                      <th className="py-3.5 px-4">Estado / Visibilidad (1 Clic)</th>
                      <th className="py-3.5 px-4">Precio Contado / Switch</th>
                      <th className="py-3.5 px-4">Posicionamiento</th>
                      <th className="py-3.5 px-4 text-right">Herramientas Vendedor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 text-sm">
                    {motos.map((m) => (
                      <tr key={m.id} className="hover:bg-neutral-50 transition-colors">
                        {/* Moto Info */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={m.imagen_portada}
                              alt={m.titulo}
                              className="w-16 h-12 rounded-lg object-cover bg-neutral-900 shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase ${
                                    m.condicion === '0km'
                                      ? 'bg-red-600 text-white'
                                      : 'bg-neutral-900 text-white'
                                  }`}
                                >
                                  {m.condicion}
                                </span>
                                <span className="text-xs font-bold text-neutral-500">
                                  {getMarcaNombre(m.marca_id)} • {m.anio}
                                </span>
                              </div>
                              <Link
                                href={`/motos/${m.slug}`}
                                className="font-black text-neutral-950 hover:text-red-600 flex items-center gap-1"
                              >
                                <span>{m.titulo}</span>
                                <ExternalLink className="w-3 h-3 text-neutral-400" />
                              </Link>
                            </div>
                          </div>
                        </td>

                        {/* Switch de Visibilidad Rápido */}
                        <td className="py-4 px-4">
                          <select
                            value={m.estado}
                            onChange={(e) =>
                              toggleEstadoMoto(m.id, e.target.value as EstadoMoto)
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border cursor-pointer ${
                              m.estado === 'disponible'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : m.estado === 'reservada'
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : m.estado === 'vendida'
                                ? 'bg-red-50 text-red-800 border-red-300'
                                : 'bg-neutral-200 text-neutral-700 border-neutral-300'
                            }`}
                          >
                            <option value="disponible">🟢 Disponible</option>
                            <option value="reservada">🟡 Reservada (Cinta en foto)</option>
                            <option value="vendida">🔴 Vendida</option>
                            <option value="pausada">⚪ Pausada (Oculta)</option>
                          </select>
                        </td>

                        {/* Switch de Precio */}
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <div className="font-black text-neutral-950">
                              {formatCurrency(m.precio_contado, m.moneda)}
                            </div>
                            <button
                              onClick={() => toggleMostrarPrecio(m.id)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border transition-all ${
                                m.mostrar_precio
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-neutral-900 text-white border-neutral-800'
                              }`}
                            >
                              {m.mostrar_precio ? (
                                <>
                                  <Eye className="w-3 h-3" />
                                  <span>Precio Visible</span>
                                </>
                              ) : (
                                <>
                                  <EyeOff className="w-3 h-3 text-amber-400" />
                                  <span>Dice &ldquo;Consultar Precio&rdquo;</span>
                                </>
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Destacada / Oferta */}
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1.5">
                            <button
                              onClick={() => toggleDestacadaMoto(m.id)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border ${
                                m.destacada
                                  ? 'bg-neutral-950 text-white border-neutral-950'
                                  : 'bg-neutral-100 text-neutral-500 border-neutral-200'
                              }`}
                            >
                              <Star
                                className={`w-3.5 h-3.5 ${
                                  m.destacada ? 'fill-amber-400 text-amber-400' : ''
                                }`}
                              />
                              <span>Home</span>
                            </button>

                            <button
                              onClick={() => toggleOfertaMesMoto(m.id)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border ${
                                m.oferta_mes
                                  ? 'bg-red-600 text-white border-red-600'
                                  : 'bg-neutral-100 text-neutral-500 border-neutral-200'
                              }`}
                            >
                              <Flame className="w-3.5 h-3.5" />
                              <span>Oferta</span>
                            </button>
                          </div>
                        </td>

                        {/* Acciones: Story WA / Editar / Borrar */}
                        <td className="py-4 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => setStoryMoto(m)}
                              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
                              title="Generar placa vertical para Estado de WhatsApp / Instagram Story"
                            >
                              <Smartphone className="w-3.5 h-3.5" />
                              <span>Story WA</span>
                            </button>

                            <button
                              onClick={() => openEditMotoModal(m)}
                              className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800"
                              title="Editar Moto"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => deleteMoto(m.id)}
                              className="p-2 rounded-lg bg-neutral-100 hover:bg-red-100 text-neutral-500 hover:text-red-600"
                              title="Eliminar Moto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 2: BANDEJA DE CONSULTAS - FINANCIACIÓN CON DNI (MINI CRM)
        =================================================================== */}
        {activeTab === 'crm_financiacion' && (
          <div className="pt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-neutral-200">
              <div>
                <h2 className="text-lg font-black text-neutral-950">
                  Solicitudes de Pre-Calificación Crediticia (DNI / CUIL)
                </h2>
                <p className="text-xs text-neutral-500">
                  Copiá el DNI en 1 clic para verificar BCRA/Veraz y cambiá el estado de
                  seguimiento.
                </p>
              </div>
              <button
                onClick={exportarFinanciacionCSV}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 self-start sm:self-auto shadow"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Exportar a Excel / CSV</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {leadsFinanciacion.map((lead) => (
                <div
                  key={lead.id}
                  className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-5 items-center"
                >
                  {/* Cliente & DNI */}
                  <div className="lg:col-span-4 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-base text-neutral-950">
                        {lead.nombre_completo}
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        {new Date(lead.created_at).toLocaleDateString('es-AR')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-neutral-900 text-white font-mono text-xs font-bold">
                        DNI/CUIL: {lead.dni_cuil}
                      </span>
                      <button
                        onClick={() => copyToClipboard(lead.dni_cuil, lead.id)}
                        className="p-1.5 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs flex items-center gap-1"
                        title="Copiar DNI/CUIL para consultar BCRA / Veraz"
                      >
                        {copiedId === lead.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-neutral-600 font-medium">
                      {SITUACION_LABORAL_LABELS[lead.situacion_laboral]} • {lead.localidad}
                    </p>
                  </div>

                  {/* Moto & Anticipo */}
                  <div className="lg:col-span-3 space-y-1 text-xs">
                    <span className="font-extrabold uppercase tracking-wider text-red-600 block">
                      Moto de Interés:
                    </span>
                    <p className="font-black text-sm text-neutral-900">
                      {lead.moto_interes_titulo}
                    </p>
                    <p className="text-neutral-600">
                      Anticipo:{' '}
                      <strong>{formatCurrency(lead.anticipo_disponible)}</strong>
                      {lead.ingreso_aproximado
                        ? ` • Ingreso: ${formatCurrency(lead.ingreso_aproximado)}`
                        : ''}
                    </p>
                  </div>

                  {/* Estado & Notas Internas */}
                  <div className="lg:col-span-3 space-y-2">
                    <select
                      value={lead.estado}
                      onChange={(e) =>
                        updateLeadFinanciacion(lead.id, {
                          estado: e.target.value as EstadoLead,
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-100 border border-neutral-300 text-xs font-black uppercase"
                    >
                      {Object.entries(ESTADO_LEAD_LABELS).map(([key, val]) => (
                        <option key={key} value={key}>
                          {val.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={lead.notas_internas || ''}
                      onChange={(e) =>
                        updateLeadFinanciacion(lead.id, {
                          notas_internas: e.target.value,
                        })
                      }
                      placeholder="Agregar nota interna (ej: Aprobado BCRA)..."
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200 text-xs"
                    />
                  </div>

                  {/* Contactar por WhatsApp */}
                  <div className="lg:col-span-2 flex justify-end">
                    <a
                      href={`https://wa.me/549${lead.telefono.replace(
                        /[^0-9]/g,
                        ''
                      )}?text=${encodeURIComponent(
                        `Hola ${lead.nombre_completo}! Te escribimos de Elohim Motos por tu consulta de financiación con DNI para la ${lead.moto_interes_titulo}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Responder WA</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 3: BANDEJA DE TOMA DE USADOS / PERMUTAS
        =================================================================== */}
        {activeTab === 'crm_permutas' && (
          <div className="pt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-neutral-200">
              <div>
                <h2 className="text-lg font-black text-neutral-950">
                  Solicitudes de Toma de Usados (Permutas / Parte de Pago)
                </h2>
                <p className="text-xs text-neutral-500">
                  Revisá las fotos y estado de las motos ofrecidas y anotá la tasación.
                </p>
              </div>
              <button
                onClick={exportarPermutasCSV}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 self-start sm:self-auto shadow"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Exportar Permutas a Excel / CSV</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {leadsPermutas.map((perm) => (
                <div
                  key={perm.id}
                  className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-5 items-center"
                >
                  <div className="lg:col-span-4 flex items-start gap-3">
                    {perm.fotos_usada?.[0] && (
                      <img
                        src={perm.fotos_usada[0]}
                        alt=""
                        className="w-20 h-16 rounded-xl object-cover border border-neutral-200 shrink-0"
                      />
                    )}
                    <div className="space-y-1">
                      <span className="font-black text-base text-neutral-950 block">
                        {perm.marca_ofrecida} {perm.modelo_ofrecido} ({perm.anio_ofrecido})
                      </span>
                      <span className="text-xs text-neutral-600 block">
                        {perm.kilometraje_aprox.toLocaleString('es-AR')} km •{' '}
                        {perm.papeles_al_dia ? '✅ Papeles al día' : '⚠️ Revisar papeles'}
                      </span>
                      <span className="text-xs text-neutral-500 block">
                        Cliente: <strong>{perm.cliente_nombre}</strong> ({perm.cliente_telefono})
                      </span>
                    </div>
                  </div>

                  <div className="lg:col-span-3 text-xs space-y-1">
                    <p className="text-neutral-700 italic">&ldquo;{perm.detalles_estado}&rdquo;</p>
                    <p className="font-bold text-neutral-900">
                      Pretende: {formatCurrency(perm.valor_pretendido)}
                    </p>
                    <p className="text-red-600 font-bold">
                      Quiere sacar: {perm.moto_interes_titulo}
                    </p>
                  </div>

                  <div className="lg:col-span-3 space-y-2">
                    <select
                      value={perm.estado}
                      onChange={(e) =>
                        updateLeadPermuta(perm.id, {
                          estado: e.target.value as EstadoLead,
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-100 border border-neutral-300 text-xs font-black uppercase"
                    >
                      {Object.entries(ESTADO_LEAD_LABELS).map(([key, val]) => (
                        <option key={key} value={key}>
                          {val.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={perm.notas_tasacion || ''}
                      onChange={(e) =>
                        updateLeadPermuta(perm.id, {
                          notas_tasacion: e.target.value,
                        })
                      }
                      placeholder="Nota de tasación (ej: Tomar en $1.8M)..."
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200 text-xs"
                    />
                  </div>

                  <div className="lg:col-span-2 flex justify-end">
                    <a
                      href={`https://wa.me/549${perm.cliente_telefono.replace(
                        /[^0-9]/g,
                        ''
                      )}?text=${encodeURIComponent(
                        `Hola ${perm.cliente_nombre}! Vimos las fotos de tu ${perm.marca_ofrecida} ${perm.modelo_ofrecido} (${perm.anio_ofrecido}) en Elohim Motos para entregar por la ${perm.moto_interes_titulo}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Cotizar por WA</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 4: ENRUTADOR INTELIGENTE DE WHATSAPP (MULTI-VENDEDOR)
        =================================================================== */}
        {activeTab === 'vendedores' && (
          <div className="pt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white rounded-2xl border border-neutral-200 p-6 space-y-4">
              <h2 className="text-lg font-black text-neutral-950">
                Equipo de Vendedores en Rotación de WhatsApp
              </h2>
              <p className="text-xs text-neutral-500">
                Cada vez que un cliente toca un botón de consulta en la web, el sistema
                asigna el próximo vendedor activo para que ningún número colapse.
              </p>

              <div className="space-y-3">
                {vendedores.map((v) => (
                  <div
                    key={v.id}
                    className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-neutral-900 text-white text-[10px] font-black">
                          Orden #{v.orden_rotacion}
                        </span>
                        <span className="font-black text-sm text-neutral-950">
                          {v.nombre}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        +{v.whatsapp} • {v.sucursal}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => saveVendedor({ ...v, activo: !v.activo })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                          v.activo
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-neutral-200 text-neutral-600'
                        }`}
                      >
                        {v.activo ? 'Activo en Rotación' : 'En Pausa'}
                      </button>
                      <button
                        onClick={() => deleteVendedor(v.id)}
                        className="p-2 rounded-lg hover:bg-red-100 text-neutral-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 bg-white rounded-2xl border border-neutral-200 p-6 space-y-4">
              <h3 className="text-base font-black text-neutral-950">
                Agregar Nuevo Vendedor / Sucursal
              </h3>
              <form onSubmit={handleAddVendedor} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-1">
                    Nombre del Vendedor
                  </label>
                  <input
                    type="text"
                    required
                    value={nuevoVendedorNombre}
                    onChange={(e) => setNuevoVendedorNombre(e.target.value)}
                    placeholder="Ej: Franco - Ventas 0km"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-1">
                    Especialidad / Rol
                  </label>
                  <input
                    type="text"
                    value={nuevoVendedorRol}
                    onChange={(e) => setNuevoVendedorRol(e.target.value)}
                    placeholder="Ej: Créditos DNI y Usados"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-1">
                    WhatsApp Internacional (549...)
                  </label>
                  <input
                    type="text"
                    required
                    value={nuevoVendedorWa}
                    onChange={(e) => setNuevoVendedorWa(e.target.value)}
                    placeholder="5493794550104"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-1">
                    Sucursal
                  </label>
                  <input
                    type="text"
                    value={nuevoVendedorSucursal}
                    onChange={(e) => setNuevoVendedorSucursal(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-300 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider"
                >
                  Sumar Vendedor al Enrutador
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 5: PÍXEL DE META, GOOGLE TAG MANAGER Y CONFIGURACIÓN
        =================================================================== */}
        {activeTab === 'config_pixel' && (
          <div className="pt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 bg-white rounded-2xl border border-neutral-200 p-6 space-y-4">
              <h2 className="text-lg font-black text-neutral-950">
                Configuración de Agencia, Meta Pixel y GTM
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-1">
                    Meta Pixel ID (Facebook/Instagram)
                  </label>
                  <input
                    type="text"
                    value={config.meta_pixel_id}
                    onChange={(e) => updateConfig({ meta_pixel_id: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-300 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-1">
                    Google Tag Manager ID
                  </label>
                  <input
                    type="text"
                    value={config.gtm_id}
                    onChange={(e) => updateConfig({ gtm_id: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-300 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-1">
                    Razón Social (Data Fiscal 960/D)
                  </label>
                  <input
                    type="text"
                    value={config.razon_social}
                    onChange={(e) => updateConfig({ razon_social: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-1">
                    CUIT Oficial (ARCA)
                  </label>
                  <input
                    type="text"
                    value={config.cuit}
                    onChange={(e) => updateConfig({ cuit: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-300 text-sm font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-neutral-600 mb-1">
                    Dirección del Local
                  </label>
                  <input
                    type="text"
                    value={config.direccion}
                    onChange={(e) => updateConfig({ direccion: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-300 text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-xs text-neutral-500">
                  Los cambios se reflejan en el sitio y pie de página al instante.
                </span>
                <button
                  onClick={resetDemoData}
                  className="px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar Datos Iniciales</span>
                </button>
              </div>
            </div>

            {/* Monitor en vivo de eventos del Píxel de Meta */}
            <div className="lg:col-span-6 bg-neutral-950 text-white rounded-2xl border border-neutral-800 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-red-500" />
                  <h3 className="text-base font-black">
                    Monitor en Vivo — Píxel de Meta & GTM
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  Activo (Pixel #{config.meta_pixel_id})
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Cada vez que un visitante mira una moto (<code>ViewContent</code>), toca
                WhatsApp o envía su DNI (<code>Lead</code>), queda registrado para tus
                campañas de Remarketing en Instagram y Facebook:
              </p>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {pixelEvents.length === 0 ? (
                  <p className="text-xs text-neutral-500 py-8 text-center">
                    Todavía no se dispararon eventos en esta sesión. Entrá a una ficha de
                    moto o tocá un botón de WhatsApp para ver el disparo en tiempo real.
                  </p>
                ) : (
                  pixelEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs flex items-center justify-between gap-2"
                    >
                      <div>
                        <span
                          className={`px-2 py-0.5 rounded font-black text-[10px] uppercase mr-2 ${
                            ev.event === 'Lead'
                              ? 'bg-red-600 text-white'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          {ev.event}
                        </span>
                        <span className="font-bold text-white">
                          {String(ev.details.content_name || ev.source)}
                        </span>
                        <span className="block text-[11px] text-neutral-400 mt-0.5">
                          Origen: {ev.source}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-neutral-500 shrink-0">
                        {ev.timestamp}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================================
          MODAL CARGA / EDICIÓN DE MOTO EN < 1 MINUTO
      ===================================================================== */}
      {isMotoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl my-8 space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
              <h3 className="text-xl font-black text-neutral-950">
                {editingMotoId ? 'Editar Moto' : 'Cargar Nueva Moto en < 1 Minuto'}
              </h3>
              <button
                onClick={() => setIsMotoModalOpen(false)}
                className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMotoForm} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-extrabold uppercase text-neutral-600 mb-1">
                    Título Comercial (Marca + Modelo + Versión) *
                  </label>
                  <input
                    type="text"
                    required
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ej: Honda Wave 110S Full Disco"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-300 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-neutral-600 mb-1">
                    Marca
                  </label>
                  <select
                    value={marcaId}
                    onChange={(e) => setMarcaId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-300 text-sm font-bold"
                  >
                    {marcas.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-neutral-600 mb-1">
                    Categoría / Tipo
                  </label>
                  <select
                    value={categoriaId}
                    onChange={(e) => setCategoriaId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-300 text-sm font-bold"
                  >
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-neutral-600 mb-1">
                    Condición
                  </label>
                  <select
                    value={condicion}
                    onChange={(e) => setCondicion(e.target.value as CondicionMoto)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-300 text-sm font-bold"
                  >
                    <option value="0km">0km</option>
                    <option value="usada">Usada Seleccionada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-neutral-600 mb-1">
                    Cilindrada (cc) / Año / Km
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      value={cilindrada}
                      onChange={(e) => setCilindrada(Number(e.target.value))}
                      placeholder="110"
                      className="px-2.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-300 text-sm font-bold"
                    />
                    <input
                      type="number"
                      value={anio}
                      onChange={(e) => setAnio(Number(e.target.value))}
                      placeholder="2026"
                      className="px-2.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-300 text-sm font-bold"
                    />
                    <input
                      type="number"
                      value={kilometraje}
                      onChange={(e) => setKilometraje(Number(e.target.value))}
                      placeholder="Km"
                      disabled={condicion === '0km'}
                      className="px-2.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-300 text-sm font-bold disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-neutral-600 mb-1">
                    Precio Contado (ARS)
                  </label>
                  <input
                    type="number"
                    value={precioContado}
                    onChange={(e) => setPrecioContado(e.target.value)}
                    placeholder="3150000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-300 text-sm font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-extrabold uppercase text-neutral-600 mb-1">
                      Entrega Mínima ($)
                    </label>
                    <input
                      type="number"
                      value={entregaMinima}
                      onChange={(e) => setEntregaMinima(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 border border-neutral-300 text-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold uppercase text-neutral-600 mb-1">
                      Cuota Desde ($)
                    </label>
                    <input
                      type="number"
                      value={cuotaDesde}
                      onChange={(e) => setCuotaDesde(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 border border-neutral-300 text-sm font-bold"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-extrabold uppercase text-neutral-600 mb-1">
                    URL Foto Principal
                  </label>
                  <input
                    type="url"
                    required
                    value={imagenPortada}
                    onChange={(e) => setImagenPortada(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-300 text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-extrabold uppercase text-neutral-600 mb-1">
                    Descripción Comercial
                  </label>
                  <textarea
                    rows={2}
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-300 text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mostrarPrecio}
                    onChange={(e) => setMostrarPrecio(e.target.checked)}
                    className="accent-red-600 w-4 h-4"
                  />
                  <span>Mostrar Precio Público</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={destacada}
                    onChange={(e) => setDestacada(e.target.checked)}
                    className="accent-red-600 w-4 h-4"
                  />
                  <span>Destacar en Home</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ofertaMes}
                    onChange={(e) => setOfertaMes(e.target.checked)}
                    className="accent-red-600 w-4 h-4"
                  />
                  <span>Insignia Oferta del Mes</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsMotoModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-neutral-100 text-neutral-700 font-bold text-xs uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider"
                >
                  Guardar Unidad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Generador de Story / Ficha WA */}
      {storyMoto && (
        <StoryGeneratorModal moto={storyMoto} onClose={() => setStoryMoto(null)} />
      )}
    </div>
  );
}

