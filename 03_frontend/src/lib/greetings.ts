import greetingsData from '../data/greetings.json'

interface Tier {
  id: number
  label: string
  min: number
  max: number
}

const tiers: Tier[] = greetingsData.tiers
const greetings: Record<string, Record<string, string[]>> = greetingsData.greetings

function getTier(relationshipStrength: number): number {
  for (const tier of tiers) {
    if (relationshipStrength >= tier.min && relationshipStrength <= tier.max) {
      return tier.id
    }
  }
  return 0
}

export function getGreeting(loreId: string, relationshipStrength: number): string {
  const survivorGreetings = greetings[loreId]
  if (!survivorGreetings) return '...'

  const tier = getTier(relationshipStrength)
  const tierGreetings = survivorGreetings[String(tier)]
  if (!tierGreetings || tierGreetings.length === 0) return '...'

  return tierGreetings[Math.floor(Math.random() * tierGreetings.length)]
}
