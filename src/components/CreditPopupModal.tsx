'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  MessageCircle,
  Sparkles,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { SituacionLaboralTipo } from '@/types/database';
import { formatCurrency } from '@/lib/format';

export default function CreditPopupModal() {
  const {
    isCreditModalOpen,
    creditModalMotoId,
    closeCreditModal,
    motos,
    addLeadFinanciacion,
    openWhatsAppRouter,
  } = useStore();

  const [nombre, setNombre] = useState('');
  const [dni, setDni] = useState('');
  const [telefono, setTelefono] = useState('');
  const [localidad, setLocalidad] = useState('Corrientes Capital');
  const [situacionLaboral, setSituacionLaboral] =
    useState<SituacionLaboralTipo>('solo_dni_informal');
  const [motoId, setMotoId] = useState('');
  const [cuotas, setCuotas] = useState('18');
  const [aceptoLey, setAceptoLey] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedInfo, setSubmittedInfo] = useState<{
    vendedorNombre: string;
    motoTitulo: string;
  } | null>(null);

  useEffect(() => {
    if (creditModalMotoId) {
      setMotoId(creditModalMotoId);
    }
  }, [creditModalMotoId]);

  if (!isCreditModalOpen) return null;

  const motosDisponibles = motos.filter(
    (m) => m.estado !== 'vendida' && m.estado !== 'pausada'
  );
  const selectedMoto = motosDisponibles.find((m) => m.id === motoId) || motosDisponibles[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!nombre.trim() || !dni.trim() || !telefono.trim()) {
      setErrorMsg('Por favor completá tu Nombre, DNI/CUIL y WhatsApp.');
      return;
    }
    if (!aceptoLey) {
      setErrorMsg(
        'Debés aceptar el consentimiento de evaluación crediticia (Ley 25.326).'
      );
      return;
    }

    const motoInteres = motos.find((m) => m.id === motoId);
    const motoTitulo = motoInteres
      ? `${motoInteres.titulo} (${motoInteres.condicion.toUpperCase()})`
      : 'Calificación General Solo con DNI';

    const { vendedor } = await addLeadFinanciacion({
      nombre_completo: nombre.trim(),
      dni_cuil: dni.trim(),
      telefono: telefono.trim(),
      localidad: localidad.trim() || 'Corrientes',
      situacion_laboral: situacionLaboral,
      ingreso_aproximado: null,
      anticipo_disponible: 0,
      cuotas_preferidas: Number(cuotas),
      moto_interes_id: motoInteres ? motoInteres.id : null,
      moto_interes_titulo: motoTitulo,
      acepto_terminos_legales: true,
    });

    setSubmittedInfo({
      vendedorNombre: vendedor?.nombre || 'Asesor de Créditos',
      motoTitulo,
    });
  };

  const handleSendWhatsApp = () => {
    if (!submittedInfo) return;
    const mensaje = `Hola Elohim Motos! Solicité mi crédito online en la web:\n• Nombre: ${nombre}\n• DNI/CUIL: ${dni}\n• Moto de interés: ${submittedInfo.motoTitulo}\n• Plan elegido: ${cuotas} cuotas\nQuiero confirmar mi cupo aprobado.`;
    openWhatsAppRouter({
      mensaje,
      motoTitulo: submittedInfo.motoTitulo,
      source: 'popup_solicitud_credito_dni',
    });
  };

  const handleClose = () => {
    setSubmittedInfo(null);
    setErrorMsg('');
    closeCreditModal();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-white rounded-[24px] overflow-hidden shadow-2xl border border-neutral-200 animate-modal-pop grid grid-cols-1 md:grid-cols-12 max-h-[92vh]">
        {/* Botón Cerrar */}
        <button
          onClick={handleClose}
          className="absolute top-3.5 right-3.5 z-20 w-9 h-9 rounded-full bg-neutral-950/80 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-lg"
          aria-label="Cerrar ventana de crédito"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Columna Izquierda: Imagen + Destacado Visual (Estilo MyM Motos) */}
        <div className="hidden md:flex md:col-span-5 relative bg-neutral-950 text-white p-7 flex-col justify-between overflow-hidden">
          <img
            src={
              selectedMoto?.imagen_portada ||
              'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=900&q=80'
            }
            alt="Financiación Elohim Motos"
            className="absolute inset-0 w-full h-full object-cover opacity-45 scale-105 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/75 to-red-950/40" />

          <div className="relative z-10 space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-[11px] font-black uppercase tracking-wider shadow">
              <Sparkles className="w-3.5 h-3.5" />
              Solo con tu DNI
            </span>
            <h3 className="text-2xl lg:text-3xl font-black tracking-tight leading-tight">
              Solicitá tu crédito en minutos.
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Evaluamos tu aptitud crediticia en el acto y te enviamos las opciones de
              cuotas fijas por WhatsApp.
            </p>
          </div>

          <div className="relative z-10 space-y-3 pt-6">
            {selectedMoto && (
              <div className="p-3.5 rounded-2xl bg-neutral-900/90 backdrop-blur-md border border-white/15 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-400 block">
                  Unidad Seleccionada
                </span>
                <p className="text-sm font-black text-white line-clamp-1">
                  {selectedMoto.titulo}
                </p>
                {selectedMoto.cuota_desde && (
                  <p className="text-xs text-neutral-300">
                    Cuotas desde{' '}
                    <strong className="text-white">
                      {formatCurrency(selectedMoto.cuota_desde)}
                    </strong>
                  </p>
                )}
              </div>
            )}

            <div className="space-y-1.5 text-xs font-semibold text-neutral-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
                <span>Sin recibo de sueldo o con ingresos formales</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
                <span>Planes de 6, 12, 18 y 24 cuotas fijas</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
                <span>Entrega inmediata en salón</span>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Formulario Rápido */}
        <div className="md:col-span-7 p-6 sm:p-8 overflow-y-auto">
          {submittedInfo ? (
            <div className="py-6 text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full bg-neutral-950 text-white text-[11px] font-black uppercase tracking-wider">
                  Solicitud Registrada en CRM
                </span>
                <h3 className="text-2xl font-black text-neutral-950">
                  ¡Recibimos tus datos, {nombre}!
                </h3>
                <p className="text-sm text-neutral-600 max-w-md mx-auto">
                  Nuestro asesor <strong>{submittedInfo.vendedorNombre}</strong> ya tiene
                  tu solicitud para <strong>{submittedInfo.motoTitulo}</strong>.
                </p>
              </div>

              <div className="pt-2 space-y-2.5">
                <button
                  onClick={handleSendWhatsApp}
                  className="w-full py-3.5 px-6 rounded-full bg-[#2db742] hover:bg-[#249e36] text-white font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Agilizar ahora por WhatsApp</span>
                </button>
                <button
                  onClick={handleClose}
                  className="w-full py-2.5 text-xs font-bold text-neutral-500 hover:text-neutral-800"
                >
                  Cerrar ventana
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-red-600 block">
                  Pre-Aprobación Online en 60 Segundos
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-neutral-950">
                  Completá tus datos para calificar
                </h3>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-600 mb-1">
                    Nombre y Apellido *
                  </label>
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej: Juan Pérez"
                    className="w-full h-11 px-3.5 rounded-xl bg-neutral-100 border border-neutral-200 text-sm font-semibold text-neutral-950 focus:outline-none focus:border-red-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-600 mb-1">
                    DNI o CUIL *
                  </label>
                  <input
                    type="text"
                    required
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    placeholder="Sin puntos, ej: 38123456"
                    className="w-full h-11 px-3.5 rounded-xl bg-neutral-100 border border-neutral-200 text-sm font-semibold text-neutral-950 focus:outline-none focus:border-red-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-600 mb-1">
                    Teléfono (WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="Ej: 3794 123456"
                    className="w-full h-11 px-3.5 rounded-xl bg-neutral-100 border border-neutral-200 text-sm font-semibold text-neutral-950 focus:outline-none focus:border-red-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-600 mb-1">
                    Localidad
                  </label>
                  <input
                    type="text"
                    value={localidad}
                    onChange={(e) => setLocalidad(e.target.value)}
                    placeholder="Ej: Corrientes Capital"
                    className="w-full h-11 px-3.5 rounded-xl bg-neutral-100 border border-neutral-200 text-sm font-semibold text-neutral-950 focus:outline-none focus:border-red-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-600 mb-1">
                    Moto de Interés
                  </label>
                  <select
                    value={motoId}
                    onChange={(e) => setMotoId(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-neutral-100 border border-neutral-200 text-xs sm:text-sm font-bold text-neutral-950 focus:outline-none focus:border-red-600"
                  >
                    <option value="">Cualquier modelo / A definir</option>
                    {motosDisponibles.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.titulo} ({m.condicion.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-600 mb-1">
                    Situación Laboral
                  </label>
                  <select
                    value={situacionLaboral}
                    onChange={(e) =>
                      setSituacionLaboral(e.target.value as SituacionLaboralTipo)
                    }
                    className="w-full h-11 px-3 rounded-xl bg-neutral-100 border border-neutral-200 text-xs sm:text-sm font-bold text-neutral-950 focus:outline-none focus:border-red-600"
                  >
                    <option value="solo_dni_informal">Solo DNI / Sin recibo</option>
                    <option value="recibo_sueldo">Con Recibo de Sueldo</option>
                    <option value="monotributista">Monotributista / Autónomo</option>
                    <option value="jubilado_pensionado">Jubilado / Pensionado</option>
                  </select>
                </div>
              </div>

              {/* Selector rápido de cuotas */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-600 mb-1.5">
                  Plan de Cuotas Preferido
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['6', '12', '18', '24'].map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setCuotas(c)}
                      className={`py-2 rounded-xl text-xs font-black transition-all border ${
                        cuotas === c
                          ? 'bg-neutral-950 text-white border-neutral-950 shadow-sm'
                          : 'bg-neutral-100 text-neutral-700 border-neutral-200 hover:bg-neutral-200'
                      }`}
                    >
                      {c} Cuotas
                    </button>
                  ))}
                </div>
              </div>

              {/* Ley 25.326 */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-neutral-50 border border-neutral-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={aceptoLey}
                  onChange={(e) => setAceptoLey(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-red-600 rounded shrink-0"
                />
                <span className="text-[11px] text-neutral-600 leading-snug">
                  <strong>Consentimiento Ley 25.326:</strong> Acepto los Términos y
                  Condiciones y autorizo el tratamiento de mis datos personales para
                  evaluación crediticia en Elohim Motos.
                </span>
              </label>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-full bg-red-600 hover:bg-red-500 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-red-600/25 flex items-center justify-center gap-2 transition-all"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>Solicitar Crédito Ahora</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400 font-medium">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tus datos viajan encriptados • Sin costo de evaluación</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
