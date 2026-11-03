'use client';

import React from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  MessageCircle,
  ChevronRight,
  ShieldCheck,
  Flame,
  Repeat,
} from 'lucide-react';
import { Moto } from '@/types/database';
import { useStore } from '@/context/StoreContext';
import { formatCurrency } from '@/lib/format';

export default function MotoCard({ moto }: { moto: Moto }) {
  const {
    getMarcaNombre,
    getCategoriaNombre,
    openWhatsAppRouter,
    openCreditModal,
  } = useStore();

  const marca = getMarcaNombre(moto.marca_id);
  const categoria = getCategoriaNombre(moto.categoria_id);

  // Cálculo automático de Precio sin Impuestos Nacionales (Neto de IVA 21% - Resolución 4/2025 Argentina)
  const precioSinImpuestos =
    moto.precio_contado && moto.moneda === 'ARS'
      ? Math.round(moto.precio_contado / 1.21)
      : null;

  const handleConsultar = (e: React.MouseEvent) => {
    e.preventDefault();
    const origin =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'https://elohimmotos.com.ar';
    const link = `${origin}/motos/${moto.slug}`;
    const mensaje = `Hola Elohim Motos! Estoy viendo en la web la ${moto.titulo} (${moto.anio} - ${moto.condicion.toUpperCase()}) (${link}) y quiero consultar precio de contado y opciones de financiación con DNI.`;
    openWhatsAppRouter({
      mensaje,
      motoTitulo: moto.titulo,
      motoSlug: moto.slug,
      source: 'card_consultar_moto',
    });
  };

  return (
    <div className="group bg-white rounded-[18px] border border-neutral-200/90 overflow-hidden shadow-sm hover:shadow-2xl hover:border-red-600/50 transition-all duration-300 flex flex-col justify-between">
      {/* Top Media Container */}
      <div>
        <div className="relative h-56 sm:h-60 bg-neutral-900 overflow-hidden">
          <Link href={`/motos/${moto.slug}`} className="block w-full h-full">
            <img
              src={moto.imagen_portada}
              alt={moto.titulo}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/75 via-transparent to-neutral-950/25" />
          </Link>

          {/* Cucarda Superior Izquierda: Condición + Entrega */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            <div className="flex items-center gap-1.5">
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow ${
                  moto.condicion === '0km'
                    ? 'bg-red-600 text-white'
                    : 'bg-neutral-950 text-white border border-white/25'
                }`}
              >
                {moto.condicion === '0km' ? '0KM' : `USADA • ${moto.anio}`}
              </span>

              {moto.oferta_mes && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-400 text-neutral-950 shadow flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-neutral-950" />
                  Oferta
                </span>
              )}
            </div>

            {moto.estado === 'disponible' && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/95 text-neutral-950 shadow inline-flex items-center gap-1 w-fit">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Entrega Inmediata
              </span>
            )}
          </div>

          {/* Cucarda Superior Derecha: Financiación / Cuotas (Estilo MyM Cucardas) */}
          {moto.financiacion_dni && moto.estado === 'disponible' && (
            <div className="absolute top-3 right-3 z-10 bg-neutral-950/90 backdrop-blur-md border border-red-500/60 text-white rounded-xl px-2.5 py-1.5 text-center shadow-lg">
              <span className="block text-[9px] font-black uppercase tracking-widest text-red-400 leading-none">
                SOLO CON DNI
              </span>
              <span className="block text-[11px] font-black tracking-tight leading-tight mt-0.5">
                12 / 24 CUOTAS
              </span>
            </div>
          )}

          {/* Cinta Diagonal para Reservada o Vendida */}
          {moto.estado === 'reservada' && (
            <div className="absolute top-5 -right-10 rotate-45 bg-amber-500 text-neutral-950 font-black text-xs uppercase tracking-widest py-1.5 px-12 shadow-lg z-20">
              RESERVADA
            </div>
          )}
          {moto.estado === 'vendida' && (
            <div className="absolute top-5 -right-10 rotate-45 bg-neutral-950 text-red-500 border-y border-red-500 font-black text-xs uppercase tracking-widest py-1.5 px-12 shadow-lg z-20">
              VENDIDA
            </div>
          )}

          {/* Barra Inferior sobre Foto */}
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] font-bold text-white z-10">
            <span className="px-2.5 py-0.5 rounded-full bg-neutral-950/80 backdrop-blur-sm border border-white/15">
              {marca} • {categoria}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-red-600 font-black">
              {moto.cilindrada} cc
            </span>
          </div>
        </div>

        {/* Información Principal de la Tarjeta */}
        <div className="p-5 pb-3 space-y-2.5">
          <Link href={`/motos/${moto.slug}`}>
            <h3 className="text-lg font-black text-neutral-950 group-hover:text-red-600 transition-colors line-clamp-1">
              {moto.titulo}
            </h3>
          </Link>

          {/* Píldora de Precio + Precio sin Impuestos Nacionales (Estilo MyM Motos) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              {moto.mostrar_precio && moto.precio_contado ? (
                <div className="inline-block bg-neutral-100 px-3 py-1 rounded-lg">
                  <span className="text-xl font-black text-neutral-950 tracking-tight">
                    {formatCurrency(moto.precio_contado, moto.moneda)}
                  </span>
                </div>
              ) : (
                <div className="inline-block bg-neutral-100 px-3 py-1 rounded-lg">
                  <span className="text-base font-extrabold text-neutral-900">
                    Consultar Precio
                  </span>
                </div>
              )}

              <span className="text-[11px] font-bold text-neutral-500">
                {moto.condicion === '0km'
                  ? '0 km'
                  : `${moto.kilometraje.toLocaleString('es-AR')} km`}
              </span>
            </div>

            {moto.mostrar_precio && precioSinImpuestos && (
              <p className="text-[11px] text-neutral-400 font-medium">
                Precio sin impuestos nacionales:{' '}
                {formatCurrency(precioSinImpuestos, 'ARS')}
              </p>
            )}
          </div>

          {/* Etiqueta Personalizada de Cuotas / Entrega (Estilo MyM Custom Tag) */}
          {moto.cuota_desde ? (
            <div className="px-3 py-2 rounded-xl bg-red-50 border border-red-200/80 flex items-center justify-between text-xs">
              <span className="font-bold text-neutral-800">
                {moto.entrega_minima
                  ? `Anticipo ${formatCurrency(moto.entrega_minima)}`
                  : 'Financiación DNI'}
              </span>
              <span className="font-black text-red-600">
                Cuotas de {formatCurrency(moto.cuota_desde)}
              </span>
            </div>
          ) : (
            <div className="px-3 py-2 rounded-xl bg-neutral-100 text-xs font-bold text-neutral-700">
              Financiación con DNI y Tarjetas disponible
            </div>
          )}

          {moto.acepta_permuta && (
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 font-semibold">
              <Repeat className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <span>Tomamos tu moto usada en parte de pago</span>
            </div>
          )}
        </div>
      </div>

      {/* Botonera Inferior (Botón Píldora Verde WhatsApp + Calificar DNI + Ver Ficha) */}
      <div className="px-5 pb-5 pt-2 space-y-2">
        <button
          onClick={handleConsultar}
          className="w-full py-2.5 px-4 rounded-full bg-[#2db742] hover:bg-[#249e36] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-[#2db742]/20 transition-all"
        >
          <MessageCircle className="w-4 h-4 fill-white/20 shrink-0" />
          <span>Contactanos</span>
        </button>

        <div className="flex items-center justify-between pt-1 text-xs">
          <button
            onClick={() => openCreditModal(moto.id)}
            className="font-extrabold text-neutral-700 hover:text-red-600 flex items-center gap-1 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
            <span>Financiar con DNI</span>
          </button>

          <Link
            href={`/motos/${moto.slug}`}
            className="font-extrabold text-neutral-950 hover:text-red-600 flex items-center gap-0.5 transition-colors"
          >
            <span>Ver todos los detalles</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
