/* =============================================================
   Estado de la demo.

   Un único reducer con las cuatro dimensiones de estado, más los
   datos que el usuario va creando durante el recorrido. Es la capa
   que mañana se reemplaza por llamadas reales: las features solo
   leen selectores y despachan acciones, nunca tocan los mocks.
   ============================================================= */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react'
import {
  ACCOUNT_STATUS, IDENTITY_STATUS, KYB_STATUS, PRODUCT_STATUS, SECTION_STATUS,
  USER_STATUS, canAccessDesk, canProvisionAccount, isProductOperable,
} from './statuses'
import { PRODUCT_CATALOG } from '../mock/products'
import { TEAM_MEMBERS } from '../mock/team'
import { VIRTUAL_ACCOUNTS } from '../mock/virtualAccounts'
import { TERMS_VERSION } from '../mock/terms'
import { restrictToChile } from './chileScope'

/* --------------------------- persistencia --------------------------- */
const STORAGE_KEY = 'yol1.enterprise'
const SCHEMA_VERSION = 1

function readPersisted() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    // Si cambia el esquema se descarta: es una demo, no migramos.
    if (parsed?.__v !== SCHEMA_VERSION) return null
    return parsed
  } catch {
    return null
  }
}

function persist(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* almacenamiento bloqueado (incógnito): la demo sigue funcionando en memoria */
  }
}

/* ---------------------------- estado base ---------------------------- */
const emptyOrganization = {
  id: null,
  legalName: '',
  tradeName: '',
  industry: '',
  countryOfIncorporation: '',
  operatingCountries: [],
  taxId: '',
  entityType: '',
  legalAddress: '',
  economicActivity: '',
  legalEntities: [],
}

export const initialState = {
  __v: SCHEMA_VERSION,

  // Macroproceso A — signup
  signupStep: 0,
  otpAttempts: 0,
  onboardingDraftId: null,
  user: { email: '', firstName: '', lastName: '', termsVersion: null, acceptedAt: null },
  userStatus: USER_STATUS.CREATED,
  organization: { ...emptyOrganization },

  // Macroproceso B — onboarding
  identityStatus: IDENTITY_STATUS.NOT_STARTED,
  kybStatus: KYB_STATUS.DRAFT,
  kybSections: {
    legal: SECTION_STATUS.NOT_STARTED,
    structure: SECTION_STATUS.NOT_STARTED,
    documents: SECTION_STATUS.NOT_STARTED,
    activity: SECTION_STATUS.NOT_STARTED,
  },
  kybObservations: [],
  kybSubmittedAt: null,

  // Macroproceso C — core activation
  accountStatus: ACCOUNT_STATUS.NOT_PROVISIONED,
  accountActivatedAt: null,
  provisioningStartedAt: null,

  // Macroproceso D — merchant desk
  virtualAccounts: [],
  products: Object.fromEntries(
    PRODUCT_CATALOG.map(p => [p.id, p.initialStatus ?? PRODUCT_STATUS.AVAILABLE_TO_REQUEST]),
  ),
  productRequests: [],

  // Macroproceso E — config org
  team: [],
  invitations: [],
  approvalPolicy: {
    dualApprovalEnabled: true,
    dualApprovalThreshold: 5000000,
    initiatorRoles: ['operator', 'org_admin'],
    approverRoles: ['approver', 'org_admin'],
  },
  checklistDone: {},
  apiKeysRevealed: false,
}

/* ------------------------------ reducer ------------------------------ */
function reducer(state, action) {
  switch (action.type) {
    /* ---------- signup ---------- */
    case 'signup/step':
      return { ...state, signupStep: action.step }

    case 'signup/email':
      return { ...state, user: { ...state.user, email: action.email }, otpAttempts: 0, userStatus: USER_STATUS.CREATED }

    case 'signup/otpSent':
      return { ...state, otpAttempts: 0, otpSentAt: Date.now(), userStatus: USER_STATUS.CREATED }

    case 'signup/otpAttempt':
      return { ...state, otpAttempts: state.otpAttempts + 1 }

    case 'signup/otpVerified':
      return { ...state, userStatus: USER_STATUS.EMAIL_VERIFIED, otpAttempts: 0 }

    case 'signup/profile':
      return { ...state, user: { ...state.user, firstName: action.firstName, lastName: action.lastName } }

    case 'signup/company':
      return {
        ...state,
        organization: {
          ...state.organization,
          tradeName: action.tradeName,
          legalName: state.organization.legalName || action.tradeName,
          industry: action.industry,
          countryOfIncorporation: action.countryOfIncorporation,
          operatingCountries: action.operatingCountries,
        },
      }

    case 'signup/terms':
      return {
        ...state,
        user: { ...state.user, termsVersion: TERMS_VERSION, acceptedAt: new Date().toISOString() },
      }

    /** Cierra el signup: crea User + Organization + Onboarding Draft. */
    case 'signup/complete': {
      const slug = (state.organization.tradeName || 'org').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 18)
      return {
        ...state,
        userStatus: USER_STATUS.ACTIVE,
        organization: {
          ...state.organization,
          id: `org_${slug}`,
          legalEntities: [{
            id: 'ent_1',
            legalName: state.organization.legalName || state.organization.tradeName,
            country: state.organization.countryOfIncorporation,
            role: 'primary',
            kybStatus: KYB_STATUS.DRAFT,
          }],
        },
        onboardingDraftId: `obd_${Math.random().toString(36).slice(2, 8)}`,
        team: TEAM_MEMBERS.slice(0, 1).map((m, i) => (i === 0
          ? { ...m, name: [state.user.firstName, state.user.lastName].filter(Boolean).join(' ') || m.name, email: state.user.email || m.email }
          : m)),
        signupStep: 0,
      }
    }

    /* ---------- onboarding ---------- */
    case 'identity/status':
      return { ...state, identityStatus: action.status }

    case 'kyb/section':
      return { ...state, kybSections: { ...state.kybSections, [action.section]: action.status } }

    case 'kyb/submit':
      return {
        ...state,
        kybStatus: KYB_STATUS.IN_REVIEW,
        kybSubmittedAt: new Date().toISOString(),
        kybObservations: [],
      }

    case 'kyb/status':
      return {
        ...state,
        kybStatus: action.status,
        kybObservations: action.observations ?? (action.status === KYB_STATUS.OBSERVED ? state.kybObservations : []),
      }

    case 'kyb/observations':
      return { ...state, kybStatus: KYB_STATUS.OBSERVED, kybObservations: action.observations }

    case 'kyb/resolveObservation':
      return { ...state, kybObservations: state.kybObservations.filter(o => o.id !== action.id) }

    case 'org/details':
      return { ...state, organization: { ...state.organization, ...action.patch } }

    case 'org/addLegalEntity':
      return {
        ...state,
        organization: {
          ...state.organization,
          legalEntities: [...state.organization.legalEntities, { id: `ent_${state.organization.legalEntities.length + 1}`, ...action.entity }],
        },
      }

    /* ---------- core activation ---------- */
    case 'account/startProvisioning':
      return {
        ...state,
        accountStatus: ACCOUNT_STATUS.PROVISIONING,
        provisioningStartedAt: new Date().toISOString(),
        provisioningOutcome: action.outcome ?? ACCOUNT_STATUS.ACTIVE,
      }

    case 'account/status':
      return {
        ...state,
        accountStatus: action.status,
        accountActivatedAt: action.status === ACCOUNT_STATUS.ACTIVE
          ? (state.accountActivatedAt ?? new Date().toISOString())
          : state.accountActivatedAt,
        // La cuenta habilitada trae consigo las cuentas virtuales de ejemplo.
        virtualAccounts: [ACCOUNT_STATUS.ACTIVE, ACCOUNT_STATUS.RESTRICTED].includes(action.status) && state.virtualAccounts.length === 0
          ? VIRTUAL_ACCOUNTS
          : state.virtualAccounts,
        products: [ACCOUNT_STATUS.ACTIVE, ACCOUNT_STATUS.RESTRICTED].includes(action.status)
          ? { ...state.products, core_account: PRODUCT_STATUS.ACTIVE, virtual_accounts: PRODUCT_STATUS.ACTIVE }
          : state.products,
      }

    /* ---------- merchant desk ---------- */
    case 'virtualAccounts/create':
      return {
        ...state,
        virtualAccounts: [{
          id: `CV-${10000 + state.virtualAccounts.length + 1}`,
          alias: action.alias,
          holder: action.holder,
          currency: action.currency,
          purpose: action.purpose,
          balance: 0,
          status: 'active',
          createdAt: new Date().toISOString(),
          movements: 0,
        }, ...state.virtualAccounts],
      }

    case 'virtualAccounts/setStatus':
      return {
        ...state,
        virtualAccounts: state.virtualAccounts.map(va => va.id === action.id ? { ...va, status: action.status } : va),
      }

    case 'products/request':
      return {
        ...state,
        products: { ...state.products, [action.productId]: PRODUCT_STATUS.REQUESTED },
        productRequests: [
          { id: `req_${Math.random().toString(36).slice(2, 8)}`, productId: action.productId, requestedAt: new Date().toISOString(), note: action.note ?? '' },
          ...state.productRequests,
        ],
      }

    case 'products/status':
      return { ...state, products: { ...state.products, [action.productId]: action.status } }

    /* ---------- config org ---------- */
    case 'team/invite':
      return {
        ...state,
        invitations: [{
          id: `inv_${Math.random().toString(36).slice(2, 8)}`,
          email: action.email,
          role: action.role,
          invitedAt: new Date().toISOString(),
          status: 'pending',
        }, ...state.invitations],
      }

    case 'team/cancelInvitation':
      return { ...state, invitations: state.invitations.filter(i => i.id !== action.id) }

    case 'team/setRole':
      return { ...state, team: state.team.map(m => m.id === action.id ? { ...m, role: action.role } : m) }

    case 'team/setStatus':
      return { ...state, team: state.team.map(m => m.id === action.id ? { ...m, status: action.status } : m) }

    case 'approvals/patch':
      return { ...state, approvalPolicy: { ...state.approvalPolicy, ...action.patch } }

    case 'checklist/toggle':
      return { ...state, checklistDone: { ...state.checklistDone, [action.id]: action.done } }

    case 'api/reveal':
      return { ...state, apiKeysRevealed: action.revealed }

    /* ---------- demo ---------- */
    case 'demo/patch':
      return { ...state, ...action.patch }

    case 'demo/reset':
      return { ...initialState }

    /** Salta directo a un escenario completo, para demos en vivo. */
    case 'demo/scenario':
      return { ...state, ...action.state }

    default:
      return state
  }
}

const chileReducer = (state, action) => restrictToChile(reducer(state, action))

/* ------------------------------ contexto ----------------------------- */
const DemoStateContext = createContext(null)

export function DemoStateProvider({ children }) {
  const [state, dispatch] = useReducer(chileReducer, null, () => restrictToChile(readPersisted() ?? initialState))

  // La apertura pertenece al ciclo de vida de la entidad, no a una pantalla.
  useEffect(() => {
    if (state.organization.id && canProvisionAccount(state) && state.accountStatus === ACCOUNT_STATUS.NOT_PROVISIONED) {
      dispatch({ type: 'account/startProvisioning' })
    }
  }, [state.organization.id, state.identityStatus, state.kybStatus, state.accountStatus])

  useEffect(() => {
    if (state.accountStatus !== ACCOUNT_STATUS.PROVISIONING) return
    const elapsed = Date.now() - new Date(state.provisioningStartedAt ?? Date.now()).getTime()
    const timer = setTimeout(() => dispatch({ type: 'account/status', status: state.provisioningOutcome ?? ACCOUNT_STATUS.ACTIVE }), Math.max(0, 5200 - elapsed))
    return () => clearTimeout(timer)
  }, [state.accountStatus, state.provisioningStartedAt, state.provisioningOutcome])

  useEffect(() => {
    const primary = state.organization.legalEntities.find(e => e.role === 'primary')
    if (primary && primary.kybStatus !== state.kybStatus) {
      dispatch({ type: 'org/details', patch: { legalEntities: state.organization.legalEntities.map(e => e.role === 'primary' ? { ...e, kybStatus: state.kybStatus, legalName: state.organization.legalName, country: state.organization.countryOfIncorporation } : e) } })
    }
  }, [state.kybStatus, state.organization.legalEntities])

  useEffect(() => { persist(state) }, [state])

  const actions = useMemo(() => ({
    // signup
    setSignupStep: step => dispatch({ type: 'signup/step', step }),
    setEmail: email => dispatch({ type: 'signup/email', email }),
    sendOtp: () => dispatch({ type: 'signup/otpSent' }),
    registerOtpAttempt: () => dispatch({ type: 'signup/otpAttempt' }),
    verifyOtp: () => dispatch({ type: 'signup/otpVerified' }),
    setProfile: (firstName, lastName) => dispatch({ type: 'signup/profile', firstName, lastName }),
    setCompany: payload => dispatch({ type: 'signup/company', ...payload }),
    acceptTerms: () => dispatch({ type: 'signup/terms' }),
    completeSignup: () => dispatch({ type: 'signup/complete' }),

    // onboarding
    setIdentityStatus: status => dispatch({ type: 'identity/status', status }),
    setKybSection: (section, status) => dispatch({ type: 'kyb/section', section, status }),
    submitKyb: () => dispatch({ type: 'kyb/submit' }),
    setKybStatus: (status, observations) => dispatch({ type: 'kyb/status', status, observations }),
    setKybObservations: observations => dispatch({ type: 'kyb/observations', observations }),
    resolveObservation: id => dispatch({ type: 'kyb/resolveObservation', id }),
    patchOrganization: patch => dispatch({ type: 'org/details', patch }),
    addLegalEntity: entity => dispatch({ type: 'org/addLegalEntity', entity }),

    // activation
    startProvisioning: outcome => dispatch({ type: 'account/startProvisioning', outcome }),
    setAccountStatus: status => dispatch({ type: 'account/status', status }),

    // desk
    createVirtualAccount: payload => dispatch({ type: 'virtualAccounts/create', ...payload }),
    setVirtualAccountStatus: (id, status) => dispatch({ type: 'virtualAccounts/setStatus', id, status }),
    requestProduct: (productId, note) => dispatch({ type: 'products/request', productId, note }),
    setProductStatus: (productId, status) => dispatch({ type: 'products/status', productId, status }),

    // config org
    invite: (email, role) => dispatch({ type: 'team/invite', email, role }),
    cancelInvitation: id => dispatch({ type: 'team/cancelInvitation', id }),
    setMemberRole: (id, role) => dispatch({ type: 'team/setRole', id, role }),
    setMemberStatus: (id, status) => dispatch({ type: 'team/setStatus', id, status }),
    patchApprovalPolicy: patch => dispatch({ type: 'approvals/patch', patch }),
    toggleChecklistItem: (id, done) => dispatch({ type: 'checklist/toggle', id, done }),
    revealApiKeys: revealed => dispatch({ type: 'api/reveal', revealed }),

    // demo
    patchState: patch => dispatch({ type: 'demo/patch', patch }),
    applyScenario: next => dispatch({ type: 'demo/scenario', state: next }),
    reset: () => dispatch({ type: 'demo/reset' }),
  }), [])

  const value = useMemo(() => ({ state, actions }), [state, actions])

  return <DemoStateContext.Provider value={value}>{children}</DemoStateContext.Provider>
}

export function useDemoState() {
  const ctx = useContext(DemoStateContext)
  if (!ctx) throw new Error('useDemoState debe usarse dentro de <DemoStateProvider>')
  return ctx
}

/* ----------------------------- selectores ---------------------------- */
/** Hook de conveniencia: devuelve booleanos derivados, no el estado crudo. */
export function useAccess() {
  const { state } = useDemoState()
  return useMemo(() => ({
    hasOrganization: Boolean(state.organization.id),
    deskEnabled: canAccessDesk(state),
    provisionable: canProvisionAccount(state),
    identityApproved: state.identityStatus === IDENTITY_STATUS.APPROVED,
    kybApproved: state.kybStatus === KYB_STATUS.APPROVED,
    accountActive: state.accountStatus === ACCOUNT_STATUS.ACTIVE,
  }), [state])
}

/** Estado de un producto concreto + si se puede operar. */
export function useProduct(productId) {
  const { state } = useDemoState()
  const status = state.products[productId] ?? PRODUCT_STATUS.NOT_AVAILABLE
  return { status, operable: isProductOperable(status) }
}

export const useOnboardingProgress = () => {
  const { state } = useDemoState()
  return useMemo(() => {
    const sections = Object.values(state.kybSections)
    const complete = sections.filter(s => s === SECTION_STATUS.COMPLETE).length
    const identityDone = state.identityStatus === IDENTITY_STATUS.APPROVED ? 1 : 0
    return {
      identityDone: Boolean(identityDone),
      sectionsComplete: complete,
      sectionsTotal: sections.length,
      percent: Math.round(((complete + identityDone) / (sections.length + 1)) * 100),
    }
  }, [state.kybSections, state.identityStatus])
}
