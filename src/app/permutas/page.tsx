'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Repeat,
  Upload,
  CheckCircle2,
  MessageCircle,
  FileCheck2,
  Wrench,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { Vendedor } from '@/types/database';
import { formatCurrency } from '@/lib/format';

function PermutasContent() {
  const searchParams = useSearchParams();
  const { motos, addLeadPermuta, openWhatsAppRouter } = useStore();

  const motosActivas = motos.filter((m) => m.estado !== 'pausada');

  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');
  const [marcaOfrecida, setMarcaOfrecida] = useState('Honda');
  const [modeloOfrecido, setModeloOfrecido] = useState('');
  const [anioOfrecido, setAnioOfrecido] = useState(2022);
  const [kilometrajeAprox, setKilometrajeAprox] = useState('12000');
  const [papelesAlDia, setPapelesAlDia] = useState(true);
  const [detallesEstado, setDetallesEstado] = useState('');
  const [valorPretendido, setValorPretendido] = useState('');
  const [motoInteresId, setMotoInteresId] = useState('');
  const [fotosPreview, setFotosPreview] = useState<string[]>([]);

  const [submitted, setSubmitted] = useState(false);
  const [vendedorAsignado, setVendedorAsignado] = useState<Vendedor | null>(null);

  useEffect(() => {
    const qMoto = searchParams.get('moto');
    if (qMoto) {
      setMotoInteresId(qMoto);
    } else if (motosActivas.length > 0 && !motoInteresId) {
      setMotoInteresId(motosActivas[0].id);
    }
  }, [searchParams, motosActivas, motoInteresId]);

  const selectedMoto = motos.find((m) => m.id === motoInteresId);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files)
      .slice(0, 4 - fotosPreview.length)
      .forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setFotosPreview((prev) => [...prev, reader.result as string].slice(0, 4));
          }
        };
        reader.readAsDataURL(file);
      });
  };

  const removeFoto = (index: number) => {
    setFotosPreview((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const motoTitulo = selectedMoto ? selectedMoto.titulo : 'Catálogo General';

    const { vendedor } = await addLeadPermuta({
      cliente_nombre: clienteNombre,
      cliente_telefono: clienteTelefono,
      marca_ofrecida: marcaOfrecida,
      modelo_ofrecido: modeloOfrecido,
      anio_ofrecido: Number(anioOfrecido),
      kilometraje_aprox: Number(kilometrajeAprox || 0),
      papeles_al_dia: papelesAlDia,
      detalles_estado: detallesEstado || 'Buen estado general',
      fotos_usada:
        fotosPreview.length > 0
          ? fotosPreview
          : [
              'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80',
            ],
      valor_pretendido: valorPretendido ? Number(valorPretendido) : null,
      moto_interes_id: selectedMoto ? selectedMoto.id : null,
      moto_interes_titulo: motoTitulo,
    });

    setVendedorAsignado(vendedor);
    setSubmitted(true);
  };

  const handleWhatsAppTasador = () => {
    const motoTitulo = selectedMoto ? selectedMoto.titulo : 'Catálogo General';
    const mensaje = `Hola Elohim Motos! Quiero cotizar mi moto usada para entregar en parte de pago:\n\n• Mi moto: ${marcaOfrecida} ${modeloOfrecido} (Año ${anioOfrecido})\n• Kilometraje: ${kilometrajeAprox} km\n• Papeles al día (08/Título): ${
      papelesAlDia ? 'Sí, al día' : 'Falta completar'
    }\n• Estado: ${detallesEstado}\n• Moto que me interesa retirar: ${motoTitulo}\n\nSoy ${clienteNombre}.`;

    openWhatsAppRouter({
      mensaje,
      motoTitulo,
      vendedorId: vendedorAsignado?.id,
      source: 'permutas_post_submit_whatsapp',
    });
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-neutral-950 text-white py-14 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 text-xs font-extrabold uppercase tracking-wider">
              <Repeat className="w-3.5 h-3.5" />
              Plan Canje Elohim Motos • Tasación en el Día
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
              Entregá tu Moto Usada en{' '}
              <span className="text-red-500">Parte de Pago</span>
            </h1>
            <p className="text-neutral-300 text-base sm:text-lg leading-relaxed">
              Subí los datos y fotos de tu moto actual para recibir una cotización
              aproximada y usala como anticipo para retirar tu 0km o usada más nueva.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* =================================================================
              LEFT COLUMN (7 Cols): FORMULARIO DE TOMA DE USADOS
          ================================================================= */}
          <div className="lg:col-span-7 bg-white rounded-3xl border-2 border-neutral-900 p-6 sm:p-9 shadow-xl">
            {submitted ? (
              <div className="py-8 text-center space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">
                    Ficha de Tasación Recibida
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-neutral-950">
                    ¡Ya registramos tu {marcaOfrecida} {modeloOfrecido}!
                  </h2>
                  <p className="text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
                    Nuestro equipo de tasación ya tiene las fotos y datos de tu unidad en la
                    bandeja de <strong>Elohim Motos</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-100 border border-neutral-200 max-w-md mx-auto text-left text-xs space-y-1.5">
                  <p>
                    <strong>Unidad ofrecida:</strong> {marcaOfrecida} {modeloOfrecido} (
                    {anioOfrecido}) — {Number(kilometrajeAprox).toLocaleString('es-AR')} km
                  </p>
                  <p>
                    <strong>Documentación al día:</strong> {papelesAlDia ? 'Sí' : 'A revisar'}
                  </p>
                  <p>
                    <strong>Moto a retirar:</strong>{' '}
                    {selectedMoto ? selectedMoto.titulo : 'A definir'}
                  </p>
                </div>

                <div className="space-y-3 pt-2 max-w-md mx-auto">
                  <button
                    onClick={handleWhatsAppTasador}
                    className="w-full py-4 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all"
                  >
                    <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
                    <span>Hablar con el Tasador por WhatsApp</span>
                  </button>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-xs font-bold text-neutral-500 hover:text-neutral-900 underline"
                  >
                    Cotizar otra moto
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="border-b border-neutral-200 pb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-neutral-950">
                      Formulario de Cotización de Usados
                    </h2>
                    <p className="text-xs text-neutral-500">
                      Completá los datos de tu moto y elegí cuál querés retirar de la agencia.
                    </p>
                  </div>
                  <Repeat className="w-7 h-7 text-red-600 shrink-0" />
                </div>

                {/* Datos de Contacto */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-700 mb-1.5">
                      Tu Nombre y Apellido *
                    </label>
                    <input
                      type="text"
                      required
                      value={clienteNombre}
                      onChange={(e) => setClienteNombre(e.target.value)}
                      placeholder="Ej: Martín Almirón"
                      className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-300 text-sm font-semibold focus:outline-none focus:border-red-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-700 mb-1.5">
                      Teléfono WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      value={clienteTelefono}
                      onChange={(e) => setClienteTelefono(e.target.value)}
                      placeholder="Ej: 3794 550102"
                      className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-300 text-sm font-semibold focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                {/* Datos de la Moto del Cliente */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-700 mb-1.5">
                      Marca de tu Moto *
                    </label>
                    <select
                      value={marcaOfrecida}
                      onChange={(e) => setMarcaOfrecida(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-300 text-sm font-bold text-neutral-900 focus:outline-none focus:border-red-600"
                    >
                      <option value="Honda">Honda</option>
                      <option value="Yamaha">Yamaha</option>
                      <option value="Motomel">Motomel</option>
                      <option value="Gilera">Gilera</option>
                      <option value="Corven">Corven</option>
                      <option value="Zanella">Zanella</option>
                      <option value="Bajaj">Bajaj</option>
                      <option value="Keller">Keller</option>
                      <option value="Guerrero">Guerrero</option>
                      <option value="Otra">Otra Marca</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-700 mb-1.5">
                      Modelo y Cilindrada *
                    </label>
                    <input
                      type="text"
                      required
                      value={modeloOfrecido}
                      onChange={(e) => setModeloOfrecido(e.target.value)}
                      placeholder="Ej: Wave 110S, Blitz 110, XR 150..."
                      className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-300 text-sm font-semibold focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-700 mb-1.5">
                      Año *
                    </label>
                    <input
                      type="number"
                      required
                      min={2005}
                      max={2026}
                      value={anioOfrecido}
                      onChange={(e) => setAnioOfrecido(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-300 text-sm font-semibold focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-700 mb-1.5">
                      Kilometraje Aproximado *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={kilometrajeAprox}
                      onChange={(e) => setKilometrajeAprox(e.target.value)}
                      placeholder="Ej: 12000"
                      className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-300 text-sm font-semibold focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                {/* Papeles al Día y Valor Pretendido */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-700 mb-1.5">
                      ¿Papeles al día listos para transferir? *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPapelesAlDia(true)}
                        className={`py-3 px-3 rounded-xl text-xs font-black border transition-all ${
                          papelesAlDia
                            ? 'bg-neutral-950 text-white border-neutral-950'
                            : 'bg-neutral-50 text-neutral-700 border-neutral-300'
                        }`}
                      >
                        ✓ Sí, todos al día
                      </button>
                      <button
                        type="button"
                        onClick={() => setPapelesAlDia(false)}
                        className={`py-3 px-3 rounded-xl text-xs font-black border transition-all ${
                          !papelesAlDia
                            ? 'bg-red-600 text-white border-red-600'
                            : 'bg-neutral-50 text-neutral-700 border-neutral-300'
                        }`}
                      >
                        Falta algún trámite
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-700 mb-1.5">
                      Valor Pretendido ($) (Opcional)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={50000}
                      value={valorPretendido}
                      onChange={(e) => setValorPretendido(e.target.value)}
                      placeholder="Ej: 1850000"
                      className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-300 text-sm font-semibold focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                {/* Estado General */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Estado General (Motor, plásticos, cubiertas) *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={detallesEstado}
                    onChange={(e) => setDetallesEstado(e.target.value)}
                    placeholder="Ej: Único dueño, motor 10 puntos sin ruidos, cubiertas a medio uso, detalle mínimo en cacha derecha..."
                    className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-300 text-sm font-medium focus:outline-none focus:border-red-600"
                  />
                </div>

                {/* Subida de 3 o 4 Fotos */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Subí 3 o 4 Fotos de tu Moto (Frente, laterales y tablero)
                  </label>

                  <div className="border-2 border-dashed border-neutral-300 hover:border-red-600 rounded-2xl p-5 text-center transition-colors bg-neutral-50">
                    <label className="cursor-pointer flex flex-col items-center gap-2">
                      <div className="w-11 h-11 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                        <Upload className="w-5 h-5" />
                      </div>
                      <span className="text-xs sm:text-sm font-black text-neutral-900">
                        Tocá acá para elegir hasta 4 fotos desde tu celular o PC
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        Formatos JPG, PNG o WEBP ({fotosPreview.length}/4 cargadas)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {fotosPreview.length > 0 && (
                    <div className="grid grid-cols-4 gap-3 mt-3">
                      {fotosPreview.map((src, idx) => (
                        <div
                          key={idx}
                          className="relative h-20 rounded-xl overflow-hidden border border-neutral-300 group"
                        >
                          <img src={src} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeFoto(idx)}
                            className="absolute top-1 right-1 p-1 rounded-md bg-black/70 text-white hover:bg-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Moto de la Agencia que Quiere Sacar */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-700 mb-1.5">
                    ¿Qué Moto de Elohim Motos querés retirar? *
                  </label>
                  <select
                    value={motoInteresId}
                    onChange={(e) => setMotoInteresId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-300 text-sm font-bold text-neutral-900 focus:outline-none focus:border-red-600"
                  >
                    {motosActivas.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.titulo} ({m.condicion.toUpperCase()} -{' '}
                        {m.mostrar_precio && m.precio_contado
                          ? formatCurrency(m.precio_contado)
                          : 'Consultar'}
                        )
                      </option>
                    ))}
                    <option value="otra">A definir en el salón</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-base uppercase tracking-wider shadow-xl shadow-red-600/25 flex items-center justify-center gap-2 transition-all"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Enviar Datos para Tasación</span>
                </button>
              </form>
            )}
          </div>

          {/* =================================================================
              RIGHT COLUMN (5 Cols): REQUISITOS DE TOMA DE USADOS
          ================================================================= */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-neutral-950 text-white rounded-3xl p-6 sm:p-8 border border-neutral-800 space-y-6">
              <h3 className="text-xl font-black text-white">
                Requisitos para entregar tu moto en parte de pago
              </h3>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-start gap-3.5">
                  <FileCheck2 className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-white">
                      Documentación Lista para Transferir
                    </h4>
                    <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                      Título digital o físico, Cédula, Formulario 08 firmado o titular
                      presente para firmar, y libre de deudas o multas graves.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-start gap-3.5">
                  <Wrench className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-white">
                      Revisión Mecánica Rápida en nuestro Local
                    </h4>
                    <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                      Te damos un valor estimativo por WhatsApp y cuando te acercás al local
                      nuestro mecánico la revisa en 15 minutos para cerrarte el número final.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PermutasPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center text-sm font-bold text-neutral-500">
          Cargando cotizador de permutas...
        </div>
      }
    >
      <PermutasContent />
    </Suspense>
  );
}

