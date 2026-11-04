/* =============================================================
   Control de la demo.

   Permite mover las cuatro dimensiones de estado sin backend, que es
   lo que hace demostrable el producto: provisioning, observaciones,
   rechazos, productos en evaluación. No forma parte del producto.
   ============================================================= */
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FlaskConical, RotateCcw } from 'lucide-react'
import { Button, Dialog, Divider, Callout } from '../ui'
import { useDemoState } from '../state/DemoState'
import {
  ACCOUNT_STATUS, ACCOUNT_STATUS_META, IDENTITY_STATUS, IDENTITY_STATUS_META,
  KYB_STATUS, KYB_STATUS_META, PRODUCT_STATUS, PRODUCT_STATUS_META, USER_STATUS,
  USER_STATUS_META, SECTION_STATUS,
} from '../state/statuses'
import { ADDITIONAL_PRODUCTS } from '../mock/products'
import { SAMPLE_OBSERVATIONS } from '../mock/compliance'
import { VIRTUAL_ACCOUNTS } from '../mock/virtualAccounts'
import { TEAM_MEMBERS } from '../mock/team'
import { TERMS_VERSION } from '../mock/terms'

function ChipGroup({ label, options, value, onSelect }) {
  return (
    <div className="demo-panel__group">
      <span className="demo-panel__label">{label}</span>
      <div className="demo-panel__options">
        {options.map(o => (
          <button
            key={o.value}
            type="button"
            className="demo-chip"
            aria-pressed={value === o.value}
            onClick={() => onSelect(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

const asOptions = meta => Object.entries(meta).map(([value, m]) => ({ value, label: m.label }))

/** Escenario completo: organización lista y operando. */
const operatingScenario = state => ({
  user: {
    email: state.user.email || 'benja@arenaplay.cl',
    firstName: state.user.firstName || 'Benja',
    lastName: state.user.lastName || 'Ahumada',
    termsVersion: TERMS_VERSION,
    acceptedAt: new Date().toISOString(),
  },
  userStatus: USER_STATUS.ACTIVE,
  organization: {
    ...state.organization,
    id: state.organization.id || 'org_arenaplay',
    tradeName: state.organization.tradeName || 'ArenaPlay Demo',
    legalName: state.organization.legalName || 'ArenaPlay Demo SpA',
    industry: state.organization.industry || 'gaming',
    countryOfIncorporation: state.organization.countryOfIncorporation || 'CL',
    operatingCountries: ['CL'],
    taxId: state.organization.taxId || '76.543.210-K',
    entityType: state.organization.entityType || 'spa',
    legalAddress: state.organization.legalAddress || 'Av. Apoquindo 4500, of. 1201, Las Condes',
    economicActivity: state.organization.economicActivity || 'Plataformas de entretenimiento digital',
    legalEntities: state.organization.legalEntities.length ? state.organization.legalEntities : [
      { id: 'ent_1', legalName: 'ArenaPlay Demo SpA', country: 'CL', role: 'primary', kybStatus: KYB_STATUS.APPROVED },
    ],
  },
  onboardingDraftId: state.onboardingDraftId || 'obd_demo01',
  identityStatus: IDENTITY_STATUS.APPROVED,
  kybStatus: KYB_STATUS.APPROVED,
  kybSections: {
    legal: SECTION_STATUS.COMPLETE,
    structure: SECTION_STATUS.COMPLETE,
    documents: SECTION_STATUS.COMPLETE,
    activity: SECTION_STATUS.COMPLETE,
  },
  kybObservations: [],
  accountStatus: ACCOUNT_STATUS.ACTIVE,
  accountActivatedAt: new Date().toISOString(),
  virtualAccounts: VIRTUAL_ACCOUNTS,
  products: {
    core_account: PRODUCT_STATUS.ACTIVE,
    virtual_accounts: PRODUCT_STATUS.ACTIVE,
    fx: PRODUCT_STATUS.IN_REVIEW,
    payouts: PRODUCT_STATUS.AVAILABLE_TO_REQUEST,
    payment_initiation: PRODUCT_STATUS.AVAILABLE_TO_REQUEST,
    cards: PRODUCT_STATUS.NOT_AVAILABLE,
  },
  team: state.team.length ? state.team : TEAM_MEMBERS,
})

export default function DemoControl() {
  const [open, setOpen] = useState(false)
  const { state, actions } = useDemoState()
  const navigate = useNavigate()

  return (
    <>
      <button type="button" className="demo-fab" onClick={() => setOpen(true)}>
        <FlaskConical size={15} aria-hidden="true" />
        Control de demo
      </button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Control de demo"
        description="Prueba estados simulados de usuario, verificaciones, cuenta y productos."
        wide
        footer={
          <>
            <Button
              variant="ghost"
              icon={<RotateCcw size={14} aria-hidden="true" />}
              onClick={() => { actions.reset(); setOpen(false); navigate('/signup') }}
            >
              Reiniciar demo
            </Button>
            {state.organization.id && (
              <Button variant="secondary" onClick={() => { setOpen(false); navigate('/onboarding') }}>
                Ver onboarding
              </Button>
            )}
            <Button variant="primary" onClick={() => setOpen(false)}>Listo</Button>
          </>
        }
      >
        <Callout tone="brand" title="Escenario rápido">
          <p style={{ marginBottom: 10 }}>
            Abre Merchant Desk con la cuenta activa y FX en evaluación.
          </p>
          <Button
            size="sm"
            variant="brand"
            onClick={() => { actions.applyScenario(operatingScenario(state)); setOpen(false); navigate('/desk') }}
          >
            Aplicar y abrir el Desk
          </Button>
        </Callout>

        <div style={{ marginTop: 'var(--ray-space-5)' }}>
          <ChipGroup
            label="1 · Estado del usuario"
            options={asOptions(USER_STATUS_META)}
            value={state.userStatus}
            onSelect={v => actions.patchState({ userStatus: v })}
          />
          <ChipGroup
            label="2 · Verificación de identidad"
            options={asOptions(IDENTITY_STATUS_META)}
            value={state.identityStatus}
            onSelect={v => actions.setIdentityStatus(v)}
          />
          <ChipGroup
            label="3 · Verificación de empresa"
            options={asOptions(KYB_STATUS_META)}
            value={state.kybStatus}
            onSelect={v => {
              if (v === KYB_STATUS.OBSERVED) actions.setKybObservations(SAMPLE_OBSERVATIONS)
              else actions.setKybStatus(v, [])
            }}
          />
          <ChipGroup
            label="4 · Cuenta vista"
            options={asOptions(ACCOUNT_STATUS_META)}
            value={state.accountStatus}
            onSelect={v => actions.setAccountStatus(v)}
          />
        </div>

        <Divider />

        <div style={{ marginTop: 'var(--ray-space-5)' }}>
          {ADDITIONAL_PRODUCTS.map(p => (
            <ChipGroup
              key={p.id}
              label={p.name}
              options={asOptions(PRODUCT_STATUS_META)}
              value={state.products[p.id]}
              onSelect={v => actions.setProductStatus(p.id, v)}
            />
          ))}
        </div>
      </Dialog>
    </>
  )
}
