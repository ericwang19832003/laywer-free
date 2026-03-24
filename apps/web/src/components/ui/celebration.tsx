'use client'

import { useEffect, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Trophy, Star, PartyPopper, Sparkles, CheckCircle2 } from 'lucide-react'

interface ConfettiPiece {
  id: number
  x: number
  delay: number
  duration: number
  color: string
  size: number
  rotation: number
  drift: number
}

interface CelebrationProps {
  show: boolean
  type?: 'step' | 'milestone' | 'complete'
  title?: string
  message?: string
  onDismiss?: () => void
  autoDismiss?: number
  className?: string
}

const CONFETTI_COLORS = [
  '#6366F1', // primary
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#F59E0B', // amber
  '#10B981', // green
  '#3B82F6', // blue
  '#EF4444', // red
]

export function Confetti({ show }: { show: boolean }) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])

  useEffect(() => {
    if (show) {
      const newPieces: ConfettiPiece[] = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: 6 + Math.random() * 8,
        rotation: Math.random() * 360,
        drift: (Math.random() - 0.5) * 200,
      }))
      setPieces(newPieces)
    } else {
      setPieces([])
    }
  }, [show])

  if (!show || pieces.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute"
          style={{
            left: `${piece.x}%`,
            top: '-20px',
            animation: `confetti-fall ${piece.duration}s ease-out ${piece.delay}s forwards`,
            ['--drift' as string]: `${piece.drift}px`,
          }}
        >
          <div
            className="rounded-sm"
            style={{
              width: piece.size,
              height: piece.size * 0.6,
              backgroundColor: piece.color,
              transform: `rotate(${piece.rotation}deg)`,
              animation: `confetti-spin ${piece.duration}s linear ${piece.delay}s infinite`,
            }}
          />
        </div>
      ))}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) translateX(var(--drift)) rotate(720deg);
            opacity: 0;
          }
        }
        @keyframes confetti-spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}

export function Celebration({
  show,
  type = 'step',
  title,
  message,
  onDismiss,
  autoDismiss = 3000,
  className,
}: CelebrationProps) {
  const [visible, setVisible] = useState(show)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    if (show) {
      setVisible(true)
      setExiting(false)
      
      if (autoDismiss > 0) {
        const timer = setTimeout(() => {
          handleDismiss()
        }, autoDismiss)
        return () => clearTimeout(timer)
      }
    }
  }, [show, autoDismiss])

  const handleDismiss = useCallback(() => {
    setExiting(true)
    setTimeout(() => {
      setVisible(false)
      setExiting(false)
      onDismiss?.()
    }, 300)
  }, [onDismiss])

  if (!visible) return null

  const icons = {
    step: CheckCircle2,
    milestone: Trophy,
    complete: PartyPopper,
  }

  const colors = {
    step: 'bg-calm-green/10 border-calm-green/30 text-calm-green',
    milestone: 'bg-primary/10 border-primary/30 text-primary',
    complete: 'bg-gradient-to-br from-primary/20 to-purple-500/20 border-primary/30 text-primary',
  }

  const titles = {
    step: 'Great job!',
    milestone: 'Milestone Reached!',
    complete: 'Congratulations!',
  }

  const Icon = icons[type]

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300',
        visible && !exiting ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={handleDismiss}
      />
      <div
        className={cn(
          'relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border-2 transition-all duration-300',
          colors[type],
          exiting ? 'scale-95 opacity-0' : 'scale-100 opacity-100',
          className
        )}
      >
        <div className="flex justify-center mb-4">
          <div className={cn(
            'w-20 h-20 rounded-full flex items-center justify-center animate-bounce',
            type === 'complete' && 'bg-gradient-to-br from-primary to-purple-500',
            type === 'milestone' && 'bg-primary/20',
            type === 'step' && 'bg-calm-green/20'
          )}>
            <Icon className={cn(
              'h-10 w-10',
              type === 'complete' ? 'text-white' : ''
            )} />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-warm-text mb-2">
          {title || titles[type]}
        </h2>

        {message && (
          <p className="text-warm-muted mb-6">{message}</p>
        )}

        <div className="flex justify-center gap-2">
          <Sparkles className="h-5 w-5 text-calm-amber animate-pulse" />
          <Sparkles className="h-5 w-5 text-primary animate-pulse" style={{ animationDelay: '0.2s' }} />
          <Sparkles className="h-5 w-5 text-calm-green animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>

        <button
          onClick={handleDismiss}
          className="mt-6 px-6 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  )
}

interface ProgressCelebrationProps {
  progress: number
  previousProgress: number
  threshold?: number
  onCelebrate?: () => void
}

export function useProgressCelebration({
  progress,
  previousProgress,
  threshold = 25,
  onCelebrate,
}: ProgressCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false)
  const [milestone, setMilestone] = useState<number | null>(null)

  useEffect(() => {
    const milestones = [25, 50, 75, 100]
    
    for (const m of milestones) {
      if (progress >= m && previousProgress < m) {
        setMilestone(m)
        setShowConfetti(true)
        onCelebrate?.()
        
        setTimeout(() => {
          setShowConfetti(false)
        }, 3000)
        break
      }
    }
  }, [progress, previousProgress, threshold, onCelebrate])

  return {
    showConfetti,
    milestone,
    dismissConfetti: () => setShowConfetti(false),
  }
}

export function StreakBadge({ streak, className }: { streak: number; className?: string }) {
  if (streak <= 0) return null

  return (
    <div className={cn(
      'flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-medium shadow-sm',
      className
    )}>
      <span className="text-base">🔥</span>
      <span>{streak} day{streak !== 1 ? 's' : ''}</span>
    </div>
  )
}

export function CompletionRing({ progress, size = 120, strokeWidth = 8 }: { progress: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-warm-border"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="stroke-calm-green transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-warm-text">{Math.round(progress)}%</span>
        <span className="text-xs text-warm-muted">Complete</span>
      </div>
    </div>
  )
}
