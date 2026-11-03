'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, Download, Printer, Sparkles, Check, Smartphone } from 'lucide-react';
import { Moto } from '@/types/database';
import { useStore } from '@/context/StoreContext';
import { formatCurrency } from '@/lib/format';

interface StoryGeneratorModalProps {
  moto: Moto | null;
  onClose: () => void;
}

export default function StoryGeneratorModal({ moto, onClose }: StoryGeneratorModalProps) {
  const { getMarcaNombre, getCategoriaNombre, config } = useStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [downloaded, setDownloaded] = useState(false);
  const [incluirPrecio, setIncluirPrecio] = useState(true);
  const [incluirAnticipo, setIncluirAnticipo] = useState(true);

  useEffect(() => {
    if (!moto) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const marca = getMarcaNombre(moto.marca_id);
    const categoria = getCategoriaNombre(moto.categoria_id);

    const drawCard = (imgElement?: HTMLImageElement) => {
      // 1. Background Black & Racing Red Geometry (1080 x 1920)
      ctx.fillStyle = '#0A0A0A';
      ctx.fillRect(0, 0, 1080, 1920);

      // Top Red Slash
      ctx.fillStyle = '#E11D48';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(1080, 0);
      ctx.lineTo(1080, 260);
      ctx.lineTo(0, 340);
      ctx.closePath();
      ctx.fill();

      // Header Brand Text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 66px Inter, Arial, sans-serif';
      ctx.fillText('ELOHIM MOTOS', 70, 130);

      ctx.fillStyle = '#FFE4E6';
      ctx.font = '700 28px Inter, Arial, sans-serif';
      ctx.fillText('AGENCIA MULTIMARCA 0KM Y USADOS SELECCIONADOS', 70, 185);

      // Condition Badge
      ctx.fillStyle = '#0A0A0A';
      ctx.fillRect(70, 225, 430, 68);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 32px Inter, Arial, sans-serif';
      ctx.fillText(
        moto.condicion === '0km'
          ? '0KM • ENTREGA INMEDIATA'
          : `USADA SELECCIONADA • ${moto.anio}`,
        95,
        270
      );

      // Photo Frame (y: 350 to 1030)
      ctx.fillStyle = '#18181B';
      ctx.fillRect(60, 360, 960, 660);

      if (imgElement) {
        // Cover crop calculation
        const targetW = 960;
        const targetH = 660;
        const imgRatio = imgElement.width / imgElement.height;
        const targetRatio = targetW / targetH;
        let sx = 0,
          sy = 0,
          sw = imgElement.width,
          sh = imgElement.height;

        if (imgRatio > targetRatio) {
          sw = imgElement.height * targetRatio;
          sx = (imgElement.width - sw) / 2;
        } else {
          sh = imgElement.width / targetRatio;
          sy = (imgElement.height - sh) / 2;
        }
        ctx.drawImage(imgElement, sx, sy, sw, sh, 60, 360, targetW, targetH);
      }

      // Red Border around Photo
      ctx.strokeStyle = '#E11D48';
      ctx.lineWidth = 8;
      ctx.strokeRect(60, 360, 960, 660);

      // Cilindrada Pill on Photo Corner
      ctx.fillStyle = '#E11D48';
      ctx.fillRect(800, 360, 220, 75);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 40px Inter, Arial, sans-serif';
      ctx.fillText(`${moto.cilindrada} CC`, 835, 412);

      // Bike Title & Brand (y: 1090)
      ctx.fillStyle = '#E11D48';
      ctx.font = '800 32px Inter, Arial, sans-serif';
      ctx.fillText(`${marca.toUpperCase()} • ${categoria.toUpperCase()}`, 70, 1090);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 58px Inter, Arial, sans-serif';
      const titleText =
        moto.titulo.length > 28 ? moto.titulo.slice(0, 28) + '...' : moto.titulo;
      ctx.fillText(titleText.toUpperCase(), 70, 1165);

      // Specs Grid (4 boxes)
      const specs = [
        {
          label: 'CONDICIÓN / AÑO',
          val: `${moto.condicion.toUpperCase()} (${moto.anio})`,
        },
        {
          label: 'KILOMETRAJE',
          val:
            moto.condicion === '0km'
              ? '0 KM NUEVA'
              : `${moto.kilometraje.toLocaleString('es-AR')} KM`,
        },
        {
          label: 'ARRANQUE',
          val: (moto.ficha_tecnica.arranque || 'Eléctrico / Patada').toUpperCase(),
        },
        {
          label: 'FRENO DELANTERO',
          val: (moto.ficha_tecnica.freno_delantero || 'Disco').toUpperCase(),
        },
      ];

      specs.forEach((sp, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const bx = 70 + col * 480;
        const by = 1215 + row * 135;

        ctx.fillStyle = '#141417';
        ctx.fillRect(bx, by, 460, 115);
        ctx.strokeStyle = '#27272A';
        ctx.lineWidth = 3;
        ctx.strokeRect(bx, by, 460, 115);

        ctx.fillStyle = '#A1A1AA';
        ctx.font = '700 22px Inter, Arial, sans-serif';
        ctx.fillText(sp.label, bx + 25, by + 42);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '800 30px Inter, Arial, sans-serif';
        ctx.fillText(sp.val.slice(0, 24), bx + 25, by + 88);
      });

      // Highlighted Financing / Price Box (y: 1510)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(70, 1510, 940, 220);
      ctx.fillStyle = '#E11D48';
      ctx.fillRect(70, 1510, 24, 220);

      ctx.fillStyle = '#E11D48';
      ctx.font = '900 30px Inter, Arial, sans-serif';
      ctx.fillText('LLEVÁTELA HOY SOLO CON TU DNI', 125, 1565);

      let mainOfferLine = 'FINANCIACIÓN EN 12, 18 Y 24 CUOTAS';
      if (incluirAnticipo && moto.entrega_minima) {
        mainOfferLine = `RETIRALA CON ${formatCurrency(moto.entrega_minima, moto.moneda)}`;
      } else if (incluirPrecio && moto.precio_contado) {
        mainOfferLine = `CONTADO: ${formatCurrency(moto.precio_contado, moto.moneda)}`;
      }

      ctx.fillStyle = '#0A0A0A';
      ctx.font = '900 54px Inter, Arial, sans-serif';
      ctx.fillText(mainOfferLine, 125, 1635);

      const subOfferLine =
        incluirPrecio && moto.precio_contado && incluirAnticipo
          ? `Contado: ${formatCurrency(moto.precio_contado, moto.moneda)} • Tomamos tu moto usada en parte de pago`
          : 'Tomamos tu moto usada en parte de pago • Cuota Simple y Créditos DNI';

      ctx.fillStyle = '#52525B';
      ctx.font = '700 26px Inter, Arial, sans-serif';
      ctx.fillText(subOfferLine, 125, 1690);

      // Footer Contact Strip
      ctx.fillStyle = '#E11D48';
      ctx.fillRect(0, 1780, 1080, 140);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 34px Inter, Arial, sans-serif';
      ctx.fillText(
        `📍 ${config.direccion.toUpperCase()} - ${config.ciudad.toUpperCase()}`,
        70,
        1845
      );
      ctx.font = '700 28px Inter, Arial, sans-serif';
      ctx.fillText(
        `📲 RESPONDÉ ESTE ESTADO O ESCRIBINOS POR WHATSAPP • ${config.instagram}`,
        70,
        1892
      );
    };

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => drawCard(img);
    img.onerror = () => drawCard(undefined);
    img.src = moto.imagen_portada;
  }, [moto, getMarcaNombre, getCategoriaNombre, config, incluirPrecio, incluirAnticipo]);

  if (!moto) return null;

  const handleDownloadStory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `story-elohim-${moto.slug}.png`;
      link.href = dataUrl;
      link.click();
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch {
      alert('No se pudo exportar la imagen automáticamente por permisos CORS de la foto externa.');
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl my-8">
        {/* Topbar */}
        <div className="px-6 py-4 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                Generador de Estado de WhatsApp / Instagram Story & Ficha PDF
              </h3>
              <p className="text-xs text-neutral-400">
                Formato vertical 9:16 (1080x1920 px) listo para publicar en redes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Canvas Preview (5 cols) */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="w-64 sm:w-72 aspect-[9/16] rounded-xl overflow-hidden border-2 border-neutral-700 shadow-2xl bg-neutral-900">
              <canvas
                ref={canvasRef}
                width={1080}
                height={1920}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Controls & Options (7 cols) */}
          <div className="md:col-span-7 space-y-5 text-white">
            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-red-500">
                Unidad Seleccionada
              </span>
              <h4 className="text-xl font-black">{moto.titulo}</h4>
              <p className="text-xs text-neutral-400">
                Año {moto.anio} • {moto.cilindrada}cc •{' '}
                {moto.condicion === '0km' ? '0km' : `${moto.kilometraje} km`}
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Personalizar placa antes de descargar:
              </p>

              <label className="flex items-center gap-3 p-3 rounded-xl bg-neutral-900 border border-neutral-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={incluirAnticipo}
                  onChange={(e) => setIncluirAnticipo(e.target.checked)}
                  className="w-4 h-4 accent-red-600 rounded"
                />
                <span className="text-sm font-semibold">
                  Destacar anticipo (&ldquo;Retirala con{' '}
                  {formatCurrency(moto.entrega_minima, moto.moneda)}&rdquo;)
                </span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl bg-neutral-900 border border-neutral-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={incluirPrecio}
                  onChange={(e) => setIncluirPrecio(e.target.checked)}
                  className="w-4 h-4 accent-red-600 rounded"
                />
                <span className="text-sm font-semibold">
                  Mostrar valor de contado ({formatCurrency(moto.precio_contado, moto.moneda)})
                </span>
              </label>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={handleDownloadStory}
                className="w-full py-3.5 px-5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/25 transition-all"
              >
                {downloaded ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>¡Imagen Descargada con Éxito!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Descargar Placa para Estado WA / Instagram Stories (.PNG)</span>
                  </>
                )}
              </button>

              <button
                onClick={handlePrintPDF}
                className="w-full py-3 px-5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all"
              >
                <Printer className="w-4 h-4 text-red-500" />
                <span>Imprimir / Guardar Ficha Técnica en PDF</span>
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-900/40 flex items-start gap-2.5 text-xs text-red-200">
              <Sparkles className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p>
                <strong>Tip para vendedores:</strong> Subí esta imagen directamente a tu Estado
                de WhatsApp o Historia de Instagram con el link a{' '}
                <code className="text-white">/motos/{moto.slug}</code> para recibir consultas
                directas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

