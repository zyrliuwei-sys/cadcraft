export const MAX_DWG_BYTES = 20 * 1024 * 1024;
export const MAX_DXF_BYTES = 64 * 1024 * 1024;
export const DWG_TIMEOUT_MS = 45_000;
export const DWG_WASM_PATH = '/dwg-converter/2.0.1';

const VERSIONS = new Set([
  'AC1012',
  'AC1014',
  'AC1015',
  'AC1018',
  'AC1021',
  'AC1024',
  'AC1027',
  'AC1032',
]);

export type ImportErrorCode =
  | 'too_large'
  | 'invalid'
  | 'version'
  | 'conversion'
  | 'reader_failed'
  | 'timeout'
  | 'cancelled'
  | 'not_ready'
  | 'open_failed'
  | 'busy';

export class DrawingImportError extends Error {
  constructor(public readonly code: ImportErrorCode) {
    super(code);
    this.name = 'DrawingImportError';
  }
}

export function validateDwgHeader(header: Uint8Array, size: number) {
  if (size > MAX_DWG_BYTES) throw new DrawingImportError('too_large');
  const version = new TextDecoder().decode(header.subarray(0, 6));
  if (size < 128 || !/^AC10\d{2}$/.test(version))
    throw new DrawingImportError('invalid');
  if (!VERSIONS.has(version)) throw new DrawingImportError('version');
  return version;
}

export function dxfName(name: string) {
  return name.replace(/\.dwg$/i, '') + '.dxf';
}
