/** Países de constitución y de operación disponibles en la demo. */
export const COUNTRIES = [
  { value: 'CL', label: 'Chile', currency: 'CLP' },
]

export const countryLabel = code => COUNTRIES.find(c => c.value === code)?.label ?? code

export const INDUSTRIES = [
  { value: 'marketplace', label: 'Marketplace / comercio digital' },
  { value: 'gaming', label: 'Gaming y entretenimiento' },
  { value: 'fintech', label: 'Fintech y servicios financieros' },
  { value: 'logistics', label: 'Logística y última milla' },
  { value: 'education', label: 'Educación' },
  { value: 'travel', label: 'Turismo y viajes' },
  { value: 'saas', label: 'Software / SaaS' },
  { value: 'retail', label: 'Retail' },
  { value: 'services', label: 'Servicios profesionales' },
  { value: 'other', label: 'Otra actividad' },
]

export const industryLabel = value => INDUSTRIES.find(i => i.value === value)?.label ?? value

export const ENTITY_TYPES = [
  { value: 'spa', label: 'Sociedad por Acciones (SpA)' },
  { value: 'ltda', label: 'Sociedad de Responsabilidad Limitada' },
  { value: 'sa', label: 'Sociedad Anónima' },
  { value: 'sac', label: 'Sociedad Anónima Cerrada (SAC)' },
  { value: 'srl', label: 'Sociedad de Responsabilidad Limitada (SRL)' },
  { value: 'other', label: 'Otro tipo de sociedad' },
]
