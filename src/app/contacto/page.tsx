'use client';

import React from 'react';
import {
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Instagram,
  Facebook,
  ShieldCheck,
  Award,
  Users,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function ContactoPage() {
  const { config, vendedores, openWhatsAppRouter } = useStore();
  const activos = vendedores.filter((v) => v.activo);

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-neutral-950 text-white py-14 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-red-500 block">
              Nosotros y Contacto • {config.ciudad}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
              Conocé nuestro Salón en{' '}
              <span className="text-red-500">{config.nombre}</span>
            </h1>
            <p className="text-neutral-300 text-base sm:text-lg leading-relaxed">
              Acercate a ver y probar tu próxima moto o comunicate directo por WhatsApp con
              nuestros asesores especializados en 0km, usados y créditos.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-16">
        {/* Top Info Cards + Interactive Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Info Column (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm space-y-5 flex-1">
              <h2 className="text-xl font-black text-neutral-950">
                Información del Concesionario
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-400 block">
                      Dirección Casa Central
                    </span>
                    <p className="font-black text-neutral-950 text-base">
                      {config.direccion}
                    </p>
                    <p className="text-xs text-neutral-600">
                      {config.ciudad} — {config.provincia}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-400 block">
                      Horarios de Atención
                    </span>
                    <p className="font-bold text-neutral-900 text-sm">
                      {config.horarios_corrido}
                    </p>
                    <p className="font-semibold text-neutral-600 text-xs mt-0.5">
                      {config.horarios_sabado}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-400 block">
                      Teléfono Fijo y Administración
                    </span>
                    <p className="font-black text-neutral-900 text-base">
                      {config.telefono_fijo}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {config.razon_social} • CUIT {config.cuit}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100 space-y-2.5">
                <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-400 block">
                  Seguinos en Redes Sociales
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={`https://instagram.com/${config.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 px-4 rounded-xl bg-neutral-950 hover:bg-red-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <Instagram className="w-4 h-4" />
                    <span>{config.instagram}</span>
                  </a>
                  <a
                    href={`https://facebook.com${config.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 px-4 rounded-xl bg-neutral-950 hover:bg-red-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <Facebook className="w-4 h-4" />
                    <span>Facebook Oficial</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Google Maps Interactive Embed (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border-2 border-neutral-900 overflow-hidden shadow-lg min-h-[380px] flex flex-col">
            <div className="px-5 py-3.5 bg-neutral-950 text-white flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-500" />
                Mapa Interactivo • {config.direccion}, {config.ciudad}
              </span>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${config.direccion}, ${config.ciudad}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-400 hover:text-red-300 underline"
              >
                Abrir en Google Maps ↗
              </a>
            </div>
            <iframe
              title="Ubicación Elohim Motos en Google Maps"
              src={config.google_maps_embed}
              className="w-full flex-1 min-h-[340px] border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        {/* Team / Sellers Section */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-red-600 block mb-1">
              Atención Personalizada por WhatsApp
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-950">
              Nuestros Asesores Comerciales
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activos.map((v) => (
              <div
                key={v.id}
                className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm flex flex-col justify-between space-y-5"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      En línea ahora
                    </span>
                    <span className="text-xs font-bold text-neutral-400">
                      Turno #{v.orden_rotacion}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-neutral-950 pt-1">
                    {v.nombre}
                  </h3>
                  <p className="text-xs font-bold text-red-600 uppercase tracking-wider">
                    {v.rol || 'Asesor Comercial'}
                  </p>
                  <p className="text-xs text-neutral-500 flex items-center gap-1 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                    {v.sucursal}
                  </p>
                </div>

                <button
                  onClick={() =>
                    openWhatsAppRouter({
                      mensaje: `Hola ${v.nombre}! Te escribo desde la sección Contacto de la web de Elohim Motos.`,
                      vendedorId: v.id,
                      source: 'contacto_card_vendedor',
                    })
                  }
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                >
                  <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
                  <span>Hablar con {v.nombre.split(' ')[0]}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Agency Values */}
        <div className="bg-neutral-950 text-white rounded-3xl p-8 sm:p-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <Award className="w-8 h-8 text-red-500" />
            <h3 className="text-lg font-black">Garantía y Respaldo</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Todas nuestras unidades 0km cuentan con garantía oficial de fábrica y nuestras
              motos usadas pasan por un chequeo mecánico y registral de 25 puntos.
            </p>
          </div>
          <div className="space-y-2">
            <ShieldCheck className="w-8 h-8 text-red-500" />
            <h3 className="text-lg font-black">Gestoría Propia en el Día</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Olvidate de hacer filas en el registro. Nuestro equipo de gestoría resuelve el
              patentamiento o transferencia para que solo te preocupes por manejar.
            </p>
          </div>
          <div className="space-y-2">
            <Users className="w-8 h-8 text-red-500" />
            <h3 className="text-lg font-black">Aprobación Inclusiva</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Creemos que la moto es tu herramienta de trabajo y movilidad. Por eso buscamos
              alternativas reales de financiación con DNI para cada cliente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

