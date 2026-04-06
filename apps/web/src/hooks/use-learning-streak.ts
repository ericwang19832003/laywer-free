'use client'

import { useState, useEffect, useCallback } from 'react'

interface StreakData {
  currentStreak: number
  longestStreak: number
  lastStudyDate: string | null
  totalStudyDays: number
  weeklyActivity: boolean[]
}

const STREAK_STORAGE_KEY = 'lawyer-free-streak'

function getStoredStreak(): StreakData {
  if (typeof window === 'undefined') {
    return getDefaultStreakData()
  }
  
  try {
    const stored = localStorage.getItem(STREAK_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Failed to load streak data:', error)
  }
  
  return getDefaultStreakData()
}

function getDefaultStreakData(): StreakData {
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastStudyDate: null,
    totalStudyDays: 0,
    weeklyActivity: [false, false, false, false, false, false, false],
  }
}

function saveStreak(data: StreakData) {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Failed to save streak data:', error)
  }
}

function isSameDay(date1: string, date2: string): boolean {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

function isYesterday(date: string): boolean {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const checkDate = new Date(date)
  return (
    yesterday.getFullYear() === checkDate.getFullYear() &&
    yesterday.getMonth() === checkDate.getMonth() &&
    yesterday.getDate() === checkDate.getDate()
  )
}

function getDayOfWeek(date: string): number {
  return new Date(date).getDay()
}

export function useLearningStreak() {
  const [streakData, setStreakData] = useState<StreakData>(getDefaultStreakData)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const data = getStoredStreak()
    
    // Check if streak is broken (last study was more than 1 day ago)
    if (data.lastStudyDate) {
      const today = new Date().toISOString()
      if (!isSameDay(data.lastStudyDate, today) && !isYesterday(data.lastStudyDate)) {
        // Streak is broken - reset current streak
        data.currentStreak = 0
        saveStreak(data)
      }
    }
    
    setStreakData(data)
    setIsLoading(false)
  }, [])

  const recordStudy = useCallback(() => {
    const today = new Date().toISOString()
    
    setStreakData((prev) => {
      // If already studied today, don't increment
      if (prev.lastStudyDate && isSameDay(prev.lastStudyDate, today)) {
        return prev
      }

      const newData = { ...prev }
      
      // Update streak
      if (prev.lastStudyDate && isYesterday(prev.lastStudyDate)) {
        // Continuing streak
        newData.currentStreak = prev.currentStreak + 1
      } else if (!prev.lastStudyDate || (!isSameDay(prev.lastStudyDate, today) && !isYesterday(prev.lastStudyDate))) {
        // Starting new streak or streak was broken
        newData.currentStreak = 1
      }
      
      // Update longest streak
      if (newData.currentStreak > prev.longestStreak) {
        newData.longestStreak = newData.currentStreak
      }
      
      // Update last study date
      newData.lastStudyDate = today
      
      // Update total study days
      newData.totalStudyDays = prev.totalStudyDays + 1
      
      // Update weekly activity
      const dayOfWeek = getDayOfWeek(today)
      const newWeeklyActivity = [...prev.weeklyActivity]
      newWeeklyActivity[dayOfWeek] = true
      newData.weeklyActivity = newWeeklyActivity
      
      saveStreak(newData)
      return newData
    })
  }, [])

  const resetStreak = useCallback(() => {
    const defaultData = getDefaultStreakData()
    setStreakData(defaultData)
    saveStreak(defaultData)
  }, [])

  const hasStudiedToday = streakData.lastStudyDate 
    ? isSameDay(streakData.lastStudyDate, new Date().toISOString())
    : false

  const isStreakActive = streakData.currentStreak > 0

  return {
    streakData,
    isLoading,
    recordStudy,
    resetStreak,
    hasStudiedToday,
    isStreakActive,
  }
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: string
  progress?: number
  target?: number
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-lesson',
    title: 'First Steps',
    description: 'Complete your first lesson',
    icon: '🎓',
    unlocked: false,
  },
  {
    id: 'five-lessons',
    title: 'Eager Learner',
    description: 'Complete 5 lessons',
    icon: '📚',
    unlocked: false,
  },
  {
    id: 'streak-3',
    title: 'On a Roll',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    unlocked: false,
  },
  {
    id: 'streak-7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '⚡',
    unlocked: false,
  },
  {
    id: 'flashcard-master',
    title: 'Flashcard Master',
    description: 'Master 20 flashcards',
    icon: '🧠',
    unlocked: false,
  },
  {
    id: 'all-basics',
    title: 'Basics Complete',
    description: 'Complete all basic topics',
    icon: '✅',
    unlocked: false,
  },
]

const ACHIEVEMENTS_STORAGE_KEY = 'lawyer-free-achievements'

export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Merge with default achievements to handle new achievements
        setAchievements(ACHIEVEMENTS.map(a => {
          const saved = parsed.find((s: Achievement) => s.id === a.id)
          return saved || a
        }))
      }
    } catch (error) {
      console.error('Failed to load achievements:', error)
    }
    setIsLoading(false)
  }, [])

  const unlockAchievement = useCallback((id: string) => {
    setAchievements(prev => {
      const newAchievements = prev.map(a => {
        if (a.id === id && !a.unlocked) {
          return { ...a, unlocked: true, unlockedAt: new Date().toISOString() }
        }
        return a
      })
      localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(newAchievements))
      return newAchievements
    })
  }, [])

  const updateProgress = useCallback((id: string, progress: number) => {
    setAchievements(prev => {
      const newAchievements = prev.map(a => {
        if (a.id === id) {
          return { ...a, progress }
        }
        return a
      })
      localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(newAchievements))
      return newAchievements
    })
  }, [])

  const unlockedCount = achievements.filter(a => a.unlocked).length

  return {
    achievements,
    isLoading,
    unlockAchievement,
    updateProgress,
    unlockedCount,
    totalCount: achievements.length,
  }
}
