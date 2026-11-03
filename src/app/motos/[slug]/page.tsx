'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  MessageCircle,
  Calculator,
  Gauge,
  Calendar,
  ShieldCheck,
  Repeat,
  Play,
  Image as ImageIcon,
  ShieldAlert,
  Sparkles,
  Wrench,
  Disc,
  Zap,
  Fuel,
  Share2,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { formatCurrency } from '@/lib/format';
import { trackPixelAndGTM } from '@/lib/analytics';
import MotoCard from '@/components/MotoCard';
import StoryGeneratorModal from '@/components/StoryGeneratorModal';

export default function MotoDetallePage() {
  const params = useParams();
  const slug = typeof params?.slug === 'string' ? params.slug : '';

  const {
    motos,
    getMarcaNombre,
    getCategoriaNombre,
    openWhatsAppRouter,
    addLeadFinanciacion,
  } = useStore();

  const moto = motos.find((m) => m.slug === slug);

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);

  // Calculadora / Simulador Lead Magnet State
  const [anticipo, setAnticipo] = useState<number>(450000);
  const [cuotas, setCuotas] = useState<number>(12);
  const [nombreLead, setNombreLead] = useState('');
  const [dniLead, setDniLead] = useState('');
  const [telefonoLead, setTelefonoLead] = useState('');
  const [aceptaLey, setAceptaLey] = useState(true);
  const [enviadoSimulador, setEnviadoSimulador] = useState(false);

  useEffect(() => {
    if (moto) {
      if (moto.entrega_minima) {
        setAnticipo(moto.entrega_minima);
      } else if (moto.precio_contado) {
        setAnticipo(Math.round(moto.precio_contado * 0.2));
      }
      // Disparar evento ViewContent para Remarketing en Instagram/Facebook
      trackPixelAndGTM('ViewContent', 'ficha_producto', {
        content_name: moto.titulo,
        content_ids: [moto.slug],
        content_type: 'product',
        value: moto.precio_contado || 0,
        currency: moto.moneda,
      });
    }
  }, [moto]);

  if (!moto) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-3xl font-black text-neutral-950">
          Unidad no encontrada en el catálogo
        </h1>
        <p className="text-neutral-600">
          Es posible que la moto haya sido vendida o el enlace haya cambiado.
        </p>
        <Link
          href="/motos"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 text-white font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Catálogo
        </Link>
      </div>
    );
  }

  const marca = getMarcaNombre(moto.marca_id);
  const categoria = getCategoriaNombre(moto.categoria_id);
  const allImages =
    moto.galeria_imagenes && moto.galeria_imagenes.length > 0
      ? moto.galeria_imagenes
      : [moto.imagen_portada];

  // Cálculo orientativo para el Simulador de Entrega
  const precioBaseReferencia = moto.precio_contado || 2800000;
  const saldoFinanciar = Math.max(precioBaseReferencia - anticipo, 200000);
  const coefTasa: Record<number, number> = {
    6: 0.21,
    12: 0.125,
    18: 0.098,
    24: 0.086,
  };
  const cuotaEstimada = Math.round(saldoFinanciar * (coefTasa[cuotas] || 0.125));

  // Botón de WhatsApp dinámico requerido en las especificaciones
  const handleWhatsAppDinamico = () => {
    const currentUrl =
      typeof window !== 'undefined'
        ? window.location.href
        : `https://elohimmotos.com.ar/motos/${moto.slug}`;
    const mensaje = `Hola! Estoy viendo en la web la ${marca} ${moto.titulo} ${moto.anio} (${currentUrl}) y quiero consultar precio de contado y opciones de financiación.`;

    openWhatsAppRouter({
      mensaje,
      motoTitulo: moto.titulo,
      motoSlug: moto.slug,
      source: 'ficha_boton_whatsapp_dinamico',
    });
  };

  // Envío desde la Calculadora / Simulador de Entrega (Lead Magnet)
  const handleSubmitSimulador = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aceptaLey) return;

    const currentUrl =
      typeof window !== 'undefined'
        ? window.location.href
        : `https://elohimmotos.com.ar/motos/${moto.slug}`;

    const { vendedor } = await addLeadFinanciacion({
      nombre_completo: nombreLead,
      dni_cuil: dniLead,
      telefono: telefonoLead,
      localidad: 'Corrientes Capital',
      situacion_laboral: 'solo_dni_informal',
      ingreso_aproximado: null,
      anticipo_disponible: anticipo,
      cuotas_preferidas: cuotas,
      moto_interes_id: moto.id,
      moto_interes_titulo: moto.titulo,
      acepto_terminos_legales: true,
    });

    setEnviadoSimulador(true);

    const mensaje = `Hola! Estoy viendo en la web la ${moto.titulo} (${currentUrl}). Simulé una entrega de ${formatCurrency(
      anticipo
    )} y quiero financiar el resto en ${cuotas} cuotas. Mi nombre es ${nombreLead} (DNI: ${dniLead}).`;

    openWhatsAppRouter({
      mensaje,
      motoTitulo: moto.titulo,
      motoSlug: moto.slug,
      vendedorId: vendedor?.id,
      source: 'ficha_simulador_entrega',
    });
  };

  const similares = motos
    .filter((m) => m.id !== moto.id && m.estado !== 'pausada')
    .slice(0, 3);

  return (
    <div className="pb-20">
      {/* Top Breadcrumb Bar */}
      <div className="bg-neutral-950 text-white py-4 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-400">
            <Link
              href="/motos"
              className="hover:text-white flex items-center gap-1 font-bold text-red-400"
            >
              <ArrowLeft className="w-4 h-4" />
              Catálogo
            </Link>
            <span>/</span>
            <span>{marca}</span>
            <span>/</span>
            <span className="text-white font-semibold truncate max-w-[220px] sm:max-w-none">
              {moto.titulo}
            </span>
          </div>

          <button
            onClick={() => setShowStoryModal(true)}
            className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-bold text-white flex items-center gap-1.5 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-red-500" />
            <span>Generar Ficha para Estado WA / PDF</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* =================================================================
              LEFT COLUMN (7 Cols): GALERÍA + VIDEO MOTOR + FICHA TÉCNICA
          ================================================================= */}
          <div className="lg:col-span-7 space-y-8">
            {/* Gallery Card */}
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
              {/* Main Viewer */}
              <div className="relative h-80 sm:h-[440px] bg-neutral-950">
                {showVideo && moto.video_url ? (
                  <video
                    src={moto.video_url}
                    controls
                    autoPlay
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={allImages[selectedImageIdx] || moto.imagen_portada}
                    alt={moto.titulo}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Top Badges */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider shadow ${
                      moto.condicion === '0km'
                        ? 'bg-red-600 text-white'
                        : 'bg-neutral-950 text-white border border-white/20'
                    }`}
                  >
                    {moto.condicion === '0km'
                      ? '0KM NUEVA'
                      : `USADA SELECCIONADA • ${moto.anio}`}
                  </span>
                  {moto.estado === 'disponible' && (
                    <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-white text-neutral-950 shadow flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Entrega Inmediata
                    </span>
                  )}
                  {moto.estado === 'reservada' && (
                    <span className="px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-amber-400 text-neutral-950 shadow">
                      UNIDAD RESERVADA
                    </span>
                  )}
                </div>

                {/* Video Motor Toggle Button (Destacado para usadas o si hay video_url) */}
                {moto.video_url && (
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <button
                      onClick={() => setShowVideo(!showVideo)}
                      className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-xl flex items-center gap-2 transition-all ${
                        showVideo
                          ? 'bg-white text-neutral-950'
                          : 'bg-red-600 hover:bg-red-500 text-white'
                      }`}
                    >
                      {showVideo ? (
                        <>
                          <ImageIcon className="w-4 h-4" />
                          <span>Ver Galería de Fotos</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-white" />
                          <span>Escuchar Motor / Ver Video</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Thumbnails Strip */}
              <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex items-center gap-3 overflow-x-auto">
                {allImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setShowVideo(false);
                      setSelectedImageIdx(idx);
                    }}
                    className={`relative w-20 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      !showVideo && selectedImageIdx === idx
                        ? 'border-red-600 scale-105 shadow'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}

                {moto.video_url && (
                  <button
                    onClick={() => setShowVideo(true)}
                    className={`px-4 h-16 rounded-xl border-2 flex items-center gap-2 text-xs font-extrabold shrink-0 transition-all ${
                      showVideo
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-neutral-900 text-white border-neutral-800 hover:bg-neutral-800'
                    }`}
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Video Motor</span>
                  </button>
                )}
              </div>
            </div>

            {/* Descripción del Vendedor */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-3 shadow-sm">
              <h2 className="text-lg font-black uppercase tracking-wide text-neutral-950 flex items-center gap-2">
                <span className="w-2 h-5 bg-red-600 rounded-sm inline-block" />
                Descripción de la Unidad
              </h2>
              <p className="text-neutral-700 leading-relaxed text-sm sm:text-base">
                {moto.descripcion}
              </p>
            </div>

            {/* Ficha Técnica Clara */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                <h2 className="text-lg font-black uppercase tracking-wide text-neutral-950 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-red-600" />
                  Ficha Técnica Completa
                </h2>
                <span className="text-xs font-extrabold px-2.5 py-1 rounded bg-neutral-100 text-neutral-800">
                  {marca} • {moto.cilindrada} cc
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
                    Marca y Modelo
                  </span>
                  <span className="text-sm font-black text-neutral-900">
                    {marca} — {moto.titulo}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
                    Cilindrada y Categoría
                  </span>
                  <span className="text-sm font-black text-neutral-900">
                    {moto.cilindrada} cc • {categoria}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
                    Tipo de Motor
                  </span>
                  <span className="text-sm font-black text-neutral-900">
                    {moto.ficha_tecnica.motor || 'Monocilíndrico 4 tiempos'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-red-600" /> Arranque
                  </span>
                  <span className="text-sm font-black text-neutral-900">
                    {moto.ficha_tecnica.arranque || 'Eléctrico y a patada'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block flex items-center gap-1">
                    <Disc className="w-3.5 h-3.5 text-red-600" /> Freno Delantero / Trasero
                  </span>
                  <span className="text-sm font-black text-neutral-900">
                    Del: {moto.ficha_tecnica.freno_delantero || 'Disco'} / Tras:{' '}
                    {moto.ficha_tecnica.freno_trasero || 'Tambor'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
                    Transmisión / Caja
                  </span>
                  <span className="text-sm font-black text-neutral-900">
                    {moto.ficha_tecnica.transmision || 'Manual / Semi-automática'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
                    Año y Kilometraje
                  </span>
                  <span className="text-sm font-black text-neutral-900">
                    Año {moto.anio} •{' '}
                    {moto.condicion === '0km'
                      ? '0 km (Sin rodar)'
                      : `${moto.kilometraje.toLocaleString('es-AR')} km reales`}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block flex items-center gap-1">
                    <Fuel className="w-3.5 h-3.5 text-red-600" /> Colores Disponibles
                  </span>
                  <span className="text-sm font-black text-neutral-900">
                    {moto.ficha_tecnica.colores?.join(' / ') || 'Rojo, Negro, Blanco'}
                  </span>
                </div>
              </div>

              {/* Mandatory Dealership Legal Disclaimer under 0km/used sheet */}
              <div className="p-3.5 rounded-xl bg-neutral-100 border border-neutral-200 flex items-start gap-2.5 text-[11px] text-neutral-500 leading-relaxed">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <p>
                  Las imágenes publicadas en este sitio son de carácter ilustrativo. Los
                  precios, planes de financiación y disponibilidad de stock están sujetos a
                  modificaciones sin previo aviso. Los valores expresados no incluyen gastos
                  de patentamiento, flete ni formularios, salvo que se indique expresamente
                  lo contrario.
                </p>
              </div>
            </div>
          </div>

          {/* =================================================================
              RIGHT COLUMN (5 Cols): PRECIO + WHATSAPP DINÁMICO + SIMULADOR
          ================================================================= */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            {/* Main Commercial Card */}
            <div className="bg-white rounded-2xl border-2 border-neutral-900 p-6 shadow-xl space-y-5">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-red-600">
                    {marca} • {categoria}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-neutral-600">
                    <Calendar className="w-3.5 h-3.5" /> Año {moto.anio} •{' '}
                    <Gauge className="w-3.5 h-3.5 ml-1" />{' '}
                    {moto.condicion === '0km' ? '0km' : `${moto.kilometraje} km`}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 leading-tight">
                  {moto.titulo}
                </h1>
              </div>

              {/* Price Box */}
              <div className="p-4 rounded-xl bg-neutral-950 text-white space-y-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
                      Precio de Contado
                    </span>
                    {moto.mostrar_precio && moto.precio_contado ? (
                      <span className="text-3xl font-black text-white tracking-tight">
                        {formatCurrency(moto.precio_contado, moto.moneda)}
                      </span>
                    ) : (
                      <span className="text-2xl font-black text-white">
                        Consultar Precio del Día
                      </span>
                    )}
                  </div>

                  {moto.entrega_minima && (
                    <div className="text-right">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-400 block">
                        Retirala hoy con
                      </span>
                      <span className="text-lg font-black text-red-400">
                        {formatCurrency(moto.entrega_minima, moto.moneda)}
                      </span>
                    </div>
                  )}
                </div>

                {moto.cuota_desde && (
                  <div className="pt-2.5 border-t border-neutral-800 flex items-center justify-between text-xs">
                    <span className="text-neutral-300">Financiación con DNI:</span>
                    <span className="font-bold text-white">
                      Cuotas fijas desde{' '}
                      <strong className="text-red-400">
                        {formatCurrency(moto.cuota_desde)}
                      </strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Dynamic WhatsApp CTA Button */}
              <button
                onClick={handleWhatsAppDinamico}
                className="w-full py-4 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm sm:text-base uppercase tracking-wider shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2.5 transition-all"
              >
                <MessageCircle className="w-5 h-5 fill-white text-emerald-600 shrink-0" />
                <span>Consultar Contado y Financiación</span>
              </button>

              {/* Quick Badges */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <Link
                  href={`/financiacion?moto=${moto.id}`}
                  className="p-3 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-900 font-bold flex items-center gap-2 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Calificar con mi DNI</span>
                </Link>
                <Link
                  href={`/permutas?moto=${moto.id}`}
                  className="p-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-neutral-900 font-bold flex items-center gap-2 transition-colors"
                >
                  <Repeat className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Entregar mi Usada</span>
                </Link>
              </div>
            </div>

            {/* ===============================================================
                CALCULADORA / SIMULADOR DE ENTREGA (LEAD MAGNET)
            =============================================================== */}
            <div className="bg-neutral-950 text-white rounded-2xl border border-neutral-800 p-6 shadow-xl space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shrink-0">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-400">
                    Simulador Directo con el Vendedor
                  </span>
                  <h3 className="text-lg font-black leading-snug">
                    ¿Cuánto podés entregar de anticipo y en cuántas cuotas querés el resto?
                  </h3>
                </div>
              </div>

              {enviadoSimulador ? (
                <div className="p-5 rounded-xl bg-emerald-950/60 border border-emerald-700/60 text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h4 className="font-black text-base text-white">
                    ¡Propuesta enviada al vendedor!
                  </h4>
                  <p className="text-xs text-emerald-200 leading-relaxed">
                    Tu simulación quedó registrada en la bandeja de Elohim Motos y se abrió
                    WhatsApp para que un asesor confirme tu cuota exacta con tu DNI.
                  </p>
                  <button
                    onClick={() => setEnviadoSimulador(false)}
                    className="text-xs font-bold text-red-400 underline"
                  >
                    Hacer otra simulación
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitSimulador} className="space-y-4">
                  {/* Anticipo Slider & Input */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                      <span className="text-neutral-300">Tu anticipo disponible:</span>
                      <span className="text-base font-black text-red-400">
                        {formatCurrency(anticipo)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={Math.max((moto.precio_contado || 3500000) * 0.8, 2500000)}
                      step={50000}
                      value={anticipo}
                      onChange={(e) => setAnticipo(Number(e.target.value))}
                      className="w-full accent-red-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
                      <span>$0 (100% Financiado)</span>
                      <span>Entrega o moto usada</span>
                    </div>
                  </div>

                  {/* Cantidad de Cuotas */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-2">
                      ¿En cuántas cuotas querés financiar el saldo?
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[6, 12, 18, 24].map((n) => (
                        <button
                          type="button"
                          key={n}
                          onClick={() => setCuotas(n)}
                          className={`py-2.5 rounded-xl text-xs font-black border transition-all ${
                            cuotas === n
                              ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
                              : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                          }`}
                        >
                          {n} cuotas
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Estimación Box */}
                  <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold block">
                        Plan Estimado ({cuotas} cuotas)
                      </span>
                      <span className="text-xs text-neutral-300">
                        Anticipo {formatCurrency(anticipo)} +
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-white">
                        {cuotas}x {formatCurrency(cuotaEstimada)}*
                      </span>
                      <span className="block text-[9px] text-neutral-500">
                        *Sujeto a evaluación crediticia
                      </span>
                    </div>
                  </div>

                  {/* Datos rápidos para enviar al vendedor */}
                  <div className="space-y-2.5 pt-1">
                    <input
                      type="text"
                      required
                      value={nombreLead}
                      onChange={(e) => setNombreLead(e.target.value)}
                      placeholder="Tu Nombre y Apellido"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-red-500"
                    />
                    <div className="grid grid-cols-2 gap-2.5">
                      <input
                        type="text"
                        required
                        value={dniLead}
                        onChange={(e) => setDniLead(e.target.value)}
                        placeholder="DNI o CUIL"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-red-500"
                      />
                      <input
                        type="tel"
                        required
                        value={telefonoLead}
                        onChange={(e) => setTelefonoLead(e.target.value)}
                        placeholder="Tu WhatsApp"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  {/* Ley 25.326 Checkbox */}
                  <label className="flex items-start gap-2 text-[11px] text-neutral-400 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={aceptaLey}
                      onChange={(e) => setAceptaLey(e.target.checked)}
                      className="mt-0.5 accent-red-600 rounded"
                    />
                    <span>
                      Acepto los Términos y Condiciones y autorizo el tratamiento de mis
                      datos personales para evaluación crediticia conforme a la Ley 25.326.
                    </span>
                  </label>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-red-600/25 flex items-center justify-center gap-2 transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Enviar mi Simulación al Vendedor</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Motos Similares */}
        {similares.length > 0 && (
          <div className="pt-8 border-t border-neutral-200 space-y-6">
            <h2 className="text-2xl font-black text-neutral-950">
              Otras unidades que te pueden interesar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similares.map((m) => (
                <MotoCard key={m.id} moto={m} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal Generador de Story / Ficha */}
      {showStoryModal && (
        <StoryGeneratorModal moto={moto} onClose={() => setShowStoryModal(false)} />
      )}
    </div>
  );
}

