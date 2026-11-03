-- ============================================================================
-- ELOHIM MOTOS - ARQUITECTURA DE BASE DE DATOS (SUPABASE / POSTGRESQL)
-- ============================================================================

-- 1. EXTENSIONES Y ENUMS (Tipos de datos personalizados para evitar errores)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
    CREATE TYPE condicion_moto AS ENUM ('0km', 'usada');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE estado_moto AS ENUM ('disponible', 'reservada', 'vendida', 'pausada');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE estado_lead AS ENUM ('nuevo', 'contactado', 'en_evaluacion', 'aprobado', 'rechazado', 'cerrado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE situacion_laboral_tipo AS ENUM ('recibo_sueldo', 'monotributista', 'jubilado_pensionado', 'solo_dni_informal');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 2. TABLAS DE CATÁLOGO (Marcas, Categorías y Motos)
-- ============================================================================

-- Tabla de Marcas (Honda, Yamaha, Motomel, Gilera, Corven, etc.)
CREATE TABLE IF NOT EXISTS marcas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    orden INT DEFAULT 0,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Categorías / Tipos (Cub 110, Street, Enduro / On-Off, Scooter, etc.)
CREATE TABLE IF NOT EXISTS categorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    icono TEXT, -- Nombre del ícono de Lucide o URL de SVG
    orden INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla Principal de Motos
CREATE TABLE IF NOT EXISTS motos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo TEXT NOT NULL,                  -- Ej: "Honda Wave 110S Base"
    slug TEXT NOT NULL UNIQUE,             -- Ej: "honda-wave-110s-base-0km"
    marca_id UUID REFERENCES marcas(id) ON DELETE SET NULL,
    categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
    
    -- Datos clave de filtro y estado
    condicion condicion_moto NOT NULL DEFAULT '0km',
    estado estado_moto NOT NULL DEFAULT 'disponible',
    cilindrada INT NOT NULL,               -- Ej: 110, 125, 150, 250
    anio INT NOT NULL,                     -- Ej: 2026 (para 0km) o 2022 (para usada)
    kilometraje INT DEFAULT 0,             -- 0 para nuevas, km reales para usadas
    
    -- Precios y Financiación (Adaptado a fluctuación de precios)
    precio_contado NUMERIC(12, 2),         -- Precio en ARS (o USD según prefieran)
    moneda TEXT DEFAULT 'ARS',             -- 'ARS' o 'USD'
    mostrar_precio BOOLEAN DEFAULT false,  -- Si es false, en la web muestra "Consultar Precio"
    entrega_minima NUMERIC(12, 2),         -- Ej: "Retirala con $350.000"
    cuota_desde NUMERIC(12, 2),            -- Ej: "Cuotas desde $85.000"
    acepta_permuta BOOLEAN DEFAULT true,   -- Si aceptan moto menor en parte de pago
    financiacion_dni BOOLEAN DEFAULT true, -- Etiqueta "Financiación solo con DNI"
    
    -- Ficha Técnica flexible en JSONB
    -- Estructura sugerida:
    -- { "motor": "4 tiempos", "arranque": "Eléctrico y patada", "freno_delantero": "Disco", "freno_trasero": "Tambor", "transmision": "4 velocidades", "colores": ["Rojo", "Negro", "Blanco"] }
    ficha_tecnica JSONB DEFAULT '{}'::jsonb,
    
    descripcion TEXT,                      -- Detalles extra (ej: "Único dueño, service al día, papeles listos para transferir")
    
    -- Multimedia
    imagen_portada TEXT,                   -- URL de la foto principal
    galeria_imagenes TEXT[] DEFAULT '{}',  -- Array con las URLs del resto de las fotos
    video_url TEXT,                        -- Opcional: Link a video corto (muy útil en usadas para escuchar el motor)
    
    -- Posicionamiento en la web
    destacada BOOLEAN DEFAULT false,       -- Para mostrar en el carrusel del Home
    oferta_mes BOOLEAN DEFAULT false,      -- Para ponerle una insignia de "Oferta"
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. TABLAS DE CONVERSIÓN (Leads de Financiación, Permutas y Vendedores)
-- ============================================================================

-- Tabla de Vendedores (Para el enrutador inteligente de WhatsApp)
CREATE TABLE IF NOT EXISTS vendedores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    whatsapp TEXT NOT NULL,                -- Formato internacional: "5493794XXXXXX"
    sucursal TEXT DEFAULT 'Casa Central',
    activo BOOLEAN DEFAULT true,
    orden_rotacion INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Solicitudes de Financiación (Pre-aprobación con DNI)
CREATE TABLE IF NOT EXISTS leads_financiacion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_completo TEXT NOT NULL,
    dni_cuil TEXT NOT NULL,                -- Clave para consultar BCRA / Veraz / Nosis
    telefono TEXT NOT NULL,
    localidad TEXT DEFAULT 'Corrientes Capital',
    situacion_laboral situacion_laboral_tipo NOT NULL,
    ingreso_aproximado NUMERIC(12, 2),
    anticipo_disponible NUMERIC(12, 2) DEFAULT 0,
    
    -- Qué moto estaba mirando cuando pidió el crédito
    moto_interes_id UUID REFERENCES motos(id) ON DELETE SET NULL,
    moto_interes_titulo TEXT,              -- Guardamos el texto por si el día de mañana borran la moto
    
    -- Seguimiento interno de la agencia (Mini CRM)
    estado estado_lead DEFAULT 'nuevo',
    vendedor_asignado_id UUID REFERENCES vendedores(id) ON DELETE SET NULL,
    notas_internas TEXT,                   -- Ej: "Salió rechazado en Veraz, ofrecer plan con garante"
    acepto_terminos_legales BOOLEAN NOT NULL DEFAULT true, -- Respaldo Ley 25.326
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Toma de Usados ("Entregá tu moto en parte de pago")
CREATE TABLE IF NOT EXISTS leads_permutas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_nombre TEXT NOT NULL,
    cliente_telefono TEXT NOT NULL,
    
    -- Datos de la moto del cliente
    marca_ofrecida TEXT NOT NULL,
    modelo_ofrecido TEXT NOT NULL,
    anio_ofrecido INT NOT NULL,
    kilometraje_aprox INT,
    papeles_al_dia BOOLEAN DEFAULT true,   -- Fundamental en motos usadas (08, título, libre deuda)
    detalles_estado TEXT,                  -- Ej: "Detalles estéticos en cachas, motor 10 puntos"
    fotos_usada TEXT[] DEFAULT '{}',       -- URLs de las fotos que sube el cliente
    valor_pretendido NUMERIC(12, 2),
    
    -- Moto que quiere sacar de la agencia
    moto_interes_id UUID REFERENCES motos(id) ON DELETE SET NULL,
    moto_interes_titulo TEXT,
    
    estado estado_lead DEFAULT 'nuevo',
    notas_tasacion TEXT,                   -- Para que la agencia anote cuánto le pueden tomar la moto
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. ÍNDICES Y TRIGGERS (Optimización de velocidad para los filtros)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_motos_condicion ON motos(condicion);
CREATE INDEX IF NOT EXISTS idx_motos_estado ON motos(estado);
CREATE INDEX IF NOT EXISTS idx_motos_marca ON motos(marca_id);
CREATE INDEX IF NOT EXISTS idx_motos_categoria ON motos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_motos_destacada ON motos(destacada) WHERE destacada = true;
CREATE INDEX IF NOT EXISTS idx_motos_slug ON motos(slug);

-- Trigger para actualizar "updated_at" automáticamente
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_motos_modtime ON motos;
CREATE TRIGGER update_motos_modtime
    BEFORE UPDATE ON motos
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_leads_financiacion_modtime ON leads_financiacion;
CREATE TRIGGER update_leads_financiacion_modtime
    BEFORE UPDATE ON leads_financiacion
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ============================================================================
-- 5. SEGURIDAD: ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE marcas ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE motos ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads_financiacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads_permutas ENABLE ROW LEVEL SECURITY;

-- Políticas de LECTURA PÚBLICA (Cualquier visitante puede ver el catálogo)
CREATE POLICY "Lectura pública de marcas" ON marcas FOR SELECT USING (true);
CREATE POLICY "Lectura pública de categorias" ON categorias FOR SELECT USING (true);
CREATE POLICY "Lectura pública de motos activas" ON motos FOR SELECT USING (estado != 'pausada');
CREATE POLICY "Lectura pública de vendedores activos" ON vendedores FOR SELECT USING (activo = true);

-- Políticas de INSERCIÓN PÚBLICA (Los clientes pueden enviar formularios sin estar logueados)
CREATE POLICY "Clientes pueden enviar solicitud de financiacion" 
    ON leads_financiacion FOR INSERT WITH CHECK (true);

CREATE POLICY "Clientes pueden enviar solicitud de permuta" 
    ON leads_permutas FOR INSERT WITH CHECK (true);

-- Políticas de ADMINISTRADOR (Usuarios autenticados en Supabase Auth tienen control total)
CREATE POLICY "Admin control total marcas" ON marcas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin control total categorias" ON categorias FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin control total motos" ON motos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin control total vendedores" ON vendedores FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin control total financiacion" ON leads_financiacion FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin control total permutas" ON leads_permutas FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================================
-- 6. DATOS INICIALES (Seed de Marcas, Categorías y Vendedores en Argentina)
-- ============================================================================

INSERT INTO marcas (nombre, slug, orden) VALUES
('Honda', 'honda', 1),
('Yamaha', 'yamaha', 2),
('Motomel', 'motomel', 3),
('Gilera', 'gilera', 4),
('Corven', 'corven', 5),
('Zanella', 'zanella', 6),
('Bajaj', 'bajaj', 7),
('Keller', 'keller', 8),
('Guerrero', 'guerrero', 9),
('Benelli', 'benelli', 10)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categorias (nombre, slug, icono, orden) VALUES
('Cub / 110cc', 'cub', 'Bike', 1),
('Street / Calle', 'street', 'Gauge', 2),
('Enduro / On-Off', 'enduro', 'Mountain', 3),
('Scooter', 'scooter', 'Zap', 4),
('Naked / Deportivas', 'naked', 'Flame', 5),
('Utilitarias / Carga', 'utilitarias', 'Package', 6)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO vendedores (nombre, whatsapp, sucursal, activo, orden_rotacion) VALUES
('Matías - Ventas 0km y Créditos', '5493794550101', 'Casa Central - Av. Independencia', true, 1),
('Lucas - Usados Seleccionados y Permutas', '5493794550102', 'Casa Central - Av. Independencia', true, 2),
('Sofía - Financiación DNI y Cuota Simple', '5493794550103', 'Sucursal Cazadores Correntinos', true, 3);

