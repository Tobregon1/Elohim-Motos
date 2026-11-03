'use client';

import React from 'react';
import {
  X,
  CreditCard,
  ShieldCheck,
  Repeat,
  Banknote,
  CheckCircle2,
  MessageCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

const PROMO_CARDS = [
  {
    id: 'dni',
    badge: 'MÁS ELEGIDO • EN EL ACTO',
    title: 'Crédito Personal Solo con DNI',
    subtitle: 'Sin recibo de sueldo o con ingresos informales',
    highlight: '6, 12, 18 y 24 Cuotas Fijas',
    details: [
      'Aprobación crediticia en 15 minutos con tu número de DNI.',
      'Posibilidad de retirar sin entrega inicial o con anticipo mínimo.',
      'Primera cuota a los 30 días de retirar la unidad.',
    ],
    accent: true,
  },
  {
    id: 'tarjetas',
    badge: 'TARJETAS BANCARIAS',
    title: 'Visa, Mastercard & Cabal (Cuota Simple)',
    subtitle: 'Todos los bancos • BBVA, Galicia, Santander, Macro, Corrientes',
    highlight: '3, 6, 9 y 12 Cuotas',
    details: [
      'Financiá el 100% de la moto o combiná tarjeta + efectivo.',
      'Promociones especiales sin interés en modelos seleccionados.',
      'Acreditación instantánea en nuestro salón.',
    ],
    accent: false,
  },
  {
    id: 'naranja',
    badge: 'TARJETA NARANJA X',
    title: 'Planes Naranja X & Plan Z',
    subtitle: 'Exclusivo titulares de Tarjeta Naranja',
    highlight: 'Plan Z, 6 y 10 Cuotas',
    details: [
      'Usá tu margen disponible para retirar tu 0km o usada.',
      'Combinable con entrega de tu moto usada en parte de pago.',
    ],
    accent: false,
  },
  {
    id: 'recibo',
    badge: 'TASA PREFERENCIAL',
    title: 'Recibo de Sueldo, Monotributo y Jubilados',
    subtitle: 'Bonificación especial de tasa anual',
    highlight: 'Hasta 100% Financiado',
    details: [
      'Tasa reducida presentando último recibo de haberes o constancia ARCA.',
      'Mínimos requisitos y entrega inmediata.',
    ],
    accent: false,
  },
];

export default function CuotasDrawer() {
  const {
    isCuotasDrawerOpen,
    closeCuotasDrawer,
    openCreditModal,
    openWhatsAppRouter,
  } = useStore();

  if (!isCuotasDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex justify-end bg-black/70 backdrop-blur-sm">
      {/* Backdrop click */}
      <div className="flex-1" onClick={closeCuotasDrawer} />

      {/* Slide-over Panel */}
      <aside className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-drawer-left overflow-hidden">
        {/* Header */}
        <div className="bg-neutral-950 text-white p-5 sm:p-6 flex items-center justify-between border-b border-neutral-800">
          <div className="space-y-0.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-red-500">
              <Sparkles className="w-3 h-3" />
              Financiación & Promociones
            </span>
            <h3 className="text-lg sm:text-xl font-black tracking-tight">
              Medios de Pago y Cuotas
            </h3>
          </div>
          <button
            onClick={closeCuotasDrawer}
            className="w-9 h-9 rounded-full bg-neutral-900 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
            aria-label="Cerrar panel de cuotas"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body List */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 bg-[#F7F7F8]">
          {PROMO_CARDS.map((promo) => (
            <div
              key={promo.id}
              className={`p-5 rounded-2xl bg-white border transition-all shadow-sm space-y-3 ${
                promo.accent
                  ? 'border-2 border-red-600 ring-4 ring-red-600/10'
                  : 'border-neutral-200'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    promo.accent
                      ? 'bg-red-600 text-white'
                      : 'bg-neutral-950 text-white'
                  }`}
                >
                  {promo.badge}
                </span>
                <span className="text-xs font-black text-red-600 bg-red-50 px-2.5 py-1 rounded-lg">
                  {promo.highlight}
                </span>
              </div>

              <div>
                <h4 className="text-base font-black text-neutral-950">
                  {promo.title}
                </h4>
                <p className="text-xs text-neutral-500 font-medium">
                  {promo.subtitle}
                </p>
              </div>

              <ul className="space-y-1.5 pt-1 border-t border-neutral-100">
                {promo.details.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs text-neutral-700"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Plan Canje Card */}
          <div className="p-5 rounded-2xl bg-neutral-950 text-white space-y-2.5">
            <div className="flex items-center gap-2 text-red-500 text-xs font-black uppercase tracking-wider">
              <Repeat className="w-4 h-4" />
              <span>Plan Canje • Parte de Pago</span>
            </div>
            <h4 className="text-base font-black">
              ¿Tenés una moto usada? La tomamos como anticipo
            </h4>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Entregá tu moto usada llave por llave y financiá únicamente la
              diferencia con cualquiera de los planes de arriba.
            </p>
          </div>
        </div>

        {/* Sticky Footer CTAs */}
        <div className="p-5 bg-white border-t border-neutral-200 space-y-2.5">
          <button
            onClick={() => openCreditModal()}
            className="w-full py-3.5 px-5 rounded-full bg-red-600 hover:bg-red-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-red-600/25 flex items-center justify-center gap-2 transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Calificar con mi DNI Ahora</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              closeCuotasDrawer();
              openWhatsAppRouter({
                mensaje:
                  'Hola Elohim Motos! Estuve viendo el panel de Cuotas y Promociones en la web y quiero consultar qué planes tienen activos hoy.',
                source: 'drawer_cuotas_whatsapp',
              });
            }}
            className="w-full py-3 px-5 rounded-full bg-[#2db742] hover:bg-[#249e36] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Simular Cuotas por WhatsApp</span>
          </button>
        </div>
      </aside>
    </div>
  );
}

