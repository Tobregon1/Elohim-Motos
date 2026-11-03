'use client';

import React, { useState } from 'react';
import { MessageCircle, X, Users, MapPin, Zap, ChevronUp } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function WhatsAppWidget() {
  const { vendedores, openWhatsAppRouter, config } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  const activos = vendedores
    .filter((v) => v.activo)
    .sort((a, b) => a.orden_rotacion - b.orden_rotacion);

  const handleDirectOrToggle = () => {
    if (config.modo_rotacion_whatsapp === 'round_robin' && !isOpen) {
      setIsOpen(true);
    } else {
      setIsOpen(!isOpen);
    }
  };

  const handleQuickRotator = () => {
    openWhatsAppRouter({
      mensaje:
        'Hola Elohim Motos! Estuve visitando la página web y quiero asesoramiento sobre motos 0km/usadas y planes de financiación con DNI.',
      source: 'floating_whatsapp_rotator',
    });
    setIsOpen(false);
  };

  const handleSelectVendedor = (vendedorId: string) => {
    openWhatsAppRouter({
      mensaje:
        'Hola! Te escribo desde la web de Elohim Motos para consultar por catálogo y financiación con DNI.',
      vendedorId,
      source: 'floating_whatsapp_selector',
    });
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Expanded Multi-Seller Router Panel */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 rounded-2xl bg-neutral-950 text-white border border-neutral-800 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-red-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-black text-sm leading-tight">
                  Atención Inmediata Elohim Motos
                </h4>
                <p className="text-[11px] text-white/90">
                  Enrutador inteligente • Respondemos en minutos
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-black/20 text-white"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3">
            {/* Automatic Round-Robin Option */}
            <button
              onClick={handleQuickRotator}
              className="w-full p-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-left flex items-center justify-between shadow-lg shadow-emerald-600/20 transition-all"
            >
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 shrink-0 fill-white" />
                <div>
                  <span className="block text-sm font-black">
                    Hablar con el Primer Asesor Libre
                  </span>
                  <span className="block text-[11px] text-emerald-100 font-normal">
                    Asignación automática sin demoras (Turno rotativo)
                  </span>
                </div>
              </div>
            </button>

            <div className="relative py-1 flex items-center justify-center">
              <div className="border-t border-neutral-800 w-full" />
              <span className="bg-neutral-950 px-2.5 text-[10px] uppercase tracking-widest text-neutral-400 font-bold shrink-0">
                O elegí tu asesor / sucursal
              </span>
              <div className="border-t border-neutral-800 w-full" />
            </div>

            {/* Sellers List */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {activos.map((v) => (
                <button
                  key={v.id}
                  onClick={() => handleSelectVendedor(v.id)}
                  className="w-full p-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-red-600/50 text-left flex items-center justify-between group transition-all"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-bold text-sm text-white group-hover:text-red-400 transition-colors">
                        {v.nombre}
                      </span>
                    </div>
                    {v.rol && (
                      <p className="text-xs text-neutral-300 font-medium pl-4">
                        {v.rol}
                      </p>
                    )}
                    <p className="text-[11px] text-neutral-400 flex items-center gap-1 pl-4">
                      <MapPin className="w-3 h-3 text-red-500" />
                      {v.sucursal}
                    </p>
                  </div>
                  <MessageCircle className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={handleDirectOrToggle}
        className="group flex items-center gap-2.5 pl-4 pr-5 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-2xl shadow-emerald-600/40 border-2 border-white/20 transition-all hover:scale-105"
      >
        <div className="relative">
          <MessageCircle className="w-6 h-6 fill-white text-emerald-600" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-600 border border-white" />
        </div>
        <div className="text-left leading-tight">
          <span className="block text-[10px] uppercase tracking-wider text-emerald-100 font-bold">
            En línea ({activos.length} asesores)
          </span>
          <span className="block text-sm font-black">WhatsApp Directo</span>
        </div>
        <ChevronUp
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
    </div>
  );
}

