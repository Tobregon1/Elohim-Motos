'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  AgenciaConfig,
  Categoria,
  EntregaCliente,
  EstadoMoto,
  LeadFinanciacion,
  LeadPermuta,
  Marca,
  Moto,
  Vendedor,
} from '@/types/database';
import {
  INITIAL_CATEGORIAS,
  INITIAL_CONFIG,
  INITIAL_ENTREGAS,
  INITIAL_LEADS_FINANCIACION,
  INITIAL_LEADS_PERMUTAS,
  INITIAL_MARCAS,
  INITIAL_MOTOS,
  INITIAL_VENDEDORES,
} from '@/data/seed';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { trackPixelAndGTM } from '@/lib/analytics';

interface WhatsAppRequest {
  mensaje: string;
  motoTitulo?: string;
  motoSlug?: string;
  vendedorId?: string;
  source?: string;
}

interface StoreContextType {
  motos: Moto[];
  marcas: Marca[];
  categorias: Categoria[];
  vendedores: Vendedor[];
  leadsFinanciacion: LeadFinanciacion[];
  leadsPermutas: LeadPermuta[];
  entregas: EntregaCliente[];
  config: AgenciaConfig;
  isLiveSupabase: boolean;
  isLoaded: boolean;
  getMarcaNombre: (id: string) => string;
  getCategoriaNombre: (id: string) => string;
  saveMoto: (motoData: Omit<Moto, 'id' | 'created_at' | 'updated_at'> & { id?: string }) => Promise<Moto>;
  deleteMoto: (id: string) => Promise<void>;
  toggleEstadoMoto: (id: string, estado: EstadoMoto) => Promise<void>;
  toggleMostrarPrecio: (id: string) => Promise<void>;
  toggleDestacadaMoto: (id: string) => Promise<void>;
  toggleOfertaMesMoto: (id: string) => Promise<void>;
  toggleAllPrecios: (mostrar: boolean) => Promise<void>;
  importMotosMasivo: (
    items: Array<Omit<Moto, 'id' | 'created_at' | 'updated_at'> & { id?: string }>,
    modo: 'merge' | 'replace'
  ) => Promise<{ insertadas: number; actualizadas: number }>;
  addLeadFinanciacion: (
    lead: Omit<LeadFinanciacion, 'id' | 'estado' | 'vendedor_asignado_id' | 'notas_internas' | 'created_at' | 'updated_at'>
  ) => Promise<{ lead: LeadFinanciacion; vendedor: Vendedor | null }>;
  updateLeadFinanciacion: (id: string, updates: Partial<LeadFinanciacion>) => Promise<void>;
  addLeadPermuta: (
    lead: Omit<LeadPermuta, 'id' | 'estado' | 'notas_tasacion' | 'created_at'>
  ) => Promise<{ lead: LeadPermuta; vendedor: Vendedor | null }>;
  updateLeadPermuta: (id: string, updates: Partial<LeadPermuta>) => Promise<void>;
  saveVendedor: (vendedor: Omit<Vendedor, 'id'> & { id?: string }) => Promise<void>;
  deleteVendedor: (id: string) => Promise<void>;
  updateConfig: (updates: Partial<AgenciaConfig>) => void;
  openWhatsAppRouter: (req: WhatsAppRequest) => Vendedor | null;
  getNextVendedor: () => Vendedor | null;
  resetDemoData: () => void;
  isCreditModalOpen: boolean;
  creditModalMotoId: string;
  openCreditModal: (motoId?: string) => void;
  closeCreditModal: () => void;
  isCuotasDrawerOpen: boolean;
  openCuotasDrawer: () => void;
  closeCuotasDrawer: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  MOTOS: 'elohim_motos_v2',
  VENDEDORES: 'elohim_vendedores_v2',
  LEADS_FIN: 'elohim_leads_fin_v1',
  LEADS_PERM: 'elohim_leads_perm_v1',
  CONFIG: 'elohim_config_v2',
  ROTACION_IDX: 'elohim_wa_rotacion_idx_v1',
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUuid(value: string | null | undefined): boolean {
  return Boolean(value && UUID_REGEX.test(value));
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [motos, setMotos] = useState<Moto[]>(INITIAL_MOTOS);
  const [marcas, setMarcas] = useState<Marca[]>(INITIAL_MARCAS);
  const [categorias, setCategorias] = useState<Categoria[]>(INITIAL_CATEGORIAS);
  const [vendedores, setVendedores] = useState<Vendedor[]>(INITIAL_VENDEDORES);
  const [leadsFinanciacion, setLeadsFinanciacion] = useState<LeadFinanciacion[]>(INITIAL_LEADS_FINANCIACION);
  const [leadsPermutas, setLeadsPermutas] = useState<LeadPermuta[]>(INITIAL_LEADS_PERMUTAS);
  const [entregas] = useState<EntregaCliente[]>(INITIAL_ENTREGAS);
  const [config, setConfig] = useState<AgenciaConfig>(INITIAL_CONFIG);
  const [isLoaded, setIsLoaded] = useState(false);

  // Global UI Modals & Drawers (MyM Motos interactive overlays)
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [creditModalMotoId, setCreditModalMotoId] = useState('');
  const [isCuotasDrawerOpen, setIsCuotasDrawerOpen] = useState(false);

  const openCreditModal = useCallback((motoId?: string) => {
    if (motoId !== undefined) setCreditModalMotoId(motoId);
    setIsCuotasDrawerOpen(false);
    setIsCreditModalOpen(true);
  }, []);

  const closeCreditModal = useCallback(() => {
    setIsCreditModalOpen(false);
  }, []);

  const openCuotasDrawer = useCallback(() => {
    setIsCreditModalOpen(false);
    setIsCuotasDrawerOpen(true);
  }, []);

  const closeCuotasDrawer = useCallback(() => {
    setIsCuotasDrawerOpen(false);
  }, []);

  // Carga inicial desde Supabase o LocalStorage
  useEffect(() => {
    async function loadData() {
      if (isSupabaseConfigured && supabase) {
        try {
          const [
            { data: dbMarcas },
            { data: dbCategorias },
            { data: dbMotos },
            { data: dbVendedores },
            { data: dbLeadsFin },
            { data: dbLeadsPerm },
          ] = await Promise.all([
            supabase.from('marcas').select('*').order('orden'),
            supabase.from('categorias').select('*').order('orden'),
            supabase.from('motos').select('*').order('created_at', { ascending: false }),
            supabase.from('vendedores').select('*').order('orden_rotacion'),
            supabase.from('leads_financiacion').select('*').order('created_at', { ascending: false }),
            supabase.from('leads_permutas').select('*').order('created_at', { ascending: false }),
          ]);

          if (dbMarcas?.length) setMarcas(dbMarcas);
          if (dbCategorias?.length) setCategorias(dbCategorias);

          if (dbMotos?.length) {
            setMotos(dbMotos);
          } else if (dbMarcas?.length && dbCategorias?.length) {
            // Si la tabla motos en Supabase recién fue creada y está vacía,
            // mapeamos los IDs de marcas y categorías del seed a los UUIDs reales de Supabase
            const mappedInitialMotos = INITIAL_MOTOS.map((m) => {
              const seedMarcaSlug = m.marca_id.replace(/^m-/, '');
              const seedCatSlug = m.categoria_id.replace(/^c-/, '');
              const realMarca =
                dbMarcas.find((dm: Marca) => dm.slug === seedMarcaSlug) || dbMarcas[0];
              const realCat =
                dbCategorias.find((dc: Categoria) => dc.slug === seedCatSlug) ||
                dbCategorias[0];
              return {
                ...m,
                marca_id: realMarca.id,
                categoria_id: realCat.id,
              };
            });

            // Intentamos poblar automáticamente las 13 motos iniciales en Supabase
            const payloadToInsert = mappedInitialMotos.map(
              ({ id: _id, created_at: _c, updated_at: _u, ...rest }) => rest
            );
            const { data: insertedMotos } = await supabase
              .from('motos')
              .insert(payloadToInsert)
              .select('*');

            if (insertedMotos?.length) {
              setMotos(insertedMotos);
            } else {
              setMotos(mappedInitialMotos);
            }
          }

          if (dbVendedores?.length) {
            const hasPlaceholderPhone = dbVendedores.some((v: Vendedor) =>
              v.whatsapp.startsWith('54937945501')
            );
            if (hasPlaceholderPhone) {
              const updatedVendedores = dbVendedores.map((v: Vendedor) => ({
                ...v,
                whatsapp: '5493795087892',
                sucursal: 'Av. Centenario 4145 (Av. Raúl Alfonsín 4145)',
              }));
              setVendedores(updatedVendedores);
              // Actualizar también en Supabase si la política lo permite
              for (const uv of updatedVendedores) {
                await supabase
                  .from('vendedores')
                  .update({
                    whatsapp: uv.whatsapp,
                    sucursal: uv.sucursal,
                  })
                  .eq('id', uv.id);
              }
            } else {
              setVendedores(dbVendedores);
            }
          }
          if (dbLeadsFin) setLeadsFinanciacion(dbLeadsFin);
          if (dbLeadsPerm) setLeadsPermutas(dbLeadsPerm);
        } catch (err) {
          console.error('Error cargando desde Supabase, usando store local:', err);
        }
      } else if (typeof window !== 'undefined') {
        try {
          const savedMotos = localStorage.getItem(STORAGE_KEYS.MOTOS);
          const savedVendedores = localStorage.getItem(STORAGE_KEYS.VENDEDORES);
          const savedLeadsFin = localStorage.getItem(STORAGE_KEYS.LEADS_FIN);
          const savedLeadsPerm = localStorage.getItem(STORAGE_KEYS.LEADS_PERM);
          const savedConfig = localStorage.getItem(STORAGE_KEYS.CONFIG);

          if (savedMotos) setMotos(JSON.parse(savedMotos));
          if (savedVendedores) setVendedores(JSON.parse(savedVendedores));
          if (savedLeadsFin) setLeadsFinanciacion(JSON.parse(savedLeadsFin));
          if (savedLeadsPerm) setLeadsPermutas(JSON.parse(savedLeadsPerm));
          if (savedConfig) setConfig({ ...INITIAL_CONFIG, ...JSON.parse(savedConfig) });
        } catch {
          // fallback a seed
        }
      }
      setIsLoaded(true);
    }

    loadData();
  }, []);

  // Persistencia automática en LocalStorage para modo Demo/Local
  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.MOTOS, JSON.stringify(motos));
      localStorage.setItem(STORAGE_KEYS.VENDEDORES, JSON.stringify(vendedores));
      localStorage.setItem(STORAGE_KEYS.LEADS_FIN, JSON.stringify(leadsFinanciacion));
      localStorage.setItem(STORAGE_KEYS.LEADS_PERM, JSON.stringify(leadsPermutas));
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    } catch {
      // ignore quota errors
    }
  }, [motos, vendedores, leadsFinanciacion, leadsPermutas, config, isLoaded]);

  const getMarcaNombre = useCallback(
    (id: string) => marcas.find((m) => m.id === id)?.nombre || 'Multimarca',
    [marcas]
  );

  const getCategoriaNombre = useCallback(
    (id: string) => categorias.find((c) => c.id === id)?.nombre || 'General',
    [categorias]
  );

  const getNextVendedor = useCallback((): Vendedor | null => {
    const activos = vendedores
      .filter((v) => v.activo)
      .sort((a, b) => a.orden_rotacion - b.orden_rotacion);
    if (activos.length === 0) return vendedores[0] || null;

    if (typeof window === 'undefined') return activos[0];
    const rawIdx = localStorage.getItem(STORAGE_KEYS.ROTACION_IDX);
    const currentIdx = rawIdx ? parseInt(rawIdx, 10) : 0;
    const selected = activos[currentIdx % activos.length];
    localStorage.setItem(STORAGE_KEYS.ROTACION_IDX, String((currentIdx + 1) % activos.length));
    return selected;
  }, [vendedores]);

  const openWhatsAppRouter = useCallback(
    ({ mensaje, motoTitulo, motoSlug, vendedorId, source = 'whatsapp_button' }: WhatsAppRequest): Vendedor | null => {
      let vendedor = vendedorId ? vendedores.find((v) => v.id === vendedorId) || null : null;
      if (!vendedor) {
        vendedor = getNextVendedor();
      }
      if (!vendedor) return null;

      trackPixelAndGTM('Lead', source, {
        content_name: motoTitulo || 'Consulta General WhatsApp',
        content_ids: motoSlug ? [motoSlug] : [],
        vendedor_asignado: vendedor.nombre,
        sucursal: vendedor.sucursal,
      });

      const cleanPhone = vendedor.whatsapp.replace(/[^0-9]/g, '');
      const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(mensaje)}`;
      if (typeof window !== 'undefined') {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
      return vendedor;
    },
    [vendedores, getNextVendedor]
  );

  const saveMoto = async (
    motoData: Omit<Moto, 'id' | 'created_at' | 'updated_at'> & { id?: string }
  ): Promise<Moto> => {
    const now = new Date().toISOString();
    if (motoData.id) {
      const updated: Moto = {
        ...motoData,
        id: motoData.id,
        created_at: motos.find((m) => m.id === motoData.id)?.created_at || now,
        updated_at: now,
      };
      if (isSupabaseConfigured && supabase) {
        await supabase.from('motos').update(updated).eq('id', updated.id);
      }
      setMotos((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      return updated;
    } else {
      const created: Moto = {
        ...motoData,
        id: `moto-${Date.now()}`,
        created_at: now,
        updated_at: now,
      };
      if (isSupabaseConfigured && supabase) {
        const { id: _unusedId, ...insertPayload } = motoData;
        const { data } = await supabase
          .from('motos')
          .insert([insertPayload])
          .select()
          .single();
        if (data) {
          setMotos((prev) => [data, ...prev]);
          return data;
        }
      }
      setMotos((prev) => [created, ...prev]);
      return created;
    }
  };

  const deleteMoto = async (id: string) => {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('motos').delete().eq('id', id);
    }
    setMotos((prev) => prev.filter((m) => m.id !== id));
  };

  const toggleEstadoMoto = async (id: string, estado: EstadoMoto) => {
    const now = new Date().toISOString();
    if (isSupabaseConfigured && supabase) {
      await supabase.from('motos').update({ estado, updated_at: now }).eq('id', id);
    }
    setMotos((prev) => prev.map((m) => (m.id === id ? { ...m, estado, updated_at: now } : m)));
  };

  const toggleMostrarPrecio = async (id: string) => {
    const target = motos.find((m) => m.id === id);
    if (!target) return;
    const mostrar_precio = !target.mostrar_precio;
    if (isSupabaseConfigured && supabase) {
      await supabase.from('motos').update({ mostrar_precio }).eq('id', id);
    }
    setMotos((prev) => prev.map((m) => (m.id === id ? { ...m, mostrar_precio } : m)));
  };

  const toggleDestacadaMoto = async (id: string) => {
    const target = motos.find((m) => m.id === id);
    if (!target) return;
    const destacada = !target.destacada;
    if (isSupabaseConfigured && supabase) {
      await supabase.from('motos').update({ destacada }).eq('id', id);
    }
    setMotos((prev) => prev.map((m) => (m.id === id ? { ...m, destacada } : m)));
  };

  const toggleOfertaMesMoto = async (id: string) => {
    const target = motos.find((m) => m.id === id);
    if (!target) return;
    const oferta_mes = !target.oferta_mes;
    if (isSupabaseConfigured && supabase) {
      await supabase.from('motos').update({ oferta_mes }).eq('id', id);
    }
    setMotos((prev) => prev.map((m) => (m.id === id ? { ...m, oferta_mes } : m)));
  };

  const toggleAllPrecios = async (mostrar: boolean) => {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('motos').update({ mostrar_precio: mostrar }).neq('slug', '__none__');
    }
    setMotos((prev) => prev.map((m) => ({ ...m, mostrar_precio: mostrar })));
  };

  const importMotosMasivo = async (
    items: Array<Omit<Moto, 'id' | 'created_at' | 'updated_at'> & { id?: string }>,
    modo: 'merge' | 'replace'
  ): Promise<{ insertadas: number; actualizadas: number }> => {
    const now = new Date().toISOString();

    if (modo === 'replace') {
      const seenSlugs = new Set<string>();
      const prepared = items.map((item, idx) => {
        let finalSlug = item.slug || `moto-${idx}-${Date.now()}`;
        if (seenSlugs.has(finalSlug)) {
          finalSlug = `${finalSlug}-${idx + 1}`;
        }
        seenSlugs.add(finalSlug);
        return {
          ...item,
          slug: finalSlug,
        };
      });

      if (isSupabaseConfigured && supabase) {
        await supabase.from('motos').delete().neq('slug', '__none__');
        const payloadToInsert = prepared.map(({ id: _unusedId, ...rest }) => rest);
        const { data: inserted } = await supabase
          .from('motos')
          .insert(payloadToInsert)
          .select('*');
        if (inserted?.length) {
          setMotos(inserted);
          return { insertadas: inserted.length, actualizadas: 0 };
        }
      }

      const localList: Moto[] = prepared.map((item, idx) => ({
        ...item,
        id: item.id || `moto-${Date.now()}-${idx}`,
        created_at: now,
        updated_at: now,
      }));
      setMotos(localList);
      return { insertadas: localList.length, actualizadas: 0 };
    }

    // Modo 'merge': Actualizar existentes + Agregar nuevas
    let insertadas = 0;
    let actualizadas = 0;
    const currentMotos = [...motos];
    const toInsert: Array<Omit<Moto, 'id' | 'created_at' | 'updated_at'>> = [];
    const seenSlugs = new Set<string>(currentMotos.map((m) => m.slug));

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const existingIndex = currentMotos.findIndex(
        (m) =>
          (item.id && m.id === item.id) ||
          m.slug === item.slug ||
          (m.titulo.trim().toLowerCase() === item.titulo.trim().toLowerCase() &&
            m.condicion === item.condicion &&
            m.anio === item.anio)
      );

      if (existingIndex !== -1) {
        const existing = currentMotos[existingIndex];
        const updatedMoto: Moto = {
          ...existing,
          ...item,
          id: existing.id,
          slug: existing.slug,
          created_at: existing.created_at,
          updated_at: now,
        };
        currentMotos[existingIndex] = updatedMoto;
        actualizadas++;

        if (isSupabaseConfigured && supabase) {
          const { id: _id, created_at: _c, ...updatePayload } = updatedMoto;
          await supabase.from('motos').update(updatePayload).eq('id', existing.id);
        }
      } else {
        let uniqueSlug = item.slug;
        if (seenSlugs.has(uniqueSlug)) {
          uniqueSlug = `${uniqueSlug}-${Date.now().toString().slice(-4)}-${i}`;
        }
        seenSlugs.add(uniqueSlug);
        const { id: _unusedId, ...cleanNew } = item;
        toInsert.push({
          ...cleanNew,
          slug: uniqueSlug,
        });
        insertadas++;
      }
    }

    if (toInsert.length > 0) {
      if (isSupabaseConfigured && supabase) {
        const { data: insertedRows } = await supabase
          .from('motos')
          .insert(toInsert)
          .select('*');
        if (insertedRows?.length) {
          setMotos([...insertedRows, ...currentMotos]);
          return { insertadas: insertedRows.length, actualizadas };
        }
      }

      const localInserted: Moto[] = toInsert.map((item, idx) => ({
        ...item,
        id: `moto-${Date.now()}-${idx}`,
        created_at: now,
        updated_at: now,
      }));
      setMotos([...localInserted, ...currentMotos]);
    } else {
      setMotos(currentMotos);
    }

    return { insertadas, actualizadas };
  };

  const addLeadFinanciacion = async (
    leadData: Omit<
      LeadFinanciacion,
      'id' | 'estado' | 'vendedor_asignado_id' | 'notas_internas' | 'created_at' | 'updated_at'
    >
  ) => {
    const vendedor = getNextVendedor();
    const now = new Date().toISOString();
    const newLead: LeadFinanciacion = {
      ...leadData,
      id: `lf-${Date.now()}`,
      estado: 'nuevo',
      vendedor_asignado_id: vendedor?.id || null,
      notas_internas: leadData.cuotas_preferidas
        ? `Plan solicitado: ${leadData.cuotas_preferidas} cuotas.`
        : '',
      created_at: now,
      updated_at: now,
    };

    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase
        .from('leads_financiacion')
        .insert([
          {
            nombre_completo: newLead.nombre_completo,
            dni_cuil: newLead.dni_cuil,
            telefono: newLead.telefono,
            localidad: newLead.localidad,
            situacion_laboral: newLead.situacion_laboral,
            ingreso_aproximado: newLead.ingreso_aproximado,
            anticipo_disponible: newLead.anticipo_disponible,
            moto_interes_id: isValidUuid(newLead.moto_interes_id)
              ? newLead.moto_interes_id
              : null,
            moto_interes_titulo: newLead.moto_interes_titulo,
            vendedor_asignado_id: isValidUuid(newLead.vendedor_asignado_id)
              ? newLead.vendedor_asignado_id
              : null,
            notas_internas: newLead.notas_internas,
            acepto_terminos_legales: newLead.acepto_terminos_legales,
          },
        ])
        .select()
        .single();
      if (data) newLead.id = data.id;
    }

    setLeadsFinanciacion((prev) => [newLead, ...prev]);

    trackPixelAndGTM('Lead', 'formulario_financiacion_dni', {
      content_name: newLead.moto_interes_titulo || 'Pre-calificación Crediticia DNI',
      situacion_laboral: newLead.situacion_laboral,
      value: newLead.anticipo_disponible || 0,
      currency: 'ARS',
    });

    return { lead: newLead, vendedor };
  };

  const updateLeadFinanciacion = async (id: string, updates: Partial<LeadFinanciacion>) => {
    const updated_at = new Date().toISOString();
    if (isSupabaseConfigured && supabase) {
      await supabase.from('leads_financiacion').update({ ...updates, updated_at }).eq('id', id);
    }
    setLeadsFinanciacion((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updates, updated_at } : l))
    );
  };

  const addLeadPermuta = async (
    leadData: Omit<LeadPermuta, 'id' | 'estado' | 'notas_tasacion' | 'created_at'>
  ) => {
    const vendedor = getNextVendedor();
    const now = new Date().toISOString();
    const newLead: LeadPermuta = {
      ...leadData,
      id: `lp-${Date.now()}`,
      estado: 'nuevo',
      notas_tasacion: '',
      created_at: now,
    };

    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase
        .from('leads_permutas')
        .insert([
          {
            cliente_nombre: newLead.cliente_nombre,
            cliente_telefono: newLead.cliente_telefono,
            marca_ofrecida: newLead.marca_ofrecida,
            modelo_ofrecido: newLead.modelo_ofrecido,
            anio_ofrecido: newLead.anio_ofrecido,
            kilometraje_aprox: newLead.kilometraje_aprox,
            papeles_al_dia: newLead.papeles_al_dia,
            detalles_estado: newLead.detalles_estado,
            fotos_usada: newLead.fotos_usada,
            valor_pretendido: newLead.valor_pretendido,
            moto_interes_id: isValidUuid(newLead.moto_interes_id)
              ? newLead.moto_interes_id
              : null,
            moto_interes_titulo: newLead.moto_interes_titulo,
          },
        ])
        .select()
        .single();
      if (data) newLead.id = data.id;
    }

    setLeadsPermutas((prev) => [newLead, ...prev]);

    trackPixelAndGTM('Lead', 'formulario_permuta_usados', {
      content_name: `${newLead.marca_ofrecida} ${newLead.modelo_ofrecido} (${newLead.anio_ofrecido})`,
      moto_interes: newLead.moto_interes_titulo,
      value: newLead.valor_pretendido || 0,
      currency: 'ARS',
    });

    return { lead: newLead, vendedor };
  };

  const updateLeadPermuta = async (id: string, updates: Partial<LeadPermuta>) => {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('leads_permutas').update(updates).eq('id', id);
    }
    setLeadsPermutas((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  };

  const saveVendedor = async (vendedorData: Omit<Vendedor, 'id'> & { id?: string }) => {
    if (vendedorData.id) {
      const updated: Vendedor = { ...vendedorData, id: vendedorData.id };
      if (isSupabaseConfigured && supabase) {
        await supabase.from('vendedores').update(updated).eq('id', updated.id);
      }
      setVendedores((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
    } else {
      const created: Vendedor = { ...vendedorData, id: `v-${Date.now()}` };
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase.from('vendedores').insert([vendedorData]).select().single();
        if (data) created.id = data.id;
      }
      setVendedores((prev) => [...prev, created]);
    }
  };

  const deleteVendedor = async (id: string) => {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('vendedores').delete().eq('id', id);
    }
    setVendedores((prev) => prev.filter((v) => v.id !== id));
  };

  const updateConfig = (updates: Partial<AgenciaConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const resetDemoData = () => {
    setMotos(INITIAL_MOTOS);
    setVendedores(INITIAL_VENDEDORES);
    setLeadsFinanciacion(INITIAL_LEADS_FINANCIACION);
    setLeadsPermutas(INITIAL_LEADS_PERMUTAS);
    setConfig(INITIAL_CONFIG);
    if (typeof window !== 'undefined') {
      Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    }
  };

  return (
    <StoreContext.Provider
      value={{
        motos,
        marcas,
        categorias,
        vendedores,
        leadsFinanciacion,
        leadsPermutas,
        entregas,
        config,
        isLiveSupabase: isSupabaseConfigured,
        isLoaded,
        getMarcaNombre,
        getCategoriaNombre,
        saveMoto,
        deleteMoto,
        toggleEstadoMoto,
        toggleMostrarPrecio,
        toggleDestacadaMoto,
        toggleOfertaMesMoto,
        toggleAllPrecios,
        importMotosMasivo,
        addLeadFinanciacion,
        updateLeadFinanciacion,
        addLeadPermuta,
        updateLeadPermuta,
        saveVendedor,
        deleteVendedor,
        updateConfig,
        openWhatsAppRouter,
        getNextVendedor,
        resetDemoData,
        isCreditModalOpen,
        creditModalMotoId,
        openCreditModal,
        closeCreditModal,
        isCuotasDrawerOpen,
        openCuotasDrawer,
        closeCuotasDrawer,
      }}
    >
      {isLoaded ? (
        children
      ) : (
        <div suppressHydrationWarning className="min-h-screen bg-neutral-950" />
      )}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore debe usarse dentro de StoreProvider');
  return ctx;
}

