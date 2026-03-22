'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FlashcardDeck, type Flashcard } from '@/components/education/flashcard-deck'
import { VideoPlayer, VideoPlaylist } from '@/components/education/video-player'
import { QuizPlayer, QuizList, LEGAL_BASICS_QUIZ, COURT_SYSTEM_QUIZ } from '@/components/education/quiz-player'
import { useLearningStreak, useAchievements } from '@/hooks/use-learning-streak'
import { useProgressSync } from '@/hooks/use-progress-sync'
import { StreakBadge } from '@/components/ui/celebration'
import { createClient } from '@/lib/supabase/client'
import { LEARN_TOPICS, type LearnTopic } from '@/lib/education/learn-topics'
import { cn } from '@/lib/utils'
import { 
  BookOpen, 
  Brain, 
  Video, 
  Clock,
  ChevronRight,
  Play,
  Lightbulb,
  AlertCircle,
  ArrowRight,
  GraduationCap,
  Users,
  Trophy,
  Flame,
  Target,
  BookMarked,
  RefreshCw,
  Check
} from 'lucide-react'

interface FlashCard {
  id: string
  front: string
  back: string
  category: string
}

interface VideoLesson {
  id: string
  title: string
  description: string
  duration: string
  category: string
  thumbnail?: string
}

const FLASHCARDS: FlashCard[] = [
  { id: '1', front: 'What is a "Petition" or "Complaint"?', back: 'The initial document filed with the court that starts your lawsuit. It explains who you are, who you are suing, what they did wrong, and what you want the court to do.', category: 'Basics' },
  { id: '2', front: 'What is "Service of Process"?', back: 'The formal way of delivering legal documents to the other party. The court needs proof that the defendant received the petition - this is called "service."', category: 'Filing' },
  { id: '3', front: 'What is a "Summons"?', back: 'A document that accompanies the petition, telling the defendant they have been sued and how long they have to respond (usually 20-30 days).', category: 'Filing' },
  { id: '4', front: 'What is "Venue"?', back: 'The proper location (county) where your case should be filed. Usually where the defendant lives or where the incident happened.', category: 'Jurisdiction' },
  { id: '5', front: 'What is a "Motion"?', back: 'A formal request to the judge asking for a specific ruling or order. Used to ask the court to do something before the final judgment.', category: 'Procedure' },
  { id: '6', front: 'What is "Discovery"?', back: 'The process where both sides exchange information and evidence. Includes written questions (interrogatories), document requests, and depositions.', category: 'Evidence' },
  { id: '7', front: 'What is "Default Judgment"?', back: 'A judgment entered against a defendant who failed to respond to the lawsuit. Usually favors the plaintiff for the amount requested.', category: 'Judgment' },
  { id: '8', front: 'What is a "Counterclaim"?', back: 'A claim the defendant makes against the plaintiff in response to the original lawsuit. Allows the defendant to seek their own relief.', category: 'Procedure' },
  { id: '9', front: 'What is "Standing"?', back: 'The legal right to bring a lawsuit. You must show you were personally harmed by the defendant\'s actions to have standing.', category: 'Basics' },
  { id: '10', front: 'What is "Jurisdiction"?', back: 'The court\'s authority to hear your case. Must be the right type of court (state/federal) and located in the right place (venue).', category: 'Jurisdiction' },
]

const VIDEO_LESSONS: VideoLesson[] = [
  { id: '1', title: 'How Courts Work', description: 'An overview of the judicial system, types of courts, and how cases move through the system.', duration: '5:30', category: 'Basics' },
  { id: '2', title: 'Filing Your First Case', description: 'Step-by-step walkthrough of what happens when you file a lawsuit.', duration: '8:45', category: 'Filing' },
  { id: '3', title: 'Understanding Legal Documents', description: 'Learn to read and understand common legal documents.', duration: '7:15', category: 'Basics' },
  { id: '4', title: 'Presenting Evidence', description: 'How to gather, organize, and present evidence at a hearing.', duration: '10:20', category: 'Hearing' },
  { id: '5', title: 'What Happens at a Hearing', description: 'What to expect when you walk into a courtroom.', duration: '6:00', category: 'Hearing' },
]

const QUICK_FACTS = [
  { fact: 'You can usually file in the county where the defendant lives OR where the incident occurred.', category: 'Venue' },
  { fact: 'Most civil lawsuits have a 2-4 year statute of limitations from when the injury occurred.', category: 'Deadlines' },
  { fact: 'Service must be completed by someone other than you (not the plaintiff).', category: 'Service' },
  { fact: 'If the defendant doesn\'t respond within the deadline, you can request a default judgment.', category: 'Judgment' },
  { fact: 'Small claims courts handle disputes up to $10,000-$20,000 depending on your state.', category: 'Jurisdiction' },
  { fact: 'You can ask for monetary damages, injunctive relief, or declaratory relief.', category: 'Relief' },
]

const TOPIC_DIFFICULTY_COLORS = {
  beginner: 'bg-calm-green/10 text-calm-green',
  intermediate: 'bg-calm-amber/10 text-calm-amber',
  advanced: 'bg-red-50 text-red-600',
} as const

function FlashcardView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Legal Flashcards</CardTitle>
        <CardDescription>
          Test your knowledge of key legal concepts. Mark cards as you learn them!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FlashcardDeck 
          cards={FLASHCARDS as Flashcard[]} 
          title="Legal Terms"
          showStats={true}
        />
      </CardContent>
    </Card>
  )
}

function QuickFactsView() {
  const [currentFact, setCurrentFact] = useState(0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <Badge variant="outline">{QUICK_FACTS[currentFact].category}</Badge>
        <span className="text-xs text-warm-muted">
          {currentFact + 1} / {QUICK_FACTS.length}
        </span>
      </div>

      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-warm-text leading-relaxed">{QUICK_FACTS[currentFact].fact}</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-2">
        {QUICK_FACTS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentFact(i)}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === currentFact ? 'bg-primary' : 'bg-warm-border'
            }`}
          />
        ))}
      </div>

      <div className="flex justify-center gap-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setCurrentFact((prev) => (prev - 1 + QUICK_FACTS.length) % QUICK_FACTS.length)}
        >
          Previous
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setCurrentFact((prev) => (prev + 1) % QUICK_FACTS.length)}
        >
          Next Tip
        </Button>
      </div>
    </div>
  )
}

const AVAILABLE_QUIZZES = [LEGAL_BASICS_QUIZ, COURT_SYSTEM_QUIZ]

interface QuizViewProps {
  onQuizComplete?: (quizId: string, score: number, passed: boolean) => void
}

function QuizView({ onQuizComplete }: QuizViewProps) {
  const [selectedQuiz, setSelectedQuiz] = useState<typeof LEGAL_BASICS_QUIZ | null>(null)
  const [completedQuizzes, setCompletedQuizzes] = useState<Record<string, { score: number; passed: boolean }>>({})

  const handleQuizComplete = (quizId: string, score: number, passed: boolean) => {
    setCompletedQuizzes(prev => ({
      ...prev,
      [quizId]: { score, passed }
    }))
    onQuizComplete?.(quizId, score, passed)
  }

  if (selectedQuiz) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedQuiz(null)}
            className="gap-2"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
            Back to Quizzes
          </Button>
          {completedQuizzes[selectedQuiz.id] && (
            <Badge 
              variant={completedQuizzes[selectedQuiz.id].passed ? 'default' : 'secondary'}
              className={cn(
                completedQuizzes[selectedQuiz.id].passed 
                  ? 'bg-calm-green/10 text-calm-green border-calm-green/30'
                  : 'bg-red-50 text-red-600 border-red-200'
              )}
            >
              {completedQuizzes[selectedQuiz.id].passed ? 'Passed' : 'Not Passed'}: {completedQuizzes[selectedQuiz.id].score}%
            </Badge>
          )}
        </div>
        <QuizPlayer 
          quiz={selectedQuiz}
          onComplete={(score, passed) => handleQuizComplete(selectedQuiz.id, score, passed)}
        />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Practice Quizzes</CardTitle>
        <CardDescription>
          Test your knowledge with our practice quizzes. You need 70% to pass!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AVAILABLE_QUIZZES.map((quiz) => {
            const completed = completedQuizzes[quiz.id]
            return (
              <Card 
                key={quiz.id}
                className={cn(
                  'hover:shadow-md transition-all cursor-pointer group',
                  completed?.passed && 'border-calm-green/30 bg-calm-green/5'
                )}
                onClick={() => setSelectedQuiz(quiz)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center',
                        completed?.passed 
                          ? 'bg-calm-green/20' 
                          : 'bg-primary/10'
                      )}>
                        {completed?.passed ? (
                          <Check className="h-4 w-4 text-calm-green" />
                        ) : (
                          <BookMarked className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <Badge variant="outline">{quiz.questions.length} questions</Badge>
                    </div>
                    {completed && (
                      <Badge 
                        variant="secondary"
                        className={completed.passed ? 'bg-calm-green/10 text-calm-green' : 'bg-red-50 text-red-600'}
                      >
                        {completed.score}%
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-warm-text mb-1 group-hover:text-primary transition-colors">
                    {quiz.title}
                  </h3>
                  <p className="text-sm text-warm-muted">{quiz.description}</p>
                  <div className="mt-4 flex items-center gap-2 text-sm text-warm-muted">
                    <Target className="h-4 w-4" />
                    <span>{quiz.passingScore}% to pass</span>
                    {completed && (
                      <span className={cn(
                        'ml-2',
                        completed.passed ? 'text-calm-green' : 'text-red-500'
                      )}>
                        {completed.passed ? 'Completed' : 'Try again'}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="p-4 bg-calm-indigo/5 border border-calm-indigo/20 rounded-lg">
          <div className="flex items-start gap-3">
            <Trophy className="h-5 w-5 text-calm-indigo mt-0.5" />
            <div>
              <p className="font-medium text-warm-text">Track Your Progress</p>
              <p className="text-sm text-warm-muted mt-1">
                Complete quizzes to earn achievements and track your legal knowledge progress.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function VideoLessonCard({ video }: { video: VideoLesson }) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group">
      <div className="aspect-video bg-gradient-to-br from-warm-bg to-warm-bg/50 rounded-t-lg flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors" />
        <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Play className="h-5 w-5 text-white ml-0.5" />
        </div>
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {video.duration}
        </div>
      </div>
      <CardContent className="p-4">
        <Badge variant="outline" className="mb-2 text-xs">{video.category}</Badge>
        <h3 className="font-medium text-warm-text mb-1">{video.title}</h3>
        <p className="text-sm text-warm-muted">{video.description}</p>
      </CardContent>
    </Card>
  )
}

function TopicCard({
  topic,
  onSelect,
}: {
  topic: LearnTopic
  onSelect: (topic: LearnTopic) => void
}) {
  const Icon = topic.icon

  return (
    <Card
      className="transition-all hover:border-primary/30 hover:shadow-md"
    >
      <button
        type="button"
        className="group h-full w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl"
        onClick={() => onSelect(topic)}
        aria-label={topic.title}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <Badge className={TOPIC_DIFFICULTY_COLORS[topic.difficulty]} variant="secondary">
              {topic.difficulty}
            </Badge>
          </div>
          <CardTitle className="text-base mt-3">{topic.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-sm mb-4">{topic.description}</CardDescription>
          <div className="flex items-center justify-between text-xs text-warm-muted">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {topic.duration}
              </span>
              <span>{topic.lessons} lessons</span>
            </div>
            <div className="rounded-full border border-warm-border p-2 text-warm-muted transition-colors group-hover:border-primary/30 group-hover:text-primary">
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </CardContent>
      </button>
    </Card>
  )
}

export default function LearnPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<LearnTopic | null>(null)
  const { streakData, recordStudy, hasStudiedToday } = useLearningStreak()
  const { achievements, unlockedCount, totalCount } = useAchievements()
  const { 
    progress, 
    syncStatus, 
    recordStudySession, 
    recordQuizScore,
    unlockAchievement,
    forceSync 
  } = useProgressSync(userId)

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      }
    }
    loadUser()
  }, [])

  const handleStudyActivity = () => {
    if (!hasStudiedToday) {
      recordStudy()
      recordStudySession()
    }
  }

  const handleQuizComplete = (quizId: string, score: number, passed: boolean) => {
    recordQuizScore(quizId, score)
    if (passed && score >= 90) {
      unlockAchievement('quiz-master')
    }
  }

  const syncProgress = async () => {
    if (userId && progress) {
      await forceSync()
    }
  }

  const handleTopicSelect = (topic: LearnTopic) => {
    setSelectedTopic(topic)
  }

  return (
    <div className="min-h-screen bg-warm-bg">
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-warm-text mb-2">Learn Legal Basics</h1>
              <p className="text-warm-muted">
                Free educational resources to help you navigate the legal system with confidence.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {userId && (
                <button
                  onClick={syncProgress}
                  className={cn(
                    'flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border transition-colors',
                    syncStatus.isSyncing 
                      ? 'bg-primary/5 border-primary/20 text-primary'
                      : syncStatus.pendingChanges
                        ? 'bg-calm-amber/5 border-calm-amber/20 text-calm-amber'
                        : 'bg-calm-green/5 border-calm-green/20 text-calm-green'
                  )}
                  title={syncStatus.isSyncing ? 'Syncing...' : syncStatus.pendingChanges ? 'Changes pending sync' : 'Synced'}
                >
                  <RefreshCw className={cn('h-3 w-3', syncStatus.isSyncing && 'animate-spin')} />
                  {syncStatus.isSyncing ? 'Syncing' : syncStatus.pendingChanges ? 'Pending' : 'Synced'}
                </button>
              )}
              {streakData.currentStreak > 0 && (
                <StreakBadge streak={streakData.currentStreak} />
              )}
              <div className="flex items-center gap-2 text-sm text-warm-muted">
                <Trophy className="h-4 w-4 text-calm-amber" />
                <span>{unlockedCount}/{totalCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Streak Banner */}
        {streakData.currentStreak > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-200/30 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <Flame className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-warm-text">
                  {streakData.currentStreak} day streak! {hasStudiedToday ? '✅' : '📚'}
                </p>
                <p className="text-sm text-warm-muted">
                  {hasStudiedToday 
                    ? "Great job! You've studied today." 
                    : "Study something today to keep your streak going!"
                  }
                </p>
              </div>
              <div className="flex gap-1">
                {streakData.weeklyActivity.map((active, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      active ? 'bg-calm-green' : 'bg-warm-border'
                    }`}
                    title={['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-warm-text">6 Topics</p>
                <p className="text-sm text-warm-muted">Comprehensive lessons</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-calm-green/5 to-calm-green/10 border-calm-green/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-calm-green/10 flex items-center justify-center">
                <Brain className="h-6 w-6 text-calm-green" />
              </div>
              <div>
                <p className="font-semibold text-warm-text">10 Flashcards</p>
                <p className="text-sm text-warm-muted">Key legal terms</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-calm-amber/5 to-calm-amber/10 border-calm-amber/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-calm-amber/10 flex items-center justify-center">
                <Target className="h-6 w-6 text-calm-amber" />
              </div>
              <div>
                <p className="font-semibold text-warm-text">2 Quizzes</p>
                <p className="text-sm text-warm-muted">Test your knowledge</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-calm-indigo/5 to-calm-indigo/10 border-calm-indigo/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-calm-indigo/10 flex items-center justify-center">
                <Video className="h-6 w-6 text-calm-indigo" />
              </div>
              <div>
                <p className="font-semibold text-warm-text">5 Video Lessons</p>
                <p className="text-sm text-warm-muted">Watch and learn</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements Section */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-warm-muted uppercase tracking-wider mb-3">
            Your Achievements
          </h2>
          <div className="flex gap-3 flex-wrap">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                  achievement.unlocked
                    ? 'bg-calm-amber/10 border-calm-amber/30'
                    : 'bg-warm-border/30 border-warm-border opacity-60'
                }`}
                title={achievement.description}
              >
                <span className="text-lg">{achievement.icon}</span>
                <span className={`text-sm ${achievement.unlocked ? 'font-medium' : ''}`}>
                  {achievement.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Tabs defaultValue="topics" className="space-y-6" onValueChange={handleStudyActivity}>
          <TabsList className="bg-white">
            <TabsTrigger value="topics" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Topics
            </TabsTrigger>
            <TabsTrigger value="flashcards" className="gap-2">
              <Brain className="h-4 w-4" />
              Flashcards
            </TabsTrigger>
            <TabsTrigger value="videos" className="gap-2">
              <Video className="h-4 w-4" />
              Videos
            </TabsTrigger>
            <TabsTrigger value="quick-facts" className="gap-2">
              <Lightbulb className="h-4 w-4" />
              Quick Facts
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="gap-2">
              <Target className="h-4 w-4" />
              Quizzes
            </TabsTrigger>
          </TabsList>

          <Dialog open={!!selectedTopic} onOpenChange={(open) => !open && setSelectedTopic(null)}>
            <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-3xl">
              {selectedTopic && (
                <>
                  <DialogHeader className="gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={TOPIC_DIFFICULTY_COLORS[selectedTopic.difficulty]} variant="secondary">
                        {selectedTopic.difficulty}
                      </Badge>
                      <Badge variant="outline">{selectedTopic.duration}</Badge>
                      <Badge variant="outline">{selectedTopic.lessons} lessons</Badge>
                    </div>
                    <DialogTitle className="text-2xl">{selectedTopic.title}</DialogTitle>
                    <DialogDescription className="text-sm">
                      {selectedTopic.description}
                    </DialogDescription>
                  </DialogHeader>

                    <div className="grid gap-4">
                      <Card className="border-primary/20 bg-primary/5">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Overview</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm text-warm-muted">
                        {selectedTopic.overview.map((paragraph) => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}
                        </CardContent>
                      </Card>

                      <Card className="border-calm-amber/20 bg-calm-amber/5">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Real-world Example</CardTitle>
                          <CardDescription>{selectedTopic.example.title}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-warm-muted">
                          <p>{selectedTopic.example.scenario}</p>
                          <p className="rounded-lg border border-calm-amber/20 bg-white px-3 py-3 text-warm-text">
                            {selectedTopic.example.lesson}
                          </p>
                        </CardContent>
                      </Card>

                      <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">Practical Checklist</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2 text-sm text-warm-muted">
                              {selectedTopic.checklist.map((item, index) => (
                                <li key={item} className="flex gap-3 rounded-lg bg-calm-green/5 px-3 py-3">
                                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-calm-green/15 text-xs font-semibold text-calm-green">
                                    {index + 1}
                                  </span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">Key Takeaways</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2 text-sm text-warm-muted">
                              {selectedTopic.takeaways.map((item) => (
                                <li key={item} className="rounded-lg bg-warm-bg px-3 py-2">
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      </div>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Common Mistakes</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2 text-sm text-warm-muted">
                            {selectedTopic.mistakes.map((item) => (
                              <li key={item} className="rounded-lg bg-red-50 px-3 py-2 text-red-700">
                                {item}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Next Steps</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ol className="space-y-2 text-sm text-warm-muted">
                            {selectedTopic.nextSteps.map((item, index) => (
                              <li key={item} className="flex gap-3 rounded-lg bg-calm-indigo/5 px-3 py-3">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-calm-indigo/15 text-xs font-semibold text-calm-indigo">
                                  {index + 1}
                                </span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ol>
                        </CardContent>
                      </Card>

                      <Card className="border-warm-border bg-warm-bg/40">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Learn the Rule</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2 text-sm text-warm-muted">
                            {selectedTopic.ruleNotes.map((item) => (
                              <li key={item} className="rounded-lg bg-white px-3 py-3">
                                {item}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>

                  <DialogFooter className="sm:justify-between" showCloseButton>
                    <Button asChild>
                      <Link href={`/learn/${selectedTopic.id}`}>Start Lesson</Link>
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>

          <TabsContent value="topics">
            <div className="space-y-6">
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-white">
                <CardHeader className="gap-2">
                  <CardTitle className="text-xl">Topic Library</CardTitle>
                  <CardDescription>
                    Click the arrow on any topic to open a full lesson with overview, takeaways, common mistakes, and next steps.
                  </CardDescription>
                </CardHeader>
              </Card>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {LEARN_TOPICS.map((topic) => (
                  <TopicCard
                    key={topic.id}
                    topic={topic}
                    onSelect={handleTopicSelect}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="flashcards">
            <Card>
              <CardHeader>
                <CardTitle>Legal Flashcards</CardTitle>
                <CardDescription>
                  Test your knowledge of key legal concepts. Click a card to flip it.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FlashcardView />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="videos">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-warm-text mb-2">Legal Basics Video Course</h3>
              <p className="text-warm-muted">Watch and learn at your own pace.</p>
            </div>
            <VideoPlaylist 
              lessons={VIDEO_LESSONS.map(v => ({
                id: v.id,
                title: v.title,
                description: v.description,
                duration: v.duration,
              }))} 
            />
            <div className="mt-6 p-4 bg-calm-amber/10 border border-calm-amber/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-calm-amber mt-0.5" />
                <div>
                  <p className="font-medium text-warm-text">More videos coming soon</p>
                  <p className="text-sm text-warm-muted mt-1">
                    We&apos;re adding more video content regularly. Subscribe for updates!
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="quick-facts">
            <Card>
              <CardHeader>
                <CardTitle>Quick Legal Facts</CardTitle>
                <CardDescription>
                  Essential things every self-represented litigant should know.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <QuickFactsView />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quizzes">
            <QuizView onQuizComplete={handleQuizComplete} />
          </TabsContent>
        </Tabs>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-calm-indigo/20 bg-gradient-to-br from-calm-indigo/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-calm-indigo" />
                Self-Help Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-warm-muted">
                Official court resources for people representing themselves:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-warm-muted" />
                  <a href="https://www.txcourts.gov/programs-services/self-help/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Texas Courts Self-Help Center
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-warm-muted" />
                  <a href="https://www.uscourts.gov/about-federal-courts/federal-courts-portal/self-help-centers" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Federal Courts Self-Help Centers
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-warm-muted" />
                  <a href="https://www.lawhelp.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    LawHelp - Free Legal Information
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-calm-green/20 bg-gradient-to-br from-calm-green/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-calm-green" />
                Need More Help?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-warm-muted">
                Sometimes you need more than information. Here are options:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-warm-muted" />
                  <a href="https://www.lsntap.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Legal Services Corporation - Free Legal Aid
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-warm-muted" />
                  <a href="https://www.avvo.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Avvo - Find an Attorney
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-warm-muted" />
                  <Link href="/help" className="text-primary hover:underline">
                    Visit our Help Center
                  </Link>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 p-6 bg-white rounded-lg border border-warm-border text-center">
          <p className="text-sm text-warm-muted">
            <strong className="text-warm-text">Remember:</strong> This content is for educational purposes only. 
            It is not legal advice. When in doubt, consult a licensed attorney.
          </p>
        </div>
      </main>
    </div>
  )
}
