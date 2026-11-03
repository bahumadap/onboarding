/* =============================================================
   Piezas compartidas por las pantallas del Merchant Desk.

   Acá vive la regla que atraviesa todo el macroproceso D: una
   cuenta solo es operable si el producto del que depende está
   activo. Las pantallas no la reimplementan, la consumen.
   ============================================================= */
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ACCOUNTS, formatMoney } from '../../mock/accounts'
import { TRANSACTIONS } from '../../mock/transactions'
import { PRODUCT_STATUS, isProductOperable } from '../../state/statuses'
import { productById } from '../../mock/products'
import { useDemoState } from '../../state/DemoState'
import { cx } from '../../ui'
import './desk.css'

/**
 * Cuentas empresariales con su veredicto de operabilidad.
 * `requiresProduct` manda: si el producto no está activo, la cuenta
 * se expone como no habilitada y su saldo no se presenta como operable.
 */
export function useDeskAccounts() {
  const { state } = useDemoState()
  return useMemo(() => ACCOUNTS.map(account => {
    const requiredId = account.requiresProduct
    const requiredStatus = requiredId
      ? (state.products[requiredId] ?? PRODUCT_STATUS.NOT_AVAILABLE)
      : null
    return {
      ...account,
      requiredProduct: requiredId ? productById(requiredId) : null,
      requiredProductStatus: requiredStatus,
      operable: !requiredId || isProductOperable(requiredStatus),
    }
  }), [state.products])
}

/** Movimientos visibles: solo los de cuentas que hoy se pueden operar. */
export function useDeskTransactions() {
  const accounts = useDeskAccounts()
  return useMemo(() => {
    if (!Array.isArray(TRANSACTIONS)) return null
    const operable = new Set(accounts.filter(a => a.operable).map(a => a.id))
    return TRANSACTIONS
      .filter(tx => operable.has(tx.account))
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [accounts])
}

/**
 * Simula la latencia de una consulta al core para que las pantallas
 * tengan un estado de carga real en vez de aparecer ya resueltas.
 */
export function useDeskLoad(delay = 420) {
  const [attempt, setAttempt] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(false)
    const timer = setTimeout(() => setReady(true), delay)
    return () => clearTimeout(timer)
  }, [delay, attempt])

  return {
    loading: !ready,
    retry: useCallback(() => setAttempt(a => a + 1), []),
  }
}

/** Monto con signo: el sentido se lee en el texto, no solo en el color. */
export function SignedAmount({ amount, currency = 'CLP' }) {
  const positive = amount >= 0
  return (
    <span className={cx('desk-amount', positive ? 'desk-amount--in' : 'desk-amount--out')}>
      {positive ? '+' : '−'}{formatMoney(Math.abs(amount), currency)}
      <span className="sr-only">{positive ? ' (abono)' : ' (egreso)'}</span>
    </span>
  )
}

/** Trío de saldos: total, disponible y reservado. */
export function BalanceBreakdown({ account, hideReserved }) {
  return (
    <div className="desk-balances">
      <div>
        <p className="desk-balance__label">Saldo total</p>
        <p className="desk-balance__value">{formatMoney(account.balanceTotal, account.currency)}</p>
      </div>
      <div>
        <p className="desk-balance__label">Disponible</p>
        <p className="desk-balance__value">{formatMoney(account.balanceAvailable, account.currency)}</p>
      </div>
      {!hideReserved && (
        <div>
          <p className="desk-balance__label">Reservado</p>
          <p className="desk-balance__value desk-balance__value--muted">
            {formatMoney(account.balanceReserved, account.currency)}
          </p>
        </div>
      )}
    </div>
  )
}

/** Fecha y hora cortas, en formato chileno. */
export const formatDateTime = iso => new Intl.DateTimeFormat('es-CL', {
  day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit',
}).format(new Date(iso))

export const formatDate = iso => new Intl.DateTimeFormat('es-CL', {
  day: '2-digit', month: 'long', year: 'numeric',
}).format(new Date(iso))

/** Motivo por el que una cuenta no se puede operar, en una frase. */
export function inoperableReason(account) {
  if (account.operable) return null
  const name = account.requiredProduct?.name ?? 'el producto asociado'
  if (account.requiredProductStatus === PRODUCT_STATUS.NOT_AVAILABLE) {
    return `Requiere ${name}, no disponible para tu empresa.`
  }
  if (account.requiredProductStatus === PRODUCT_STATUS.AVAILABLE_TO_REQUEST) {
    return `Requiere ${name}. Solicítalo en Productos.`
  }
  if (account.requiredProductStatus === PRODUCT_STATUS.REJECTED) {
    return `Solicitud de ${name} rechazada. Contacta a tu ejecutivo.`
  }
  return `Requiere ${name}. Activación pendiente.`
}

/** Tokens de color para las series de recharts. */
export const CHART_COLORS = {
  inflow: 'var(--ray-color-interaction-brand-medium)',
  outflow: 'var(--ray-color-state-warning-medium)',
  grid: 'var(--ray-color-border-base)',
  axis: 'var(--ray-color-text-tertiary)',
}
