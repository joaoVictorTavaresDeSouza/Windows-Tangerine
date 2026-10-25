export type MenuItem = {
  id: string
  label: string
  icon: string
  description?: string
}

type RadialMenuProps = {
  items: MenuItem[]
  selectedId?: string
  onSelect: (item: MenuItem) => void
}

// Tudo em unidades do viewBox (1000 x 1000); o SVG escala com o palco.
const VIEWBOX = 1000
const CENTER = VIEWBOX / 2

const GEOMETRY = {
  innerRadius: 194, // = raio do botão central (180, 36% no CSS) + gap (14): mesma folga entre fatias e centro
  outerRadius: 455, // borda externa das fatias
  gap: 14, // largura constante da divisão entre fatias
  innerCorner: 30, // raio de arredondamento dos cantos internos
  outerCorner: 46, // raio de arredondamento dos cantos externos
  ringRadius: 488, // contorno externo
  ringBand: 33, // largura da faixa translúcida entre fatias e contorno
}

const f = (n: number) => n.toFixed(2)

/**
 * Fatia anular com lados paralelos (gap constante) e cantos arredondados
 * por arcos tangentes. Calculada com o eixo da fatia em +x e depois
 * rotacionada para o ângulo real. Vale para qualquer count >= 3.
 */
function petalPath(angle: number, count: number): string {
  const { innerRadius, outerRadius, gap, innerCorner, outerCorner } = GEOMETRY
  const half = Math.PI / count
  const offset = gap / 2

  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const at = (x: number, y: number) =>
    `${f(CENTER + x * cos - y * sin)} ${f(CENTER + x * sin + y * cos)}`
  const polar = (r: number, a: number) => at(r * Math.cos(a), r * Math.sin(a))

  // Normal interna da reta lateral superior (aponta para o eixo da fatia).
  const nx = Math.sin(half)
  const ny = -Math.cos(half)

  // Centro do arco de canto: a distância `rho` da origem e a `offset + r`
  // da reta lateral. Devolve o ângulo do centro e o ponto de tangência na reta.
  const fillet = (rho: number, r: number) => {
    const phi = half - Math.asin((offset + r) / rho)
    const cx = rho * Math.cos(phi)
    const cy = rho * Math.sin(phi)
    return { phi, line: [cx - r * nx, cy - r * ny] as const }
  }

  const outer = fillet(outerRadius - outerCorner, outerCorner)
  const inner = fillet(innerRadius + innerCorner, innerCorner)
  // O centro de cada canto, projetado no raio da borda, é o ponto de tangência no arco.
  const outerA = outer.phi
  const innerA = inner.phi
  const [olx, oly] = outer.line
  const [ilx, ily] = inner.line

  return [
    `M ${polar(outerRadius, -outerA)}`,
    `A ${outerRadius} ${outerRadius} 0 0 1 ${polar(outerRadius, outerA)}`,
    `A ${outerCorner} ${outerCorner} 0 0 1 ${at(olx, oly)}`,
    `L ${at(ilx, ily)}`,
    `A ${innerCorner} ${innerCorner} 0 0 1 ${polar(innerRadius, innerA)}`,
    `A ${innerRadius} ${innerRadius} 0 0 0 ${polar(innerRadius, -innerA)}`,
    `A ${innerCorner} ${innerCorner} 0 0 1 ${at(ilx, -ily)}`,
    `L ${at(olx, -oly)}`,
    `A ${outerCorner} ${outerCorner} 0 0 1 ${polar(outerRadius, -outerA)}`,
    'Z',
  ].join(' ')
}

function RadialMenu({ items, selectedId, onSelect }: RadialMenuProps) {
  const { innerRadius, outerRadius, ringRadius, ringBand } = GEOMETRY
  const labelRadius = innerRadius + (outerRadius - innerRadius) * 0.62
  const bandRadius = (outerRadius + ringRadius) / 2

  return (
    <svg
      className="radial-svg"
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      role="group"
      aria-label="Menu radial"
    >
      <defs>
        <linearGradient id="tg-rim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffc9a0" stopOpacity=".5" />
          <stop offset="1" stopColor="#ff8737" stopOpacity=".12" />
        </linearGradient>
        <radialGradient
          id="tg-petal"
          gradientUnits="userSpaceOnUse"
          cx={CENTER}
          cy={CENTER}
          r={outerRadius}
        >
          <stop offset=".55" stopColor="#42332a" />
          <stop offset="1" stopColor="#2a211b" />
        </radialGradient>
        <radialGradient
          id="tg-glow"
          gradientUnits="userSpaceOnUse"
          cx={CENTER}
          cy={CENTER}
          r={outerRadius}
        >
          <stop offset=".5" stopColor="#e8722a" />
          <stop offset="1" stopColor="#bf4e0b" />
        </radialGradient>
      </defs>

      <circle
        className="ring-band"
        cx={CENTER}
        cy={CENTER}
        r={bandRadius}
        strokeWidth={ringBand}
      />
      <circle
        className="ring-edge"
        cx={CENTER}
        cy={CENTER}
        r={ringRadius}
        stroke="url(#tg-rim)"
      />

      {items.map((item, index) => {
        const angle = ((-90 + (360 / items.length) * index) * Math.PI) / 180
        const d = petalPath(angle, items.length)
        const x = CENTER + Math.cos(angle) * labelRadius
        const y = CENTER + Math.sin(angle) * labelRadius
        const selected = selectedId === item.id

        return (
          <g
            key={item.id}
            className={`petal ${selected ? 'is-selected' : ''}`}
            style={{ animationDelay: `${index * 35}ms` }}
            role="button"
            tabIndex={0}
            aria-pressed={selected}
            aria-label={item.label}
            onClick={() => onSelect(item)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onSelect(item)
              }
            }}
          >
            <title>{item.description ?? item.label}</title>
            <path className="petal-base" d={d} />
            <path className="petal-glow" d={d} />
            <text className="petal-icon" x={x} y={y - 24}>
              {item.icon}
            </text>
            <text className="petal-label" x={x} y={y + 34}>
              {item.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default RadialMenu
