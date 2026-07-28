import { getSession } from '@/lib/dal/session'
import { getLearningPath, getPlacementChallenges, getUserProgress } from '@/lib/dal/learn'
import { redirect } from 'next/navigation'
import { LearnClient } from './LearnClient'

export default async function LearnPage() {
  const session = await getSession()
  if (!session) redirect('/auth/signin?redirect=/learn')

  const [lessons, challenges, progress] = await Promise.all([
    getLearningPath(),
    getPlacementChallenges(),
    getUserProgress(session.userId),
  ])

  return <LearnClient lessons={lessons} challenges={challenges} initialProgress={progress} />
}
