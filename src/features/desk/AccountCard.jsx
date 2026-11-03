import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet } from 'lucide-react'
import { Badge, Button, Card, CardBody, CardFooter } from '../../ui'
import { useDemoState } from '../../state/DemoState'
import { ACCOUNT_STATUS_META } from '../../state/statuses'
import { formatCompact, formatMoney } from '../../mock/accounts'
import { inoperableReason } from './shared'

export default function AccountCard({ account }) {
  const { state } = useDemoState()
  const accountMeta = ACCOUNT_STATUS_META[state.accountStatus]
  const navigate = useNavigate()
  const reason = inoperableReason(account)

  if (!account.operable) {
    return (
      <Card level="low">
        <CardBody>
          <div className="row between gap-3">
            <div className="grow">
              <p className="ray-subtitle truncate">{account.label}</p>
              <p className="desk-id">{account.currency} · {account.number}</p>
            </div>
            <Badge tone="neutral">No habilitada</Badge>
          </div>
          <p className="ray-body-sm text-secondary" style={{ marginTop: 'var(--ray-space-3)' }}>{reason}</p>
        </CardBody>
        <CardFooter>
          <Button variant="secondary" size="sm" onClick={() => navigate('/desk/products')}>
            Ver producto
          </Button>
        </CardFooter>
      </Card>
    )
  }

  const primary = account.kind === 'primary'

  return (
    <Card level={primary ? 'high' : 'low'}>
      <CardBody>
        <div className="row between gap-3">
          <div className="grow">
            <p className="ray-subtitle truncate">{account.label}</p>
            <p className="desk-id">{account.currency} · {account.number}</p>
          </div>
          <Badge tone={accountMeta.tone} dot>{accountMeta.label}</Badge>
        </div>

        <p className="ray-display" style={{ fontSize: 'var(--ray-text-h3)', marginTop: 'var(--ray-space-4)' }}>
          {formatCompact(account.balanceTotal, account.currency)}
        </p>
        <p className="ray-caption text-tertiary">
          Disponible {formatMoney(account.balanceAvailable, account.currency)}
          {account.balanceReserved > 0 && ` · reservado ${formatMoney(account.balanceReserved, account.currency)}`}
        </p>
      </CardBody>
      <CardFooter>
        <Button
          variant={primary ? 'primary' : 'secondary'}
          size="sm"
          icon={<Wallet size={15} aria-hidden="true" />}
          onClick={() => navigate(`/desk/accounts/${account.id}`)}
        >
          Ver cuenta
        </Button>
      </CardFooter>
    </Card>
  )
}
