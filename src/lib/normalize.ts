export function normalizeAnswer(value: string): string {
  return value.normalize('NFC').trim().toLocaleLowerCase('en-US')
    .replace(/[.,!?;'"“”‘’()\[\]{}]/g, '')
    .replace(/\s+/g, '')
    .replace(/^0+(?=\d)/, '')
}

export function normalizeTime(value: string): string {
  const normalized = normalizeAnswer(value)
  const match = normalized.match(/^(\d{1,2}):(\d{1,2})(am|pm)?$/)
  if (!match) return normalized
  let hour = Number(match[1])
  const period = match[3]
  if (period && hour >= 1 && hour <= 12) hour = hour % 12 + (period === 'pm' ? 12 : 0)
  return `${hour}:${String(Number(match[2])).padStart(2, '0')}`
}

export function sample<T>(items: readonly T[]): T { return items[Math.floor(Math.random() * items.length)]! }
export function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [copy[i], copy[j]] = [copy[j]!, copy[i]!] }
  return copy
}
export function uniqueChoices(correct: string, candidates: string[], size = 3): string[] {
  return shuffle([correct, ...shuffle(candidates.filter(x => x !== correct))].filter((x, i, a) => a.indexOf(x) === i).slice(0, size))
}
