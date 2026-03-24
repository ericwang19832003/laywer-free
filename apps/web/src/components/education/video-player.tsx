'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  SkipBack, 
  SkipForward,
  Settings,
  CheckCircle2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface VideoLesson {
  id: string
  title: string
  description: string
  duration: string
  thumbnailUrl?: string
  videoUrl?: string
  completed?: boolean
}

interface VideoPlayerProps {
  lesson: VideoLesson
  onComplete?: () => void
  className?: string
}

export function VideoPlayer({ lesson, onComplete, className }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [progress, setProgress] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const [completed, setCompleted] = useState(lesson.completed || false)

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2]

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      setProgress((video.currentTime / video.duration) * 100)
    }

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      if (!completed) {
        setCompleted(true)
        onComplete?.()
      }
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('ended', handleEnded)
    }
  }, [completed, onComplete])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed
    }
  }, [playbackSpeed])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect()
      const percent = (e.clientX - rect.left) / rect.width
      videoRef.current.currentTime = percent * duration
    }
  }

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds))
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen()
      }
    }
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <div 
        className="relative aspect-video bg-black"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {lesson.videoUrl ? (
          <video
            ref={videoRef}
            src={lesson.videoUrl}
            className="w-full h-full object-contain"
            onClick={togglePlay}
            playsInline
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                <Play className="h-10 w-10 text-white ml-1" />
              </div>
              <p className="text-white/60 text-sm">Video placeholder</p>
              <p className="text-white/40 text-xs mt-1">{lesson.title}</p>
            </div>
          </div>
        )}

        {/* Play/Pause overlay */}
        {!isPlaying && lesson.videoUrl && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
          >
            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors">
              <Play className="h-8 w-8 text-gray-900 ml-1" />
            </div>
          </button>
        )}

        {/* Progress bar */}
        <div 
          className="absolute bottom-12 left-0 right-0 h-1 bg-white/30 cursor-pointer"
          onClick={handleProgressClick}
        >
          <div 
            className="h-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Controls */}
        <div className={cn(
          'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300',
          showControls ? 'opacity-100' : 'opacity-0'
        )}>
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="text-white hover:text-primary transition-colors">
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>

            <button onClick={() => skip(-10)} className="text-white hover:text-primary transition-colors">
              <SkipBack className="h-4 w-4" />
            </button>

            <button onClick={() => skip(10)} className="text-white hover:text-primary transition-colors">
              <SkipForward className="h-4 w-4" />
            </button>

            <span className="text-white text-sm font-medium">
              {formatTime(currentTime)} / {formatTime(duration || 0)}
            </span>

            <div className="flex-1" />

            <div className="relative">
              <button 
                onClick={() => setShowSpeedMenu(!showSpeedMenu)} 
                className="text-white hover:text-primary transition-colors text-sm font-medium"
              >
                {playbackSpeed}x
              </button>
              {showSpeedMenu && (
                <div className="absolute bottom-full right-0 mb-2 bg-gray-900 rounded-lg shadow-xl py-2 min-w-[80px]">
                  {speeds.map((speed) => (
                    <button
                      key={speed}
                      onClick={() => {
                        setPlaybackSpeed(speed)
                        setShowSpeedMenu(false)
                      }}
                      className={cn(
                        'w-full px-4 py-1.5 text-sm text-left hover:bg-white/10 transition-colors',
                        playbackSpeed === speed ? 'text-primary font-medium' : 'text-white'
                      )}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={toggleMute} className="text-white hover:text-primary transition-colors">
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>

            <button onClick={handleFullscreen} className="text-white hover:text-primary transition-colors">
              <Maximize className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Completed badge */}
        {completed && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-calm-green text-white gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Completed
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold text-warm-text">{lesson.title}</h3>
            <p className="text-sm text-warm-muted mt-1">{lesson.description}</p>
          </div>
          <Badge variant="outline">{lesson.duration}</Badge>
        </div>
      </CardContent>
    </Card>
  )
}

interface VideoPlaylistProps {
  lessons: VideoLesson[]
  currentLessonId?: string
  onSelectLesson?: (lesson: VideoLesson) => void
  className?: string
}

export function VideoPlaylist({ lessons, currentLessonId, onSelectLesson, className }: VideoPlaylistProps) {
  const currentLesson = lessons.find(l => l.id === currentLessonId) || lessons[0]
  const currentIndex = lessons.findIndex(l => l.id === currentLesson?.id)

  return (
    <div className={cn('flex flex-col lg:flex-row gap-6', className)}>
      <div className="flex-1">
        <VideoPlayer 
          lesson={currentLesson} 
          onComplete={() => {
            if (currentIndex < lessons.length - 1 && onSelectLesson) {
              onSelectLesson(lessons[currentIndex + 1])
            }
          }}
        />
      </div>
      
      <div className="lg:w-80">
        <h3 className="font-semibold text-warm-text mb-3">Course Contents</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {lessons.map((lesson, index) => (
            <button
              key={lesson.id}
              onClick={() => onSelectLesson?.(lesson)}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
                currentLesson?.id === lesson.id 
                  ? 'bg-primary/10 border border-primary/20' 
                  : 'hover:bg-warm-border/30'
              )}
            >
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium',
                currentLesson?.id === lesson.id 
                  ? 'bg-primary text-white' 
                  : lesson.completed 
                    ? 'bg-calm-green text-white'
                    : 'bg-warm-border text-warm-muted'
              )}>
                {lesson.completed ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  'text-sm truncate',
                  currentLesson?.id === lesson.id ? 'font-medium text-warm-text' : 'text-warm-muted'
                )}>
                  {lesson.title}
                </p>
                <p className="text-xs text-warm-muted">{lesson.duration}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
