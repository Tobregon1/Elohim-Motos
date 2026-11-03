/**
 * Utilidad nativa OpenXML (.xlsx) para exportar e importar planillas reales de Microsoft Excel
 * sin depender de separadores regionales de CSV (; vs ,) y con soporte de anchos de columna y fórmulas.
 */

function escapeXml(value: string): string {
  return value
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function colIndexToLetter(index: number): string {
  let letter = '';
  let temp = index;
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
}

function colLetterToIndex(letters: string): number {
  let idx = 0;
  for (let i = 0; i < letters.length; i++) {
    idx = idx * 26 + (letters.charCodeAt(i) - 64);
  }
  return idx - 1;
}

// Tabla CRC32 estándar para contenedores ZIP (.xlsx)
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createZipStore(files: Array<{ name: string; data: Uint8Array }>): Uint8Array {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const dataBytes = file.data;
    const crc = crc32(dataBytes);
    const size = dataBytes.length;

    // Local file header (30 bytes + name)
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(localHeader.buffer);
    lv.setUint32(0, 0x04034b50, true); // Signature
    lv.setUint16(4, 20, true); // Version needed
    lv.setUint16(6, 0x0800, true); // UTF-8 flag
    lv.setUint16(8, 0, true); // Compression: 0 (STORE)
    lv.setUint16(10, 0, true); // Mod time
    lv.setUint16(12, 0x2100, true); // Mod date
    lv.setUint32(14, crc, true);
    lv.setUint32(18, size, true);
    lv.setUint32(22, size, true);
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true);
    localHeader.set(nameBytes, 30);

    localParts.push(localHeader, dataBytes);

    // Central directory header (46 bytes + name)
    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(centralHeader.buffer);
    cv.setUint32(0, 0x02014b50, true); // Signature
    cv.setUint16(4, 20, true); // Version made by
    cv.setUint16(6, 20, true); // Version needed
    cv.setUint16(8, 0x0800, true); // UTF-8 flag
    cv.setUint16(10, 0, true); // Compression: 0 (STORE)
    cv.setUint16(12, 0, true);
    cv.setUint16(14, 0x2100, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, size, true);
    cv.setUint32(24, size, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint16(30, 0, true);
    cv.setUint16(32, 0, true);
    cv.setUint16(34, 0, true);
    cv.setUint16(36, 0, true);
    cv.setUint32(38, 0, true);
    cv.setUint32(42, offset, true);
    centralHeader.set(nameBytes, 46);

    centralParts.push(centralHeader);
    offset += localHeader.length + size;
  }

  const centralSize = centralParts.reduce((acc, p) => acc + p.length, 0);
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, files.length, true);
  ev.setUint16(10, files.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);
  ev.setUint16(20, 0, true);

  const totalLength = offset + centralSize + eocd.length;
  const result = new Uint8Array(totalLength);
  let pos = 0;
  for (const p of localParts) {
    result.set(p, pos);
    pos += p.length;
  }
  for (const p of centralParts) {
    result.set(p, pos);
    pos += p.length;
  }
  result.set(eocd, pos);
  return result;
}

export interface ExcelColumnSpec {
  header: string;
  width: number;
}

/**
 * Descarga un archivo nativo .xlsx con columnas bien dimensionadas, encabezado estilizado y celdas tipadas.
 */
export function downloadExcelWorkbook(
  filename: string,
  sheetName: string,
  columns: ExcelColumnSpec[],
  rows: Array<Array<string | number | null | undefined>>
): void {
  const encoder = new TextEncoder();

  const colsXml = columns
    .map(
      (col, idx) =>
        `<col min="${idx + 1}" max="${idx + 1}" width="${col.width}" customWidth="1"/>`
    )
    .join('');

  const headerCellsXml = columns
    .map((col, cIdx) => {
      const ref = `${colIndexToLetter(cIdx)}1`;
      return `<c r="${ref}" s="1" t="inlineStr"><is><t>${escapeXml(
        col.header
      )}</t></is></c>`;
    })
    .join('');

  const dataRowsXml = rows
    .map((row, rIdx) => {
      const rowNum = rIdx + 2;
      const cells = columns
        .map((_, cIdx) => {
          const ref = `${colIndexToLetter(cIdx)}${rowNum}`;
          const val = row[cIdx];
          if (val === null || val === undefined || val === '') {
            return `<c r="${ref}" s="2" t="inlineStr"><is><t></t></is></c>`;
          }
          if (typeof val === 'number' && Number.isFinite(val)) {
            return `<c r="${ref}" s="2" t="n"><v>${val}</v></c>`;
          }
          return `<c r="${ref}" s="2" t="inlineStr"><is><t>${escapeXml(
            String(val)
          )}</t></is></c>`;
        })
        .join('');
      return `<row r="${rowNum}" ht="20" customHeight="1">${cells}</row>`;
    })
    .join('');

  const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <cols>${colsXml}</cols>
  <sheetData>
    <row r="1" ht="26" customHeight="1">${headerCellsXml}</row>
    ${dataRowsXml}
  </sheetData>
</worksheet>`;

  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2">
    <font><sz val="10"/><color rgb="FF111111"/><name val="Calibri"/></font>
    <font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
  </fonts>
  <fills count="3">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF111827"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FFE5E7EB"/></left>
      <right style="thin"><color rgb="FFE5E7EB"/></right>
      <top style="thin"><color rgb="FFE5E7EB"/></top>
      <bottom style="thin"><color rgb="FFE5E7EB"/></bottom>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="3">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment vertical="center"/>
    </xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1">
      <alignment vertical="center"/>
    </xf>
  </cellXfs>
</styleSheet>`;

  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="${escapeXml(sheetName)}" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`;

  const workbookRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

  const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`;

  const zipBytes = createZipStore([
    { name: '[Content_Types].xml', data: encoder.encode(contentTypesXml) },
    { name: '_rels/.rels', data: encoder.encode(rootRelsXml) },
    { name: 'xl/workbook.xml', data: encoder.encode(workbookXml) },
    { name: 'xl/_rels/workbook.xml.rels', data: encoder.encode(workbookRelsXml) },
    { name: 'xl/styles.xml', data: encoder.encode(stylesXml) },
    { name: 'xl/worksheets/sheet1.xml', data: encoder.encode(sheetXml) },
  ]);

  const blob = new Blob([zipBytes.buffer as ArrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

async function inflateRawBytes(compressed: Uint8Array): Promise<Uint8Array> {
  const ds = new DecompressionStream('deflate-raw');
  const writer = ds.writable.getWriter();
  writer.write(compressed as unknown as BufferSource);
  writer.close();
  const reader = ds.readable.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      total += value.length;
    }
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return out;
}

async function extractZipEntries(buffer: ArrayBuffer): Promise<Map<string, string>> {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  const decoder = new TextDecoder('utf-8');
  const entries = new Map<string, string>();

  // Buscar End of Central Directory (EOCD) desde el final
  let eocdOffset = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }
  if (eocdOffset === -1) {
    throw new Error('Archivo .xlsx inválido (no se encontró cabecera ZIP).');
  }

  const totalEntries = view.getUint16(eocdOffset + 10, true);
  let cdOffset = view.getUint32(eocdOffset + 16, true);

  for (let e = 0; e < totalEntries; e++) {
    if (view.getUint32(cdOffset, true) !== 0x02014b50) break;
    const method = view.getUint16(cdOffset + 10, true);
    const compressedSize = view.getUint32(cdOffset + 20, true);
    const nameLen = view.getUint16(cdOffset + 28, true);
    const extraLen = view.getUint16(cdOffset + 30, true);
    const commentLen = view.getUint16(cdOffset + 32, true);
    const localHeaderOffset = view.getUint32(cdOffset + 42, true);

    const name = decoder.decode(bytes.subarray(cdOffset + 46, cdOffset + 46 + nameLen));
    cdOffset += 46 + nameLen + extraLen + commentLen;

    if (
      name === 'xl/sharedStrings.xml' ||
      name.startsWith('xl/worksheets/sheet')
    ) {
      const localNameLen = view.getUint16(localHeaderOffset + 26, true);
      const localExtraLen = view.getUint16(localHeaderOffset + 28, true);
      const dataStart = localHeaderOffset + 30 + localNameLen + localExtraLen;
      const rawSlice = bytes.subarray(dataStart, dataStart + compressedSize);

      let uncompressed: Uint8Array;
      if (method === 0) {
        uncompressed = rawSlice;
      } else if (method === 8) {
        uncompressed = await inflateRawBytes(rawSlice);
      } else {
        continue;
      }
      entries.set(name, decoder.decode(uncompressed));
    }
  }

  return entries;
}

/**
 * Lee un archivo .xlsx (guardado por Microsoft Excel, Google Sheets o LibreOffice)
 * y devuelve una matriz 2D de filas y columnas.
 */
export async function parseExcelWorkbook(buffer: ArrayBuffer): Promise<string[][]> {
  const entries = await extractZipEntries(buffer);
  const parser = new DOMParser();

  // 1. Leer tabla de textos compartidos (sharedStrings.xml) si Excel la utilizó
  const sharedStrings: string[] = [];
  const sharedXmlStr = entries.get('xl/sharedStrings.xml');
  if (sharedXmlStr) {
    const sharedDoc = parser.parseFromString(sharedXmlStr, 'application/xml');
    const siNodes = Array.from(sharedDoc.getElementsByTagName('si'));
    for (const si of siNodes) {
      const tNodes = Array.from(si.getElementsByTagName('t'));
      sharedStrings.push(tNodes.map((t) => t.textContent || '').join(''));
    }
  }

  // 2. Buscar la primera hoja de cálculo disponible
  const sheetXmlStr =
    entries.get('xl/worksheets/sheet1.xml') ||
    Array.from(entries.entries()).find(([k]) => k.startsWith('xl/worksheets/sheet'))?.[1];

  if (!sheetXmlStr) {
    throw new Error('No se encontró ninguna hoja de cálculo dentro del archivo .xlsx');
  }

  const sheetDoc = parser.parseFromString(sheetXmlStr, 'application/xml');
  const rowNodes = Array.from(sheetDoc.getElementsByTagName('row'));
  const rows: string[][] = [];

  for (const rowNode of rowNodes) {
    const cellNodes = Array.from(rowNode.getElementsByTagName('c'));
    const rowValues: string[] = [];
    let fallbackColIdx = 0;

    for (const cell of cellNodes) {
      const ref = cell.getAttribute('r') || '';
      const letterMatch = ref.match(/^[A-Z]+/);
      const colIdx = letterMatch ? colLetterToIndex(letterMatch[0]) : fallbackColIdx;
      fallbackColIdx = colIdx + 1;

      const cellType = cell.getAttribute('t') || '';
      let value = '';

      if (cellType === 's') {
        const vNode = cell.getElementsByTagName('v')[0];
        const idx = Number(vNode?.textContent || 0);
        value = sharedStrings[idx] ?? '';
      } else if (cellType === 'inlineStr') {
        const tNodes = Array.from(cell.getElementsByTagName('t'));
        value = tNodes.map((t) => t.textContent || '').join('');
      } else {
        const vNode = cell.getElementsByTagName('v')[0];
        value = vNode?.textContent || '';
      }

      while (rowValues.length <= colIdx) {
        rowValues.push('');
      }
      rowValues[colIdx] = value.trim();
    }

    if (rowValues.some((v) => v !== '')) {
      rows.push(rowValues);
    }
  }

  return rows;
}
