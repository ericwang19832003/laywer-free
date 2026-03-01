'use client'

import { useState } from 'react'

interface DataPoint {
  date: string
  score: number
}

interface TrendChartProps {
  data: DataPoint[]
}

const WIDTH = 600
const HEIGHT = 160
const PAD_X = 10
const PAD_Y = 14
const CHART_W = WIDTH - PAD_X * 2
const CHART_H = HEIGHT - PAD_Y * 2

const GRIDLINES = [25, 50, 75]

function formatLabel(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function TrendChart({ data }: TrendChartProps) {
  const [hovered, setHovered] = useState<number | null>(null)

  if (data.length === 0) return null

  // Compute score range — force range of 1 when all identical
  const scores = data.map((d) => d.score)
  const minScore = Math.min(...scores)
  const maxScore = Math.max(...scores)
  const scoreRange = maxScore === minScore ? 1 : maxScore - minScore

  // Map data points to SVG coordinates (evenly spaced by index)
  const points = data.map((d, i) => {
    const x =
      data.length === 1
        ? PAD_X + CHART_W / 2
        : PAD_X + (i / (data.length - 1)) * CHART_W
    const y =
      maxScore === minScore
        ? PAD_Y + CHART_H / 2
        : PAD_Y + (1 - (d.score - minScore) / scoreRange) * CHART_H
    return { x, y, ...d }
  })

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ')

  // Date labels: first, middle, last — deduplicated for ≤2 points
  const labelIndices: number[] = []
  if (data.length === 1) {
    labelIndices.push(0)
  } else if (data.length === 2) {
    labelIndices.push(0, data.length - 1)
  } else {
    labelIndices.push(0, Math.floor(data.length / 2), data.length - 1)
  }

  // Tooltip
  const tip = hovered !== null ? points[hovered] : null
  const tipFlip = tip ? tip.x > WIDTH - 120 : false

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      width="100%"
      className="overflow-visible"
      role="img"
      aria-label="Health score trend chart"
    >
      {/* Gridlines */}
      {GRIDLINES.map((val) => {
        const y =
          maxScore === minScore
            ? PAD_Y + CHART_H / 2
            : PAD_Y + (1 - (val - minScore) / scoreRange) * CHART_H
        if (y < PAD_Y || y > PAD_Y + CHART_H) return null
        return (
          <line
            key={val}
            x1={PAD_X}
            y1={y}
            x2={PAD_X + CHART_W}
            y2={y}
            stroke="var(--warm-border)"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
        )
      })}

      {/* Polyline */}
      {data.length > 1 && (
        <polyline
          points={polylinePoints}
          fill="none"
          stroke="var(--calm-indigo)"
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}

      {/* Visible dots */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={hovered === i ? 5 : 3}
          fill="var(--calm-indigo)"
          className="transition-[r] duration-150"
        />
      ))}

      {/* Invisible hit targets */}
      {points.map((p, i) => (
        <circle
          key={`hit-${i}`}
          cx={p.x}
          cy={p.y}
          r={14}
          fill="transparent"
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
        />
      ))}

      {/* Tooltip */}
      {tip && (
        <g>
          <rect
            x={tipFlip ? tip.x - 110 : tip.x + 10}
            y={tip.y - 28}
            width={100}
            height={24}
            rx={4}
            fill="var(--warm-text)"
            opacity={0.9}
          />
          <text
            x={tipFlip ? tip.x - 60 : tip.x + 60}
            y={tip.y - 12}
            textAnchor="middle"
            fill="white"
            fontSize={11}
            fontFamily="system-ui, sans-serif"
          >
            {tip.score} · {formatLabel(tip.date)}
          </text>
        </g>
      )}

      {/* Date labels */}
      {labelIndices.map((idx) => (
        <text
          key={`label-${idx}`}
          x={points[idx].x}
          y={HEIGHT - 1}
          textAnchor={
            idx === 0 ? 'start' : idx === data.length - 1 ? 'end' : 'middle'
          }
          fill="var(--warm-muted)"
          fontSize={10}
          fontFamily="system-ui, sans-serif"
        >
          {formatLabel(data[idx].date)}
        </text>
      ))}
    </svg>
  )
}
