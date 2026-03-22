'use client'

import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  CheckCircle2, 
  XCircle,
  Shuffle,
  Brain,
  Trophy
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Flashcard {
  id: string
  front: string
  back: string
  category: string
  difficulty?: 'easy' | 'medium' | 'hard'
}

interface FlashcardDeckProps {
  cards: Flashcard[]
  title?: string
  description?: string
  onComplete?: (stats: { correct: number; incorrect: number; total: number }) => void
  showStats?: boolean
  autoFlip?: boolean
  autoFlipDelay?: number
}

interface CardStats {
  correct: number
  incorrect: number
  lastReviewed: number
  easeFactor: number
  interval: number
}

export function FlashcardDeck({
  cards,
  title = 'Flashcards',
  description,
  onComplete,
  showStats = true,
  autoFlip = false,
  autoFlipDelay = 3000,
}: FlashcardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [shuffled, setShuffled] = useState(false)
  const [cardOrder, setCardOrder] = useState<number[]>([])
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 })
  const [stats, setStats] = useState<Record<string, CardStats>>({})
  const [completed, setCompleted] = useState(false)

  const categories = ['all', ...new Set(cards.map(c => c.category))]
  const filteredCards = categoryFilter === 'all' 
    ? cards 
    : cards.filter(c => c.category === categoryFilter)

  const orderedCards = shuffled 
    ? cardOrder.map(i => filteredCards[i]).filter(Boolean)
    : filteredCards

  const currentCard = orderedCards[currentIndex]

  useEffect(() => {
    setCardOrder(Array.from({ length: filteredCards.length }, (_, i) => i))
  }, [filteredCards.length])

  useEffect(() => {
    if (autoFlip && currentCard && !isFlipped) {
      const timer = setTimeout(() => setIsFlipped(true), autoFlipDelay)
      return () => clearTimeout(timer)
    }
  }, [autoFlip, currentCard, isFlipped, autoFlipDelay])

  const handleShuffle = useCallback(() => {
    const newOrder = [...cardOrder]
    for (let i = newOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newOrder[i], newOrder[j]] = [newOrder[j], newOrder[i]]
    }
    setCardOrder(newOrder)
    setShuffled(true)
    setCurrentIndex(0)
    setIsFlipped(false)
  }, [cardOrder])

  const handleFlip = useCallback(() => {
    setIsFlipped(!isFlipped)
  }, [isFlipped])

  const handleMark = useCallback((known: boolean) => {
    const cardId = currentCard.id
    const currentCardStats = stats[cardId] || {
      correct: 0,
      incorrect: 0,
      lastReviewed: 0,
      easeFactor: 2.5,
      interval: 1,
    }

    const updatedStats: CardStats = {
      ...currentCardStats,
      lastReviewed: Date.now(),
      [known ? 'correct' : 'incorrect']: currentCardStats[known ? 'correct' : 'incorrect'] + 1,
      easeFactor: known 
        ? Math.min(currentCardStats.easeFactor + 0.1, 3.0)
        : Math.max(currentCardStats.easeFactor - 0.2, 1.3),
      interval: known
        ? Math.round(currentCardStats.interval * currentCardStats.easeFactor)
        : 1,
    }

    setStats(prev => ({ ...prev, [cardId]: updatedStats }))
    setSessionStats(prev => ({
      ...prev,
      [known ? 'correct' : 'incorrect']: prev[known ? 'correct' : 'incorrect'] + 1
    }))

    if (known) {
      setIsFlipped(false)
      setTimeout(() => {
        if (currentIndex < orderedCards.length - 1) {
          setCurrentIndex(prev => prev + 1)
        } else {
          setCompleted(true)
          onComplete?.({
            correct: sessionStats.correct + 1,
            incorrect: sessionStats.incorrect,
            total: orderedCards.length,
          })
        }
      }, 300)
    } else {
      setIsFlipped(false)
      setTimeout(() => {
        if (currentIndex < orderedCards.length - 1) {
          setCurrentIndex(prev => prev + 1)
        } else {
          setCompleted(true)
          onComplete?.({
            correct: sessionStats.correct,
            incorrect: sessionStats.incorrect + 1,
            total: orderedCards.length,
          })
        }
      }, 300)
    }
  }, [currentCard, currentIndex, orderedCards.length, sessionStats, stats, onComplete])

  const handleNext = useCallback(() => {
    setIsFlipped(false)
    if (currentIndex < orderedCards.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      setCompleted(true)
      onComplete?.({
        correct: sessionStats.correct,
        incorrect: sessionStats.incorrect,
        total: orderedCards.length,
      })
    }
  }, [currentIndex, orderedCards.length, sessionStats, onComplete])

  const handlePrev = useCallback(() => {
    setIsFlipped(false)
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }, [currentIndex])

  const handleRestart = useCallback(() => {
    setCurrentIndex(0)
    setIsFlipped(false)
    setCompleted(false)
    setSessionStats({ correct: 0, incorrect: 0 })
    if (shuffled) {
      handleShuffle()
    }
  }, [shuffled, handleShuffle])

  const progress = orderedCards.length > 0 
    ? ((currentIndex + (isFlipped ? 0.5 : 0)) / orderedCards.length) * 100 
    : 0

  if (filteredCards.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Brain className="h-12 w-12 text-warm-muted mx-auto mb-4" />
          <p className="text-warm-muted">No flashcards in this category.</p>
        </CardContent>
      </Card>
    )
  }

  if (completed) {
    const accuracy = sessionStats.correct + sessionStats.incorrect > 0
      ? Math.round((sessionStats.correct / (sessionStats.correct + sessionStats.incorrect)) * 100)
      : 0

    return (
      <Card className="bg-gradient-to-br from-calm-green/5 to-calm-green/10 border-calm-green/20">
        <CardContent className="py-8 text-center">
          <Trophy className="h-16 w-16 text-calm-green mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-warm-text mb-2">Session Complete!</h3>
          <p className="text-warm-muted mb-6">You reviewed {orderedCards.length} flashcards</p>
          
          <div className="flex justify-center gap-8 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-calm-green">{sessionStats.correct}</div>
              <div className="text-sm text-warm-muted">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-500">{sessionStats.incorrect}</div>
              <div className="text-sm text-warm-muted">Needs Review</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{accuracy}%</div>
              <div className="text-sm text-warm-muted">Accuracy</div>
            </div>
          </div>

          <Button onClick={handleRestart} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Study Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="text-sm text-warm-muted">
            Card {currentIndex + 1} of {orderedCards.length}
          </p>
          {showStats && (
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-calm-green">
                <CheckCircle2 className="h-4 w-4" />
                {sessionStats.correct}
              </span>
              <span className="flex items-center gap-1 text-red-500">
                <XCircle className="h-4 w-4" />
                {sessionStats.incorrect}
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant={categoryFilter === cat ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => {
                setCategoryFilter(cat)
                setCurrentIndex(0)
                setIsFlipped(false)
                setCompleted(false)
                setSessionStats({ correct: 0, incorrect: 0 })
              }}
            >
              {cat === 'all' ? 'All' : cat}
            </Badge>
          ))}
        </div>
      </div>

      {showStats && (
        <Progress value={progress} className="h-2" />
      )}

      <div 
        className="relative h-72 cursor-pointer perspective-1000"
        onClick={handleFlip}
      >
        <div 
          className={cn(
            'absolute inset-0 transition-transform duration-500 transform-style-preserve-3d',
            isFlipped && 'rotate-y-180'
          )}
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          <Card 
            className="absolute inset-0 backface-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <CardContent className="flex flex-col items-center justify-center h-full p-6 text-center">
              <Badge variant="outline" className="mb-4">{currentCard.category}</Badge>
              <p className="text-lg font-medium text-warm-text">{currentCard.front}</p>
              <p className="text-sm text-warm-muted mt-4">Click to reveal answer</p>
            </CardContent>
          </Card>

          <Card 
            className="absolute inset-0 bg-primary/5 border-primary/20"
            style={{ 
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <CardContent className="flex flex-col items-center justify-center h-full p-6 text-center">
              <Badge variant="outline" className="mb-4 bg-primary/10">{currentCard.category}</Badge>
              <p className="text-sm text-warm-text leading-relaxed">{currentCard.back}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <Button 
          variant="outline" 
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleMark(false)}
            className="gap-1 text-red-600 border-red-200 hover:bg-red-50"
          >
            <XCircle className="h-4 w-4" />
            Need Review
          </Button>
          <Button
            onClick={() => handleMark(true)}
            className="gap-1 bg-calm-green hover:bg-calm-green/90"
          >
            <CheckCircle2 className="h-4 w-4" />
            Got It!
          </Button>
        </div>
        
        <Button 
          variant="outline" 
          onClick={handleNext}
          className="gap-1"
        >
          Skip
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex justify-center gap-2">
        <Button variant="ghost" size="sm" onClick={handleFlip} className="gap-1">
          {isFlipped ? 'Show Question' : 'Show Answer'}
        </Button>
        <Button variant="ghost" size="sm" onClick={handleShuffle} className="gap-1">
          <Shuffle className="h-4 w-4" />
          Shuffle
        </Button>
      </div>

      <p className="text-center text-xs text-warm-muted">
        Click the card to flip between question and answer
      </p>
    </div>
  )
}
