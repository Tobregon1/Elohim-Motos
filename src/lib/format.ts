import { SituacionLaboralTipo, EstadoLead } from '@/types/database';

export function formatCurrency(amount: number | null | undefined, moneda: 'ARS' | 'USD' = 'ARS'): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'Consultar Precio';
  }
  if (moneda === 'USD') {
    return `USD ${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(amount)}`;
  }
  return `$ ${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(amount)}`;
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export const SITUACION_LABORAL_LABELS: Record<SituacionLaboralTipo, string> = {
  recibo_sueldo: 'Con Recibo de Sueldo (Relación de dependencia)',
  monotributista: 'Monotributista / Responsable Inscripto',
  jubilado_pensionado: 'Jubilado / Pensionado',
  solo_dni_informal: 'Solo con DNI (Sin recibo de sueldo / Ingreso informal)',
};

export const ESTADO_LEAD_LABELS: Record<EstadoLead, { label: string; color: string }> = {
  nuevo: { label: 'Nuevo', color: 'bg-red-500/20 text-red-400 border-red-500/40' },
  contactado: { label: 'Contactado', color: 'bg-blue-500/20 text-blue-400 border-blue-500/40' },
  en_evaluacion: {
    label: 'En Evaluación (Veraz/BCRA)',
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  },
  aprobado: {
    label: 'Crédito Aprobado',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  },
  rechazado: { label: 'Rechazado', color: 'bg-zinc-700/50 text-zinc-400 border-zinc-600' },
  cerrado: {
    label: 'Venta Cerrada',
    color: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  },
};

