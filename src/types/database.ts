export type CondicionMoto = '0km' | 'usada';
export type EstadoMoto = 'disponible' | 'reservada' | 'vendida' | 'pausada';
export type EstadoLead = 'nuevo' | 'contactado' | 'en_evaluacion' | 'aprobado' | 'rechazado' | 'cerrado';
export type SituacionLaboralTipo =
  | 'recibo_sueldo'
  | 'monotributista'
  | 'jubilado_pensionado'
  | 'solo_dni_informal';

export interface Marca {
  id: string;
  nombre: string;
  slug: string;
  logo_url?: string;
  orden: number;
  activa: boolean;
}

export interface Categoria {
  id: string;
  nombre: string;
  slug: string;
  icono?: string;
  orden: number;
}

export interface FichaTecnica {
  motor?: string;
  alimentacion?: string;
  arranque?: string;
  freno_delantero?: string;
  freno_trasero?: string;
  transmision?: string;
  tanque?: string;
  peso?: string;
  colores?: string[];
}

export interface Moto {
  id: string;
  titulo: string;
  slug: string;
  marca_id: string;
  categoria_id: string;
  condicion: CondicionMoto;
  estado: EstadoMoto;
  cilindrada: number;
  anio: number;
  kilometraje: number;
  precio_contado: number | null;
  moneda: 'ARS' | 'USD';
  mostrar_precio: boolean;
  entrega_minima: number | null;
  cuota_desde: number | null;
  acepta_permuta: boolean;
  financiacion_dni: boolean;
  ficha_tecnica: FichaTecnica;
  descripcion: string;
  imagen_portada: string;
  galeria_imagenes: string[];
  video_url?: string;
  destacada: boolean;
  oferta_mes: boolean;
  created_at: string;
  updated_at: string;
}

export interface Vendedor {
  id: string;
  nombre: string;
  rol?: string;
  whatsapp: string;
  sucursal: string;
  activo: boolean;
  orden_rotacion: number;
}

export interface LeadFinanciacion {
  id: string;
  nombre_completo: string;
  dni_cuil: string;
  telefono: string;
  localidad: string;
  situacion_laboral: SituacionLaboralTipo;
  ingreso_aproximado: number | null;
  anticipo_disponible: number;
  cuotas_preferidas?: number;
  moto_interes_id: string | null;
  moto_interes_titulo: string;
  estado: EstadoLead;
  vendedor_asignado_id: string | null;
  notas_internas: string;
  acepto_terminos_legales: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeadPermuta {
  id: string;
  cliente_nombre: string;
  cliente_telefono: string;
  marca_ofrecida: string;
  modelo_ofrecido: string;
  anio_ofrecido: number;
  kilometraje_aprox: number;
  papeles_al_dia: boolean;
  detalles_estado: string;
  fotos_usada: string[];
  valor_pretendido: number | null;
  moto_interes_id: string | null;
  moto_interes_titulo: string;
  estado: EstadoLead;
  notas_tasacion: string;
  created_at: string;
}

export interface EntregaCliente {
  id: string;
  cliente: string;
  barrio_localidad: string;
  moto_entregada: string;
  modalidad: string;
  comentario: string;
  estrellas: number;
  imagen_url: string;
  fecha: string;
}

export interface AgenciaConfig {
  nombre: string;
  slogan: string;
  razon_social: string;
  cuit: string;
  direccion: string;
  ciudad: string;
  provincia: string;
  horarios_corrido: string;
  horarios_sabado: string;
  telefono_fijo: string;
  instagram: string;
  facebook: string;
  google_maps_embed: string;
  modo_rotacion_whatsapp: 'round_robin' | 'eleccion_cliente';
  meta_pixel_id: string;
  gtm_id: string;
}

