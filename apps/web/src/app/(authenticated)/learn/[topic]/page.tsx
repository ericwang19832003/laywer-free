import { notFound } from 'next/navigation'
import { LessonPlayer } from '@/components/education/lesson-player'
import { getLearnTopic, LEARN_TOPIC_IDS } from '@/lib/education/learn-topics'

export function generateStaticParams() {
  return LEARN_TOPIC_IDS.map((topic) => ({ topic }))
}

export default async function LearnTopicPage({
  params,
}: {
  params: Promise<{ topic: string }>
}) {
  const { topic } = await params
  const lessonTopic = getLearnTopic(topic)

  if (!lessonTopic) {
    notFound()
  }

  return <LessonPlayer topicId={topic} />
}
