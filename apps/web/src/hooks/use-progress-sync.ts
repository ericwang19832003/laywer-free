'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface LessonProgressState {
  currentSection: number
  answers: Record<number, number>
  submitted: boolean
  completed: boolean
  updatedAt: string | null
}

interface LearningProgress {
  streak: {
    currentStreak: number
    longestStreak: number
    lastStudyDate: string | null
    totalStudyDays: number
    weeklyActivity: boolean[]
  }
  achievements: {
    id: string
    unlocked: boolean
    unlockedAt: string | null
    progress?: number
  }[]
  quizScores: Record<string, { score: number; completedAt: string }>
  completedLessons: string[]
  lessonProgress: Record<string, LessonProgressState>
  watchedVideos: string[]
  flashcardsReviewed: number
  lastSyncedAt: string | null
}

interface SyncStatus {
  isSyncing: boolean
  lastSyncedAt: string | null
  error: string | null
  pendingChanges: boolean
}

const PROGRESS_STORAGE_KEY = 'lawyer-free-progress'
const SYNC_INTERVAL = 60000 // 1 minute

function lessonProgressEquals(
  left: Omit<LessonProgressState, 'updatedAt'> | LessonProgressState | undefined,
  right: Omit<LessonProgressState, 'updatedAt'> | LessonProgressState | undefined,
): boolean {
  if (!left || !right) {
    return left === right
  }

  const leftAnswerKeys = Object.keys(left.answers)
  const rightAnswerKeys = Object.keys(right.answers)

  if (
    left.currentSection !== right.currentSection ||
    left.submitted !== right.submitted ||
    left.completed !== right.completed ||
    leftAnswerKeys.length !== rightAnswerKeys.length
  ) {
    return false
  }

  return leftAnswerKeys.every((key) => left.answers[Number(key)] === right.answers[Number(key)])
}

export function useProgressSync(userId: string | null) {
  const [progress, setProgress] = useState<LearningProgress | null>(null)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    lastSyncedAt: null,
    error: null,
    pendingChanges: false,
  })
  const supabase = createClient()
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load local progress
  const loadLocalProgress = useCallback((): LearningProgress => {
    if (typeof window === 'undefined') {
      return getDefaultProgress()
    }
    
    try {
      const stored = localStorage.getItem(PROGRESS_STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load local progress:', error)
    }
    return getDefaultProgress()
  }, [])

  // Save local progress
  const saveLocalProgress = useCallback((data: LearningProgress) => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save local progress:', error)
    }
  }, [])

  // Get default progress
  const getDefaultProgress = (): LearningProgress => ({
    streak: {
      currentStreak: 0,
      longestStreak: 0,
      lastStudyDate: null,
      totalStudyDays: 0,
      weeklyActivity: [false, false, false, false, false, false, false],
    },
    achievements: [],
    quizScores: {},
    completedLessons: [],
    lessonProgress: {},
    watchedVideos: [],
    flashcardsReviewed: 0,
    lastSyncedAt: null,
  })

  // Fetch from backend
  const fetchFromBackend = useCallback(async (): Promise<LearningProgress | null> => {
    if (!userId) return null

    try {
      const { data, error } = await supabase
        .from('user_learning_progress')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return data?.progress_data || null
    } catch (error) {
      console.error('Failed to fetch progress from backend:', error)
      return null
    }
  }, [userId, supabase])

  // Save to backend
  const saveToBackend = useCallback(async (data: LearningProgress): Promise<boolean> => {
    if (!userId) return false

    try {
      const { error } = await supabase
        .from('user_learning_progress')
        .upsert({
          user_id: userId,
          progress_data: data,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        })

      if (error) {
        throw error
      }

      setSyncStatus(prev => ({
        ...prev,
        lastSyncedAt: new Date().toISOString(),
        pendingChanges: false,
        error: null,
      }))

      return true
    } catch (error) {
      console.error('Failed to save progress to backend:', error)
      setSyncStatus(prev => ({
        ...prev,
        error: 'Failed to sync progress',
      }))
      return false
    }
  }, [userId, supabase])

  // Merge local and backend progress
  const mergeProgress = useCallback((local: LearningProgress, remote: LearningProgress | null): LearningProgress => {
    if (!remote) return local

    // Remote wins for most fields, but preserve local streak if it's newer
    return {
      streak: local.streak.lastStudyDate && remote.streak.lastStudyDate
        ? new Date(local.streak.lastStudyDate) > new Date(remote.streak.lastStudyDate)
          ? local.streak
          : remote.streak
        : local.streak,
      achievements: remote.achievements.map(a => {
        const localAchievement = local.achievements.find(la => la.id === a.id)
        if (localAchievement?.unlocked && !a.unlocked) {
          return localAchievement
        }
        return a
      }),
      quizScores: {
        ...remote.quizScores,
        ...local.quizScores,
      },
      completedLessons: [...new Set([...remote.completedLessons, ...local.completedLessons])],
      lessonProgress: mergeLessonProgress(local.lessonProgress, remote.lessonProgress),
      watchedVideos: [...new Set([...remote.watchedVideos, ...local.watchedVideos])],
      flashcardsReviewed: Math.max(remote.flashcardsReviewed, local.flashcardsReviewed),
      lastSyncedAt: new Date().toISOString(),
    }
  }, [])

  function mergeLessonProgress(
    localProgress: Record<string, LessonProgressState>,
    remoteProgress: Record<string, LessonProgressState>,
  ): Record<string, LessonProgressState> {
    const merged: Record<string, LessonProgressState> = {}
    const topicIds = new Set([...Object.keys(localProgress ?? {}), ...Object.keys(remoteProgress ?? {})])

    for (const topicId of topicIds) {
      const localEntry = localProgress?.[topicId]
      const remoteEntry = remoteProgress?.[topicId]

      if (!localEntry) {
        merged[topicId] = remoteEntry
        continue
      }

      if (!remoteEntry) {
        merged[topicId] = localEntry
        continue
      }

      const localUpdatedAt = localEntry.updatedAt ? new Date(localEntry.updatedAt).getTime() : 0
      const remoteUpdatedAt = remoteEntry.updatedAt ? new Date(remoteEntry.updatedAt).getTime() : 0
      merged[topicId] = localUpdatedAt >= remoteUpdatedAt ? localEntry : remoteEntry
    }

    return merged
  }

  // Initial load and merge
  useEffect(() => {
    const loadProgress = async () => {
      const localProgress = loadLocalProgress()
      
      if (userId) {
        setSyncStatus(prev => ({ ...prev, isSyncing: true }))
        
        const remoteProgress = await fetchFromBackend()
        const mergedProgress = mergeProgress(localProgress, remoteProgress)
        
        setProgress(mergedProgress)
        saveLocalProgress(mergedProgress)
        
        setSyncStatus(prev => ({ 
          ...prev, 
          isSyncing: false,
          lastSyncedAt: mergedProgress.lastSyncedAt,
        }))
      } else {
        setProgress(localProgress)
      }
    }

    loadProgress()
  }, [userId, loadLocalProgress, fetchFromBackend, mergeProgress, saveLocalProgress])

  // Auto-sync interval
  useEffect(() => {
    if (!userId || !syncStatus.pendingChanges) return

    const sync = async () => {
      if (progress) {
        setSyncStatus(prev => ({ ...prev, isSyncing: true }))
        await saveToBackend(progress)
        setSyncStatus(prev => ({ ...prev, isSyncing: false }))
      }
    }

    syncTimeoutRef.current = setTimeout(sync, SYNC_INTERVAL)

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
    }
  }, [userId, syncStatus.pendingChanges, progress, saveToBackend])

  // Update functions
  const updateProgress = useCallback((updates: Partial<LearningProgress>) => {
    setProgress(prev => {
      if (!prev) return prev
      const newProgress = { ...prev, ...updates, lastSyncedAt: null }
      saveLocalProgress(newProgress)
      setSyncStatus(prev => ({ ...prev, pendingChanges: true }))
      return newProgress
    })
  }, [saveLocalProgress])

  const recordStudySession = useCallback(() => {
    const today = new Date().toISOString()
    
    setProgress(prev => {
      if (!prev) return prev
      
      const dayOfWeek = new Date().getDay()
      const newWeeklyActivity = [...prev.streak.weeklyActivity]
      newWeeklyActivity[dayOfWeek] = true

      let newStreak = prev.streak.currentStreak
      if (prev.streak.lastStudyDate) {
        const lastDate = new Date(prev.streak.lastStudyDate)
        const todayDate = new Date(today)
        const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (diffDays === 1) {
          newStreak = prev.streak.currentStreak + 1
        } else if (diffDays > 1) {
          newStreak = 1
        }
      } else {
        newStreak = 1
      }

      const newProgress: LearningProgress = {
        ...prev,
        streak: {
          currentStreak: newStreak,
          longestStreak: Math.max(prev.streak.longestStreak, newStreak),
          lastStudyDate: today,
          totalStudyDays: prev.streak.totalStudyDays + 1,
          weeklyActivity: newWeeklyActivity,
        },
        lastSyncedAt: null,
      }

      saveLocalProgress(newProgress)
      setSyncStatus(prev => ({ ...prev, pendingChanges: true }))
      return newProgress
    })
  }, [saveLocalProgress])

  const completeLesson = useCallback((lessonId: string) => {
    setProgress(prev => {
      if (!prev) return prev
      if (prev.completedLessons.includes(lessonId)) return prev

      const newProgress: LearningProgress = {
        ...prev,
        completedLessons: [...prev.completedLessons, lessonId],
        lastSyncedAt: null,
      }

      saveLocalProgress(newProgress)
      setSyncStatus(prev => ({ ...prev, pendingChanges: true }))
      return newProgress
    })
  }, [saveLocalProgress])

  const updateLessonProgress = useCallback((lessonId: string, lessonState: Omit<LessonProgressState, 'updatedAt'>) => {
    setProgress(prev => {
      if (!prev) return prev
      const existingLessonState = prev.lessonProgress[lessonId]
      if (lessonProgressEquals(existingLessonState, lessonState)) {
        return prev
      }

      const newProgress: LearningProgress = {
        ...prev,
        lessonProgress: {
          ...prev.lessonProgress,
          [lessonId]: {
            ...lessonState,
            updatedAt: new Date().toISOString(),
          },
        },
        lastSyncedAt: null,
      }

      saveLocalProgress(newProgress)
      setSyncStatus(prev => ({ ...prev, pendingChanges: true }))
      return newProgress
    })
  }, [saveLocalProgress])

  const recordQuizScore = useCallback((quizId: string, score: number) => {
    setProgress(prev => {
      if (!prev) return prev

      const newProgress: LearningProgress = {
        ...prev,
        quizScores: {
          ...prev.quizScores,
          [quizId]: { score, completedAt: new Date().toISOString() },
        },
        lastSyncedAt: null,
      }

      saveLocalProgress(newProgress)
      setSyncStatus(prev => ({ ...prev, pendingChanges: true }))
      return newProgress
    })
  }, [saveLocalProgress])

  const unlockAchievement = useCallback((achievementId: string) => {
    setProgress(prev => {
      if (!prev) return prev

      const existing = prev.achievements.find(a => a.id === achievementId)
      if (existing?.unlocked) return prev

      const newProgress: LearningProgress = {
        ...prev,
        achievements: [
          ...prev.achievements.filter(a => a.id !== achievementId),
          { id: achievementId, unlocked: true, unlockedAt: new Date().toISOString() },
        ],
        lastSyncedAt: null,
      }

      saveLocalProgress(newProgress)
      setSyncStatus(prev => ({ ...prev, pendingChanges: true }))
      return newProgress
    })
  }, [saveLocalProgress])

  const forceSync = useCallback(async () => {
    if (!userId || !progress) return
    
    setSyncStatus(prev => ({ ...prev, isSyncing: true }))
    const success = await saveToBackend(progress)
    
    if (success) {
      setSyncStatus(prev => ({ ...prev, isSyncing: false }))
    } else {
      setSyncStatus(prev => ({ ...prev, isSyncing: false, error: 'Sync failed' }))
    }
  }, [userId, progress, saveToBackend])

  return {
    progress,
    syncStatus,
    updateProgress,
    recordStudySession,
    completeLesson,
    updateLessonProgress,
    recordQuizScore,
    unlockAchievement,
    forceSync,
  }
}
