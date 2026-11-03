/* =============================================================
   Rutas de YOL1 Enterprise.

   Los guards derivan de los selectores de estado, nunca de un flag
   de "onboarding completo": por eso una organización con KYB
   aprobado y cuenta en aprovisionamiento ve la pantalla de
   activación, y no un dashboard que miente sobre una cuenta activa.
   ============================================================= */
import React, { lazy, Suspense } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

import AppShell from './shell/AppShell'
import DemoControl from './shell/DemoControl'
import NotFound from './shell/NotFound'
import { DemoStateProvider, useDemoState } from './state/DemoState'
import { ToastProvider } from './ui'
import { ACCOUNT_STATUS, canAccessDesk, canProvisionAccount, resolveStage } from './state/statuses'

import SignupFlow from './features/signup/SignupFlow'
import OnboardingHub from './features/onboarding/OnboardingHub'
import IdentityVerification from './features/onboarding/IdentityVerification'
import BusinessVerification from './features/onboarding/BusinessVerification'
import CoreActivation from './features/activation/CoreActivation'

import DeskOverview from './features/desk/DeskOverview'
import AccountDetail from './features/desk/AccountDetail'
import VirtualAccounts from './features/desk/VirtualAccounts'
import Transactions from './features/desk/Transactions'
import ProductCatalog from './features/desk/ProductCatalog'

import OrgHome from './features/org/OrgHome'
import Accounts from './features/desk/Accounts'
import OrgChecklist from './features/org/OrgChecklist'
import OrgProfile from './features/org/OrgProfile'
import OrgUsers from './features/org/OrgUsers'
import OrgAccounts from './features/org/OrgAccounts'
import OrgApprovals from './features/org/OrgApprovals'
import OrgApi from './features/org/OrgApi'
import OrgProducts from './features/org/OrgProducts'
import OrgCompliance from './features/org/OrgCompliance'
import OrgPreferences from './features/org/OrgPreferences'

const LegacyApp = lazy(() => import('./legacy/LegacyApp'))

import './styles/tokens.css'
import './styles/base.css'

const STAGE_ROUTE = {
  signup: '/signup',
  onboarding: '/onboarding',
  activation: '/activation',
  desk: '/desk',
}

/** Exige que exista una organización (es decir, signup completado). */
function RequireOrganization({ children }) {
  const { state } = useDemoState()
  const location = useLocation()
  if (!state.organization.id) return <Navigate to="/signup" replace state={{ from: location.pathname }} />
  return children
}

/** Exige cuenta vista operable; si no, manda a la etapa que corresponde. */
function RequireOperableAccount({ children }) {
  const { state } = useDemoState()
  if (!state.organization.id) return <Navigate to="/signup" replace />
  if (!canAccessDesk(state)) {
    const target = canProvisionAccount(state) || state.accountStatus !== ACCOUNT_STATUS.NOT_PROVISIONED
      ? '/activation'
      : '/onboarding'
    return <Navigate to={target} replace />
  }
  return children
}

function Landing() {
  const { state } = useDemoState()
  return <Navigate to={STAGE_ROUTE[resolveStage(state)] ?? '/signup'} replace />
}

function Shell() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      {/* A — Signup */}
      <Route path="/signup/*" element={<SignupFlow />} />

      {/* B — Onboarding empresarial */}
      <Route path="/onboarding" element={<RequireOrganization><OnboardingHub /></RequireOrganization>} />
      <Route path="/onboarding/identity" element={<RequireOrganization><IdentityVerification /></RequireOrganization>} />
      <Route path="/onboarding/business" element={<RequireOrganization><BusinessVerification /></RequireOrganization>} />

      {/* C — Core Activation */}
      <Route path="/activation" element={<RequireOrganization><CoreActivation /></RequireOrganization>} />

      {/* D y E — consola */}
      <Route element={<RequireOrganization><AppShell /></RequireOrganization>}>
        <Route path="/desk" element={<RequireOperableAccount><DeskOverview /></RequireOperableAccount>} />
        <Route path="/desk/accounts" element={<RequireOperableAccount><Accounts /></RequireOperableAccount>} />
        <Route path="/desk/products/:productId" element={<RequireOperableAccount><ProductCatalog /></RequireOperableAccount>} />
        <Route path="/desk/accounts/:accountId" element={<RequireOperableAccount><AccountDetail /></RequireOperableAccount>} />
        <Route path="/desk/virtual-accounts" element={<RequireOperableAccount><VirtualAccounts /></RequireOperableAccount>} />
        <Route path="/desk/transactions" element={<RequireOperableAccount><Transactions /></RequireOperableAccount>} />
        <Route path="/desk/products" element={<RequireOperableAccount><ProductCatalog /></RequireOperableAccount>} />

        <Route path="/org" element={<OrgHome />} />
        <Route path="/org/setup" element={<OrgChecklist />} />
        <Route path="/org/profile" element={<OrgProfile />} />
        <Route path="/org/users" element={<OrgUsers />} />
        <Route path="/org/accounts" element={<OrgAccounts />} />
        <Route path="/org/approvals" element={<OrgApprovals />} />
        <Route path="/org/api" element={<OrgApi />} />
        <Route path="/org/products" element={<OrgProducts />} />
        <Route path="/org/compliance" element={<OrgCompliance />} />
        <Route path="/org/preferences" element={<OrgPreferences />} />
      </Route>

      {/* Prototipo anterior, preservado como referencia */}
      <Route path="/legacy/*" element={<div className="legacy-root"><Suspense fallback={<p role="status">Cargando prototipo anterior…</p>}><LegacyApp /></Suspense></div>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default function App() {
  return (
    <DemoStateProvider>
      <ToastProvider>
        <Shell />
        <DemoControl />
      </ToastProvider>
    </DemoStateProvider>
  )
}
