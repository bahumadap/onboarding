/* =============================================================
   Marca YOL1.

   La geometría del isotipo viene del repositorio anterior; los
   colores ya no: salen de los tokens, así que el mismo componente
   funciona sobre fondo claro y oscuro. El texto se compone en HTML
   con la tipografía del Design System, no como <text> dentro del SVG.
   ============================================================= */
import React from 'react'

export function BrandMark({ size = 28, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      role="img"
      aria-label="YOL1"
    >
      <path
        d="M11 14C18 10 25 11 30 17L36 25L27 39L20 28C17 23 14 22 9 24L11 14Z"
        fill="var(--ray-color-interaction-brand-high)"
      />
      <path
        d="M36 13L53 9L49 47C48 56 42 60 33 56L27 53L31 42L36 43L36 13Z"
        fill="var(--ray-color-interaction-brand-high)"
      />
      <path d="M30 17L36 25L27 39L22 31L30 17Z" fill="var(--ray-color-interaction-accent-medium)" />
      <path d="M36 25L46 13L36 13V25Z" fill="var(--ray-color-interaction-accent-medium)" />
    </svg>
  )
}

export function BrandLockup({ size = 'md', product = 'Enterprise' }) {
  const markSize = size === 'lg' ? 34 : 26
  return (
    <span className="brand-lockup">
      <BrandMark size={markSize} />
      <span className="brand-lockup__text">
        <span className={size === 'lg' ? 'brand-lockup__name brand-lockup__name--lg' : 'brand-lockup__name'}>YOL1</span>
        {product && <span className="brand-lockup__product">{product}</span>}
      </span>
    </span>
  )
}
