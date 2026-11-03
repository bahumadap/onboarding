/* =============================================================
   Máquina de estados de YOL1 Enterprise.

   Cuatro dimensiones INDEPENDIENTES. Una organización puede tener
   KYB aprobado y cuenta vista activa mientras FX sigue en
   evaluación: nunca se modela con un booleano de "onboarding listo".

     1. userStatus      — ciclo de vida del usuario
     2. kybStatus       — validación de la organización / entidad legal
     3. accountStatus   — aprovisionamiento de la cuenta vista
     4. productStatus   — por cada producto financiero adicional

   `tone` mapea al Badge del kit de UI, para que el estado se
   renderice igual en toda la aplicación.
   ============================================================= */

/* ------------------------------ Usuario ------------------------------ */
export const USER_STATUS = {
  CREATED: 'created',
  EMAIL_VERIFIED: 'email_verified',
  ACTIVE: 'active',
  DISABLED: 'disabled',
}

export const USER_STATUS_META = {
  [USER_STATUS.CREATED]: { label: 'Creado', tone: 'neutral' },
  [USER_STATUS.EMAIL_VERIFIED]: { label: 'Correo verificado', tone: 'info' },
  [USER_STATUS.ACTIVE]: { label: 'Activo', tone: 'success' },
  [USER_STATUS.DISABLED]: { label: 'Deshabilitado', tone: 'danger' },
}

/* ---------------------------- KYB / empresa --------------------------- */
export const KYB_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  IN_REVIEW: 'in_review',
  OBSERVED: 'observed',
  APPROVED: 'approved',
  REJECTED: 'rejected',
}

export const KYB_STATUS_META = {
  [KYB_STATUS.DRAFT]: { label: 'Borrador', tone: 'neutral', description: 'Aún no has enviado la información de la empresa.' },
  [KYB_STATUS.PENDING]: { label: 'Información pendiente', tone: 'warning', description: 'Faltan datos o documentos para completar el expediente.' },
  [KYB_STATUS.IN_REVIEW]: { label: 'En revisión', tone: 'info', description: 'Nuestro equipo está revisando la información enviada.' },
  [KYB_STATUS.OBSERVED]: { label: 'Observado', tone: 'warning', description: 'Hay observaciones que debes corregir para continuar.' },
  [KYB_STATUS.APPROVED]: { label: 'Aprobado', tone: 'success', description: 'La validación de empresa está aprobada.' },
  [KYB_STATUS.REJECTED]: { label: 'Rechazado', tone: 'danger', description: 'La solicitud fue rechazada. Contacta a tu ejecutivo.' },
}

/* ------------------------ Validación de identidad --------------------- */
export const IDENTITY_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  IN_REVIEW: 'in_review',
  OBSERVED: 'observed',
  APPROVED: 'approved',
  FAILED: 'failed',
}

export const IDENTITY_STATUS_META = {
  [IDENTITY_STATUS.NOT_STARTED]: { label: 'No iniciada', tone: 'neutral' },
  [IDENTITY_STATUS.IN_PROGRESS]: { label: 'En curso', tone: 'info' },
  [IDENTITY_STATUS.IN_REVIEW]: { label: 'En revisión', tone: 'info' },
  [IDENTITY_STATUS.OBSERVED]: { label: 'Observada', tone: 'warning' },
  [IDENTITY_STATUS.APPROVED]: { label: 'Verificada', tone: 'success' },
  [IDENTITY_STATUS.FAILED]: { label: 'Fallida', tone: 'danger' },
}

/* --------------------------- Cuenta vista ----------------------------- */
export const ACCOUNT_STATUS = {
  NOT_PROVISIONED: 'not_provisioned',
  PROVISIONING: 'provisioning',
  ACTIVE: 'active',
  RESTRICTED: 'restricted',
  FAILED: 'failed',
}

export const ACCOUNT_STATUS_META = {
  [ACCOUNT_STATUS.NOT_PROVISIONED]: { label: 'Sin aprovisionar', tone: 'neutral', description: 'La cuenta vista todavía no ha sido solicitada al proveedor.' },
  [ACCOUNT_STATUS.PROVISIONING]: { label: 'En aprovisionamiento', tone: 'info', description: 'Estamos abriendo tu cuenta vista empresarial.' },
  [ACCOUNT_STATUS.ACTIVE]: { label: 'Activa', tone: 'success', description: 'Tu cuenta vista está habilitada para operar.' },
  [ACCOUNT_STATUS.RESTRICTED]: { label: 'Restringida', tone: 'warning', description: 'La cuenta opera con restricciones. Revisa los requerimientos pendientes.' },
  [ACCOUNT_STATUS.FAILED]: { label: 'Con error', tone: 'danger', description: 'El aprovisionamiento falló. El equipo de operaciones está revisando el caso.' },
}

/** La cuenta solo se puede operar en estos estados. */
export const OPERABLE_ACCOUNT_STATUSES = [ACCOUNT_STATUS.ACTIVE, ACCOUNT_STATUS.RESTRICTED]

/* ---------------------------- Productos ------------------------------- */
export const PRODUCT_STATUS = {
  NOT_AVAILABLE: 'not_available',
  AVAILABLE_TO_REQUEST: 'available_to_request',
  REQUESTED: 'requested',
  IN_REVIEW: 'in_review',
  PENDING_CONFIGURATION: 'pending_configuration',
  ACTIVE: 'active',
  REJECTED: 'rejected',
  DISABLED: 'disabled',
}

export const PRODUCT_STATUS_META = {
  [PRODUCT_STATUS.NOT_AVAILABLE]: { label: 'No disponible', tone: 'neutral', action: null },
  [PRODUCT_STATUS.AVAILABLE_TO_REQUEST]: { label: 'Disponible', tone: 'brand', action: 'Solicitar activación' },
  [PRODUCT_STATUS.REQUESTED]: { label: 'Solicitado', tone: 'info', action: 'Ver solicitud' },
  [PRODUCT_STATUS.IN_REVIEW]: { label: 'En evaluación', tone: 'info', action: 'Ver solicitud' },
  [PRODUCT_STATUS.PENDING_CONFIGURATION]: { label: 'Pendiente de configuración', tone: 'warning', action: 'Configurar' },
  [PRODUCT_STATUS.ACTIVE]: { label: 'Activo', tone: 'success', action: 'Administrar' },
  [PRODUCT_STATUS.REJECTED]: { label: 'Rechazado', tone: 'danger', action: null },
  [PRODUCT_STATUS.DISABLED]: { label: 'Deshabilitado', tone: 'neutral', action: null },
}

/** Un producto solo se puede usar en el Merchant Desk si está activo. */
export const isProductOperable = status => status === PRODUCT_STATUS.ACTIVE

/* ------------------- Estado de secciones del KYB ---------------------- */
export const SECTION_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETE: 'complete',
  OBSERVED: 'observed',
}

export const SECTION_STATUS_META = {
  [SECTION_STATUS.NOT_STARTED]: { label: 'Pendiente', tone: 'neutral' },
  [SECTION_STATUS.IN_PROGRESS]: { label: 'En progreso', tone: 'info' },
  [SECTION_STATUS.COMPLETE]: { label: 'Completa', tone: 'success' },
  [SECTION_STATUS.OBSERVED]: { label: 'Observada', tone: 'warning' },
}

/* --------------------------- Checklist -------------------------------- */
export const TASK_KIND = {
  AUTOMATIC: 'automatic',
  REQUIRED: 'required',
  RECOMMENDED: 'recommended',
  OPTIONAL: 'optional',
}

export const TASK_KIND_META = {
  [TASK_KIND.AUTOMATIC]: { label: 'Automático', tone: 'success' },
  [TASK_KIND.REQUIRED]: { label: 'Necesario', tone: 'warning' },
  [TASK_KIND.RECOMMENDED]: { label: 'Recomendado', tone: 'info' },
  [TASK_KIND.OPTIONAL]: { label: 'Opcional', tone: 'neutral' },
}

/* ------------------------ Reglas de transición ------------------------ */
/**
 * Condición de habilitación de la cuenta vista: el aprovisionamiento
 * arranca solo cuando identidad y KYB están aprobados. Es la única
 * puerta entre el macroproceso B y el C.
 */
export const canProvisionAccount = ({ identityStatus, kybStatus }) =>
  identityStatus === IDENTITY_STATUS.APPROVED && kybStatus === KYB_STATUS.APPROVED

/** Acceso operativo al Merchant Desk. */
export const canAccessDesk = ({ accountStatus }) =>
  OPERABLE_ACCOUNT_STATUSES.includes(accountStatus)

/** Config Org se puede usar apenas existe organización, aunque el KYB siga abierto. */
export const canAccessOrgConsole = ({ userStatus }) =>
  userStatus === USER_STATUS.ACTIVE || userStatus === USER_STATUS.EMAIL_VERIFIED

/** Etapa del recorrido en la que está la organización, para redirigir desde `/`. */
export function resolveStage(state) {
  if (!state.user?.email) return 'signup'
  if (canAccessDesk(state)) return 'desk'
  if (state.accountStatus === ACCOUNT_STATUS.PROVISIONING || state.accountStatus === ACCOUNT_STATUS.FAILED) return 'activation'
  if (canProvisionAccount(state)) return 'activation'
  return 'onboarding'
}
