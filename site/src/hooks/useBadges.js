import { useProgress } from './useProgress'
import { BADGE_DEFS } from '../data/badges'

export function useBadges() {
  const { progress } = useProgress()
  const earnedIds = BADGE_DEFS.filter(b => b.condition(progress)).map(b => b.id)
  return { earnedIds, badges: BADGE_DEFS }
}
