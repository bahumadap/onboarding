/**
 * Expediente de compliance de la demo.
 *
 * Los requisitos reales dependen de la jurisdicción, del proveedor y
 * del equipo de Compliance: estos campos son demostrativos.
 */
export const KYB_SECTIONS = [
  {
    id: 'legal',
    title: 'Identificación legal',
    description: 'Razón social, identificación tributaria, tipo de sociedad y domicilio legal.',
    fields: ['Razón social', 'Número de identificación tributaria', 'Tipo de sociedad', 'País de constitución', 'Domicilio legal'],
  },
  {
    id: 'structure',
    title: 'Representantes y estructura societaria',
    description: 'Representantes legales, accionistas y beneficiarios finales.',
    fields: ['Representantes legales', 'Accionistas', 'Beneficiarios finales', 'Porcentajes de participación'],
  },
  {
    id: 'documents',
    title: 'Documentación legal',
    description: 'Escritura de constitución, vigencia y poderes vigentes.',
    fields: ['Escritura de constitución', 'Certificado de vigencia', 'Poderes de representación', 'Cédulas de representantes'],
  },
  {
    id: 'activity',
    title: 'Actividad y perfil transaccional',
    description: 'Giro declarado, volúmenes esperados, países de operación y origen de fondos.',
    fields: ['Actividad económica', 'Volumen mensual estimado', 'Países de operación', 'Origen de fondos', 'Contrapartes habituales'],
  },
]

export const SAMPLE_OBSERVATIONS = [
  {
    id: 'obs_1',
    section: 'documents',
    title: 'Certificado de vigencia vencido',
    detail: 'El certificado adjunto tiene más de 60 días. Carga uno emitido dentro del último mes.',
  },
  {
    id: 'obs_2',
    section: 'structure',
    title: 'Falta declaración de beneficiario final',
    detail: 'Hay un accionista con 28% de participación sin declarar como beneficiario final.',
  },
]

export const COMPLIANCE_DOCUMENTS = [
  { id: 'doc_1', name: 'Escritura de constitución', kind: 'Constitución', uploadedAt: '2026-10-28', status: 'accepted' },
  { id: 'doc_2', name: 'Certificado de vigencia', kind: 'Vigencia', uploadedAt: '2026-10-28', status: 'observed' },
  { id: 'doc_3', name: 'Poder de representación', kind: 'Poderes', uploadedAt: '2026-10-29', status: 'accepted' },
  { id: 'doc_4', name: 'Declaración de beneficiarios finales', kind: 'UBO', uploadedAt: null, status: 'missing' },
]

export const DOCUMENT_STATUS_META = {
  accepted: { label: 'Aceptado', tone: 'success' },
  observed: { label: 'Observado', tone: 'warning' },
  missing: { label: 'Pendiente', tone: 'neutral' },
  in_review: { label: 'En revisión', tone: 'info' },
}

export const CONTRACTS = [
  { id: 'ct_1', name: 'Términos y condiciones de la plataforma', version: '2026-10-01', acceptedAt: '2026-11-03', scope: 'Registro' },
  { id: 'ct_2', name: 'Contrato de cuenta vista empresarial', version: '2026-09-12', acceptedAt: null, scope: 'Cuenta vista' },
  { id: 'ct_3', name: 'Anexo de cambio de divisas (FX)', version: '2026-08-04', acceptedAt: null, scope: 'FX' },
]
