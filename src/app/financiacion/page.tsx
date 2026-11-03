'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  CheckCircle2,
  MessageCircle,
  Lock,
  Sparkles,
  FileCheck,
  Clock,
  CreditCard,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { SituacionLaboralTipo, Vendedor } from '@/types/database';
import { SITUACION_LABORAL_LABELS, formatCurrency } from '@/lib/format';

function FinanciacionContent() {
  const searchParams = useSearchParams();
  const { motos, addLeadFinanciacion, openWhatsAppRouter } = useStore();

  const motosActivas = motos.filter((m) => m.estado !== 'pausada');

  const [nombreCompleto, setNombreCompleto] = useState('');
  const [dniCuil, setDniCuil] = useState('');
  const [telefono, setTelefono] = useState('');
  const [localidad, setLocalidad] = useState('Corrientes Capital');
  const [situacionLaboral, setSituacionLaboral] =
    useState<SituacionLaboralTipo>('solo_dni_informal');
  const [ingresoAprox, setIngresoAprox] = useState('');
  const [anticipoDisponible, setAnticipoDisponible] = useState('350000');
  const [cuotasPreferidas, setCuotasPreferidas] = useState<number>(12);
  const [motoInteresId, setMotoInteresId] = useState<string>('');
  const [aceptoTerminos, setAceptoTerminos] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aceptoTerminos) return;

    const motoTitulo = selectedMoto ? selectedMoto.titulo : 'Catálogo General (A definir)';

    const { vendedor } = await addLeadFinanciacion({
      nombre_completo: nombreCompleto,
      dni_cuil: dniCuil,
      telefono,
      localidad,
      situacion_laboral: situacionLaboral,
      ingreso_aproximado: ingresoAprox ? Number(ingresoAprox) : null,
      anticipo_disponible: anticipoDisponible ? Number(anticipoDisponible) : 0,
      cuotas_preferidas: cuotasPreferidas,
      moto_interes_id: selectedMoto ? selectedMoto.id : null,
      moto_interes_titulo: motoTitulo,
      acepto_terminos_legales: true,
    });

    setVendedorAsignado(vendedor);
    setSubmitted(true);
  };

  const handleConectarWhatsApp = () => {
    const motoTitulo = selectedMoto ? selectedMoto.titulo : 'Catálogo General';
    const mensaje = `Hola Elohim Motos! Acabo de completar el formulario de Pre-Calificación Crediticia en la web.\n\n• Nombre: ${nombreCompleto}\n• DNI/CUIL: ${dniCuil}\n• Situación: ${SITUACION_LABORAL_LABELS[situacionLaboral]}\n• Moto de interés: ${motoTitulo}\n• Anticipo disponible: ${formatCurrency(
      Number(anticipoDisponible || 0)
    )} (${cuotasPreferidas} cuotas)\n\nQuedo a la espera de la evaluación.`;

    openWhatsAppRouter({
      mensaje,
      motoTitulo,
      vendedorId: vendedorAsignado?.id,
      source: 'financiacion_post_submit_whatsapp',
    });
  };

  return (
    <div className="pb-20">
      {/* Header Banner */}
      <div className="bg-neutral-950 text-white py-14 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 text-xs font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Evaluación Crediticia Online sin Cargo • Respuesta en 15 Minutos
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
              Pre-Aprobación de Financiación{' '}
              <span className="text-red-500">Solo con tu DNI</span>
            </h1>
            <p className="text-neutral-300 text-base sm:text-lg leading-relaxed">
              Completá tus datos para que nuestros asesores verifiquen tu cupo crediticio en
              el acto y te armen el mejor plan de cuotas fijas para retirar tu moto hoy.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* =================================================================
              LEFT COLUMN (7 Cols): FORMULARIO DE PRE-CALIFICACIÓN CREDITICIA
          ================================================================= */}
          <div className="lg:col-span-7 bg-white rounded-3xl border-2 border-neutral-900 p-6 sm:p-9 shadow-xl">
            {submitted ? (
              <div className="py-8 text-center space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">
                    Solicitud Registrada en Bandeja CRM
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-neutral-950">
                    ¡Recibimos tu solicitud, {nombreCompleto.split(' ')[0]}!
                  </h2>
                  <p className="text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
                    Tus datos ya fueron ingresados al sistema de pre-aprobación de{' '}
                    <strong>Elohim Motos</strong>.
                    {vendedorAsignado && (
                      <>
                        {' '}
                        Tu asesor asignado es <strong>{vendedorAsignado.nombre}</strong> (
                        {vendedorAsignado.sucursal}).
                      </>
                    )}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-100 border border-neutral-200 max-w-md mx-auto text-left text-xs space-y-1.5">
                  <p>
                    <strong>DNI / CUIL:</strong> {dniCuil}
                  </p>
                  <p>
                    <strong>Moto seleccionada:</strong>{' '}
                    {selectedMoto ? selectedMoto.titulo : 'A definir'}
                  </p>
                  <p>
                    <strong>Anticipo declarado:</strong>{' '}
                    {formatCurrency(Number(anticipoDisponible || 0))} en {cuotasPreferidas}{' '}
                    cuotas
                  </p>
                </div>

                <div className="space-y-3 pt-2 max-w-md mx-auto">
                  <button
                    onClick={handleConectarWhatsApp}
                    className="w-full py-4 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all"
                  >
                    <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
                    <span>Acelerar Trámite por WhatsApp Ahora</span>
                  </button>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-xs font-bold text-neutral-500 hover:text-neutral-900 underline"
                  >
                    Cargar otra consulta
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="border-b border-neutral-200 pb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-neutral-950">
                      Formulario de Pre-Calificación Crediticia
                    </h2>
                    <p className="text-xs text-neutral-500">
                      Completá en menos de 1 minuto. Datos protegidos bajo Ley 25.326.
                    </p>
                  </div>
                  <ShieldCheck className="w-8 h-8 text-red-600 shrink-0" />
                </div>

                {/* Datos Personales */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-700 mb-1.5">
                      Nombre y Apellido Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={nombreCompleto}
                      onChange={(e) => setNombreCompleto(e.target.value)}
                      placeholder="Ej: Juan Carlos Pérez"
                      className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-300 text-sm font-semibold focus:outline-none focus:border-red-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-700 mb-1.5">
                      DNI o CUIL (Sin puntos) *
                    </label>
                    <input
                      type="text"
                      required
                      value={dniCuil}
                      onChange={(e) => setDniCuil(e.target.value)}
                      placeholder="Ej: 38492019 o 20-38492019-4"
                      className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-300 text-sm font-semibold focus:outline-none focus:border-red-600 focus:bg-white"
                    />
                    <span className="text-[10px] text-neutral-500 mt-1 block">
                      Necesario para consultar cupo en BCRA / Financieras
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-700 mb-1.5">
                      Teléfono (WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="Ej: 3794 550101"
                      className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-300 text-sm font-semibold focus:outline-none focus:border-red-600 focus:bg-white"
                    />
                    <span className="text-[10px] text-neutral-500 mt-1 block">
                      Con código de área sin el 0 ni el 15
                    </span>
                  </div>
                </div>

                {/* Situación Laboral y Localidad */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-700 mb-1.5">
                      Situación Laboral *
                    </label>
                    <select
                      value={situacionLaboral}
                      onChange={(e) =>
                        setSituacionLaboral(e.target.value as SituacionLaboralTipo)
                      }
                      className="w-full px-3.5 py-3 rounded-xl bg-neutral-50 border border-neutral-300 text-sm font-bold text-neutral-900 focus:outline-none focus:border-red-600"
                    >
                      <option value="solo_dni_informal">
                        Solo DNI (Sin recibo / Ingreso informal)
                      </option>
                      <option value="recibo_sueldo">Con Recibo de Sueldo</option>
                      <option value="monotributista">Monotributista / Autónomo</option>
                      <option value="jubilado_pensionado">Jubilado / Pensionado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-700 mb-1.5">
                      Localidad / Ciudad *
                    </label>
                    <input
                      type="text"
                      required
                      value={localidad}
                      onChange={(e) => setLocalidad(e.target.value)}
                      placeholder="Corrientes Capital"
                      className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-300 text-sm font-semibold focus:outline-none focus:border-red-600 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Moto de Interés */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Moto de Interés *
                  </label>
                  <select
                    value={motoInteresId}
                    onChange={(e) => setMotoInteresId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-300 text-sm font-bold text-neutral-900 focus:outline-none focus:border-red-600"
                  >
                    {motosActivas.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.titulo} ({m.condicion.toUpperCase()} - {m.anio})
                      </option>
                    ))}
                    <option value="otra">
                      Otro modelo / Quiero que me asesoren según mi cupo
                    </option>
                  </select>
                </div>

                {/* Anticipo, Ingreso y Cuotas */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-700 mb-1.5">
                      Anticipo Disponible ($)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={10000}
                      value={anticipoDisponible}
                      onChange={(e) => setAnticipoDisponible(e.target.value)}
                      placeholder="Ej: 350000"
                      className="w-full px-3.5 py-3 rounded-xl bg-neutral-50 border border-neutral-300 text-sm font-semibold focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-700 mb-1.5">
                      Ingreso Mensual Aprox. ($)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={10000}
                      value={ingresoAprox}
                      onChange={(e) => setIngresoAprox(e.target.value)}
                      placeholder="Opcional"
                      className="w-full px-3.5 py-3 rounded-xl bg-neutral-50 border border-neutral-300 text-sm font-semibold focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-700 mb-1.5">
                      Plan de Cuotas Preferido
                    </label>
                    <select
                      value={cuotasPreferidas}
                      onChange={(e) => setCuotasPreferidas(Number(e.target.value))}
                      className="w-full px-3.5 py-3 rounded-xl bg-neutral-50 border border-neutral-300 text-sm font-bold text-neutral-900 focus:outline-none focus:border-red-600"
                    >
                      <option value={6}>6 Cuotas Fijas</option>
                      <option value={12}>12 Cuotas Fijas</option>
                      <option value={18}>18 Cuotas Fijas</option>
                      <option value={24}>24 Cuotas Fijas</option>
                    </select>
                  </div>
                </div>

                {/* Mandatory Legal Checkbox Ley 25.326 */}
                <div className="p-4 rounded-2xl bg-neutral-950 text-white border border-neutral-800">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={aceptoTerminos}
                      onChange={(e) => setAceptoTerminos(e.target.checked)}
                      className="mt-1 w-4 h-4 accent-red-600 rounded shrink-0"
                    />
                    <span className="text-xs text-neutral-200 leading-relaxed">
                      <strong>
                        Acepto los Términos y Condiciones y autorizo el tratamiento de mis
                        datos personales para evaluación crediticia conforme a la Ley 25.326.
                      </strong>{' '}
                      Entiendo que Elohim Motos utilizará mi DNI/CUIL exclusivamente para
                      verificar líneas de crédito pre-aprobadas en entidades financieras y
                      bancos asociados.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-base uppercase tracking-wider shadow-xl shadow-red-600/25 flex items-center justify-center gap-2 transition-all"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>Solicitar Pre-Aprobación Ahora</span>
                </button>
              </form>
            )}
          </div>

          {/* =================================================================
              RIGHT COLUMN (5 Cols): BENEFICIOS Y PREGUNTAS FRECUENTES
          ================================================================= */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-neutral-950 text-white rounded-3xl p-6 sm:p-8 border border-neutral-800 space-y-6">
              <h3 className="text-xl font-black text-white">
                ¿Cómo funciona la Pre-Aprobación con DNI?
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-red-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">
                      Dejás tu DNI y la moto que te gusta
                    </h4>
                    <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                      No necesitás acercarte al local todavía. Completás este formulario en
                      30 segundos desde tu celular.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-red-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">
                      Evaluamos tu cupo en 5 financieras al mismo tiempo
                    </h4>
                    <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                      Buscamos la tasa más baja según tu perfil (con recibo, monotributo,
                      jubilado o crédito directo solo con DNI).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-red-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">
                      Te escribimos por WhatsApp con tu plan aprobado
                    </h4>
                    <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                      Venís a la agencia directamente a firmar y retirar tu moto en el acto.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-800 grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-red-500 shrink-0" />
                  <span className="font-semibold">Respuesta en 15 min</span>
                </div>
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="font-semibold">100% Confidencial</span>
                </div>
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-red-500 shrink-0" />
                  <span className="font-semibold">Con o sin recibo</span>
                </div>
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-red-500 shrink-0" />
                  <span className="font-semibold">Cuotas fijas en AR$</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FinanciacionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center text-sm font-bold text-neutral-500">
          Cargando pre-calificador crediticio...
        </div>
      }
    >
      <FinanciacionContent />
    </Suspense>
  );
}

