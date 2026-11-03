/* Ruta desconocida. El prototipo anterior dejaba una pantalla en
   blanco con HTTP 200; acá hay una salida clara. */
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Button, EmptyState } from '../ui'
import { BrandLockup } from './Brand'
import './shell.css'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="flow__panel" style={{ maxWidth: 560, margin: '0 auto' }}>
      <div className="flow__topbar"><BrandLockup /></div>
      <div className="flow__content">
        <EmptyState
          icon={<Compass size={20} aria-hidden="true" />}
          title="Esta página no existe"
          description="Revisa la dirección o vuelve al inicio."
          action={<Button variant="brand" onClick={() => navigate('/')}>Volver al inicio</Button>}
        />
      </div>
    </div>
  )
}
