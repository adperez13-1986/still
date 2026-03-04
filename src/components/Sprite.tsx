interface Props {
  art: string[]
  palette: Record<string, string | null>
  pixelSize?: number
}

export default function Sprite({ art, palette, pixelSize = 4 }: Props) {
  const height = art.length
  const width = art[0]?.length ?? 0

  const rects: React.ReactElement[] = []
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const char = art[row][col]
      const color = palette[char]
      if (!color) continue // transparent
      rects.push(
        <rect
          key={`${row}-${col}`}
          x={col * pixelSize}
          y={row * pixelSize}
          width={pixelSize}
          height={pixelSize}
          fill={color}
        />
      )
    }
  }

  return (
    <svg
      width={width * pixelSize}
      height={height * pixelSize}
      style={{ imageRendering: 'pixelated', display: 'block' }}
    >
      {rects}
    </svg>
  )
}
