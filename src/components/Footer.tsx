'use client';

import React from 'react';
import Link from 'next/link';
import {
  Bike,
  MapPin,
  Clock,
  Phone,
  Instagram,
  Facebook,
  ShieldAlert,
  ExternalLink,
  QrCode,
  Scale,
  CheckCircle2,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function Footer() {
  const { config } = useStore();

  return (
    <footer className="bg-neutral-950 text-neutral-300 border-t border-neutral-800">
      {/* Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Col 1: Brand & Info (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center">
                <Bike className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-white">
                ELOHIM <span className="text-red-600">MOTOS</span>
              </span>
            </Link>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Agencia multimarca líder en venta de motos 0km y usadas seleccionadas.
              Financiación en el acto solo con tu DNI, Cuota Simple, recibo de sueldo y
              plan canje tomando tu moto usada al mejor valor.
            </p>
            <div className="space-y-2 text-sm pt-2">
              <div className="flex items-start gap-2.5 text-neutral-300">
                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-1" />
                <span>
                  {config.direccion}, {config.ciudad} ({config.provincia})
                </span>
              </div>
              <div className="flex items-start gap-2.5 text-neutral-300">
                <Clock className="w-4 h-4 text-red-500 shrink-0 mt-1" />
                <div>
                  <p>{config.horarios_corrido}</p>
                  <p className="text-xs text-neutral-400">{config.horarios_sabado}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 text-neutral-300">
                <Phone className="w-4 h-4 text-red-500 shrink-0" />
                <span>{config.telefono_fijo}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={`https://instagram.com/${config.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-lg bg-neutral-900 hover:bg-red-600 text-white text-xs font-bold flex items-center gap-2 border border-neutral-800 transition-colors"
              >
                <Instagram className="w-4 h-4" />
                {config.instagram}
              </a>
              <a
                href={`https://facebook.com${config.facebook}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-lg bg-neutral-900 hover:bg-red-600 text-white text-xs font-bold flex items-center gap-2 border border-neutral-800 transition-colors"
              >
                <Facebook className="w-4 h-4" />
                Facebook
              </a>
            </div>
          </div>

          {/* Col 2: Navegación Rápida (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-white">
              Secciones
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-red-500 transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/motos" className="hover:text-red-500 transition-colors">
                  Catálogo 0km y Usadas
                </Link>
              </li>
              <li>
                <Link href="/financiacion" className="hover:text-red-500 transition-colors">
                  Pre-Aprobación con DNI
                </Link>
              </li>
              <li>
                <Link href="/permutas" className="hover:text-red-500 transition-colors">
                  Entregá tu Moto (Permutas)
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="hover:text-red-500 transition-colors">
                  Ubicación y Vendedores
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Defensa del Consumidor y Ley 25.326 (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-white flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-red-500" /> Marco Legal Argentina
            </h4>
            <div className="p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-2">
              <p className="text-xs font-bold text-white">
                Defensa de las y los Consumidores
              </p>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Dirección Nacional de Defensa del Consumidor y Arbitraje del Consumo.
              </p>
              <a
                href="https://www.argentina.gob.ar/produccion/defensadelconsumidor/formulario"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 underline underline-offset-4"
              >
                <span>Defensa de las y los Consumidores. Para reclamos ingrese aquí</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-1.5">
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Protección de Datos (Ley 25.326)
              </p>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                El titular de los datos personales tiene la facultad de ejercer el derecho
                de acceso a los mismos en forma gratuita conforme a la Ley N° 25.326 (AAIP).
              </p>
            </div>
          </div>

          {/* Col 4: Data Fiscal Formulario 960/D ARCA (ex AFIP) (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-white">
              Data Fiscal ARCA (Ex AFIP)
            </h4>
            <div className="p-4 rounded-xl bg-white text-neutral-950 border-2 border-neutral-300 shadow-md flex items-center gap-3.5">
              <div className="w-20 h-20 bg-neutral-100 border border-neutral-300 rounded-lg flex flex-col items-center justify-center p-1.5 shrink-0">
                <QrCode className="w-14 h-14 text-neutral-900" />
                <span className="text-[8px] font-black tracking-tighter uppercase text-neutral-700">
                  FORM. 960/D
                </span>
              </div>
              <div className="space-y-1 text-xs">
                <span className="inline-block px-1.5 py-0.5 rounded bg-neutral-900 text-white text-[10px] font-black tracking-wider">
                  ARCA • DATA FISCAL
                </span>
                <p className="font-black text-neutral-900 text-sm leading-tight">
                  {config.razon_social}
                </p>
                <p className="font-mono text-xs font-bold text-neutral-700">
                  CUIT: {config.cuit}
                </p>
                <p className="text-[10px] text-neutral-600 leading-tight">
                  IVA Responsable Inscripto • Agencia de Motovehículos
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mandatory Dealership Legal Disclaimer Box */}
        <div className="mt-10 pt-8 border-t border-neutral-800/80">
          <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800/80 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-neutral-400 leading-relaxed">
              <strong className="text-neutral-200">AVISO LEGAL Y CONDICIONES COMERCIALES: </strong>
              Las imágenes publicadas en este sitio son de carácter ilustrativo. Los precios,
              planes de financiación y disponibilidad de stock están sujetos a modificaciones
              sin previo aviso. Los valores expresados no incluyen gastos de patentamiento,
              flete ni formularios, salvo que se indique expresamente lo contrario. El envío de
              solicitudes de pre-calificación crediticia implica la autorización expresa del
              usuario para la consulta de antecedentes comerciales y crediticios (BCRA, Veraz,
              Nosis) conforme al Art. 5 y 26 de la Ley 25.326 de Protección de Datos Personales.
              Sitio web destinado exclusivamente a exhibición de catálogo y generación de
              contactos comerciales (cierre presencial en concesionario).
            </p>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
            <p>
              © {new Date().getFullYear()} <strong>{config.nombre}</strong> ({config.razon_social} - CUIT {config.cuit}). Todos los derechos reservados.
            </p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />
              Blanco, Negro & Rojo • Pasión por las dos ruedas
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

