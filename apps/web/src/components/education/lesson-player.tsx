'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { createClient } from '@/lib/supabase/client'
import { useProgressSync, type LessonProgressState } from '@/hooks/use-progress-sync'
import { cn } from '@/lib/utils'
import { LEARN_TOPICS, getLearnTopic, type LearnTopic } from '@/lib/education/learn-topics'

interface LessonPlayerProps {
  topicId?: string
  topic?: LearnTopic
  topics?: LearnTopic[]
}

function getDefaultState(): LessonProgressState {
  return {
    currentSection: 0,
    answers: {},
    submitted: false,
    completed: false,
    updatedAt: null,
  }
}

export function LessonPlayer({ topicId, topic: topicProp, topics: topicsProp }: LessonPlayerProps) {
  const resolvedTopic = topicProp ?? (topicId ? getLearnTopic(topicId) : undefined)
  const topics = topicsProp ?? LEARN_TOPICS
  const [userId, setUserId] = useState<string | null>(null)

  if (!resolvedTopic) {
    return null
  }

  const topic = resolvedTopic

  const { progress, updateLessonProgress, completeLesson } = useProgressSync(userId)

  const topicIndex = topics.findIndex((entry) => entry.id === topic.id)
  const previousTopic = topicIndex > 0 ? topics[topicIndex - 1] : null
  const nextTopic = topicIndex >= 0 && topicIndex < topics.length - 1 ? topics[topicIndex + 1] : null

  const sections = useMemo(() => ([
    {
      id: 'overview',
      title: 'Overview',
      content: (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Start with the big picture before diving into procedure.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-warm-muted">
            {topic.overview.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </CardContent>
        </Card>
      ),
    },
    {
      id: 'example',
      title: 'Real-world Example',
      content: (
        <Card className="border-calm-amber/20 bg-calm-amber/5">
          <CardHeader>
            <CardTitle>Real-world Example</CardTitle>
            <CardDescription>{topic.example.title}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-warm-muted">
            <p>{topic.example.scenario}</p>
            <p className="rounded-lg border border-calm-amber/20 bg-white px-3 py-3 text-warm-text">
              {topic.example.lesson}
            </p>
          </CardContent>
        </Card>
      ),
    },
    {
      id: 'checklist',
      title: 'Practical Checklist',
      content: (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Practical Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-warm-muted">
                {topic.checklist.map((item, index) => (
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
            <CardHeader>
              <CardTitle>Key Takeaways</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-warm-muted">
                {topic.takeaways.map((item) => (
                  <li key={item} className="rounded-lg bg-warm-bg px-3 py-2">
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: 'mistakes',
      title: 'Common Mistakes',
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Common Mistakes</CardTitle>
            <CardDescription>These are the errors most likely to slow you down or weaken your position.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-warm-muted">
              {topic.mistakes.map((item) => (
                <li key={item} className="rounded-lg bg-destructive/5 px-3 py-2 text-destructive">
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ),
    },
    {
      id: 'next-steps',
      title: 'Next Steps',
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>Turn the lesson into action while the guidance is still fresh.</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm text-warm-muted">
              {topic.nextSteps.map((item, index) => (
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
      ),
    },
    {
      id: 'quick-check',
      title: 'Quick Check',
      content: 'quick-check' as const,
    },
    {
      id: 'rule',
      title: 'Learn the Rule',
      content: (
        <Card className="border-warm-border bg-warm-bg/40">
          <CardHeader>
            <CardTitle>Learn the Rule</CardTitle>
            <CardDescription>Finish with the legal frame behind the practical guidance.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-warm-muted">
              {topic.ruleNotes.map((item) => (
                <li key={item} className="rounded-lg bg-white px-3 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ),
    },
  ]), [topic])

  const [state, setState] = useState<LessonProgressState>(getDefaultState)
  const currentSection = sections[state.currentSection] ?? sections[0]
  const progressValue = ((state.currentSection + 1) / sections.length) * 100

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

  useEffect(() => {
    const saved = progress?.lessonProgress?.[topic.id]
    if (saved) {
      setState({
        currentSection: saved.currentSection,
        answers: saved.answers,
        submitted: saved.submitted,
        completed: saved.completed,
        updatedAt: saved.updatedAt,
      })
      return
    }

    setState(getDefaultState())
  }, [progress?.lessonProgress, topic.id])

  useEffect(() => {
    if (!progress) return
    updateLessonProgress(topic.id, {
      currentSection: state.currentSection,
      answers: state.answers,
      submitted: state.submitted,
      completed: state.completed,
    })
  }, [progress, state, topic.id, updateLessonProgress])

  function goToSection(index: number) {
    setState((current) => ({
      ...current,
      currentSection: Math.max(0, Math.min(index, sections.length - 1)),
    }))
  }

  function setAnswer(questionIndex: number, optionIndex: number) {
    setState((current) => ({
      ...current,
      submitted: false,
      answers: {
        ...current.answers,
        [questionIndex]: optionIndex,
      },
    }))
  }

  function gradeQuickCheck() {
    completeLesson(topic.id)
    setState((current) => ({
      ...current,
      submitted: true,
      completed: true,
    }))
  }

  const quickCheckScore = topic.quickCheck.reduce((score, question, index) => (
    state.answers[index] === question.correctIndex ? score + 1 : score
  ), 0)

  const quickCheckComplete = topic.quickCheck.every((_, index) => typeof state.answers[index] === 'number')

  const nextDisabled = currentSection.id === 'quick-check' && !state.submitted

  return (
    <div className="min-h-screen bg-warm-bg">
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Button asChild variant="ghost" className="gap-2">
            <Link href="/learn">
              <ArrowLeft className="h-4 w-4" />
              Back to Learn
            </Link>
          </Button>
          <div className="flex items-center gap-2 text-xs text-warm-muted">
            {state.completed && (
              <span className="inline-flex items-center gap-1 rounded-full bg-calm-green/10 px-2 py-1 text-calm-green">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Lesson completed
              </span>
            )}
            <span>Saved automatically</span>
          </div>
        </div>

        <Card className="border-primary/20 bg-white">
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className={cn(
                topic.difficulty === 'beginner' && 'bg-calm-green/10 text-calm-green',
                topic.difficulty === 'intermediate' && 'bg-calm-amber/10 text-calm-amber',
                topic.difficulty === 'advanced' && 'bg-destructive/5 text-destructive',
              )}>
                {topic.difficulty}
              </Badge>
              <Badge variant="outline">{topic.duration}</Badge>
              <Badge variant="outline">{topic.lessons} lessons</Badge>
            </div>
            <div>
              <CardTitle className="text-3xl">{topic.title}</CardTitle>
              <CardDescription className="mt-2 text-sm">{topic.description}</CardDescription>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-sm text-warm-muted">
                <span>{`Section ${state.currentSection + 1} of ${sections.length}`}</span>
                <span>{Math.round(progressValue)}% complete</span>
              </div>
              <Progress value={progressValue} className="h-2" />
            </div>
          </CardHeader>
        </Card>

        <div className="mt-6 grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-base">Lesson Map</CardTitle>
              <CardDescription>Move section by section or resume where you left off.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {sections.map((section, index) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => goToSection(index)}
                  className={cn(
                    'w-full rounded-lg px-3 py-2 text-left text-sm transition-colors',
                    index === state.currentSection
                      ? 'bg-primary/10 text-primary'
                      : 'bg-warm-bg text-warm-muted hover:bg-primary/5 hover:text-primary'
                  )}
                >
                  {section.title}
                </button>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-6">
            {currentSection.content === 'quick-check' ? (
              <Card>
                <CardHeader>
                  <CardTitle>Quick Check</CardTitle>
                  <CardDescription>Answer both questions before moving on.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {topic.quickCheck.map((question, questionIndex) => (
                    <div key={question.prompt} data-testid={`lesson-question-${questionIndex}`} className="rounded-xl border border-warm-border bg-warm-bg/40 p-4">
                      <p className="font-medium text-warm-text">{question.prompt}</p>
                      <div className="mt-3 space-y-2">
                        {question.options.map((option, optionIndex) => {
                          const isSelected = state.answers[questionIndex] === optionIndex
                          const isCorrect = question.correctIndex === optionIndex
                          const showFeedback = state.submitted

                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() => setAnswer(questionIndex, optionIndex)}
                              className={cn(
                                'w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                                isSelected ? 'border-primary bg-primary/5 text-primary' : 'border-warm-border bg-white text-warm-text hover:border-primary/30',
                                showFeedback && isCorrect && 'border-calm-green/40 bg-calm-green/10 text-calm-green'
                              )}
                            >
                              {option}
                            </button>
                          )
                        })}
                      </div>
                      {state.submitted && (
                        <p className="mt-3 text-sm text-warm-muted">{question.explanation}</p>
                      )}
                    </div>
                  ))}

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    {state.submitted ? (
                      <p className="text-sm font-medium text-warm-text">{`Score: ${quickCheckScore}/${topic.quickCheck.length}`}</p>
                    ) : (
                      <p className="text-sm text-warm-muted">Choose one answer for each question, then grade the quick check.</p>
                    )}
                    <Button onClick={gradeQuickCheck} disabled={!quickCheckComplete}>
                      Grade Quick Check
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              currentSection.content
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => goToSection(state.currentSection - 1)}
                  disabled={state.currentSection === 0}
                >
                  Previous Section
                </Button>
                <Button
                  onClick={() => goToSection(state.currentSection + 1)}
                  disabled={state.currentSection >= sections.length - 1 || nextDisabled}
                >
                  Next Section
                </Button>
              </div>

              {state.currentSection >= sections.length - 1 && nextTopic && (
                <Button asChild className="gap-2">
                  <Link href={`/learn/${nextTopic.id}`}>
                    Next Lesson
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {previousTopic && (
                <Card>
                  <CardHeader>
                    <CardDescription>Previous topic</CardDescription>
                    <CardTitle className="text-base">{previousTopic.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="outline">
                      <Link href={`/learn/${previousTopic.id}`}>Open Previous</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {nextTopic && (
                <Card>
                  <CardHeader>
                    <CardDescription>Up next</CardDescription>
                    <CardTitle className="text-base">{nextTopic.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button asChild>
                      <Link href={`/learn/${nextTopic.id}`}>Open Next</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
