import { useEffect, useState } from 'react'

interface Props {
  value: number
  color: string // '#e74c3c' red damage, '#3498db' blue block, '#27ae60' green heal
  x?: string // CSS left position (default '50%')
  y?: string // CSS top position (default '50%')
}

export default function DamageNumber({ value, color, x = '50%', y = '50%' }: Props) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 900)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: 'translateX(-50%)',
        pointerEvents: 'none',
        zIndex: 100,
        animation: 'dmgFloat 900ms ease-out forwards',
      }}
    >
      <span style={{
        fontSize: '22px',
        fontWeight: 'bold',
        color,
        textShadow: '0 2px 6px rgba(0,0,0,0.9)',
      }}>
        {value > 0 ? `+${value}` : value}
      </span>
      <style>{`
        @keyframes dmgFloat {
          0% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1.1); }
          15% { opacity: 1; transform: translateX(-50%) translateY(-5px) scale(1); }
          70% { opacity: 0.8; transform: translateX(-50%) translateY(-25px); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-40px); }
        }
      `}</style>
    </div>
  )
}
